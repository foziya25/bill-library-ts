import {localize} from '../../locale/i18n';
import {DiscountCalculationDtoImpl} from '../baseClass/cartItemInfo';
import {DiscountType} from '../enum/discountLib.enum';
import {DiscountCalculationDto} from '../interfaces/discount.interface';
import {
  ItemCalculationDto,
  ItemInfoDto,
} from '../interfaces/itemInfo.interface';
import {CountryMapping, getCountryLanguage} from '../../enums/country.enum';
import {getCartItemInfoNew} from '../lib/common.function.lib';

export class DiscountService {
  extractCouponInfo(
    discountCalculationDto: DiscountCalculationDto,
    couponInfo: any,
    orderType: string,
    reason: string,
  ): DiscountCalculationDto {
    if (couponInfo) {
      const couponInfoData = {
        applicableOn: couponInfo.applicable_on || null,
        requiredList: couponInfo.required_list || null,
        applicableQuantity: couponInfo.applicable_qty || null,
        applicableType:
          couponInfo.applicable_type != undefined
            ? couponInfo.applicable_type
            : null,
        discountType: couponInfo.discount_type || null,
        applicableDValue:
          couponInfo.applicable_dvalue != undefined
            ? couponInfo.applicable_dvalue
            : null,
        applicableDType: null,
        maxValue: couponInfo.max_amount || null,
        minAmount: couponInfo.min_amount || null,
        name: couponInfo.code || null, // check this if name or code
        value: couponInfo.value || null,
        code: couponInfo.code || null,
        reason: reason,
        freeDelLimit:
          couponInfo.free_del_limit != undefined
            ? couponInfo.free_del_limit
            : null,
        values: couponInfo.values || null,
        valueRanges: couponInfo.value_ranges || null,
      };

      if (couponInfo.applicable_dtype) {
        switch (couponInfo.applicable_dtype) {
          case 'flat':
            couponInfoData.applicableDType = DiscountType.FIXED;
            break;
          case 'percent':
            couponInfoData.applicableDType = DiscountType.PERCENTAGE;
            break;
        }
      }

      const discountOrderType = Array.isArray(couponInfo.order_type)
        ? couponInfo.order_type
        : [];
      if (
        discountOrderType.length > 0 &&
        discountOrderType.includes(orderType)
      ) {
        discountCalculationDto.coupon = couponInfoData;
      }
    }

    return discountCalculationDto;
  }

  getDiscountInfoFromCart(cart: any, couponInfo: any): DiscountCalculationDto {
    let discountCalculationDto: DiscountCalculationDto =
      new DiscountCalculationDtoImpl([], null, null);

    const couponId = cart['coupon_id'] || null;
    const reason = cart['reason'] || null;
    const couponName = cart['coupon_name'] || null;
    const dValue = cart['dvalue'] || 0;
    const dType = cart['dtype'] || null;
    const orderType = cart['order_type'];

    discountCalculationDto = this.extractCouponInfo(
      discountCalculationDto,
      couponInfo,
      orderType,
      reason,
    );

    if (couponId === 'mm_discount') {
      const discountData = {
        value: dValue,
        reason: reason,
        discountName: couponName,
      };

      if (dType === 'fixed') {
        discountData['discountType'] = DiscountType.FIXED;
      } else if (dType === 'per') {
        discountData['discountType'] = DiscountType.PERCENTAGE;
      }

      discountCalculationDto.merchant = discountData;
    }

    for (const item of cart['cart_items'] || []) {
      const itemDiscount = item['item_discount'];
      if (itemDiscount && itemDiscount['value']) {
        const type = itemDiscount['type'];

        const discountData = {
          itemId: item['cart_item_id'],
          value: itemDiscount['value'],
          quantity: itemDiscount['qty'],
          reason: itemDiscount['reason'],
          discountType:
            type === 'percent' ? DiscountType.PERCENTAGE : DiscountType.FIXED,
        };

        discountCalculationDto.itemLevel.push(discountData);
      }
    }

    return discountCalculationDto;
  }

