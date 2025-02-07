import {getCountryLanguage} from '../../enums/country.enum';
import {localize} from '../../locale/i18n';
import {getLocalizedData} from '../../utils/number-format';
import {CartCalculationInfo, CartItemInfo} from '../baseClass/cartItemInfo';
import {OrderCalculationInfo, OrderItemInfo} from '../baseClass/orderItemInfo';
import {
  ApplicableCartResponseDto,
  ApplicableOrderResponseDto,
  CalculateCartChargeDto,
  CalculateOrderChargeDto,
} from '../baseClass/responseDto';
import {RoundOffObj} from '../baseClass/roundOff';
import {CartDiscountDto} from '../discountClasses/cartDiscountDto';
import {OrderDiscountDto} from '../discountClasses/orderDiscountDto';
import {ChargeApplicableType, ChargeType} from '../enum/billLib.enum';
import {DiscountAction, DiscountCategory} from '../enum/discountLib.enum';
import {
  BillResponseInterface,
  DiscountFeeObj,
  FeeObj,
} from '../interfaces/billResponse.interface';
import {ChargesInterface} from '../interfaces/charges.interface';
import {
  getPlatformCommission,
  getRoundOffValue,
} from '../lib/common.function.lib';

export class BillLibraryService {
  getCartBill(
    cartItemInfo: CartItemInfo[],
    discountInfo: CartDiscountDto[],
    chargesInfo: ChargesInterface[],
    round_off: RoundOffObj,
    country_code,
  ): BillResponseInterface {
    const response: BillResponseInterface = {
      fees: [],
      bill_total: 0,
      message: 'Bill generated',
      status: 1,
      // bill_total_text: '0',
    };

    const cartCalculationInfo: CartCalculationInfo[] = [];
    // Item total fee object calculation
    const itemTotalFeeObj: FeeObj = {
      name: 'Item Total',
      value: 0,
      // value_text: '0',
      id: 'item_total',
    };

    cartItemInfo.forEach(item => {
      const cartCalculationObj = new CartCalculationInfo();
      cartCalculationObj.init(item);
      cartCalculationInfo.push(cartCalculationObj);
      itemTotalFeeObj.value += cartCalculationObj.effectivePrice;
    });

    itemTotalFeeObj.value = Number(itemTotalFeeObj.value.toFixed(2));
    // itemTotalFeeObj.value_text = itemTotalFeeObj.value.toFixed(2);
    response.fees.push(itemTotalFeeObj);

    // Applying discount
    let effectiveTotal = itemTotalFeeObj.value;
    const discountFeesArray: DiscountFeeObj[] = [];

    discountInfo.forEach(discount => {
      const discountFee: DiscountFeeObj = {
        name: discount.name,
        value: Number(discount.discountValue.toFixed(2)),
        // value_text: discount.discountValue.toFixed(2),
        id: discount.id,
        discountCategory: discount.discountCategory,
        reason: discount.reason,
      };
      if (discount.discountCategory === DiscountCategory.TOP_UP) {
        effectiveTotal += discount.discountValue;
        if (effectiveTotal > 0) {
          discount.itemDiscountInfo.forEach(itemDiscount => {
            const discountItem = cartCalculationInfo.find(
              item => item.cartItemId === itemDiscount.cartItemId,
            );
            if (discountItem) {
              discountItem.appliedDiscount += itemDiscount.itemDiscountValue;
            }
          });
          discountFeesArray.push(discountFee);
        }
      }
    });

    // apply negative discounts
    discountInfo.forEach(discount => {
      if (effectiveTotal > 0) {
        const discountFee: DiscountFeeObj = {
          name: discount.name,
          value: Number(discount.discountValue.toFixed(2)),
          // value_text: discount.discountValue.toFixed(2),
          id: discount.id,
          discountCategory: discount.discountCategory,
          reason: discount.reason,
        };
        if (discount.discountCategory === DiscountCategory.ITEM_LEVEL) {
          effectiveTotal += discount.discountValue;
          discount.itemDiscountInfo.forEach(itemDiscount => {
            const discountItem = cartCalculationInfo.find(
              item => item.cartItemId === itemDiscount.cartItemId,
            );
            if (discountItem) {
              if (
                discountItem.effectivePrice + discountItem.appliedDiscount >
                0
              ) {
                discountItem.appliedDiscount += itemDiscount.itemDiscountValue;
              }
            }
          });

          discountFeesArray.push(discountFee);
        }
      }
    });

    discountInfo.forEach(discount => {
      if (effectiveTotal > 0) {
        const discountFee: DiscountFeeObj = {
          name: discount.name,
          value: Number(discount.discountValue.toFixed(2)),
          // value_text: discount.discountValue.toFixed(2),
          id: discount.id,
          discountCategory: discount.discountCategory,
          reason: discount.reason,
        };
        if (
          discount.discountCategory !== DiscountCategory.ITEM_LEVEL &&
          discount.discountCategory !== DiscountCategory.TOP_UP &&
          discount.discountAction !== DiscountAction.FREE_DELIVERY
        ) {
          if (effectiveTotal >= -1 * discount.discountValue) {
            effectiveTotal += discount.discountValue;
            let tempTotal = 0;
            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = cartCalculationInfo.find(
                item => item.cartItemId === itemDiscount.cartItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice + discountItem.appliedDiscount >
                  0
                ) {
                  tempTotal +=
                    discountItem.effectivePrice + discountItem.appliedDiscount;
                }
              }
            });

            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = cartCalculationInfo.find(
                item => item.cartItemId === itemDiscount.cartItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice + discountItem.appliedDiscount >
                  0
                ) {
                  const propDiscount =
                    (discountItem.effectivePrice * discount.discountValue) /
                    tempTotal;
                  discountItem.appliedDiscount += propDiscount;
                }
              }
            });

