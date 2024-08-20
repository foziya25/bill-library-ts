import { ChargesObjInterface } from '../interfaces/charges.interface';
import { DiscountCalculationDto } from '../interfaces/discount.interface';
import { Addons, ItemInfo, Variants, ItemInfoDto, ItemCalculationDto, DeliveryInfo } from '../interfaces/itemInfo.interface';
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
export declare class ItemInfoDtoImpl implements ItemInfoDto {
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
    constructor();
}
export declare class DeliveryInfoImpl implements DeliveryInfo {
    distance: number;
    fee: number;
    discount: number;
    constructor(distance: number, fee: number, discount: number);
}
export declare class ItemCalculationDtoImpl implements ItemCalculationDto {
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
    constructor(originalItemId?: string, price?: number, quantity?: number, discount?: number, itemId?: string, subCatId?: string, catId?: string, itemLevelDiscount?: any, effectivePrice?: number, loyaltyItemAmount?: number, serviceCharge?: number, itemCharges?: any[]);
}
export declare class ChargesObjImpl implements ChargesObjInterface {
    value: number;
    name: string;
    id: string;
    constructor(value: number, name: string, id: string);
}
export declare class DiscountCalculationDtoImpl implements DiscountCalculationDto {
    itemLevel: any;
    coupon: any;
    merchant: any;
    constructor(itemLevel: any, coupon: any, merchant: any);
}
