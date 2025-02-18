import {CountryMapping} from '../../enums/country.enum';
import {BillObjectDto} from '../dto/billInfo.dto';
import {
  getOrderItemInfoNew,
  getPlatformCommission,
  getRoundOffValue,
  getTransformedRestaurantCharges,
} from '../lib/common.function.lib';
import {localize} from '../../locale/i18n';
import {ItemInfoDto} from '../interfaces/itemInfo.interface';
import {ChargesService} from './charges-service';
import {DiscountService} from './discount-service';

export class OrderService {
  constructor(
    private chargesService: ChargesService,
    private discountService: DiscountService,
  ) {}

  getDeliveryObj(order: any, oldOrderBill: any): any {
    let deliveryInfo: any = null;
    if (oldOrderBill) {
      const fees = oldOrderBill.fees;
      fees.forEach(fee => {
        if (fee.id == 'delivery' && order.order_type == 1) {
          deliveryInfo = {
            distance: order.distance,
            fee: fee.fee,
          };
        }
      });
    }

    return deliveryInfo;
  }

  calculateAndAddDeliveryFee(
    itemInfoDto: ItemInfoDto,
    customDeliveryFee: number = 0,
    language: string,
  ): any {
    let deliveryFee: any = null;

    if (
      itemInfoDto.deliveryInfo &&
      (itemInfoDto.deliveryInfo.fee || customDeliveryFee)
    ) {
      deliveryFee = {
        name: localize('deliveryFee', language),
        value: Number((itemInfoDto.deliveryInfo.fee || customDeliveryFee).toFixed(2)),
        id: 'delivery',
      };
    }

    return deliveryFee;
  }

  calculateAndApplyDiscount(
    order: any,
    couponInfo: any,
    itemInfoDto: ItemInfoDto,
    language: string,
    callingFromGetCart = false,
  ): any {
    let discountInfo = null;

    if (!callingFromGetCart) {
      discountInfo = this.discountService.getDiscountInfoFromOrder(
        order,
        couponInfo,
      );
    } else {
      discountInfo = this.discountService.getDiscountInfoFromCart(
        order, // This is cart passed in calculateAndApplyDiscount() in this particular case
        couponInfo,
      );
    }
    itemInfoDto = this.discountService.applyDiscount(itemInfoDto, discountInfo);

    let discountValue = 0;
    for (const item of itemInfoDto.itemInfo) {
      discountValue += item.discount;
      item.discount = Number((item.discount).toFixed(4));
    }

    if (
      itemInfoDto.deliveryInfo?.discount &&
      itemInfoDto.deliveryInfo.discount > 0
    ) {
      discountValue += itemInfoDto.deliveryInfo.discount;
      itemInfoDto.deliveryInfo.discount = Number((itemInfoDto.deliveryInfo.discount).toFixed(2));
    }

    const discountFee = {
      id: 'coupon_discount',
      name:
        localize('discount', language) + '(' + itemInfoDto.discountName + ')',
      value: -Number(discountValue.toFixed(2)),
    };

    return discountValue ? discountFee : null;
  }

  calculateAndUpdateLoyaltyCashback(
    order: any,
    itemInfoDto: ItemInfoDto,
    oldOrderBill: any,
  ): any {
    let loyaltyFee: any = null;

    // Check if loyalty cashback exists for the order
    const loyaltyExists = order?.loyalty?.amount > 0;

    // Process loyalty cashback if it exists
    if (loyaltyExists) {
      // Retrieve and apply loyalty cashback to the order
      const loyaltyObj = this.getLoyaltyFromOrderBill(oldOrderBill);

      // If loyalty cashback is applied, create a fee object and prorate the amount among items
      if (loyaltyObj) {
        loyaltyFee = {
          id: 'loyalty_cashback',
          name: 'Loyalty Cashback',
          value: Number((loyaltyObj.value).toFixed(2)),
        };

        // Calculate the amount of loyalty cashback to be subtracted from item prices
        const loyaltyAmount = -loyaltyObj.value;

        // Prorate the loyalty cashback amount among items
        this.prorateLoyalty(itemInfoDto, loyaltyAmount);
      }
    }

    return loyaltyFee;
  }

