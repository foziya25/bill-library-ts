import { Addons, ItemInfo, Variants } from '../interfaces/itemInfo.interface';

export class OrderItemInfo implements ItemInfo {
  addons: Addons[];
  variants: Variants[];
  price: number;
  quantity: number;
  subcategoryId: string;
  categoryId: string;
  itemId: string;
  orderItemId: string;
}

export class OrderCalculationInfo extends OrderItemInfo {
  appliedCharges: number;
  appliedDiscount: number;
  effectivePrice: number;

  init(orderItemInfo: OrderItemInfo) {
    Object.assign(this, orderItemInfo);
    this.appliedCharges = 0;
    this.appliedDiscount = 0;
    this.effectivePrice = this.price * this.quantity;
  }
}
