import { OrderItemInfo } from '../baseClass/orderItemInfo';
import { RoundOffObj } from '../baseClass/roundOff';
import { FeeObj } from '../interfaces/billResponse.interface';
import { ChargesInterface } from '../interfaces/charges.interface';
import { ItemInfo, ItemInfoDto } from '../interfaces/itemInfo.interface';
export declare const calculateAddonVariantPrice: (itemInfo: ItemInfo) => number;
export declare const getRoundOffValue: (value: number, round_off: RoundOffObj) => any;
export declare function getCartItemInfo(items: Array<any>, orderType: number, platform: string): OrderItemInfo[];
export declare function getCartItemInfoNew(items: any[], orderType: number, platform?: string, deliveryInfo?: any[] | null): ItemInfoDto;
export declare function getOrderItemInfo(items: any): OrderItemInfo[];
export declare function getOrderItemInfoNew(items: any[], orderType: number, deliveryInfo?: any[] | null): ItemInfoDto;
export declare function getTransformedRestaurantCharges(charges: any[], order_type: number, skip_packaging_charge_operation?: boolean, packagingChargeDisabled?: boolean, skip_service_charge_operation?: boolean): ChargesInterface[];
export declare function getCartItemTotal(itemInfo: OrderItemInfo[]): number;
export declare function getRoundOffDisableStatus(order_type: number, round_off_close: number): boolean;
export declare function getPlatformCommission(platform: string, restaurant_platforms: any, item_total: number): {
    status: number;
    fees: FeeObj;
};
export declare function generateRandomString(length?: number): string;
