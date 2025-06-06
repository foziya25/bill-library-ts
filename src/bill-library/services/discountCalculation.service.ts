import {OrderItemInfo} from '../baseClass/orderItemInfo';
import {
  CouponInfoDto,
  GetCouponInfoDto,
  GetItemLevelDiscountInterfaceDto,
  GetMerchantDiscountInterfaceDto,
  SaveDiscountObjDto,
} from '../dto/discount.dto';
import {
  DiscountAction,
  DiscountApplicableType,
  DiscountCategory,
  DiscountType,
} from '../enum/discountLib.enum';
import {DiscountInterface} from '../interfaces/discount.interface';
import {getCartItemTotal} from '../lib/common.function.lib';

export class DiscountCalculationService {
  getDiscountFromCart(cart: any, itemInfo: OrderItemInfo[], coupon_info: any) {
    const discountInterfaceList: DiscountInterface[] = [];
    const item_total = getCartItemTotal(itemInfo);
    const discountInfo = this.getDiscountInfoFromCart(
      cart,
      coupon_info,
      item_total,
    );

    if (discountInfo) {
      for (const i in discountInfo) {
        const discount = discountInfo[i];

        switch (discount.type) {
          case DiscountCategory.COUPON:
            const couponId = discount.info.id;
            const couponData = discount.info.discountData;
            const getCouponInfoDto: GetCouponInfoDto = {
              couponInfoDto: couponData,
              itemInfo: itemInfo,
              coupon_id: couponId,
            };
            const couponInterface =
              this.getOrderCouponDiscountInterface(getCouponInfoDto);
            if (couponInterface) {
              discountInterfaceList.push(couponInterface);
            } else {
              // remove coupon id from order;
            }
            break;
          case DiscountCategory.MERCHANT:
            const discountMData = discount.info.discountData;
            const discountMid = discount.info.id;
            const getMerchantDiscountInterfaceDto: GetMerchantDiscountInterfaceDto =
              {
                id: discountMid,
                type: discountMData.type,
                value: discountMData.value,
                discountType: discountMData.discountType,
                reason: discountMData.reason,
              };
            const merchantInterface = this.getMerchantDiscountInterface(
              getMerchantDiscountInterfaceDto,
            );
            if (merchantInterface) {
              discountInterfaceList.push(merchantInterface);
            }
            break;
          case DiscountCategory.ITEM_LEVEL:
            const discountILData = discount.info.discountData;
            const discountILid = discount.info.id;
            const getItemLevelDiscountInterfaceDto: GetItemLevelDiscountInterfaceDto =
              {
                id: discountILid,
                value: discountILData.value,
                discountType: discountILData.discountType,
                itemInfo: itemInfo,
                quantity: discountILData.quantity,
                orderItemId: discountILData.orderItemId,
                reason: discountILData.reason,
              };
            const itemLevelInterface = this.getItemLevelDiscountInterface(
              getItemLevelDiscountInterfaceDto,
            );
            if (itemLevelInterface) {
              discountInterfaceList.push(itemLevelInterface);
            }
            break;
        }
      }
    }
    return discountInterfaceList;
  }

