import {OrderItemInfo} from '../baseClass/orderItemInfo';
import {RoundOffObj} from '../baseClass/roundOff';
import {ChargeApplicableType, ChargeType} from '../enum/billLib.enum';
import {
  DiscountAction,
  DiscountApplicableType,
  DiscountCategory,
  DiscountType,
} from '../enum/discountLib.enum';
import {BillResponseInterface} from '../interfaces/billResponse.interface';
import {ChargesInterface} from '../interfaces/charges.interface';
import {DiscountInterface} from '../interfaces/discount.interface';
import {
  getCartItemInfo,
  getOrderItemInfo,
  getTransformedRestaurantCharges,
} from '../lib/common.function.lib';
import {BillLibraryService} from './billLibrary.service';
import {DiscountLibService} from './discount-lib.service';
import {DiscountCalculationService} from './discountCalculation.service';

export class BillOfflineCalculationService {
  constructor(
    private discountLibrary: DiscountLibService,
    private billLibrary: BillLibraryService,
    private discountCalculationService: DiscountCalculationService,
  ) {}

  getOrderBill(
    orderItemInfo: OrderItemInfo[],
    discountInfo: DiscountInterface[],
    chargesInfo: ChargesInterface[],
    round_off: RoundOffObj,
    country_code = 'MY',
    platform,
    restaurant_platform,
  ): BillResponseInterface {
    const validationResponse = this.validateDiscount(discountInfo);
    if (!validationResponse.status) {
      const bill: BillResponseInterface = {
        fees: [],
        bill_total: 0,
        status: 0,
        message: validationResponse.message,
        // bill_total_text: '0',
      };
      return bill;
    }
    const discountDto = this.discountLibrary.applyDiscountOnOrder(
      orderItemInfo,
      discountInfo,
    );
    return this.billLibrary.getOrderBill(
      orderItemInfo,
      discountDto,
      chargesInfo,
      round_off,
      country_code,
      platform,
      restaurant_platform,
    );
  }

  getIndonesiaOrderBill(
    orderItemInfo: OrderItemInfo[],
    discountInfo: DiscountInterface[],
    chargesInfo: ChargesInterface[],
    round_off: RoundOffObj,
    country_code = 'ID',
    taxAfterDiscount,
    platform,
    restaurant_platform,
  ): BillResponseInterface {
    const validationResponse = this.validateDiscount(discountInfo);
    if (!validationResponse.status) {
      const bill: BillResponseInterface = {
        fees: [],
        bill_total: 0,
        status: 0,
        message: validationResponse.message,
        // bill_total_text: '0',
      };
      return bill;
    }
    const discountDto = this.discountLibrary.applyDiscountOnOrder(
      orderItemInfo,
      discountInfo,
    );
    return this.billLibrary.getIndonesiaOrderBill(
      orderItemInfo,
      discountDto,
      chargesInfo,
      round_off,
      country_code,
      taxAfterDiscount,
      platform,
      restaurant_platform,
    );
  }

  validateDiscount(discountInfo: DiscountInterface[]) {
    const discountMap = [];
    let flag = 1;
    let message = '';
    for (const ele in discountInfo) {
      if (discountInfo[ele].discountCategory === DiscountCategory.COUPON) {
        if (
          !discountMap['merchant'] &&
          !discountMap['topUp'] &&
          !discountMap['coupon']
        ) {
          discountMap['coupon'] = 1;
        } else if (
          !discountMap['coupon'] &&
          (discountMap['merchant'] || discountMap['topUp'])
        ) {
          flag = 0;
          message =
            'Cannot add coupon ,merchant and top up discounts on same order';
          break;
        } else {
          flag = 0;
          message = 'Duplicate coupon discount';
          break;
        }
      } else if (
        discountInfo[ele].discountCategory === DiscountCategory.MERCHANT
      ) {
        if (
          !discountMap['merchant'] &&
          !discountMap['topUp'] &&
          !discountMap['coupon']
        ) {
          discountMap['merchant'] = 1;
        } else if (
          !discountMap['merchant'] &&
          (discountMap['topUp'] || discountMap['coupon'])
        ) {
          flag = 0;
          message =
            'Cannot add coupon ,merchant and top up discounts on same order';
          break;
        } else {
          flag = 0;
          message = 'Duplicate merchant discount';
          break;
        }
      } else if (
        discountInfo[ele].discountCategory === DiscountCategory.TOP_UP
      ) {
        if (
          !discountMap['topUp'] &&
          !discountMap['merchant'] &&
          !discountMap['coupon']
        ) {
          discountMap['topUp'] = 1;
        } else if (
          !discountMap['topUp'] &&
          (discountMap['merchant'] || discountMap['coupon'])
        ) {
          flag = 0;
          message =
            'Cannot add coupon ,merchant and top up discounts on same order';
          break;
        } else {
          flag = 0;
          message = 'Duplicate topUp discount ';
          break;
        }
      }
    }
    return {status: flag, message: message};
  }