            discountFeesArray.push(discountFee);
          } else {
            let tempTotal = 0;
            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = cartCalculationInfo.find(
                item => item.cartItemId === itemDiscount.cartItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice + discountItem.appliedDiscount >
                  0
                ) {
                  tempTotal +=
                    discountItem.effectivePrice + discountItem.appliedDiscount;
                }
              }
            });

            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = cartCalculationInfo.find(
                item => item.cartItemId === itemDiscount.cartItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice + discountItem.appliedDiscount >
                  0
                ) {
                  const propDiscount =
                    (discountItem.effectivePrice * effectiveTotal) / tempTotal;
                  discountItem.appliedDiscount -= propDiscount;
                }
              }
            });

            discount.discountValue = -1 * effectiveTotal;
            effectiveTotal = 0;
            discountFee.value = Number(discount.discountValue.toFixed(2));
            // discountFee.value_text = discountFee.value.toFixed(2);
            discountFeesArray.push(discountFee);
          }
        }
      }
    });
    // apply charges
    let deliveryCharge = 0;
    const chargesList: FeeObj[] = [];
    chargesInfo.forEach(charge => {
      const applicableResponse = this.findApplicableCartItemTotal(
        charge,
        cartCalculationInfo,
      );

      if (applicableResponse.status) {
        const chargeResponse = this.calculateCartChargeAmount(
          charge,
          applicableResponse,
        );
        if (chargeResponse.status) {
          if (charge.class === 'DeliveryFee') {
            deliveryCharge = 1;
          }
          chargesList.push(chargeResponse.chargeFee);
        }
      }
    });
    // add Free Delivery discount
    if (deliveryCharge) {
      const freeDeliveryDiscount = discountInfo.find(disc => {
        if (
          disc.discountCategory === DiscountCategory.COUPON &&
          disc.discountAction === DiscountAction.FREE_DELIVERY
        ) {
          return true;
        }
      });
      if (freeDeliveryDiscount) {
        if (deliveryCharge < -1 * freeDeliveryDiscount.discountValue) {
          freeDeliveryDiscount.discountValue = deliveryCharge * -1;
        }
        const discountFee: DiscountFeeObj = {
          name: freeDeliveryDiscount.name,
          value: Number(freeDeliveryDiscount.discountValue.toFixed(2)),
          // value_text: freeDeliveryDiscount.discountValue.toFixed(2),
          id: freeDeliveryDiscount.id,
          discountCategory: freeDeliveryDiscount.discountCategory,
          reason: 'delivery',
        };
        discountFeesArray.push(discountFee);
      }
    }
    response.fees.push(
      ...this.mergeItemAndMerchantDiscount(discountFeesArray, country_code),
    );
    response.fees.push(...chargesList);

    const sub_total = this.calculateBillTotal(response);

    //round off calculations
    const round_off_bill_total = getRoundOffValue(sub_total, round_off);
    const round_off_diff = round_off_bill_total - sub_total;

    if (round_off_diff && Number(round_off_diff.toFixed(2))) {
      response.fees.push({
        name: 'Round Off',
        value: Number(round_off_diff.toFixed(2)),
        // value_text: Number(round_off_diff).toFixed(2),
        id: 'round_off',
      });
      response.bill_total = this.calculateBillTotal(response);
    } else {
      response.bill_total = sub_total;
    }
    // response.bill_total_text = response.bill_total.toFixed(2);
    return response;
  }

  getOrderBill(
    orderItemInfo: OrderItemInfo[],
    discountInfo: OrderDiscountDto[],
    chargesInfo: ChargesInterface[],
    round_off: RoundOffObj,
    country_code = 'MY',
    platform,
    restaurant_platform,
  ): BillResponseInterface {
    let response: BillResponseInterface = {
      fees: [],
      bill_total: 0,
      message: 'Bill generated',
      status: 1,
      // bill_total_text: '0',
    };

    const language = getCountryLanguage(country_code);
    const orderCalculationInfo: OrderCalculationInfo[] = [];

    // Item total fee object calculation
    const itemTotalFeeObj: FeeObj = {
      name: localize('itemTotal', language),
      value: 0,
      // value_text: '0',
      id: 'item_total',
    };
    orderItemInfo.forEach(item => {
      const orderCalculationObj = new OrderCalculationInfo();
      orderCalculationObj.init(item);
      orderCalculationInfo.push(orderCalculationObj);
      itemTotalFeeObj.value += orderCalculationObj.effectivePrice;
    });

    itemTotalFeeObj.value = Number(itemTotalFeeObj.value.toFixed(2));
    // itemTotalFeeObj.value_text = itemTotalFeeObj.value.toFixed(2);
    response.fees.push(itemTotalFeeObj);
    // Applying discount
    let effectiveTotal = itemTotalFeeObj.value;
    const discountFeesArray: DiscountFeeObj[] = [];

    // first apply top up discount
    discountInfo.forEach(discount => {
      const discountFee: DiscountFeeObj = {
        name: discount.name,
        value: Number(discount.discountValue.toFixed(2)),
        // value_text: discount.discountValue.toFixed(2),
        id: discount.id,
        discountCategory: discount.discountCategory,
        reason: discount.reason,
      };
      if (discount.discountCategory === DiscountCategory.TOP_UP) {
        effectiveTotal += discount.discountValue;
        if (effectiveTotal > 0) {
          discount.itemDiscountInfo.forEach(itemDiscount => {
            const discountItem = orderCalculationInfo.find(
              item => item.orderItemId === itemDiscount.orderItemId,
            );
            if (discountItem) {
              discountItem.appliedDiscount += itemDiscount.itemDiscountValue;
            }
          });
          discountFeesArray.push(discountFee);
        }
      }
    });

    // apply negative discounts

    // apply loyalty
    discountInfo.forEach(discount => {
      if (effectiveTotal > 0) {
        const discountFee: DiscountFeeObj = {
          name: discount.name,
          value: Number(discount.discountValue.toFixed(2)),
          // value_text: discount.discountValue.toFixed(2),
          id: discount.id,
          discountCategory: discount.discountCategory,
          reason: discount.reason,
        };
        if (discount.discountCategory === DiscountCategory.LOYALTY) {
          if (effectiveTotal >= -1 * discount.discountValue) {
            effectiveTotal += discount.discountValue;
            let tempTotal = 0;
            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = orderCalculationInfo.find(
                item => item.orderItemId === itemDiscount.orderItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice +
                    itemDiscount.itemDiscountValue >=
                  0
                ) {
                  tempTotal +=
                    discountItem.effectivePrice + discountItem.appliedDiscount;
                }
              }
            });

            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = orderCalculationInfo.find(
                item => item.orderItemId === itemDiscount.orderItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice +
                    itemDiscount.itemDiscountValue >=
                  0
                ) {
                  const propDiscount =
                    ((discountItem.effectivePrice +
                      discountItem.appliedDiscount) *
                      discount.discountValue) /
                    tempTotal;
                  discountItem.appliedDiscount += propDiscount;
                }
              }
            });
            discountFeesArray.push(discountFee);
          } else {
            let tempTotal = 0;
            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = orderCalculationInfo.find(
                item => item.orderItemId === itemDiscount.orderItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice + discountItem.appliedDiscount >
                  0
                ) {
                  tempTotal +=
                    discountItem.effectivePrice + discountItem.appliedDiscount;
                }
              }
            });

            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = orderCalculationInfo.find(
                item => item.orderItemId === itemDiscount.orderItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice + discountItem.appliedDiscount >
                  0
                ) {
                  const propDiscount =
                    ((discountItem.effectivePrice +
                      discountItem.appliedDiscount) *
                      effectiveTotal) /
                    tempTotal;
                  discountItem.appliedDiscount -= propDiscount;
                }
              }
            });

            discount.discountValue = -1 * effectiveTotal;
            effectiveTotal = 0;
            discountFee.value = Number(discount.discountValue.toFixed(2));
            // discountFee.value_text = discountFee.value.toFixed(2);
            discountFeesArray.push(discountFee);
          }
        }
      }
    });
    //apply item level
    discountInfo.forEach(discount => {
      if (effectiveTotal > 0) {
        const discountFee: DiscountFeeObj = {
          name: discount.name,
          value: Number(discount.discountValue.toFixed(2)),
          // value_text: discount.discountValue.toFixed(2),
          id: discount.id,
          discountCategory: discount.discountCategory,
          reason: discount.reason,
        };
        if (discount.discountCategory === DiscountCategory.ITEM_LEVEL) {
          effectiveTotal += discount.discountValue;
          discount.itemDiscountInfo.forEach(itemDiscount => {
            const discountItem = orderCalculationInfo.find(
              item => item.orderItemId === itemDiscount.orderItemId,
            );
            if (discountItem) {
              if (
                discountItem.effectivePrice + itemDiscount.itemDiscountValue >=
                0
              ) {
                discountItem.appliedDiscount += itemDiscount.itemDiscountValue;
              }
            }
          });

          discountFeesArray.push(discountFee);
        }
      }
    });

    discountInfo.forEach(discount => {
      if (effectiveTotal > 0) {
        const discountFee: DiscountFeeObj = {
          name: discount.name,
          value: Number(discount.discountValue.toFixed(2)),
          // value_text: discount.discountValue.toFixed(2),
          id: discount.id,
          discountCategory: discount.discountCategory,
          reason: discount.reason,
        };
        if (
          discount.discountCategory !== DiscountCategory.ITEM_LEVEL &&
          discount.discountCategory !== DiscountCategory.TOP_UP &&
          discount.discountAction !== DiscountAction.FREE_DELIVERY &&
          discount.discountCategory !== DiscountCategory.LOYALTY
        ) {
          if (effectiveTotal >= -1 * discount.discountValue) {
            effectiveTotal += discount.discountValue;
            let tempTotal = 0;
            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = orderCalculationInfo.find(
                item => item.orderItemId === itemDiscount.orderItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice +
                    itemDiscount.itemDiscountValue >=
                  0
                ) {
                  tempTotal +=
                    discountItem.effectivePrice + discountItem.appliedDiscount;
                }
              }
            });

            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = orderCalculationInfo.find(
                item => item.orderItemId === itemDiscount.orderItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice +
                    itemDiscount.itemDiscountValue >=
                  0
                ) {
                  const propDiscount =
                    ((discountItem.effectivePrice +
                      discountItem.appliedDiscount) *
                      discount.discountValue) /
                    tempTotal;
                  discountItem.appliedDiscount += propDiscount;
                }
              }
            });
            discountFeesArray.push(discountFee);
          } else {
            let tempTotal = 0;
            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = orderCalculationInfo.find(
                item => item.orderItemId === itemDiscount.orderItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice + discountItem.appliedDiscount >
                  0
                ) {
                  tempTotal +=
                    discountItem.effectivePrice + discountItem.appliedDiscount;
                }
              }
            });

            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = orderCalculationInfo.find(
                item => item.orderItemId === itemDiscount.orderItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice + discountItem.appliedDiscount >
                  0
                ) {
                  const propDiscount =
                    ((discountItem.effectivePrice +
                      discountItem.appliedDiscount) *
                      effectiveTotal) /
                    tempTotal;
                  discountItem.appliedDiscount -= propDiscount;
                }
              }
            });

            discount.discountValue = -1 * effectiveTotal;
            effectiveTotal = 0;
            discountFee.value = Number(discount.discountValue.toFixed(2));
            // discountFee.value_text = discountFee.value.toFixed(2);
            discountFeesArray.push(discountFee);
          }
        }
      }
    });

    // apply charges
    let deliveryCharge = 0;
    const chargesList: FeeObj[] = [];
    chargesInfo.forEach(charge => {
      const applicableResponse = this.findApplicableOrderItemTotal(
        charge,
        orderCalculationInfo,
        discountInfo,
      );

      if (applicableResponse.status) {
        const chargeResponse = this.calculateOrderChargeAmount(
          charge,
          applicableResponse,
        );
        if (chargeResponse.status) {
          if (charge.class === 'DeliveryFee') {
            deliveryCharge = charge.chargeValue;
          }
          if (chargeResponse.chargeFee.value > 0) {
            chargesList.push(chargeResponse.chargeFee);
          }
        }
      }
    });

    // add Free Delivery discount
    if (deliveryCharge) {
      const freeDeliveryDiscount = discountInfo.find(disc => {
        if (
          disc.discountCategory === DiscountCategory.COUPON &&
          disc.discountAction === DiscountAction.FREE_DELIVERY
        ) {
          return true;
        }
      });
      if (freeDeliveryDiscount) {
        if (deliveryCharge < -1 * freeDeliveryDiscount.discountValue) {
          freeDeliveryDiscount.discountValue = deliveryCharge * -1;
        }
        const discountFee: DiscountFeeObj = {
          name: freeDeliveryDiscount.name,
          value: Number(freeDeliveryDiscount.discountValue.toFixed(2)),
          // value_text: freeDeliveryDiscount.discountValue.toFixed(2),
          id: freeDeliveryDiscount.id,
          discountCategory: freeDeliveryDiscount.discountCategory,
          reason: 'delivery',
        };
        discountFeesArray.push(discountFee);
      }
    }
    response.fees.push(
      ...this.mergeItemAndMerchantDiscount(discountFeesArray, country_code),
    );
    response.fees.push(...chargesList);
    const commission = getPlatformCommission(
      platform,
      restaurant_platform,
      itemTotalFeeObj.value,
    );
    if (commission.status == 1) {
      response.fees.push(commission.fees);
    }

    const sub_total = this.calculateBillTotal(response);

    //round off calculations

    const round_off_bill_total = getRoundOffValue(sub_total, round_off);
    const round_off_diff = round_off_bill_total - sub_total;

    if (round_off_diff && Number(round_off_diff.toFixed(2))) {
      response.fees.push({
        name: localize('roundOff', language),
        value: Number(round_off_diff.toFixed(2)),
        // value_text: Number(round_off_diff).toFixed(2),
        id: 'round_off',
      });
      response.bill_total = this.calculateBillTotal(response);
    } else {
      response.fees.push({
        name: localize('roundOff', language),
        value: 0,
        id: 'round_off',
      });
      response.bill_total = sub_total;
    }
    const quantity_keys_to_format = ['value', 'bill_total'];
    // response.bill_total_text = response.bill_total.toFixed(2);
    response = getLocalizedData(
      response,
      '',
      country_code,
      [],
      quantity_keys_to_format,
    );
    return response;
  }

  getIndonesiaOrderBill(
    orderItemInfo: OrderItemInfo[],
    discountInfo: OrderDiscountDto[],
    chargesInfo: ChargesInterface[],
    round_off: RoundOffObj,
    country_code = 'ID',
    taxAfterDiscount,
    platform,
    restaurant_platform,
  ): BillResponseInterface {
    let response: BillResponseInterface = {
      fees: [],
      bill_total: 0,
      message: 'Bill generated',
      status: 1,
      // bill_total_text: '0',
    };

    const language = getCountryLanguage(country_code);
    const orderCalculationInfo: OrderCalculationInfo[] = [];

    // Item total fee object calculation
    const itemTotalFeeObj: FeeObj = {
      name: localize('itemTotal', language),
      value: 0,
      // value_text: '0',
      id: 'item_total',
    };
    orderItemInfo.forEach(item => {
      const orderCalculationObj = new OrderCalculationInfo();
      orderCalculationObj.init(item);
      orderCalculationInfo.push(orderCalculationObj);
      itemTotalFeeObj.value += orderCalculationObj.effectivePrice;
    });

    itemTotalFeeObj.value = Number(itemTotalFeeObj.value.toFixed(2));
    // itemTotalFeeObj.value_text = itemTotalFeeObj.value.toFixed(2);
    response.fees.push(itemTotalFeeObj);
    // Applying discount
    let effectiveTotal = itemTotalFeeObj.value;
    const discountFeesArray: DiscountFeeObj[] = [];

    // first apply top up discount
    discountInfo.forEach(discount => {
      const discountFee: DiscountFeeObj = {
        name: discount.name,
        value: Number(discount.discountValue.toFixed(2)),
        // value_text: discount.discountValue.toFixed(2),
        id: discount.id,
        discountCategory: discount.discountCategory,
        reason: discount.reason,
      };
      if (discount.discountCategory === DiscountCategory.TOP_UP) {
        effectiveTotal += discount.discountValue;
        if (effectiveTotal > 0) {
          discount.itemDiscountInfo.forEach(itemDiscount => {
            const discountItem = orderCalculationInfo.find(
              item => item.orderItemId === itemDiscount.orderItemId,
            );
            if (discountItem) {
              discountItem.appliedDiscount += itemDiscount.itemDiscountValue;
            }
          });
          discountFeesArray.push(discountFee);
        }
      }
    });

    // apply negative discounts

    //loyalty
    discountInfo.forEach(discount => {
      if (effectiveTotal > 0) {
        const discountFee: DiscountFeeObj = {
          name: discount.name,
          value: Number(discount.discountValue.toFixed(2)),
          // value_text: discount.discountValue.toFixed(2),
          id: discount.id,
          discountCategory: discount.discountCategory,
          reason: discount.reason,
        };
        if (discount.discountCategory == DiscountCategory.LOYALTY) {
          if (effectiveTotal >= -1 * discount.discountValue) {
            effectiveTotal += discount.discountValue;
            let tempTotal = 0;
            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = orderCalculationInfo.find(
                item => item.orderItemId === itemDiscount.orderItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice +
                    itemDiscount.itemDiscountValue >=
                  0
                ) {
                  tempTotal +=
                    discountItem.effectivePrice + discountItem.appliedDiscount;
                }
              }
            });

            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = orderCalculationInfo.find(
                item => item.orderItemId === itemDiscount.orderItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice +
                    itemDiscount.itemDiscountValue >=
                  0
                ) {
                  const propDiscount =
                    ((discountItem.effectivePrice +
                      discountItem.appliedDiscount) *
                      discount.discountValue) /
                    tempTotal;
                  discountItem.appliedDiscount += propDiscount;
                }
              }
            });
            discountFeesArray.push(discountFee);
          } else {
            let tempTotal = 0;
            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = orderCalculationInfo.find(
                item => item.orderItemId === itemDiscount.orderItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice + discountItem.appliedDiscount >
                  0
                ) {
                  tempTotal +=
                    discountItem.effectivePrice + discountItem.appliedDiscount;
                }
              }
            });

            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = orderCalculationInfo.find(
                item => item.orderItemId === itemDiscount.orderItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice + discountItem.appliedDiscount >
                  0
                ) {
                  const propDiscount =
                    ((discountItem.effectivePrice +
                      discountItem.appliedDiscount) *
                      effectiveTotal) /
                    tempTotal;
                  discountItem.appliedDiscount -= propDiscount;
                }
              }
            });

            discount.discountValue = -1 * effectiveTotal;
            effectiveTotal = 0;
            discountFee.value = Number(discount.discountValue.toFixed(2));
            // discountFee.value_text = discountFee.value.toFixed(2);
            discountFeesArray.push(discountFee);
          }
        }
      }
    });

    // item-level
    discountInfo.forEach(discount => {
      if (effectiveTotal > 0) {
        const discountFee: DiscountFeeObj = {
          name: discount.name,
          value: Number(discount.discountValue.toFixed(2)),
          // value_text: discount.discountValue.toFixed(2),
          id: discount.id,
          discountCategory: discount.discountCategory,
          reason: discount.reason,
        };
        if (discount.discountCategory === DiscountCategory.ITEM_LEVEL) {
          effectiveTotal += discount.discountValue;
          discount.itemDiscountInfo.forEach(itemDiscount => {
            const discountItem = orderCalculationInfo.find(
              item => item.orderItemId === itemDiscount.orderItemId,
            );
            if (discountItem) {
              if (
                discountItem.effectivePrice + itemDiscount.itemDiscountValue >=
                0
              ) {
                discountItem.appliedDiscount += itemDiscount.itemDiscountValue;
              }
            }
          });

          discountFeesArray.push(discountFee);
        }
      }
    });

    discountInfo.forEach(discount => {
      if (effectiveTotal > 0) {
        const discountFee: DiscountFeeObj = {
          name: discount.name,
          value: Number(discount.discountValue.toFixed(2)),
          // value_text: discount.discountValue.toFixed(2),
          id: discount.id,
          discountCategory: discount.discountCategory,
          reason: discount.reason,
        };
        if (
          discount.discountCategory !== DiscountCategory.ITEM_LEVEL &&
          discount.discountCategory !== DiscountCategory.TOP_UP &&
          discount.discountAction !== DiscountAction.FREE_DELIVERY &&
          discount.discountCategory !== DiscountCategory.LOYALTY
        ) {
          if (effectiveTotal >= -1 * discount.discountValue) {
            effectiveTotal += discount.discountValue;
            let tempTotal = 0;
            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = orderCalculationInfo.find(
                item => item.orderItemId === itemDiscount.orderItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice +
                    itemDiscount.itemDiscountValue >=
                  0
                ) {
                  tempTotal +=
                    discountItem.effectivePrice + discountItem.appliedDiscount;
                }
              }
            });

            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = orderCalculationInfo.find(
                item => item.orderItemId === itemDiscount.orderItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice +
                    itemDiscount.itemDiscountValue >=
                  0
                ) {
                  const propDiscount =
                    ((discountItem.effectivePrice +
                      discountItem.appliedDiscount) *
                      discount.discountValue) /
                    tempTotal;
                  discountItem.appliedDiscount += propDiscount;
                }
              }
            });
            discountFeesArray.push(discountFee);
          } else {
            let tempTotal = 0;
            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = orderCalculationInfo.find(
                item => item.orderItemId === itemDiscount.orderItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice + discountItem.appliedDiscount >
                  0
                ) {
                  tempTotal +=
                    discountItem.effectivePrice + discountItem.appliedDiscount;
                }
              }
            });

            discount.itemDiscountInfo.forEach(itemDiscount => {
              const discountItem = orderCalculationInfo.find(
                item => item.orderItemId === itemDiscount.orderItemId,
              );
              if (discountItem) {
                if (
                  discountItem.effectivePrice + discountItem.appliedDiscount >
                  0
                ) {
                  const propDiscount =
                    ((discountItem.effectivePrice +
                      discountItem.appliedDiscount) *
                      effectiveTotal) /
                    tempTotal;
                  discountItem.appliedDiscount -= propDiscount;
                }
              }
            });

            discount.discountValue = -1 * effectiveTotal;
            effectiveTotal = 0;
            discountFee.value = Number(discount.discountValue.toFixed(2));
            // discountFee.value_text = discountFee.value.toFixed(2);
            discountFeesArray.push(discountFee);
          }
        }
      }
    });

    // apply charges
    let deliveryCharge = 0;
    const chargesList: FeeObj[] = [];
    // first calculate service tax
    let serviceCharge: FeeObj = null;
    for (const i in chargesInfo) {
      const charge = chargesInfo[i];
      if (charge.id === 'service_tax') {
        const applicableResponse = this.findIndonesiaApplicableOrderItemTotal(
          charge,
          orderCalculationInfo,
          discountInfo,
          taxAfterDiscount,
        );

        if (applicableResponse.status) {
          const chargeResponse = this.calculateOrderChargeAmount(
            charge,
            applicableResponse,
          );
          if (chargeResponse.status) {
            if (chargeResponse.chargeFee.value > 0) {
              serviceCharge = chargeResponse.chargeFee;
              chargesList.push(chargeResponse.chargeFee);
            }
          }
        }
        break;
      }
    }

    chargesInfo.forEach(charge => {
      if (charge.id !== 'service_tax') {
        const applicableResponse = this.findIndonesiaApplicableOrderItemTotal(
          charge,
          orderCalculationInfo,
          discountInfo,
          taxAfterDiscount,
        );

        if (charge.id.includes('sst_tax') && serviceCharge) {
          applicableResponse.itemTotalWithDiscount += serviceCharge.value;
        }

        if (applicableResponse.status) {
          const chargeResponse = this.calculateOrderChargeAmount(
            charge,
            applicableResponse,
          );
          if (chargeResponse.status) {
            if (charge.class === 'DeliveryFee') {
              deliveryCharge = charge.chargeValue;
            }
            if (chargeResponse.chargeFee.value > 0) {
              chargesList.push(chargeResponse.chargeFee);
            }
          }
        }
      }
    });

    // add Free Delivery discount
    if (deliveryCharge) {
      const freeDeliveryDiscount = discountInfo.find(disc => {
        if (
          disc.discountCategory === DiscountCategory.COUPON &&
          disc.discountAction === DiscountAction.FREE_DELIVERY
        ) {
          return true;
        }
      });
      if (freeDeliveryDiscount) {
        if (deliveryCharge < -1 * freeDeliveryDiscount.discountValue) {
          freeDeliveryDiscount.discountValue = deliveryCharge * -1;
        }
        const discountFee: DiscountFeeObj = {
          name: freeDeliveryDiscount.name,
          value: Number(freeDeliveryDiscount.discountValue.toFixed(2)),
          // value_text: freeDeliveryDiscount.discountValue.toFixed(2),
          id: freeDeliveryDiscount.id,
          discountCategory: freeDeliveryDiscount.discountCategory,
          reason: 'delivery',
        };
        discountFeesArray.push(discountFee);
      }
    }
    response.fees.push(
      ...this.mergeItemAndMerchantDiscount(discountFeesArray, country_code),
    );
    response.fees.push(...chargesList);
    const commission = getPlatformCommission(
      platform,
      restaurant_platform,
      itemTotalFeeObj.value,
    );
    if (commission.status == 1) {
      response.fees.push(commission.fees);
    }

    const sub_total = this.calculateBillTotal(response);

    //round off calculations
    const round_off_bill_total = getRoundOffValue(sub_total, round_off);
    const round_off_diff = round_off_bill_total - sub_total;

    if (round_off_diff && Number(round_off_diff.toFixed(2))) {
      response.fees.push({
        name: localize('roundOff', language),
        value: Number(round_off_diff.toFixed(2)),
        // value_text: Number(round_off_diff).toFixed(2),
        id: 'round_off',
      });
      response.bill_total = this.calculateBillTotal(response);
    } else {
      response.fees.push({
        name: localize('roundOff', language),
        value: 0,
        id: 'round_off',
      });
      response.bill_total = sub_total;
    }
    const quantity_keys_to_format = ['value', 'bill_total'];
    // response.bill_total_text = response.bill_total.toFixed(2);
    response = getLocalizedData(
      response,
      '',
      country_code,
      [],
      quantity_keys_to_format,
    );
    return response;
  }

  calculateCartChargeAmount(
    charge: ChargesInterface,
    applicableResponse: ApplicableCartResponseDto,
  ): CalculateCartChargeDto {
    const response: CalculateCartChargeDto = {
      status: 0,
      chargeFee: null,
    };
    const chargeFee: FeeObj = {
      name: charge.name,
      value: 0,
      // value_text: '',
      id: charge.id,
    };
    const {chargeType, chargeValue} = charge;
    const {itemTotalWithDiscount} = applicableResponse;
    switch (chargeType) {
      case ChargeType.FIXED:
        chargeFee.value = Number(chargeValue.toFixed(2));
        response.status = 1;
        break;
      case ChargeType.PERCENTAGE:
        chargeFee.value = Number(
          ((itemTotalWithDiscount * chargeValue) / 100).toFixed(2),
        );
        response.status = 1;
        break;
      default:
        response.status = 0;
        break;
    }
    // chargeFee.value_text = chargeFee.value.toFixed(2);
    response.chargeFee = chargeFee;
    return response;
  }

  calculateOrderChargeAmount(
    charge: ChargesInterface,
    applicableResponse: ApplicableOrderResponseDto,
  ): CalculateOrderChargeDto {
    const response: CalculateOrderChargeDto = {
      status: 0,
      chargeFee: null,
    };
    const chargeFee: FeeObj = {
      name: charge.name,
      value: 0,
      // value_text: '',
      id: charge.id,
    };
    const {chargeType, chargeValue} = charge;
    const {itemTotalWithDiscount, effectiveQuantity} = applicableResponse;
    switch (chargeType) {
      case ChargeType.FIXED:
        chargeFee.value = chargeValue * effectiveQuantity;
        response.status = 1;
        break;
      case ChargeType.PERCENTAGE:
        chargeFee.value = (itemTotalWithDiscount * chargeValue) / 100;
        response.status = 1;
        break;
      default:
        response.status = 0;
        break;
    }
    chargeFee.value = Number(chargeFee.value.toFixed(2));
    // chargeFee.value_text = chargeFee.value.toFixed(2);
    response.chargeFee = chargeFee;
    return response;
  }

  findApplicableCartItemTotal(
    charge: ChargesInterface,
    cartItemInfo: CartCalculationInfo[],
  ): ApplicableCartResponseDto {
    const response: ApplicableCartResponseDto = {
      itemTotalWithDiscount: 0,
      cartItemList: [],
      status: 0,
    };

    const {chargeApplicableType, applicableOn, class: className} = charge;

    switch (chargeApplicableType) {
      case ChargeApplicableType.ITEM:
        cartItemInfo.forEach(item => {
          const itemId = applicableOn.find(itemId => itemId === item.itemId);
          if (itemId) {
            const effectivePrice = item.effectivePrice + item.appliedDiscount;
            if (effectivePrice > 0) {
              response.itemTotalWithDiscount += effectivePrice;
              response.cartItemList.push(item.cartItemId);
            }
          }
        });
        break;
      case ChargeApplicableType.SUB_CATEGORY:
        cartItemInfo.forEach(item => {
          const subCatId = applicableOn.find(
            subCatId => subCatId === item.subcategoryId,
          );
          if (subCatId) {
            const effectivePrice = item.effectivePrice + item.appliedDiscount;
            if (effectivePrice > 0) {
              response.itemTotalWithDiscount += effectivePrice;
              response.cartItemList.push(item.cartItemId);
            }
          }
        });
        break;
      case ChargeApplicableType.OVER_ALL:
        cartItemInfo.forEach(item => {
          if (className === 'DeliveryCharge') {
            response.itemTotalWithDiscount += item.effectivePrice;
            response.cartItemList.push(item.cartItemId);
          } else {
            const effectivePrice = item.effectivePrice + item.appliedDiscount;
            if (effectivePrice > 0) {
              response.itemTotalWithDiscount += effectivePrice;
              response.cartItemList.push(item.cartItemId);
            }
          }
        });
        break;
      default:
        response.itemTotalWithDiscount = 0;
    }
    if (response.itemTotalWithDiscount > 0) {
      response.status = 1;
    }
    return response;
  }

  findApplicableOrderItemTotal(
    charge: ChargesInterface,
    orderItemInfo: OrderCalculationInfo[],
    discountInfo: OrderDiscountDto[],
  ): ApplicableOrderResponseDto {
    const response: ApplicableOrderResponseDto = {
      itemTotalWithDiscount: 0,
      orderItemList: [],
      status: 0,
      effectiveQuantity: 0,
    };
    let totalDiscount = 0;
    discountInfo.forEach(disc => {
      totalDiscount += disc.discountValue;
    });
    const {
      chargeApplicableType,
      applicableOn,
      class: className,
      chargeType,
    } = charge;
    switch (chargeApplicableType) {
      case ChargeApplicableType.ITEM:
        orderItemInfo.forEach(item => {
          const itemId = applicableOn.find(itemId => itemId === item.itemId);
          if (itemId) {
            const effectivePrice = item.effectivePrice;
            if (effectivePrice > 0) {
              response.itemTotalWithDiscount += effectivePrice;
              response.orderItemList.push(item.orderItemId);
              response.effectiveQuantity += item.quantity;
            }
          }
        });
        if (response.itemTotalWithDiscount + totalDiscount > 0) {
          response.itemTotalWithDiscount += totalDiscount;
        } else {
          response.itemTotalWithDiscount = 0;
        }
        break;
      case ChargeApplicableType.SUB_CATEGORY:
        orderItemInfo.forEach(item => {
          const subCatId = applicableOn.find(
            subCatId => subCatId === item.subcategoryId,
          );
          if (subCatId) {
            const effectivePrice = item.effectivePrice;
            if (effectivePrice > 0) {
              response.itemTotalWithDiscount += effectivePrice;
              response.orderItemList.push(item.orderItemId);
              response.effectiveQuantity += item.quantity;
            }
          }
        });
        if (response.itemTotalWithDiscount + totalDiscount > 0) {
          response.itemTotalWithDiscount += totalDiscount;
        } else {
          response.itemTotalWithDiscount = 0;
        }
        break;
      case ChargeApplicableType.OVER_ALL:
        orderItemInfo.forEach(item => {
          if (className === 'DeliveryCharge') {
            response.itemTotalWithDiscount += item.effectivePrice;
            response.orderItemList.push(item.orderItemId);
          } else {
            const effectivePrice = item.effectivePrice;
            if (effectivePrice > 0) {
              response.itemTotalWithDiscount += effectivePrice;
              response.orderItemList.push(item.orderItemId);
              if (chargeType == ChargeType.FIXED) {
                response.effectiveQuantity = 1;
              } else {
                response.effectiveQuantity += item.quantity;
              }
            }
          }
        });
        if (response.itemTotalWithDiscount + totalDiscount > 0) {
          response.itemTotalWithDiscount += totalDiscount;
        } else {
          response.itemTotalWithDiscount = 0;
        }
        break;
      default:
        response.itemTotalWithDiscount = 0;
    }

    if (response.itemTotalWithDiscount > 0) {
      response.status = 1;
    }
    return response;
  }

  findIndonesiaApplicableOrderItemTotal(
    charge: ChargesInterface,
    orderItemInfo: OrderCalculationInfo[],
    discountInfo: OrderDiscountDto[],
    taxAfterDiscount,
  ): ApplicableOrderResponseDto {
    const response: ApplicableOrderResponseDto = {
      itemTotalWithDiscount: 0,
      orderItemList: [],
      status: 0,
      effectiveQuantity: 0,
    };
    let totalDiscount = 0;
    if (taxAfterDiscount) {
      discountInfo.forEach(disc => {
        totalDiscount += disc.discountValue;
      });
    }
    const {
      chargeApplicableType,
      applicableOn,
      class: className,
      chargeType,
    } = charge;
    switch (chargeApplicableType) {
      case ChargeApplicableType.ITEM:
        orderItemInfo.forEach(item => {
          const itemId = applicableOn.find(itemId => itemId === item.itemId);
          if (itemId) {
            const effectivePrice = item.effectivePrice;
            if (effectivePrice > 0) {
              response.itemTotalWithDiscount += effectivePrice;
              response.orderItemList.push(item.orderItemId);
              response.effectiveQuantity += item.quantity;
            }
          }
        });
        if (response.itemTotalWithDiscount + totalDiscount > 0) {
          response.itemTotalWithDiscount += totalDiscount;
        } else {
          response.itemTotalWithDiscount = 0;
        }
        break;
      case ChargeApplicableType.SUB_CATEGORY:
        orderItemInfo.forEach(item => {
          const subCatId = applicableOn.find(
            subCatId => subCatId === item.subcategoryId,
          );
          if (subCatId) {
            const effectivePrice = item.effectivePrice;
            if (effectivePrice > 0) {
              response.itemTotalWithDiscount += effectivePrice;
              response.orderItemList.push(item.orderItemId);
              response.effectiveQuantity += item.quantity;
            }
          }
        });
        if (response.itemTotalWithDiscount + totalDiscount > 0) {
          response.itemTotalWithDiscount += totalDiscount;
        } else {
          response.itemTotalWithDiscount = 0;
        }
        break;
      case ChargeApplicableType.OVER_ALL:
        orderItemInfo.forEach(item => {
          if (className === 'DeliveryCharge') {
            response.itemTotalWithDiscount += item.effectivePrice;
            response.orderItemList.push(item.orderItemId);
          } else {
            const effectivePrice = item.effectivePrice;

            if (effectivePrice > 0) {
              if (chargeType == ChargeType.FIXED) {
                response.effectiveQuantity = 1;
              } else {
                response.effectiveQuantity += item.quantity;
              }
              response.itemTotalWithDiscount += effectivePrice;
              response.orderItemList.push(item.orderItemId);
            }
          }
        });
        if (response.itemTotalWithDiscount + totalDiscount > 0) {
          response.itemTotalWithDiscount += totalDiscount;
        } else {
          response.itemTotalWithDiscount = 0;
        }
        break;
      default:
        response.itemTotalWithDiscount = 0;
    }

    if (response.itemTotalWithDiscount > 0) {
      response.status = 1;
    }
    return response;
  }

  calculateBillTotal(billInfo: BillResponseInterface) {
    let total = 0;
    billInfo.fees.forEach(fee => {
      total += fee.value;
    });
    return total;
  }

  mergeItemAndMerchantDiscount(
    discountFeesArray: DiscountFeeObj[],
    country_code,
  ): FeeObj[] {
    const response: FeeObj[] = [];
    const language = getCountryLanguage(country_code);
    const itemLevel = {
      status: 0,
      value: 0,
      name: localize('itemLevel', language),
      reason: '',
    };
    let itemLevelCount = 0;
    let isTopUp = 0;
    discountFeesArray.forEach(discount => {
      if (discount.discountCategory === DiscountCategory.ITEM_LEVEL) {
        itemLevel.value += discount.value;
        itemLevel.status = 1;
        itemLevelCount++;
        if (itemLevelCount == 1) {
          itemLevel.reason = discount.reason;
        } else {
          itemLevel.reason = localize('itemLevel', language);
        }
      }
    });

    const discountItemMerchant: FeeObj = {
      name: '',
      value: 0,
      // value_text: '',
      id: 'coupon_discount',
      reason: '',
    };
    let flag = 0;
    if (itemLevel.status) {
      discountItemMerchant.value = itemLevel.value;
      discountItemMerchant.name = '(' + '"' + itemLevel.reason + '"';
      flag = 1;
      discountItemMerchant.reason = itemLevel.reason;
    }
    discountFeesArray.forEach(discount => {
      if (discount.discountCategory === DiscountCategory.MERCHANT) {
        if (discount.reason) {
          discount.name = '"' + discount.reason + '"';
        } else {
          discount.name = '"' + localize('byRestaurant', language) + '"';
          discount.reason = localize('byRestaurant', language);
        }
        discountItemMerchant.value += discount.value;
        if (flag) {
          discountItemMerchant.name =
            discountItemMerchant.name + ',' + discount.name;
          discountItemMerchant.reason =
            discount.reason + ',' + discountItemMerchant.reason;
        } else {
          discountItemMerchant.name = '(' + discount.name;
          flag = 1;
          discountItemMerchant.reason = discount.reason;
        }
      } else if (discount.discountCategory === DiscountCategory.TOP_UP) {
        isTopUp = 1;
        if (discount.reason) {
          discount.name = '"' + discount.reason + '"';
        } else {
          discount.name = '"' + localize('byRestaurant', language) + '"';
          discount.reason = localize('byRestaurant', language);
        }
        discountItemMerchant.value += discount.value;
        if (flag) {
          discountItemMerchant.name =
            discountItemMerchant.name + ',' + discount.name;
          discountItemMerchant.reason =
            discount.reason + ',' + discountItemMerchant.reason;
        } else {
          discountItemMerchant.name = '(' + discount.name;
          flag = 1;
          discountItemMerchant.reason = discount.reason;
        }
      } else if (discount.discountCategory != DiscountCategory.ITEM_LEVEL) {
        delete discount.discountCategory;
        if (discount.value != 0) {
          discount.name = 'Discount(' + discount.name + ')';
          response.push(discount);
        }
      }
    });

    if (flag) {
      if (isTopUp) {
        discountItemMerchant.name = 'TopUp' + discountItemMerchant.name + ')';
      } else {
        discountItemMerchant.name =
          'Discount' + discountItemMerchant.name + ')';
      }
      // discountItemMerchant.value_text = discountItemMerchant.value.toFixed(2);
      if (discountItemMerchant.value != 0) {
        response.push(discountItemMerchant);
      }
    }
    if (response.length == 0) {
      const emptyDiscount: FeeObj = {
        name: 'Discount',
        value: 0,
        id: 'coupon_discount',
        reason: '',
      };
      response.push(emptyDiscount);
    }
    return response;
  }
}
