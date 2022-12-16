import { Addons, ItemInfo, Variants } from "../interfaces/itemInfo.interface";
export declare class OrderItemInfo implements ItemInfo {
    addons: Addons[];
    variants: Variants[];
    price: number;
    quantity: number;
    subcategoryId: string;
    categoryId: string;
    itemId: string;
    orderItemId: string;
}
export declare class OrderCalculationInfo extends OrderItemInfo {
    appliedCharges: number;
    appliedDiscount: number;
    effectivePrice: number;
    init(orderItemInfo: OrderItemInfo): void;
}