  getDiscountInfoFromOrder(
    order: any,
    couponInfo: any,
  ): DiscountCalculationDto {
    // Initialize a DiscountCalculationDto object to accumulate discount information.
    let discountCalculationDto = new DiscountCalculationDtoImpl([], null, null);

    // Extract necessary information from the order.
    const couponId = order['coupon_id'] || null;
    const reason = order['reason'] || null;
    const couponName = order['coupon_name'] || null;
    const dvalue = order['dvalue'] || null;
    const dtype = order['dtype'] || null;
    const orderItems = order['items'] || [];
    const orderType = order['order_type'];

    // Extract and apply coupon information if available.
    discountCalculationDto = this.extractCouponInfo(
      discountCalculationDto,
      couponInfo,
      orderType,
      reason,
    );

    // Special handling for known coupon IDs.
    if (
      ['mm_discount', 'mm_topup', 'fp_discount', 'gf_discount'].includes(
        couponId,
      )
    ) {
      const discountData = {
        value: dvalue,
        reason: reason,
        discountName: couponName,
      };

      // Determine the discount type (fixed or percentage) based on the order's details.
      discountData['discountType'] =
        dtype === 'fixed' ? DiscountType.FIXED : DiscountType.PERCENTAGE;

      // Assign this discount data to the merchant level of the DTO.
      discountCalculationDto.merchant = discountData;
    }

    // Iterate over each item in the order to extract item-level discount information.
    for (const item of orderItems) {
      const itemDiscount = item['item_discount'];
      if (itemDiscount && itemDiscount['value']) {
        // Prepare item-level discount data.
        const discountData = {
          itemId: item['order_item_id'],
          value: itemDiscount['value'],
          quantity: itemDiscount['qty'],
          reason: itemDiscount['reason'],
          discountType:
            itemDiscount['type'] === 'percent'
              ? DiscountType.PERCENTAGE
              : DiscountType.FIXED,
        };

        // Add the prepared discount data to the item-level discounts array in the DTO.
        discountCalculationDto.itemLevel.push(discountData);
      }
    }

    // Return the populated DiscountCalculationDto with all extracted discount information.
    return discountCalculationDto;
  }

  applyCouponDiscount(itemInfoDto: ItemInfoDto, couponData: any): ItemInfoDto {
    let currentDiscount = 0;
    let newDiscount = 0;

    // Extract the discount type from the coupon data.
    const discountType = couponData.discountType;


    // Calculate the total price applicable for the discount and the current total discount.
    for (const item of itemInfoDto.itemInfo) {
      currentDiscount += item.discount;
    }

    // Apply the coupon discount based on its type.
    switch (discountType) {
      case 'bxgy':
      case 'bxgyoz':
        // Apply Buy X Get Y discount.
        itemInfoDto = this.applyBxGyDiscount(couponData, itemInfoDto);
        break;
      case 'sxgdo':
      case 'percentage':
      case 'fixed':
        // Apply fixed or percentage discount.
        itemInfoDto = this.applyFPOFdDiscount(couponData, itemInfoDto);
        break;
    }

    // Calculate the new total discount after applying the coupon.
    for (const itemCal of itemInfoDto.itemInfo) {
      newDiscount += itemCal.discount;
    }

    // Include any discount on delivery fees.
    if (itemInfoDto.deliveryInfo && itemInfoDto.deliveryInfo.discount > 0) {
      newDiscount += itemInfoDto.deliveryInfo.discount;
    }

    // Update the total coupon discount applied.
    itemInfoDto.couponDiscount = newDiscount - currentDiscount;
    itemInfoDto.couponDiscount = Number((itemInfoDto.couponDiscount).toFixed(2));
    // Flag the coupon discount as applied if there's a positive discount amount.
    if (itemInfoDto.couponDiscount > 0) {
      itemInfoDto.isCouponDiscountApplied = true;
      itemInfoDto.discountName = itemInfoDto.discountName
        ? `${itemInfoDto.discountName}, ${couponData.code}`
        : couponData.code;
      itemInfoDto.discountMessage = 'Coupon applied';
    }

    return itemInfoDto;
  }