  calculateAndApplyCharges(
    order: any,
    platform: string,
    restaurantDetails: any,
    country_code: string,
    itemInfoDto: ItemInfoDto,
  ): ItemInfoDto {
    const skip_service_charge_operation =
      order.skip_service_charge_operation || false;
    const skip_packaging_charge_operation =
      order.skip_packaging_charge_operation || false;
    const orderType = order.order_type;
    const offlinePlatform = restaurantDetails.offline_platforms || [];
    const restaurantFees = restaurantDetails.fees || [];

    let packagingChargeDisabled = false;

    if (
      platform &&
      platform !== 'easyeat' &&
      offlinePlatform &&
      offlinePlatform.length > 0
    ) {
      packagingChargeDisabled = true;

      for (const platformSettings of offlinePlatform) {
        if (
          platformSettings.id === platform &&
          platformSettings.pkg_applicable
        ) {
          packagingChargeDisabled = false;
          break;
        }
      }
    }

    const restCharges = getTransformedRestaurantCharges(
      restaurantFees,
      orderType,
      skip_packaging_charge_operation,
      packagingChargeDisabled,
      skip_service_charge_operation,
    );

    if (country_code === CountryMapping.MALAYSIA.country_code) {
      for (const charge of restCharges) {
        itemInfoDto = this.chargesService.applyChargesOnItems(
          itemInfoDto,
          charge,
        );
      }
    }

    if (country_code === CountryMapping.INDONESIA.country_code) {
      for (const charge of restCharges) {
        if (charge.id === 'service_tax') {
          itemInfoDto = this.chargesService.applyIndonesiaChargesOnItems(
            itemInfoDto,
            charge,
          );
          break;
        }
      }

      for (const charge of restCharges) {
        if (charge.id !== 'service_tax') {
          itemInfoDto = this.chargesService.applyIndonesiaChargesOnItems(
            itemInfoDto,
            charge,
          );
        }
      }
    }

    return itemInfoDto;
  }

  calculateAndApplyPlatformChargesAuto(
    restaurantDetails: any,
    platform: string,
    itemInfoDto: ItemInfoDto,
    discountValue: number,
    customDeliveryFee: number,
    bill: BillObjectDto,
  ): any {
    // Initialize variables
    let op_new_calculation = 0;
    let platformFeeObj = null;

    // Extract settings and offline platforms from restaurant details
    const settings = restaurantDetails.settings;
    const restOfflinePlatform = restaurantDetails.offline_platforms || [];

    // Determine if new calculation method is enabled
    if (
      settings.global.is_gf_new_calculation ||
      settings.global.is_fp_new_calculation
    ) {
      op_new_calculation = 1;
    }

    // Calculate charges based on platform and calculation method
    if (platform === 'foodpanda' || platform === 'grab') {
      if (op_new_calculation) {
        // Use item total as subtotal for new calculation method
        bill.subtotal = itemInfoDto.itemTotal;
      } else {
        // Calculate subtotal based on item total, discount, and delivery fee
        const discount = discountValue;
        if (platform === 'grab') {
          bill.subtotal = itemInfoDto.itemTotal - Math.abs(discount);
        } else {
          bill.subtotal =
            itemInfoDto.itemTotal +
            itemInfoDto.deliveryInfo.fee -
            Math.abs(discount);
        }

        // Calculate commission applied on subtotal minus custom delivery fee
        const comm_applied_on = bill.subtotal - customDeliveryFee;
        const platform_commision = getPlatformCommission(
          platform,
          restOfflinePlatform,
          comm_applied_on,
        );
        const commission_value =
          platform_commision.status === 1 ? platform_commision.fees.value : 0;

        // Create platform fee object if commission is applied
        if (commission_value) {
          platformFeeObj = {
            id: 'platform_commision',
            name: platform_commision.fees.name,
            value: commission_value,
          };
        }
      }
    }

    // Return the platform fee object
    return platformFeeObj;
  }