  getOfflineCartBill(
    cart: any,
    restFee: any,
    offlinePlatform: any,
    platform = 'easyeat',
    round_off: RoundOffObj,
    country_code = 'MY',
    restaurant_platform,
  ): BillResponseInterface {
    const {
      cart_items,
      order_type,
      skip_service_charge_operation,
      skip_packaging_charge_operation,
    } = cart;
    const itemInfo = getCartItemInfo(cart_items, order_type, platform);
    let restCharges = getTransformedRestaurantCharges(restFee, order_type);
    const discountInfo = this.discountCalculationService.getDiscountFromCart(
      cart,
      itemInfo,
    );

    let packagingChargeDisabled = false;
    if (
      platform &&
      platform != 'easyeat' &&
      offlinePlatform &&
      Array.isArray(offlinePlatform) &&
      offlinePlatform.length
    ) {
      packagingChargeDisabled = true;
      for (const i in offlinePlatform) {
        const platformSettings = offlinePlatform[i];
        if (
          platformSettings['id'] == platform &&
          platformSettings['pkg_applicable']
        ) {
          packagingChargeDisabled = false;
        }
      }
    }

    restCharges = restCharges.filter(charges => {
      if (
        ((skip_packaging_charge_operation || packagingChargeDisabled) &&
          charges.class === 'packaging_charge') ||
        (skip_service_charge_operation && charges.class === 'service_tax')
      ) {
        return false;
      } else {
        return true;
      }
    });

    return this.getOrderBill(
      itemInfo,
      discountInfo,
      restCharges,
      round_off,
      country_code,
      platform,
      restaurant_platform,
    );
  }

  getOfflineOrderBill(
    order: any,
    restFee: any,
    couponInfo: any,
    orderBill: any,
    offlinePlatform: any,
    round_off: RoundOffObj,
    country_code = 'MY',
    restaurant_platform,
  ): BillResponseInterface {
    const {
      items,
      order_type,
      skip_service_charge_operation,
      skip_packaging_charge_operation,
      platform,
    } = order;
    const {fees} = orderBill;
    const itemInfo = getOrderItemInfo(items);
    let restCharges = getTransformedRestaurantCharges(restFee, order_type);
    const discountInfo = this.discountCalculationService.getDiscountOnOrder(
      order,
      couponInfo,
      itemInfo,
    );

    let packagingChargeDisabled = false;
    if (
      platform &&
      platform != 'easyeat' &&
      offlinePlatform &&
      Array.isArray(offlinePlatform) &&
      offlinePlatform.length
    ) {
      packagingChargeDisabled = true;
      for (const i in offlinePlatform) {
        const platformSettings = offlinePlatform[i];
        if (
          platformSettings['id'] == platform &&
          platformSettings['pkg_applicable']
        ) {
          packagingChargeDisabled = false;
        }
      }
    }

    restCharges = restCharges.filter(charges => {
      if (
        ((skip_packaging_charge_operation || packagingChargeDisabled) &&
          charges.class === 'packaging_charge') ||
        (skip_service_charge_operation && charges.class === 'service_tax')
      ) {
        return false;
      } else {
        return true;
      }
    });
    if (fees && fees.length) {
      fees.forEach(fee => {
        if (order_type == 1 && fee.id === 'delivery') {
          const deliveryChargeInterface: ChargesInterface = {
            chargeType: ChargeType.FIXED,
            chargeValue: fee.fee,
            applicableOn: [],
            chargeApplicableType: ChargeApplicableType.OVER_ALL,
            id: fee.id,
            name: fee.fee_name,
            class: 'DeliveryCharge',
            subName: 'DeliveryCharge',
          };
          restCharges.push(deliveryChargeInterface);
        }
        if (fee.id === 'loyalty_cashback') {
          const loyaltyDiscount: DiscountInterface = {
            name: fee.fee_name,
            discountType: DiscountType.FIXED,
            value: -1 * fee.fee,
            applicableOn: [],
            discountApplicableType: DiscountApplicableType.OVER_ALL,
            id: fee.id,
            discountAction: DiscountAction.NORMAL,
            discountCategory: DiscountCategory.MERCHANT,
            maxValue: 0,
          };
          discountInfo.push(loyaltyDiscount);
        }
      });
    }
    return this.getOrderBill(
      itemInfo,
      discountInfo,
      restCharges,
      round_off,
      country_code,
      platform,
      restaurant_platform,
    );
  }

