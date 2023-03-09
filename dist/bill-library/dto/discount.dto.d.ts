import { OrderItemInfo } from '../baseClass/orderItemInfo';
import { DiscountAction, DiscountCategory, DiscountType } from '../enum/discountLib.enum';
export declare class SaveDiscountObjDto {
    type: DiscountCategory;
    info: DiscountInfo;
}
export declare class DiscountInfo {
    id: string;
    discountData: Record<any, any>;
}
export declare class CouponInfoDto {
    applicableOn: any[];
    requiredList: any[];
    applicableQuantity: number;
    applicableType: number;
    discountType: string;
    applicableDValue: number;
    applicableDType: DiscountType;
    maxValue: number;
    minAmount: number;
    name: string;
    value: number;
    code: string;
    reason: string;
}
export declare class GetCouponInfoDto {
    couponInfoDto: CouponInfoDto;
    itemInfo: OrderItemInfo[];
    coupon_id: string;
}
export declare class GetMerchantDiscountInterfaceDto {
    id: string;
    type: DiscountAction;
    value: number;
    discountType: DiscountType;
    reason: string;
}
export declare class GetItemLevelDiscountInterfaceDto {
    itemInfo: OrderItemInfo[];
    id: string;
    value: number;
    quantity: number;
    discountType: DiscountType;
    orderItemId: string;
    reason: string;
}