  applyChargesAndCalculateCommission(
    itemInfoDto: ItemInfoDto,
    platform: string,
    restaurantDetails: any,
  ): any {
    // Initialize variables
    const orderFees: any[] = [];
    const restOfflinePlatform = restaurantDetails.offline_platforms || [];
    const chargesObj = itemInfoDto.charges;

    // Iterate through charges and add them to order fees if they have a non-zero value
    for (const charge of chargesObj) {
      if (charge.value) {
        const chargeFeeObj = {
          id: charge.id,
          name: charge.name,
          value: charge.value,
        };
        orderFees.push(chargeFeeObj);
      }
    }

    // Calculate and add platform commission to order fees
    const platformCommission = getPlatformCommission(
      platform,
      restOfflinePlatform,
      itemInfoDto.itemTotal,
    );
    if (platformCommission.status === 1 && platformCommission.fees.value) {
      const platformFeeObj = {
        id: 'platform_commision',
        name: platformCommission.fees.name,
        value: platformCommission.fees.value,
      };
      orderFees.push(platformFeeObj);
    }

    // Return the array containing details of charges and commission applied to the order
    return orderFees;
  }

  getLoyaltyFromOrderBill(orderBill: any): any {
    let loyalty_obj = null;
    try {
      const {fees} = orderBill;

      if (fees?.length) {
        fees.forEach(fee => {
          if (fee.id === 'loyalty_cashback') {
            loyalty_obj = {
              name: fee.fee_name,
              value: fee.fee,
              id: fee.id,
            };
          }
        });
      }
    } catch (e) {}
    return loyalty_obj;
  }

  reCalculateBill(orderBill: any, roundOff: any, language: string): any {
    // Initialize variables
    const oldFees = orderBill.fees;
    const newFees = [];
    const payments = orderBill.payments || [];
    const subtotal = orderBill.subtotal || 0;
    let billTotal = 0;
    let paid = 0;
    let itemTotal = 0;

    let couponExists = false;
    let topUpExists = false;

    // Iterate through old fees to calculate bill total and retrieve item total
    for (const fee of oldFees) {
      if (fee.id !== 'round_off') {
        billTotal += Number(fee.value.toFixed(2));
        newFees.push(fee);
      }
      if (fee.id === 'item_total') {
        itemTotal = fee.value;
      }
      if (fee.id === 'coupon_discount') {
        couponExists = true;
      }
      if (fee.id === 'topup') {
        topUpExists = true;
      }
    }

    if (!couponExists) {
      newFees.push({
        id: 'coupon_discount',
        name: localize('discount', language),
        value: 0,
        reason: '',
      });
    }

    if (!topUpExists) {
      newFees.push({
        id: 'topup',
        name: localize('topup', language),
        value: 0,
        reason: '',
      });
    }

    // Calculate total amount paid based on payment status
    for (const payment of payments) {
      if (payment.status === 1) {
        paid += payment.amount;
      }
    }

    billTotal = Number(billTotal.toFixed(2));
    // Retrieve rounding off status and perform rounding off calculation if enabled
    const roundOffStatus = roundOff.status;
    if (roundOffStatus === 1) {
      const roundValue = getRoundOffValue(billTotal, roundOff);
      const roundDiff = roundValue - billTotal;
      billTotal = Number(roundValue.toFixed(2));

      // Add rounding off fee to new fees if there's a difference
      if (roundDiff != 0) {
        newFees.push({
          id: 'round_off',
          name: localize('roundOff', language),
          value: Number(roundDiff.toFixed(2)),
        });
      }
    }

    // Override bill total with subtotal if subtotal is greater than 0
    if (subtotal > 0) {
      billTotal = subtotal;
    }

    // Calculate remaining balance
    const balance = billTotal - paid;

    // Update order bill with recalculated values
    orderBill.fees = newFees; // discount will be updated in case of discount
    orderBill.paid = Number((paid).toFixed(2));
    orderBill.balance = Number((balance).toFixed(2));
    orderBill.bill_total = Number((billTotal).toFixed(2));
    orderBill.item_total = Number((itemTotal).toFixed(2));

    // Return the updated order bill
    return orderBill;
  }

