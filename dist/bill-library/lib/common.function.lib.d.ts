import { OrderItemInfo } from '../baseClass/orderItemInfo';
import { ChargesInterface } from '../interfaces/charges.interface';
import { ItemInfo } from '../interfaces/itemInfo.interface';
export declare const calculateAddonVariantPrice: (itemInfo: ItemInfo) => number;
export declare const getRoundOffValue: (value: number, base: number) => any;
export declare function getCartItemInfo(items: any, orderType: any): OrderItemInfo[];
export declare function getOrderItemInfo(items: any): OrderItemInfo[];
export declare function getTransformedRestaurantCharges(charges: any[]): ChargesInterface[];
export declare function getCartItemTotal(itemInfo: OrderItemInfo[]): number;