  getDiscountInfoFromCart(
    cart: any,
    coupon_info: any,
    item_total: number,
  ): any {
    const discountInfo: any[] = [];
    const {
      coupon_id,
      reason,
      coupon_name,
      dvalue,
      dtype,
      cart_items,
      order_type,
    } = cart;
    if (coupon_info && coupon_id && coupon_id === coupon_info.coupon_id) {
      const values = coupon_info.values;
      const value_ranges = coupon_info.value_ranges;
      let value = coupon_info.value;
      for (const i in value_ranges) {
        const range = value_ranges[i];
        if (range >= item_total) {
          value = values[i];
          break;
        }
      }

      const couponInfoData: CouponInfoDto = {
        applicableOn: coupon_info.applicable_on,
        requiredList: coupon_info.required_list,
        applicableQuantity: coupon_info.applicable_qty,
        applicableType: coupon_info.applicable_type,
        discountType: coupon_info.discount_type,
        applicableDValue: coupon_info.applicable_dvalue,
        applicableDType: null,
        maxValue: coupon_info.max_amount,
        minAmount: coupon_info.min_amount,
        name: coupon_info.code,
        value: value,
        code: coupon_info.code,
        reason: reason,
      };
      if (coupon_info.applicable_dtype === 'flat') {
        couponInfoData.applicableDType = DiscountType.FIXED;
      } else if (coupon_info.applicable_dtype === 'percent') {
        couponInfoData.applicableDType = DiscountType.PERCENTAGE;
      }
      const discountInfoObj: SaveDiscountObjDto = {
        type: DiscountCategory.COUPON,
        info: {id: coupon_id, discountData: couponInfoData},
      };
      const discountOrderType = coupon_info.order_type;
      if (discountOrderType) {
        for (const i in discountOrderType) {
          const applicableOrderType = discountOrderType[i];
          if (applicableOrderType == order_type) {
            discountInfo.push(discountInfoObj);
            break;
          }
        }
      }
    }

    if (coupon_id === 'mm_discount' || coupon_id === 'mm_topup') {
      const mDiscountObj: SaveDiscountObjDto = {
        type: DiscountCategory.MERCHANT,
        info: {
          id: coupon_id,
          discountData: {
            value: dvalue,
            reason,
            discountName: coupon_name,
          },
        },
      };
      if (coupon_id === 'mm_discount') {
        mDiscountObj.info.discountData.type = DiscountAction.NORMAL;
      } else if (coupon_id === 'mm_topup') {
        mDiscountObj.info.discountData.type = DiscountAction.TOP_UP;
      }

      if (dtype === 'fixed') {
        mDiscountObj.info.discountData.discountType = DiscountType.FIXED;
      } else if (dtype === 'per') {
        mDiscountObj.info.discountData.discountType = DiscountType.PERCENTAGE;
      }
      discountInfo.push(mDiscountObj);
    }
    cart_items.forEach(item => {
      const {item_discount} = item;

      if (item_discount) {
        const {value, type, reason, qty} = item_discount;
        const itemLevelDiscountObj: SaveDiscountObjDto = {
          type: DiscountCategory.ITEM_LEVEL,
          info: {
            id: 'IL_' + item.cart_item_id,
            discountData: {
              orderItemId: item.cart_item_id,
              value,
              quantity: qty,
              reason,
            },
          },
        };
        if (type === 'percent') {
          itemLevelDiscountObj.info.discountData.discountType =
            DiscountType.PERCENTAGE;
        } else if (type === 'fixed') {
          itemLevelDiscountObj.info.discountData.discountType =
            DiscountType.FIXED;
        }
        discountInfo.push(itemLevelDiscountObj);
      }
    });
    return discountInfo;
  }