  prorateLoyalty(itemInfoDto: ItemInfoDto, loyaltyAmount: number): ItemInfoDto {
    // Check if loyalty cashback amount is greater than 0
    if (loyaltyAmount > 0) {
      // Initialize variables
      const itemInfo = itemInfoDto.itemInfo;
      let effectivePriceSum = 0;

      // Calculate the sum of effective prices of all items
      itemInfo.forEach(itemCal => {
        effectivePriceSum += itemCal.effectivePrice;
      });

      // Prorate loyalty cashback amount among items and update effective prices
      itemInfo.forEach(itemCal => {
        itemCal.loyaltyItemAmount =
          itemCal.effectivePrice * (loyaltyAmount / effectivePriceSum);
        itemCal.effectivePrice -= itemCal.loyaltyItemAmount;
        itemCal.loyaltyItemAmount = Number((itemCal.loyaltyItemAmount).toFixed(4));
      });

      // Update item information DTO with loyalty cashback amount
      loyaltyAmount = Number((loyaltyAmount).toFixed(2));
      itemInfoDto.loyaltyAmount = loyaltyAmount;
    }

    // Return the updated item information DTO
    return itemInfoDto;
  }

  getRoundOffObject(restaurantDetails: any, orderType: string): any {
    // Initialize round-off object
    const roundOff: any = {};

    // Set base round-off value from restaurant details, defaulting to 0.05 if not provided
    roundOff.baseRoundOff =
      restaurantDetails.base_roundoff || restaurantDetails.base_roundoff == 0
        ? restaurantDetails.base_roundoff
        : 0;

    // Set round-up option from restaurant details, defaulting to false if not provided
    roundOff.roundUp = restaurantDetails.roundup || false;

    // Set round-down option from restaurant details, defaulting to false if not provided
    roundOff.roundDown = restaurantDetails.rounddown || false;

    // Determine round-off status based on round-off disable setting and order type
    const roundOffDisable = restaurantDetails.round_off_close || 0;
    roundOff.status = this.roundOffDisable(roundOffDisable, orderType) ? 0 : 1;

    // Return the constructed round-off object
    return roundOff;
  }

  roundOffDisable(roundOffVal: number, orderType: any): any {
    let roundOffDisable = 0;
    if (roundOffVal !== 0) {
      if (
        (roundOffVal & 1 && orderType === 0) ||
        (roundOffVal & 2 && orderType === 1) ||
        (roundOffVal & 4 && orderType === 2)
      ) {
        roundOffDisable = 1;
      }
    }
    return roundOffDisable;
  }

  getTopUpFeeObj(order: any, language: string): any {
    // Initialize response object with default status and null fee
    const response = {status: 0, fee: null};

    // Check if the order has a top-up ID and non-zero top-up value
    if (order.topup_id === 'mm_topup' && order.tvalue) {
      // Round the top-up value to 2 decimal places
      const topUpValue = Number(order.tvalue.toFixed(2));

      // Construct top-up name based on top-up name in the order, or default to "Top-up"
      const tName = order.treason ? order.treason : order.topup_name;
      const topUpName = tName
        ? localize('topup', language) + '(' + tName + ')'
        : localize('topup', language);

      // Create the top-up fee object
      const topUpFee = {
        id: 'topup',
        name: topUpName,
        value: topUpValue,
      };

      // Set the status to 1 indicating successful retrieval of top-up fee
      response.status = 1;

      // Set the fee in the response object
      response.fee = topUpFee;
    }

    // Return the response object containing the status and fee object of the top-up, or null if no top-up fee exists
    return response;
  }

  reCalculateAndUpdateBill(orderBill: any, roundOff: any, language: string) {
    // Recalculate the order bill based on new calculations and language settings
    orderBill = this.reCalculateBill(orderBill, roundOff, language);

    return orderBill;
  }
}