  applyBxGyDiscount(couponData: any, itemInfoDto: ItemInfoDto): ItemInfoDto {
    const itemInfo = itemInfoDto.itemInfo;
    const requiredList = couponData.requiredList;
    const applicableOn = couponData.applicableOn;
    const applicableQuantity = couponData.applicableQuantity;
    const applicableType = couponData.applicableType;
    const discountType = couponData.discountType;
    const minAmount = couponData.minAmount;

    let effectiveTotal = 0;
    for (const item of itemInfo) {
      effectiveTotal += item.effectivePrice;
    }

    // Check if the effective total is less than the minimum amount required
    if (effectiveTotal <= minAmount) {
      itemInfoDto.discountMessage = `Minimum item total required is ${minAmount}`;
      return itemInfoDto;
    }

    // Check if the applicable type is 0 (no specific condition for application)
    if (applicableType === 0) {
      return itemInfoDto;
    } else {
      const key = this.getAppliedOnKey(applicableType);
      let appliedItemPresent = false;
      let appliedItemData: any[] = [];
      let applicableList: any[] = [];
      let totalPrice = 0;

      // Iterate through items to find applicable items based on applicableOn condition
      for (const item of itemInfo) {
        for (const applicable of applicableOn) {
          if (item[key] === applicable) {
            appliedItemPresent = true;

            const qty = item.quantity;
            let ildQty = item.itemLevelDiscount.qty;
            const ildValue = ildQty !== 0 ? item.itemLevelDiscount.value : 0;

            // Create applicable items list considering item level discounts
            for (let i = 0; i < qty; i++) {
              let itemY;
              if (ildQty > 0) {
                itemY = {
                  effectivePrice: item.price - ildValue,
                  itemId: item.itemId,
                };
                ildQty--;
              } else {
                itemY = {effectivePrice: item.price, itemId: item.itemId};
              }
              applicableList.push(itemY);
            }
          }
        }
      }

      // Sort the applicable list based on effective price
      if (applicableList.length) {
        applicableList.sort((a, b) => a.effectivePrice - b.effectivePrice);

        // Select required quantity of applicable items
        let requiredQty = applicableQuantity;
        for (const item of applicableList) {
          if (requiredQty > 0) {
            appliedItemData.push(item);
            totalPrice += item.effectivePrice;
            requiredQty--;
          }
        }
      }

      // Check if applied items are present
      if (appliedItemPresent) {
        let requiredEffectiveTotal = 0;

        // Validate required conditions for the coupon
        for (const listData of requiredList) {
          const listKey = this.getAppliedOnKey(listData.type);
          const listQuantity = listData.qty;
          let totalPresent = 0;

          // Count the total quantity of items based on required conditions
          for (const item of itemInfo) {
            for (const on of listData.on) {
              if (item[listKey] === on) {
                totalPresent += item.quantity;
                requiredEffectiveTotal += item.effectivePrice;
              }
            }
          }

          // Check if required quantity is met
          if (totalPresent < listQuantity) {
            itemInfoDto.discountMessage = `Minimum item quantity required for this coupon ${listQuantity}`;
            return itemInfoDto;
          }

          // Check if required effective total is greater than 0
          if (requiredEffectiveTotal === 0) {
            itemInfoDto.discountMessage =
              'Minimum item total of required items for this coupon must be greater than 0';
            return itemInfoDto;
          }
        }

        // Apply discount based on discount type
        if (discountType === 'bxgy') {
          return this.applyBxGyDiscountType(itemInfoDto, appliedItemData);
        } else if (discountType === 'bxgyoz') {
          return this.applyBxGyOzDiscountType(
            itemInfoDto,
            appliedItemData,
            couponData,
            totalPrice,
          );
        }
      } else {
        itemInfoDto.discountMessage = 'No item of applicable list present';
        return itemInfoDto;
      }
    }

    return itemInfoDto;
  }

  applyBxGyDiscountType(
    itemInfoDto: ItemInfoDto,
    appliedItemData: any,
  ): ItemInfoDto {
    const itemInfo = itemInfoDto.itemInfo;

    appliedItemData.forEach((itemData: any) => {
      const discountValue = itemData.effectivePrice;
      const itemId = itemData.itemId;

      itemInfo.forEach((itemCal: any, key: number) => {
        if (itemCal.itemId === itemId) {
          itemInfo[key] = this.updateItemDiscount(itemCal, discountValue);
        }
      });
    });

    return itemInfoDto;
  }