  getDiscountOnOrder(
    order: any,
    couponInfo: any,
    itemInfo: OrderItemInfo[],
  ): DiscountInterface[] {
    const discountInterfaceList: DiscountInterface[] = [];
    const item_total = getCartItemTotal(itemInfo);
    const discountInfo = this.getDiscountInfoFromOrder(
      order,
      couponInfo,
      item_total,
    );

    if (discountInfo) {
      for (const i in discountInfo) {
        const discount = discountInfo[i];
        switch (discount.type) {
          case DiscountCategory.COUPON:
            const couponId = discount.info.id;
            const couponData = discount.info.discountData;
            const getCouponInfoDto: GetCouponInfoDto = {
              couponInfoDto: couponData,
              itemInfo: itemInfo,
              coupon_id: couponId,
            };
            const couponInterface =
              this.getOrderCouponDiscountInterface(getCouponInfoDto);
            if (couponInterface) {
              discountInterfaceList.push(couponInterface);
            } else {
              // remove coupon id from order;
            }
            break;
          case DiscountCategory.MERCHANT:
            const discountMData = discount.info.discountData;
            const discountMid = discount.info.id;
            const getMerchantDiscountInterfaceDto: GetMerchantDiscountInterfaceDto =
              {
                id: discountMid,
                type: discountMData.type,
                value: discountMData.value,
                discountType: discountMData.discountType,
                reason: discountMData.reason,
              };
            const merchantInterface = this.getMerchantDiscountInterface(
              getMerchantDiscountInterfaceDto,
            );
            if (merchantInterface) {
              discountInterfaceList.push(merchantInterface);
            }
            break;
          case DiscountCategory.ITEM_LEVEL:
            const discountILData = discount.info.discountData;
            const discountILid = discount.info.id;
            const getItemLevelDiscountInterfaceDto: GetItemLevelDiscountInterfaceDto =
              {
                id: discountILid,
                value: discountILData.value,
                discountType: discountILData.discountType,
                itemInfo: itemInfo,
                quantity: discountILData.quantity,
                orderItemId: discountILData.orderItemId,
                reason: discountILData.reason,
              };
            const itemLevelInterface = this.getItemLevelDiscountInterface(
              getItemLevelDiscountInterfaceDto,
            );
            if (itemLevelInterface) {
              discountInterfaceList.push(itemLevelInterface);
            }
            break;
        }
      }
    }
    return discountInterfaceList;
  }
  // same name function in PHP
  getDiscountInfoFromOrder(
    order: any,
    coupon_info: any,
    item_total: number,
  ): any {
    const discountInfo: any[] = [];
    const {coupon_id, reason, coupon_name, dtype, dvalue, items, order_type} =
      order;
    if (coupon_info && coupon_id && coupon_id === coupon_info.coupon_id) {
      const values = coupon_info.values;
      const value_ranges = coupon_info.value_ranges;
      let value = coupon_info.value;
      for (const i in value_ranges) {
        const range = value_ranges[i];
        if (range >= item_total) {
          value = values[i];
          break;
        }
      }

      const couponInfoData: CouponInfoDto = {
        applicableOn: coupon_info.applicable_on,
        requiredList: coupon_info.required_list,
        applicableQuantity: coupon_info.applicable_qty,
        applicableType: coupon_info.applicable_type,
        discountType: coupon_info.discount_type,
        applicableDValue: coupon_info.applicable_dvalue,
        applicableDType: null,
        maxValue: coupon_info.max_amount,
        minAmount: coupon_info.min_amount,
        name: coupon_info.code,
        value: value,
        code: coupon_info.code,
        reason: reason,
      };
      if (coupon_info.applicable_dtype === 'flat') {
        couponInfoData.applicableDType = DiscountType.FIXED;
      } else if (coupon_info.applicable_dtype === 'percent') {
        couponInfoData.applicableDType = DiscountType.PERCENTAGE;
      }
      const discountInfoObj: SaveDiscountObjDto = {
        type: DiscountCategory.COUPON,
        info: {id: coupon_id, discountData: couponInfoData},
      };
      const discountOrderType = coupon_info.order_type;
      if (discountOrderType) {
        for (const i in discountOrderType) {
          const applicableOrderType = discountOrderType[i];
          if (applicableOrderType == order_type) {
            discountInfo.push(discountInfoObj);
            break;
          }
        }
      }
    }

    if (coupon_id === 'mm_discount' || coupon_id === 'mm_topup') {
      const mDiscountObj: SaveDiscountObjDto = {
        type: DiscountCategory.MERCHANT,
        info: {
          id: coupon_id,
          discountData: {
            value: dvalue,
            reason,
            discountName: coupon_name,
          },
        },
      };
      if (coupon_id === 'mm_discount') {
        mDiscountObj.info.discountData.type = DiscountAction.NORMAL;
      } else if (coupon_id === 'mm_topup') {
        mDiscountObj.info.discountData.type = DiscountAction.TOP_UP;
      }

      if (dtype === 'fixed') {
        mDiscountObj.info.discountData.discountType = DiscountType.FIXED;
      } else if (dtype === 'per') {
        mDiscountObj.info.discountData.discountType = DiscountType.PERCENTAGE;
      }
      discountInfo.push(mDiscountObj);
    }
    items.forEach(item => {
      const {item_discount} = item;
      if (item_discount) {
        const {value, type, reason, qty} = item_discount;
        const itemLevelDiscountObj: SaveDiscountObjDto = {
          type: DiscountCategory.ITEM_LEVEL,
          info: {
            id: 'IL_' + item.order_item_id,
            discountData: {
              orderItemId: item.order_item_id,
              value,
              quantity: qty,
              reason,
            },
          },
        };
        if (type === 'percent') {
          itemLevelDiscountObj.info.discountData.discountType =
            DiscountType.PERCENTAGE;
        } else if (type === 'fixed') {
          itemLevelDiscountObj.info.discountData.discountType =
            DiscountType.FIXED;
        }
        discountInfo.push(itemLevelDiscountObj);
      }
    });
    return discountInfo;
  }

  getOrderCouponDiscountInterface(
    getCouponInfoDto: GetCouponInfoDto,
  ): DiscountInterface {
    const {discountType} = getCouponInfoDto.couponInfoDto;
    switch (discountType) {
      case 'bxgy':
      case 'bxgyoz':
        return this.getBxGyDiscountFromOrder(getCouponInfoDto);
      case 'sxgdo':
      case 'percentage':
      case 'fixed':
        return this.getFPOFdDiscountFromOrder(getCouponInfoDto);
    }
  }

