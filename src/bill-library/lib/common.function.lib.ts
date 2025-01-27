import {OrderItemInfo} from '../baseClass/orderItemInfo';
import {
  DeliveryInfoImpl,
  ItemCalculationDtoImpl,
  ItemInfoDtoImpl,
} from '../baseClass/cartItemInfo';
import {RoundOffObj} from '../baseClass/roundOff';
import {ChargeApplicableType, ChargeType} from '../enum/billLib.enum';
import {Platform, RoundOffMasks} from '../enum/common.enum';
import {FeeObj} from '../interfaces/billResponse.interface';
import {ChargesInterface} from '../interfaces/charges.interface';
import {
  Addons,
  ItemInfo,
  ItemInfoDto,
  DeliveryInfo,
} from '../interfaces/itemInfo.interface';

export const calculateAddonVariantPrice = (itemInfo: ItemInfo): number => {
  let totalPrice = 0;

  if (itemInfo.addons) {
    itemInfo.addons.forEach(addon => {
      totalPrice += addon.price * addon.quantity;
    });
  }

  if (itemInfo.variants) {
    itemInfo.variants.forEach(variations => {
      if (variations.options) {
        variations.options.forEach(option => {
          totalPrice += option.price;
        });
      }
    });
  }

  return totalPrice;
};

/* Get round off value around a base value */
export const getRoundOffValue = (
  value: number,
  round_off: RoundOffObj,
): any => {
  if (round_off.roundOffClose) {
    return value;
  } else {
    let base = round_off.baseRoundOff;
    const roundUp = round_off.roundUp;
    const roundDown = round_off.roundDown;
    base = base > 0 ? base : 1;
    // Smaller multiple
    const a = parseInt((Number(value) / base).toString()) * base;
    // Larger multiple
    const b = a + base;

    if (roundDown && !roundUp) {
      return value - a != base ? a : b;
    }
    // Return of closest of two
    return value - a >= b - value || (roundUp == true && value - a > 0) ? b : a;
  }
};

function getPriceKeyByOrderType(orderType: number, platform: string): string {
  if (platform == Platform.EASYEAT) {
    if (orderType == 1) {
      return 'delivery_price';
    } else if (orderType == 2) {
      return 'takeaway_price';
    } else {
      return 'price';
    }
  } else {
    return 'original_price';
  }
}

