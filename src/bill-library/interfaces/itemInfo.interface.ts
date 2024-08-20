export interface ItemInfo {
  price: number;
  quantity: number;
  subcategoryId: string;
  categoryId: string;
  itemId: string;
  addons: Addons[];
  variants: Variants[];
}

export interface Addons {
  id: string;
  price: number;
  quantity: number;
}

export interface Variants {
  groupId: string;
  options: Options[];
}

export interface Options {
  optionsId: string;
  price: number;
}

export interface ItemCalculationDto {
  originalItemId: string;
  price: number;
  quantity: number;
  discount: number;
  itemId: string;
  subCatId: string;
  catId: string;
  itemLevelDiscount: any;
  effectivePrice: number;
  loyaltyItemAmount: number;
  serviceCharge: number;
  itemCharges: any[];
}

export interface ItemInfoDto {
  itemInfo: ItemCalculationDto[];
  itemTotal: number;
  deliveryInfo: DeliveryInfo | null;
  charges: any[];
  commission: any[];
  isCouponDiscountApplied: boolean;
  couponDiscount: number;
  discountName: string;
  discountMessage: string;
  loyaltyAmount: number;
}

export interface DeliveryInfo {
  distance: number;
  fee: number;
  discount: number;
}

export interface ServiceChargeDto {
  itemId: string;
  serviceCharge: number;
}