  getFPOFdDiscountFromOrder(
    getCouponInfoDto: GetCouponInfoDto,
  ): DiscountInterface {
    const {couponInfoDto, coupon_id, itemInfo} = getCouponInfoDto;
    const {
      applicableOn,
      applicableType,
      maxValue,
      minAmount,
      name,
      discountType,
    } = couponInfoDto;
    let {value} = couponInfoDto;
    const itemTotal = getCartItemTotal(itemInfo);
    if (itemTotal <= minAmount) {
      return null;
    }

    const isApplicableOnItems = this.verifyAppliedOnItems(
      {applicableType, applicableOn},
      itemInfo,
    );
    if (!isApplicableOnItems) {
      return null;
    }

    let discountTypeEnum = null;
    let discountAction = null;
    switch (discountType) {
      case 'fixed':
        discountTypeEnum = DiscountType.FIXED;
        discountAction = DiscountAction.NORMAL;
        break;
      case 'percentage':
        if (value > 100) {
          value = 100;
        }
        discountTypeEnum = DiscountType.PERCENTAGE;
        discountAction = DiscountAction.NORMAL;
        break;
      case 'sxgdo':
        discountTypeEnum = DiscountType.FIXED;
        discountAction = DiscountAction.FREE_DELIVERY;
        break;
    }

    const discountInterfaceObj: DiscountInterface = {
      name: name,
      discountType: discountTypeEnum,
      value: value,
      applicableOn: applicableOn,
      discountApplicableType: this.getDiscountApplicableType(applicableType),
      id: 'coupon_discount',
      discountAction: discountAction,
      discountCategory: DiscountCategory.COUPON,
      maxValue: maxValue,
    };
    return discountInterfaceObj;
  }

  getBxGyDiscountFromOrder(
    getCouponInfoDto: GetCouponInfoDto,
  ): DiscountInterface {
    const {couponInfoDto, coupon_id, itemInfo} = getCouponInfoDto;
    const {
      applicableOn,
      applicableType,
      applicableDType,
      maxValue,
      minAmount,
      name,
    } = couponInfoDto;

    const itemTotal = getCartItemTotal(itemInfo);
    if (itemTotal <= minAmount) {
      return null;
    }

    const discountCal = this.calculateAppliedOnBxGyItems(
      couponInfoDto,
      itemInfo,
    );

    if (discountCal && discountCal.status) {
      const discountInterfaceObj: DiscountInterface = {
        name: name,
        discountType: discountCal.applicableDType,
        value: discountCal.discountValue,
        applicableOn: applicableOn,
        discountApplicableType: this.getDiscountApplicableType(applicableType),
        id: 'coupon_discount',
        discountAction: DiscountAction.NORMAL,
        discountCategory: DiscountCategory.COUPON,
        maxValue: maxValue,
      };
      return discountInterfaceObj;
    }
  }

