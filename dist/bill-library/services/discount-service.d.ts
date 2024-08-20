import { DiscountType } from '../enum/discountLib.enum';
import { DiscountCalculationDto } from '../interfaces/discount.interface';
import { ItemCalculationDto, ItemInfoDto } from '../interfaces/itemInfo.interface';
export declare class DiscountService {
    extractCouponInfo(discountCalculationDto: DiscountCalculationDto, couponInfo: any, orderType: string, reason: string): DiscountCalculationDto;
    getDiscountInfoFromCart(cart: any, couponInfo: any): DiscountCalculationDto;
    getDiscountInfoFromOrder(order: any, couponInfo: any): DiscountCalculationDto;
    applyCouponDiscount(itemInfoDto: ItemInfoDto, couponData: any): ItemInfoDto;
    applyBxGyDiscount(couponData: any, itemInfoDto: ItemInfoDto): ItemInfoDto;
    applyBxGyDiscountType(itemInfoDto: ItemInfoDto, appliedItemData: any): ItemInfoDto;
    applyBxGyOzDiscountType(itemInfoDto: ItemInfoDto, appliedItemData: any[], couponData: any, totalPrice: number): ItemInfoDto;
    updateItemDiscount(itemCal: ItemCalculationDto, discountValue: number): any;
    calculateUseValue(totalPrice: number, applicableDValue: number, maxValue: number, applicableDType: DiscountType): number;
    getAppliedOnKey(applicableType: number): string;
    applyFPOFdDiscount(couponInfoDto: any, itemInfoDto: ItemInfoDto): ItemInfoDto;
    applyItemLevelDiscount(itemInfoDto: ItemInfoDto, itemLevelData: any[], country_code?: string): ItemInfoDto;
    applyMerchantDiscount(itemInfoDto: ItemInfoDto, merchantData: any, country_code?: string): ItemInfoDto;
    applyDiscount(itemInfoDto: ItemInfoDto, discountInfo: DiscountCalculationDto): ItemInfoDto;
    checkCouponApplicable(cart: any, discount: any, timezone: string, language: string, platform?: string, deliveryInfo?: any): any;
}
