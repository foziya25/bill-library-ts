import { OrderItemInfo } from '../baseClass/orderItemInfo';
import { ChargeApplicableType, ChargeType } from '../enum/billLib.enum';
import { ChargesInterface } from '../interfaces/charges.interface';
import { Addons, ItemInfo, Options, Variants } from '../interfaces/itemInfo.interface';

export const calculateAddonVariantPrice = (itemInfo: ItemInfo): number => {
  let totalPrice = 0;

  if (itemInfo.addons) {
    itemInfo.addons.forEach((addon) => {
      totalPrice += addon.price * addon.quantity;
    });
  }

  if (itemInfo.variants) {
    itemInfo.variants.forEach((variations) => {
      if (variations.options) {
        variations.options.forEach((option) => {
          totalPrice += option.price;
        });
      }
    });
  }

  return totalPrice;
};

/* Get round off value around a base value */
export const getRoundOffValue = (value: number, base: number): any => {
  base = base > 0 ? base : 1;
  // Smaller multiple
  const a = parseInt((Number(value) / base).toString()) * base;
  // Larger multiple
  const b = a + base;
  // Return of closest of two
  return value - a >= b - value ? b : a;
};

function getPriceKeyByOrderType(orderType: number): string {
  if (orderType == 1) {
    return 'delivery_price';
  } else if (orderType == 2) {
    return 'takeaway_price';
  } else {
    return 'price';
  }
}

export function getCartItemInfo(items: Array<any>, orderType: number): OrderItemInfo[] {
  const cartItemInfo: OrderItemInfo[] = [];
  /* Getting the price key from the order type. */
  const priceKey = getPriceKeyByOrderType(orderType);
  if (items && items.length) {
    items.forEach((item) => {
      /* Destructuring the object. */
      const { addons, new_variation } = item;
      /* Creating an object of type OrderItemInfo. */
      const cartItemInfoObj: OrderItemInfo = {
        addons: [],
        variants: [],
        price: item[priceKey],
        quantity: item.quantity,
        subcategoryId: item.subcategory_id,
        categoryId: item.category_id,
        itemId: item.item_id,
        orderItemId: item.cart_item_id,
      };

      // transforming addons
      if (addons && addons.length) {
        /* Iterating over the addons array and pushing the addonInfo object into the
        cartItemInfoObj.addons array. */
        addons.forEach((addon) => {
          const addonInfo: Addons = {
            id: addon.id,
            price: addon.price,
            quantity: addon.qty,
          };
          cartItemInfoObj.addons.push(addonInfo);
        });
      }

      // setting up variations
      // if (new_variation && new_variation !== '') {
      //   const variantsObj = JSON.parse(new_variation);
      //   /* This is a function that is used to get the cart item info. */
      //   if (variantsObj && variantsObj.length) {
      //     variantsObj.forEach((group) => {
      //       if (group.status && group.options && group.options.length) {
      //         const variants: Variants = {
      //           groupId: group.group_id,
      //           options: [],
      //         };
      //         group.options.forEach((option) => {
      //           if (option.selected === true) {
      //             const optionInfo: Options = {
      //               optionsId: option.option_id,
      //               price: option.price,
      //             };
      //             variants.options.push(optionInfo);
      //           }
      //         });
      //         cartItemInfoObj.variants.push(variants);
      //       }
      //     });
      //   }
      // }
      cartItemInfo.push(cartItemInfoObj);
    });
  }
  return cartItemInfo;
}

export function getOrderItemInfo(items): OrderItemInfo[] {
  const orderItemInfo: OrderItemInfo[] = [];
  if (items && items.length) {
    items.forEach((item) => {
      const { addons, new_variation } = item;
      const orderItemInfoObj: OrderItemInfo = {
        addons: [],
        variants: [],
        price: item.item_price,
        quantity: item.item_quantity,
        subcategoryId: item.subcategory_id,
        categoryId: item.category_id,
        itemId: item.item_id,
        orderItemId: item.order_item_id,
      };

      // transforming addons
      if (addons && addons.length) {
        addons.forEach((addon) => {
          const addonInfo: Addons = {
            id: addon.id,
            price: addon.price,
            quantity: addon.qty,
          };
          orderItemInfoObj.addons.push(addonInfo);
        });
      }

      // setting up variations
      // if (new_variation && new_variation !== '') {
      //   const variantsObj = JSON.parse(new_variation);
      //   if (variantsObj) {
      //     variantsObj.forEach((group) => {
      //       if (group.status && group.options) {
      //         const variants: Variants = {
      //           groupId: group.group_id,
      //           options: [],
      //         };
      //         group.options.forEach((option) => {
      //           if (option.selected === true) {
      //             const optionInfo: Options = {
      //               optionsId: option.option_id,
      //               price: option.price,
      //             };
      //             variants.options.push(optionInfo);
      //           }
      //         });
      //         orderItemInfoObj.variants.push(variants);
      //       }
      //     });
      //   }
      // }
      orderItemInfo.push(orderItemInfoObj);
    });
  }
  return orderItemInfo;
}

export function getTransformedRestaurantCharges(charges: any[], order_type: number): ChargesInterface[] {
  const chargesList: ChargesInterface[] = [];
  if (charges && charges.length) {
    charges.forEach((charge) => {
      const { order_type: applicableOrderType } = charge;
      if (charge.status && charge.id !== 'delivery') {
        const applicable = applicableOrderType.find((ot) => {
          if (ot === order_type) {
            return true;
          }
        });
        if (applicable != undefined) {
          const chargeInfo = getChargesTypeAndValue(charge.type, charge.data);
          const applicableInfo = getApplicableOnInfo(charge.applicable_on, charge.applicable_subcat);
          const restCharge: ChargesInterface = {
            chargeType: chargeInfo.type,
            chargeValue: chargeInfo.value,
            applicableOn: applicableInfo.applicableList,
            chargeApplicableType: applicableInfo.chargeApplicableType,
            id: charge.id,
            name: charge.name,
            class: charge.class,
            subName: charge.sub_name,
          };
          if (restCharge.chargeType == ChargeType.PERCENTAGE) {
            restCharge.name = restCharge.name + '@' + restCharge.chargeValue + '%';
          }
          chargesList.push(restCharge);
        }
      }
    });
  }
  return chargesList;
}

function getChargesTypeAndValue(chargeType: string, data: any): { type: ChargeType; value: number } {
  switch (chargeType) {
    case 'fixed':
      return { type: ChargeType.FIXED, value: data.fixed_amount };
    case 'percentage':
      return { type: ChargeType.PERCENTAGE, value: data.percentage_amount };
  }
}

function getApplicableOnInfo(applicableOn, applicableSubcat): { chargeApplicableType: ChargeApplicableType; applicableList: [] } {
  if (applicableOn[0] === 'category') {
    return {
      chargeApplicableType: ChargeApplicableType.SUB_CATEGORY,
      applicableList: applicableSubcat,
    };
  } else if (applicableOn[0] === 'order') {
    return {
      chargeApplicableType: ChargeApplicableType.OVER_ALL,
      applicableList: [],
    };
  }
}

export function getCartItemTotal(itemInfo: OrderItemInfo[]): number {
  let itemTotal = 0;
  itemInfo.forEach((item) => {
    itemTotal += item.price * item.quantity;
  });
  return itemTotal;
}
