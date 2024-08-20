import {ChargesObjInterface} from '../interfaces/charges.interface';
import {DiscountCalculationDto} from '../interfaces/discount.interface';
import {
  Addons,
  ItemInfo,
  Variants,
  ItemInfoDto,
  ItemCalculationDto,
  DeliveryInfo,
} from '../interfaces/itemInfo.interface';

export class CartItemInfo implements ItemInfo {
  addons: Addons[];
  variants: Variants[];
  price: number;
  quantity: number;
  subcategoryId: string;
  categoryId: string;
  itemId: string;
  cartItemId: string;
}

export class CartCalculationInfo extends CartItemInfo {
  appliedCharges: number;
  appliedDiscount: number;
  effectivePrice: number;

  init(cartItemInfo: CartItemInfo) {
    Object.assign(this, cartItemInfo);
    this.appliedCharges = 0;
    this.appliedDiscount = 0;
    this.effectivePrice = this.price * this.quantity;
  }
}

export class ItemInfoDtoImpl implements ItemInfoDto {
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

  constructor() {
    this.itemInfo = [];
    this.itemTotal = 0;
    this.deliveryInfo = null;
    this.charges = [];
    this.commission = [];
    this.isCouponDiscountApplied = false;
    this.couponDiscount = 0;
    this.discountName = '';
    this.discountMessage = '';
    this.loyaltyAmount = 0;
  }
}

export class DeliveryInfoImpl implements DeliveryInfo {
  distance: number;
  fee: number;
  discount: number;

  constructor(distance: number, fee: number, discount: number) {
    this.distance = distance;
    this.fee = fee;
    this.discount = discount;
  }
}

export class ItemCalculationDtoImpl implements ItemCalculationDto {
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

  constructor(
    originalItemId: string = '',
    price: number = 0,
    quantity: number = 0,
    discount: number = 0,
    itemId: string = '',
    subCatId: string = '',
    catId: string = '',
    itemLevelDiscount: any = {},
    effectivePrice: number = 0,
    loyaltyItemAmount: number = 0,
    serviceCharge: number = 0,
    itemCharges: any[] = [],
  ) {
    this.originalItemId = originalItemId;
    this.price = price;
    this.quantity = quantity;
    this.discount = discount;
    this.itemId = itemId;
    this.subCatId = subCatId;
    this.catId = catId;
    this.itemLevelDiscount = itemLevelDiscount;
    this.effectivePrice = effectivePrice;
    this.loyaltyItemAmount = loyaltyItemAmount;
    this.serviceCharge = serviceCharge;
    this.itemCharges = itemCharges;
  }
}

export class ChargesObjImpl implements ChargesObjInterface {
  value: number;
  name: string;
  id: string;

  constructor(value: number, name: string, id: string) {
    this.value = value;
    this.name = name;
    this.id = id;
  }
}

export class DiscountCalculationDtoImpl implements DiscountCalculationDto {
  itemLevel: any;
  coupon: any;
  merchant: any;

  constructor(itemLevel: any, coupon: any, merchant: any) {
    this.itemLevel = itemLevel;
    this.coupon = coupon;
    this.merchant = merchant;
  }
}
