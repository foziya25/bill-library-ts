export const enum DiscountApplicableType {
  SUB_CATEGORY = 'subCategory',
  CATEGORY = 'category',
  ITEM = 'item',
  CART_ITEM_ID = 'cartItemId',
  ORDER_ITEM_ID = 'orderItemId',
  OVER_ALL = 'overAll',
  ORDER = 'order',
}

export const enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export const enum DiscountAction {
  TOP_UP = 'topUp',
  NORMAL = 'normal',
  FREE_DELIVERY = 'freeDelivery',
}

export const enum DiscountCategory {
  TOP_UP = 'topUp',
  COUPON = 'coupon',
  MERCHANT = 'merchant',
  ITEM_LEVEL = 'itemLevel',
  LOYALTY = 'loyalty',
  FREE_DEL = 'free_del', // Discounts providing free delivery.
}
