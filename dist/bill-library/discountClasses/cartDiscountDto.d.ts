import { DiscountAction, DiscountCategory } from "../enum/discountLib.enum";
export declare class CartDiscountDto {
    itemDiscountInfo: CartItemDiscountInfo[];
    discountValue: number;
    name: string;
    id: string;
    discountCategory: DiscountCategory;
    discountAction: DiscountAction;
}
export declare class CartItemDiscountInfo {
    cartItemId: string;
    itemDiscountValue: number;
}