  applyBxGyOzDiscountType(
    itemInfoDto: ItemInfoDto,
    appliedItemData: any[],
    couponData: any,
    totalPrice: number,
  ): ItemInfoDto {
    const itemInfo = itemInfoDto.itemInfo;

    const applicableDType = couponData.applicableDType;
    const applicableDValue = couponData.applicableDValue;

    const useValue = this.calculateUseValue(
      totalPrice,
      applicableDValue,
      couponData.maxValue,
      applicableDType,
    );

    appliedItemData.forEach((itemData: any) => {
      const discountValue = (itemData.effectivePrice / totalPrice) * useValue;
      const itemId = itemData.itemId;

      itemInfo.forEach((itemCal: any, key: number) => {
        if (itemCal.itemId === itemId) {
          itemInfo[key] = this.updateItemDiscount(itemCal, discountValue);
        }
      });
    });

    return itemInfoDto;
  }

  updateItemDiscount(itemCal: ItemCalculationDto, discountValue: number): any {
    // Retrieve the current effective price of the item
    let effectivePrice = itemCal.effectivePrice;

    // Check if the effective price is greater than 0
    if (effectivePrice > 0) {
      // If the discounted value does not make the effective price negative
      if (effectivePrice - discountValue > 0) {
        // Update the effective price by subtracting the discount value
        effectivePrice = effectivePrice - discountValue;
        // Increase the discount for the item by the discount value
        itemCal.discount += discountValue;
      } else {
        // If the discount would make the effective price negative, set effective price to 0
        // and increase the discount by the remaining effective price
        itemCal.discount += effectivePrice;
        effectivePrice = 0;
      }

      // Update the effective price of the item
      itemCal.effectivePrice = effectivePrice;
    }

    // Return the updated item object with modified discount and effective price
    return itemCal;
  }

  calculateUseValue(
    totalPrice: number,
    applicableDValue: number,
    maxValue: number,
    applicableDType: DiscountType,
  ): number {
    let useValue = 0;

    // Determine the discount type and calculate the appropriate use value
    switch (applicableDType) {
      case DiscountType.FIXED:
        // For fixed discounts, use the discount value directly
        useValue = applicableDValue;

        // Ensure that the use value does not exceed the total price
        if (useValue > totalPrice) {
          useValue = totalPrice;
        }
        break;

      case DiscountType.PERCENTAGE:
        // For percentage discounts, calculate the value based on the discount percentage and total price
        if (applicableDValue > 100) {
          applicableDValue = 100;
        }
        useValue = (applicableDValue * totalPrice) / 100;
        break;
    }

    // Ensure that the use value does not exceed the maximum value allowed
    if (useValue > maxValue) {
      useValue = maxValue;
    }

    // Return the calculated use value
    return useValue;
  }

  getAppliedOnKey(applicableType: number): string {
    // Determine the key based on the applicable type
    switch (applicableType) {
      case 0:
        // For order level conditions
        return 'order';
      case 1:
        // For category level conditions
        return 'catId';
      case 2:
        // For sub-category level conditions
        return 'subCatId';
      case 3:
        // For original item ID level conditions
        return 'originalItemId';
      default:
        // Return an empty string for unrecognized types
        return '';
    }
  }

