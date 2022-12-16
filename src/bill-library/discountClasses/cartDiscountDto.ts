import { DiscountAction, DiscountCategory } from "../enum/discountLib.enum";

export class CartDiscountDto {
  itemDiscountInfo: CartItemDiscountInfo[];
  discountValue: number;
  name: string;
  id: string;
  discountCategory: DiscountCategory;
  discountAction: DiscountAction;
}

export class CartItemDiscountInfo {
  cartItemId: string;
  itemDiscountValue: number;
}
