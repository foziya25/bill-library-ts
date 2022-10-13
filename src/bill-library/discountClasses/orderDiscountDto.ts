import { DiscountAction, DiscountCategory } from '../enum/discountLib.enum';

export class OrderDiscountDto {
  itemDiscountInfo: OrderItemDiscountInfo[];
  discountValue: number;
  name: string;
  id: string;
  discountCategory: DiscountCategory;
  discountAction: DiscountAction;
}

export class OrderItemDiscountInfo {
  orderItemId: string;
  itemDiscountValue: number;
}