  getIndonesiaOfflineCartBill(
    cart: any,
    restFee: any,
    offlinePlatform: any,
    platform = 'easyeat',
    round_off: RoundOffObj,
    country_code = 'ID',
    taxAfterDiscount,
    restaurant_platform,
  ): BillResponseInterface {
    const {
      cart_items,
      order_type,
      skip_service_charge_operation,
      skip_packaging_charge_operation,
    } = cart;
    const itemInfo = getCartItemInfo(cart_items, order_type, platform);
    let restCharges = getTransformedRestaurantCharges(restFee, order_type);
    const discountInfo = this.discountCalculationService.getDiscountFromCart(
      cart,
      itemInfo,
    );

    let packagingChargeDisabled = false;
    if (
      platform &&
      platform != 'easyeat' &&
      offlinePlatform &&
      Array.isArray(offlinePlatform) &&
      offlinePlatform.length
    ) {
      packagingChargeDisabled = true;
      for (const i in offlinePlatform) {
        const platformSettings = offlinePlatform[i];
        if (
          platformSettings['id'] == platform &&
          platformSettings['pkg_applicable']
        ) {
          packagingChargeDisabled = false;
        }
      }
    }

    restCharges = restCharges.filter(charges => {
      if (
        ((skip_packaging_charge_operation || packagingChargeDisabled) &&
          charges.class === 'packaging_charge') ||
        (skip_service_charge_operation && charges.class === 'service_tax')
      ) {
        return false;
      } else {
        return true;
      }
    });

    return this.getIndonesiaOrderBill(
      itemInfo,
      discountInfo,
      restCharges,
      round_off,
      country_code,
      taxAfterDiscount,
      platform,
      restaurant_platform,
    );
  }

  getIndonesiaOfflineOrderBill(
    order: any,
    restFee: any,
    couponInfo: any,
    orderBill: any,
    offlinePlatform: any,
    round_off: RoundOffObj,
    country_code = 'ID',
    taxAfterDiscount,
    restaurant_platform,
  ): BillResponseInterface {
    const {
      items,
      order_type,
      skip_service_charge_operation,
      skip_packaging_charge_operation,
      platform,
    } = order;
    const {fees} = orderBill;
    const itemInfo = getOrderItemInfo(items);
    let restCharges = getTransformedRestaurantCharges(restFee, order_type);
    const discountInfo = this.discountCalculationService.getDiscountOnOrder(
      order,
      couponInfo,
      itemInfo,
    );

    let packagingChargeDisabled = false;
    if (
      platform &&
      platform != 'easyeat' &&
      offlinePlatform &&
      Array.isArray(offlinePlatform) &&
      offlinePlatform.length
    ) {
      packagingChargeDisabled = true;
      for (const i in offlinePlatform) {
        const platformSettings = offlinePlatform[i];
        if (
          platformSettings['id'] == platform &&
          platformSettings['pkg_applicable']
        ) {
          packagingChargeDisabled = false;
        }
      }
    }

    restCharges = restCharges.filter(charges => {
      if (
        ((skip_packaging_charge_operation || packagingChargeDisabled) &&
          charges.class === 'packaging_charge') ||
        (skip_service_charge_operation && charges.class === 'service_tax')
      ) {
        return false;
      } else {
        return true;
      }
    });
    if (fees && fees.length) {
      fees.forEach(fee => {
        if (order_type == 1 && fee.id === 'delivery') {
          const deliveryChargeInterface: ChargesInterface = {
            chargeType: ChargeType.FIXED,
            chargeValue: fee.fee,
            applicableOn: [],
            chargeApplicableType: ChargeApplicableType.OVER_ALL,
            id: fee.id,
            name: fee.fee_name,
            class: 'DeliveryCharge',
            subName: 'DeliveryCharge',
          };
          restCharges.push(deliveryChargeInterface);
        }
        if (fee.id === 'loyalty_cashback') {
          const loyaltyDiscount: DiscountInterface = {
            name: fee.fee_name,
            discountType: DiscountType.FIXED,
            value: -1 * fee.fee,
            applicableOn: [],
            discountApplicableType: DiscountApplicableType.OVER_ALL,
            id: fee.id,
            discountAction: DiscountAction.NORMAL,
            discountCategory: DiscountCategory.MERCHANT,
            maxValue: 0,
          };
          discountInfo.push(loyaltyDiscount);
        }
      });
    }
    return this.getIndonesiaOrderBill(
      itemInfo,
      discountInfo,
      restCharges,
      round_off,
      country_code,
      taxAfterDiscount,
      platform,
      restaurant_platform,
    );
  }
}
