import { DiscountAction, DiscountCategory } from "../enum/discountLib.enum";
export declare class OrderDiscountDto {
    itemDiscountInfo: OrderItemDiscountInfo[];
    discountValue: number;
    name: string;
    id: string;
    discountCategory: DiscountCategory;
    discountAction: DiscountAction;
}
export declare class OrderItemDiscountInfo {
    orderItemId: string;
    itemDiscountValue: number;
}
