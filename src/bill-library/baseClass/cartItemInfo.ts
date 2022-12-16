import { Addons, ItemInfo, Variants } from "../interfaces/itemInfo.interface";

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
