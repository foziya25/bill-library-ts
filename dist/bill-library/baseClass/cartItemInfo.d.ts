import { Addons, ItemInfo, Variants } from "../interfaces/itemInfo.interface";
export declare class CartItemInfo implements ItemInfo {
    addons: Addons[];
    variants: Variants[];
    price: number;
    quantity: number;
    subcategoryId: string;
    categoryId: string;
    itemId: string;
    cartItemId: string;
}
export declare class CartCalculationInfo extends CartItemInfo {
    appliedCharges: number;
    appliedDiscount: number;
    effectivePrice: number;
    init(cartItemInfo: CartItemInfo): void;
}
