import { OrderItemInfo } from "../baseClass/orderItemInfo";
import { CouponInfoDto, GetCouponInfoDto, GetItemLevelDiscountInterfaceDto, GetMerchantDiscountInterfaceDto } from "../dto/discount.dto";
import { DiscountApplicableType } from "../enum/discountLib.enum";
import { DiscountInterface } from "../interfaces/discount.interface";
export declare class DiscountCalculationService {
    getDiscountFromCart(cart: any, itemInfo: OrderItemInfo[]): DiscountInterface[];
    getDiscountInfoFromCart(cart: any): any;
    getDiscountOnOrder(order: any, couponInfo: any, itemInfo: OrderItemInfo[]): DiscountInterface[];
    getDiscountInfoFromOrder(order: any, coupon_info: any): any;
    getOrderCouponDiscountInterface(getCouponInfoDto: GetCouponInfoDto): DiscountInterface;
    getFPOFdDiscountFromOrder(getCouponInfoDto: GetCouponInfoDto): DiscountInterface;
    getBxGyDiscountFromOrder(getCouponInfoDto: GetCouponInfoDto): DiscountInterface;
    verifyAppliedOnItems(applicableInfo: {
        applicableType: number;
        applicableOn: any[];
    }, itemInfo: OrderItemInfo[]): boolean;
    getAppliedOnKey(applicableType: number): string;
    getDiscountApplicableType(applicableType: number): DiscountApplicableType;
    calculateAppliedOnBxGyItems(coupon_info: CouponInfoDto, itemInfo: OrderItemInfo[]): any;
    getMerchantDiscountInterface(getMerchantDiscountInterfaceDto: GetMerchantDiscountInterfaceDto): DiscountInterface;
    getItemLevelDiscountInterface(getItemLevelDiscountInterfaceDto: GetItemLevelDiscountInterfaceDto): DiscountInterface;
}
