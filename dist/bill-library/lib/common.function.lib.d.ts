import { OrderItemInfo } from '../baseClass/orderItemInfo';
import { ChargesInterface } from '../interfaces/charges.interface';
import { ItemInfo } from '../interfaces/itemInfo.interface';
export declare const calculateAddonVariantPrice: (itemInfo: ItemInfo) => number;
export declare const getRoundOffValue: (value: number, base: number) => any;
export declare function getCartItemInfo(items: Array<any>, orderType: number): OrderItemInfo[];
export declare function getOrderItemInfo(items: any): OrderItemInfo[];
export declare function getTransformedRestaurantCharges(charges: any[], order_type: number): ChargesInterface[];
export declare function getCartItemTotal(itemInfo: OrderItemInfo[]): number;
