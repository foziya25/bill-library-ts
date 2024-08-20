import { BillResponseInterface } from './bill-library/interfaces/billResponse.interface';
export declare function calculateBill(cartItemInfo: any, discountInfo: any, chargesInfo: any, rest_round_off: any, country_code: string, platform: any, restaurant_platform: any): BillResponseInterface;
export declare function calculateOfflineCartBill(cart: any, restFee: any, coupon_info: any, offlinePlatform: any, platform: string, rest_round_off: any, taxAfterDiscount?: number, country_code?: string): BillResponseInterface;
export declare function calculateOfflineOrderBill(order: any, restFee: any, coupon_info: any, order_bill: any, offlinePlatform: any, rest_round_off: any, taxAfterDiscount?: number, country_code?: string): BillResponseInterface;
export declare function calculateOfflineOrderBill2(order: any, restaurantDetails: any, discountInfo?: any | null, oldOrderBill?: any | null): any;
export declare function calculateOfflineCartBill2(cart: any, restaurantDetails: any, discountInfo: any | null, platform: string): BillResponseInterface;
export declare function getOrderBill(order: any, restaurantDetails: any, language?: string, platform?: string, subtotal?: number | null, currCode?: string, oldOrderBill?: any | null, couponInfo?: any | null): {
    orderBill: any;
    itemInfo: import("./bill-library/interfaces/itemInfo.interface").ItemCalculationDto[];
};
export declare function getCartBill(cart: any, restaurantDetails: any, language?: string, platform?: string, couponInfo?: any | null, countryCode?: string): any;