  applyFPOFdDiscount(
    couponInfoDto: any,
    itemInfoDto: ItemInfoDto,
  ): ItemInfoDto {
    // Extract coupon information
    const itemInfo = itemInfoDto.itemInfo;
    const applicableOn = couponInfoDto.applicableOn;
    const applicableType = couponInfoDto.applicableType;
    const maxValue = couponInfoDto.maxValue;
    const minAmount = couponInfoDto.minAmount;
    const discountType = couponInfoDto.discountType;
    let value = couponInfoDto.value;
    const freeDelLimit = couponInfoDto.freeDelLimit;

    // Initialize arrays to store applicable items and their total effective price
    const applicableItems: any[] = [];
    let applicableTotal = 0;

    // Determine applicable items based on the applicable type
    if (applicableType === 0) {
      for (const item of itemInfo) {
        applicableItems.push(item.itemId);
        applicableTotal += item.effectivePrice;
      }
    } else {
      const key = this.getAppliedOnKey(applicableType);
      for (const item of itemInfo) {
        for (const applicableValue of applicableOn) {
          if (item[key] && item[key] === applicableValue) {
            applicableItems.push(item.itemId);
            applicableTotal += item.effectivePrice;
          }
        }
      }
    }

    // Check if applicable items are present
    if (applicableTotal === 0) {
      itemInfoDto.discountMessage =
        'Applicable items for this coupon are not present';
      return itemInfoDto;
    }

    // Check if the total effective price meets the minimum amount requirement
    if (applicableTotal < minAmount) {
      itemInfoDto.discountMessage = `Minimum item total required is ${minAmount}`;
      return itemInfoDto;
    }

      // Determine the coupon value based on the applicable total and specified value ranges.
      const valueRanges = couponInfoDto.valueRanges;
      const values = couponInfoDto.values;
  
      // Find the appropriate value within the defined ranges.
      for (let i = 0; i < valueRanges.length; i++) {
        if (applicableTotal <= valueRanges[i]) {
          value = values[i];
          break;
        }
      }

    // Apply discount based on the discount type
    let useValue = 0;

    switch (discountType) {
      case 'fixed':
      case 'percentage':
        useValue =
          discountType === 'fixed'
            ? Math.min(value, maxValue, applicableTotal)
            : Math.min((value * applicableTotal) / 100, maxValue);

        // Iterate through applicable items and apply the discount
        for (const itemId of applicableItems) {
          for (const [key, itemCal] of itemInfo.entries()) {
            if (itemCal.itemId === itemId) {
              let effectivePrice = itemCal.effectivePrice;
              const discountValue =
                (effectivePrice / applicableTotal) * useValue;

              // Update item properties with applied discount
              if (effectivePrice > 0) {
                if (effectivePrice - discountValue > 0) {
                  effectivePrice = effectivePrice - discountValue;
                  itemCal.discount += discountValue;
                } else {
                  itemCal.discount += effectivePrice;
                  effectivePrice = 0;
                }
                itemCal.effectivePrice = effectivePrice;
                itemInfo[key] = itemCal;
              }
              break;
            }
          }
        }
        break;
      case 'sxgdo':
        // Apply special discount based on distance and free delivery limit
        const deliveryInfo = itemInfoDto.deliveryInfo;
        if (deliveryInfo) {
          useValue = Math.min(value, maxValue, deliveryInfo.fee);
          if (freeDelLimit >= deliveryInfo.distance) {
            deliveryInfo.discount = useValue;
          }
        }
        break;
    }

    // Return the updated item information data transfer object
    return itemInfoDto;
  }

  applyItemLevelDiscount(
    itemInfoDto: ItemInfoDto,
    itemLevelData: any[],
    country_code: string = 'MY',
  ): ItemInfoDto {
    const itemInfo = itemInfoDto.itemInfo;
    let discountFlag = false;
    const language = getCountryLanguage(country_code);

    for (const itemData of itemLevelData) {
      for (let i = 0; i < itemInfo.length; i++) {
        const itemCal = itemInfo[i];

        if (itemCal.itemId === itemData.itemId) {
          let qty = itemData.quantity;
          const value = itemData.value;
          const price = itemCal.price;
          const itemQty = itemCal.quantity;

          if (itemQty < qty) {
            qty = itemQty;
          }

          discountFlag = true;

          const discountType = itemData.discountType;
          let discountValue = 0;

          if (discountType === DiscountType.PERCENTAGE) {
            discountValue = (price * value) / 100;
          } else if (discountType === DiscountType.FIXED) {
            discountValue = Math.min(value, price);
          }

          itemCal.discount += discountValue * qty;
          itemCal.effectivePrice -= discountValue * qty;
          discountValue = Number((discountValue).toFixed(2));
          itemCal.itemLevelDiscount = {
            value: discountValue,
            qty: qty,
          };

          itemInfo[i] = itemCal;

          break;
        }
      }
    }

    if (discountFlag) {
      const itemNameSuffix = localize('itemLevel', language);
      itemInfoDto.discountName = itemInfoDto.discountName
        ? `${itemInfoDto.discountName}, ${itemNameSuffix}`
        : itemNameSuffix;
    }

    return itemInfoDto;
  }

