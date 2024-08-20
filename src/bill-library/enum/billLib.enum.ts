export const enum ChargeApplicableType {
  SUB_CATEGORY = 'subCategory',
  ITEM = 'item',
  OVER_ALL = 'overAll',
  ORDER = 'order', // Charge is applicable to the overall order.
}

export const enum ChargeType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}