export function getCartItemInfo(
  items: Array<any>,
  orderType: number,
  platform: string,
): OrderItemInfo[] {
  const cartItemInfo: OrderItemInfo[] = []; // Doubt here to change
  /* Getting the price key from the order type. */
  const priceKey = getPriceKeyByOrderType(orderType, platform);
  if (items && items.length) {
    items.forEach(item => {
      /* Destructuring the object. */
      const {addons, new_variation} = item;
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
        addons.forEach(addon => {
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

export function getCartItemInfoNew(
  items: any[],
  orderType: number,
  platform: string = 'easyeat',
  deliveryInfo: any[] | null = null,
): ItemInfoDto {
  const cartItemInfo = new ItemInfoDtoImpl();

  if (orderType === 1 && deliveryInfo) {
    cartItemInfo.deliveryInfo = new DeliveryInfoImpl(
      deliveryInfo['distance'],
      deliveryInfo['fee'],
      0,
    );
  }

  const priceKey = getPriceKeyByOrderType(orderType, platform);

  if (items.length > 0) {
    for (const item of items) {
      const itemLevelDiscount = [{value: 0, qty: 0}];

      const itemCalculationObj = new ItemCalculationDtoImpl(
        item['item_id'],
        item[priceKey],
        item['quantity'],
        0,
        item['cart_item_id'],
        item['subcategory_id'],
        item['category_id'],
        itemLevelDiscount,
        item[priceKey] * item['quantity'],
        0,
      );
      cartItemInfo.itemInfo.push(itemCalculationObj);

      cartItemInfo.itemTotal += item[priceKey] * item['quantity'];
    }
    cartItemInfo.itemTotal = Number((cartItemInfo.itemTotal).toFixed(2));
  }

  return cartItemInfo;
}

export function getOrderItemInfo(items): OrderItemInfo[] {
  const orderItemInfo: OrderItemInfo[] = [];
  if (items && items.length) {
    items.forEach(item => {
      const {addons, new_variation} = item;
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
        addons.forEach(addon => {
          const addonInfo: Addons = {
            id: addon.id,
            price: addon.price,
            quantity: addon.qty,
          };
          orderItemInfoObj.addons.push(addonInfo);
        });
      }

      orderItemInfo.push(orderItemInfoObj);
    });
  }
  return orderItemInfo;
}

export function getOrderItemInfoNew(
  items: any[],
  orderType: number,
  deliveryInfo: any[] | null = null,
): ItemInfoDto {
  const orderItemInfo = new ItemInfoDtoImpl();

  if (orderType === 1 && deliveryInfo) {
    orderItemInfo.deliveryInfo = new DeliveryInfoImpl(
      deliveryInfo['distance'],
      deliveryInfo['fee'],
      0,
    );
  }

  if (items.length > 0) {
    for (const item of items) {
      const itemLevelDiscount = {value: 0, qty: 0};

      const itemCalculationObj = new ItemCalculationDtoImpl(
        item['item_id'],
        item['item_price'],
        item['item_quantity'],
        0,
        item['order_item_id'],
        item['subcategory_id'],
        item['category_id'],
        itemLevelDiscount,
        item['item_price'] * item['item_quantity'],
        0,
      );
      orderItemInfo.itemInfo.push(itemCalculationObj);

      orderItemInfo.itemTotal += item['item_price'] * item['item_quantity'];
    }
  }

  return orderItemInfo;
}

export function getTransformedRestaurantCharges(
  charges: any[],
  order_type: number,
  skip_packaging_charge_operation = false,
  packagingChargeDisabled = false,
  skip_service_charge_operation = false,
): ChargesInterface[] {
  const chargesList: ChargesInterface[] = [];
  if (charges?.length) {
    charges.forEach(charge => {
      const {order_type: applicableOrderType} = charge;

      // Skip packaging charge operation if specified conditions are met
      if (
        (skip_packaging_charge_operation || packagingChargeDisabled) &&
        charge.class === 'packaging_charge'
      ) {
        return;
      }
      // Skip service charge operation if specified condition is met
      else if (
        skip_service_charge_operation &&
        charge.class === 'service_tax'
      ) {
        return;
      }

      if (charge.status && charge.id !== 'delivery') {
        const applicable = applicableOrderType.find(ot => {
          if (ot === order_type) {
            return true;
          }
        });
        if (applicable != undefined) {
          const chargeInfo = getChargesTypeAndValue(charge.type, charge.data);
          const applicableInfo = getApplicableOnInfo(
            charge.applicable_on,
            charge.applicable_subcat,
          );
          const restCharge: ChargesInterface = {
            chargeType: chargeInfo.type,
            chargeValue: chargeInfo.value,
            applicableOn: applicableInfo.applicableList,
            chargeApplicableType: applicableInfo.chargeApplicableType,
            id: charge.id,
            name: charge.sub_name,
            class: charge.class,
            subName: charge.sub_name,
          };
          if (restCharge.chargeType == ChargeType.PERCENTAGE) {
            restCharge.name =
              restCharge.name + ' @' + restCharge.chargeValue + '%';
          }
          chargesList.push(restCharge);
        }
      }
    });
  }
  return chargesList;
}

function getChargesTypeAndValue(
  chargeType: string,
  data: any,
): {type: ChargeType; value: number} {
  switch (chargeType) {
    case 'fixed':
      return {type: ChargeType.FIXED, value: data.fixed_amount};
    case 'percentage':
      return {type: ChargeType.PERCENTAGE, value: data.percentage_amount};
  }
}

function getApplicableOnInfo(
  applicableOn,
  applicableSubcat,
): {chargeApplicableType: ChargeApplicableType; applicableList: []} {
  if (applicableOn[0] === 'category') {
    return {
      chargeApplicableType: ChargeApplicableType.SUB_CATEGORY,
      applicableList: applicableSubcat,
    };
  } else if (applicableOn[0] === 'order') {
    return {
      chargeApplicableType: ChargeApplicableType.ORDER,
      applicableList: [],
    };
  }
}

export function getCartItemTotal(itemInfo: OrderItemInfo[]): number {
  let itemTotal = 0;
  itemInfo.forEach(item => {
    itemTotal += item.price * item.quantity;
  });
  return itemTotal;
}

export function getRoundOffDisableStatus(
  order_type: number,
  round_off_close: number,
): boolean {
  let response = false;
  const orderTypeMask = RoundOffMasks[order_type];
  if (round_off_close && orderTypeMask & round_off_close) {
    response = true;
  }

  return response;
}

export function getPlatformCommission(
  platform: string,
  restaurant_platforms: any,
  item_total: number,
): {status: number; fees: FeeObj} {
  const fees: FeeObj = {
    name: '',
    value: 0,
    id: 'platform_commision',
  };
  const response = {
    status: 0,
    fees: fees,
  };

  for (const i in restaurant_platforms) {
    const commission = restaurant_platforms[i];
    if (commission['id'] == platform) {
      if (commission['comm_typ'] == 'percentage') {
        fees.value = Number(
          ((item_total * commission['comm_amt']) / 100).toFixed(2),
        );
        fees.name =
          'Commission(' +
          commission['name'] +
          ')@' +
          commission['comm_amt'] +
          '%';
      } else if (commission['comm_typ'] == 'fixed') {
        fees.value = Number(commission['comm_amt'].toFixed(2));
        fees.name = 'Commission ' + commission['name'];
      }
      if (fees.value > item_total) {
        fees.value = Number(item_total.toFixed(2));
      }
      break;
    }
  }
  if (fees.value > 0) {
    fees.value = -1 * fees.value;
    response.status = 1;
    response.fees = fees;
  }
  return response;
}

export function generateRandomString(length: number = 10): string {
  const characters =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charactersLength = characters.length;
  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(
      Math.floor(Math.random() * charactersLength),
    );
  }
  return randomString;
}