  applyMerchantDiscount(
    itemInfoDto: ItemInfoDto,
    merchantData: any,
    country_code: string = 'MY',
  ): ItemInfoDto {
    // Extract item information and discount details
    const itemInfo = itemInfoDto.itemInfo;
    const discountType = merchantData.discountType;
    let value = merchantData.value;
    const language = getCountryLanguage(country_code);

    // Calculate the total effective item total
    const effectiveItemTotal = itemInfo.reduce(
      (total: number, item: any) => total + item.effectivePrice,
      0,
    );
    let totalDiscount = 0;

    // Calculate total discount based on the discount type
    if (discountType === DiscountType.PERCENTAGE) {
      // Ensure the discount percentage is within the valid range (0 to 100)
      value = Math.min(value, 100);
      totalDiscount = (effectiveItemTotal * value) / 100;
    } else if (discountType === DiscountType.FIXED) {
      // Ensure the fixed discount is within the valid range
      totalDiscount = Math.min(value, effectiveItemTotal);
    }

    // Check if there is a positive discount to apply
    if (totalDiscount > 0) {
      // Append merchant-specific discount name to the existing discount name
      const itemNameSuffix = merchantData.reason
        ? merchantData.reason
        : localize('byRest', language);
      itemInfoDto.discountName = itemInfoDto.discountName
        ? `${itemInfoDto.discountName}, ${itemNameSuffix}`
        : itemNameSuffix;
    }

    // Apply the calculated discount to each item
    itemInfo.forEach((itemCal: any, key: number) => {
      const effectivePrice = itemCal.effectivePrice;
      const discountValue =
        (totalDiscount * effectivePrice) / effectiveItemTotal;

      // Update discount and effective price for each item
      itemCal.discount += discountValue;
      itemCal.effectivePrice -= discountValue;

      // Update the item information array
      itemInfo[key] = itemCal;
    });

    // Return the updated item information data transfer object
    return itemInfoDto;
  }

  applyDiscount(
    itemInfoDto: ItemInfoDto,
    discountInfo: DiscountCalculationDto,
  ): ItemInfoDto {
    // Apply item level discount
    const itemLevelDiscount = discountInfo.itemLevel;
    if (itemLevelDiscount) {
      itemInfoDto = this.applyItemLevelDiscount(itemInfoDto, itemLevelDiscount);
    }

    // Apply coupon discount
    const couponDiscount = discountInfo.coupon;
    if (couponDiscount) {
      itemInfoDto = this.applyCouponDiscount(itemInfoDto, couponDiscount);
    }

    // Apply merchant discount
    const merchantDiscount = discountInfo.merchant;
    if (merchantDiscount) {
      itemInfoDto = this.applyMerchantDiscount(itemInfoDto, merchantDiscount);
    }

    // Return the modified item information DTO after applying discounts
    return itemInfoDto;
  }

  checkCouponApplicable(
    cart: any,
    discount: any,
    timezone: string,
    language: string,
    platform: string = 'easyeat',
    deliveryInfo: any = null,
  ): any {
    const cartItems = cart.cart_items;
    const orderType = cart.order_type;
    const itemInfoDto = getCartItemInfoNew(
      cartItems,
      orderType,
      platform,
      deliveryInfo,
    );

    const discountInfo = this.getDiscountInfoFromCart(cart, discount);
    const itemInfoDtoWithDiscount = this.applyDiscount(
      itemInfoDto,
      discountInfo,
    );

    const response = {
      status: itemInfoDtoWithDiscount.isCouponDiscountApplied ? 1 : 0,
      message: itemInfoDtoWithDiscount.discountMessage,
      discountAmount: itemInfoDtoWithDiscount.couponDiscount,
    };

    return response;
  }
}