  verifyAppliedOnItems(
    applicableInfo: {applicableType: number; applicableOn: any[]},
    itemInfo: OrderItemInfo[],
  ): boolean {
    const {applicableType, applicableOn} = applicableInfo;
    if (applicableType === 0) {
      return true;
    } else {
      const key = this.getAppliedOnKey(applicableType);
      for (const i in itemInfo) {
        for (const j in applicableOn) {
          if (itemInfo[i][key] === applicableOn[j]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  getAppliedOnKey(applicableType: number): string {
    switch (applicableType) {
      case 0:
        return 'order';
      case 1:
        return 'categoryId';
      case 2:
        return 'subcategoryId';
      case 3:
        return 'itemId';
      default:
        return '';
    }
  }

  getDiscountApplicableType(applicableType: number): DiscountApplicableType {
    switch (applicableType) {
      case 0:
        return DiscountApplicableType.OVER_ALL;
      case 1:
        return DiscountApplicableType.CATEGORY;
      case 2:
        return DiscountApplicableType.SUB_CATEGORY;
      case 3:
        return DiscountApplicableType.ITEM;
      default:
        return null;
    }
  }

  calculateAppliedOnBxGyItems(
    coupon_info: CouponInfoDto,
    itemInfo: OrderItemInfo[],
  ): any {
    const response = {
      status: false,
      discountValue: 0,
      applicableDType: null,
    };
    const {
      requiredList,
      applicableOn,
      applicableQuantity,
      applicableType,
      discountType,
      applicableDType,
      maxValue,
    } = coupon_info;
    let applicableDValue = coupon_info.applicableDValue;
    if (applicableType === 0) {
      return response;
    } else {
      const key = this.getAppliedOnKey(applicableType);
      const appliedItem = {present: 0, qty: 0, price: 0};
      const applicableList = [];
      for (const i in itemInfo) {
        for (const j in applicableOn) {
          if (itemInfo[i][key] === applicableOn[j]) {
            appliedItem.present = 1;
            const itemY = {
              qty: itemInfo[i].quantity,
              price: itemInfo[i].price,
            };
            applicableList.push(itemY);
          }
        }
      }

      if (applicableList.length) {
        applicableList.sort((a, b) => a.price - b.price);
        let requiredQty = applicableQuantity;
        for (const item of applicableList) {
          if (requiredQty > 0) {
            if (item.qty <= requiredQty) {
              appliedItem.price = appliedItem.price + item.qty * item.price;
              requiredQty = requiredQty - item.qty;
              appliedItem.qty = appliedItem.qty + item.qty;
            } else {
              appliedItem.price = appliedItem.price + requiredQty * item.price;
              appliedItem.qty = appliedItem.qty + requiredQty;
              requiredQty = 0;
            }
          }
        }
      }

      if (appliedItem.present && appliedItem.qty == applicableQuantity) {
        for (const l in requiredList) {
          const listData = requiredList[l];
          const listKey = this.getAppliedOnKey(listData.type);
          const listQuantity = listData.qty;
          let totalPresent = 0;
          for (const i in itemInfo) {
            for (const j in listData.on) {
              if (itemInfo[i][listKey] === listData.on[j]) {
                totalPresent += itemInfo[i].quantity;
              }
            }
          }
          if (totalPresent < listQuantity) {
            return response;
          }
        }
        if (discountType === 'bxgy') {
          response.status = true;
          response.discountValue = appliedItem.price;
          response.applicableDType = DiscountType.FIXED;
          return response;
        } else if (discountType === 'bxgyoz') {
          response.applicableDType = applicableDType;
          switch (applicableDType) {
            case DiscountType.FIXED:
              let useValue = applicableDValue;
              if (applicableDValue > appliedItem.price) {
                useValue = appliedItem.price;
              }
              if (useValue > maxValue) {
                useValue = maxValue;
              }
              response.discountValue = useValue;
              response.status = true;
              break;
            case DiscountType.PERCENTAGE:
              if (applicableDValue > 100) {
                applicableDValue = 100;
              }
              let percentageValue =
                (applicableDValue * appliedItem.price) / 100;
              if (percentageValue > maxValue) {
                percentageValue = maxValue;
              }
              response.discountValue = percentageValue;
              response.status = true;
              response.applicableDType = DiscountType.FIXED;
              break;
          }
          return response;
        }
      } else {
        return response;
      }
    }
  }

  getMerchantDiscountInterface(
    getMerchantDiscountInterfaceDto: GetMerchantDiscountInterfaceDto,
  ): DiscountInterface {
    const {type, value, discountType, id, reason} =
      getMerchantDiscountInterfaceDto;
    const discountInterfaceObj: DiscountInterface = {
      name: 'Merchant',
      discountType: discountType,
      value: value,
      applicableOn: [],
      discountApplicableType: DiscountApplicableType.OVER_ALL,
      id: id,
      discountAction: null,
      discountCategory: null,
      maxValue: null,
      reason: reason,
    };
    if (type === DiscountAction.NORMAL) {
      discountInterfaceObj.discountAction = DiscountAction.NORMAL;
      discountInterfaceObj.discountCategory = DiscountCategory.MERCHANT;
    } else if (type === DiscountAction.TOP_UP) {
      discountInterfaceObj.discountAction = DiscountAction.TOP_UP;
      discountInterfaceObj.discountCategory = DiscountCategory.TOP_UP;
    }
    return discountInterfaceObj;
  }

  getItemLevelDiscountInterface(
    getItemLevelDiscountInterfaceDto: GetItemLevelDiscountInterfaceDto,
  ): DiscountInterface {
    const {value, discountType, id, orderItemId, itemInfo, reason} =
      getItemLevelDiscountInterfaceDto;
    let {quantity} = getItemLevelDiscountInterfaceDto;
    const itemData = itemInfo.find(item => {
      if (item.orderItemId === orderItemId) {
        return true;
      }
    });
    if (itemData) {
      const itemPrice = itemData.price * itemData.quantity;
      if (quantity > itemData.quantity) {
        quantity = itemData.quantity;
      }
      let useValue = value * quantity;
      if (discountType !== DiscountType.PERCENTAGE && useValue > itemPrice) {
        useValue = itemPrice;
      }
      if (quantity < 0 || itemData.quantity < 0) {
        useValue = 0;
      }
      const discountInterfaceObj: DiscountInterface = {
        name: 'Item Level',
        discountType: discountType,
        value: useValue,
        applicableOn: [orderItemId],
        discountApplicableType: DiscountApplicableType.ORDER_ITEM_ID,
        id: id,
        discountAction: DiscountAction.NORMAL,
        discountCategory: DiscountCategory.ITEM_LEVEL,
        maxValue: null,
        reason: reason,
      };
      return discountInterfaceObj;
    }
  }
}
