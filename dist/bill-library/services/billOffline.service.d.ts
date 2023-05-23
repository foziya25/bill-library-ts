import { OrderItemInfo } from '../baseClass/orderItemInfo';
import { RoundOffObj } from '../baseClass/roundOff';
import { BillResponseInterface } from '../interfaces/billResponse.interface';
import { ChargesInterface } from '../interfaces/charges.interface';
import { DiscountInterface } from '../interfaces/discount.interface';
import { BillLibraryService } from './billLibrary.service';
import { DiscountLibService } from './discount-lib.service';
import { DiscountCalculationService } from './discountCalculation.service';
export declare class BillOfflineCalculationService {
    private discountLibrary;
    private billLibrary;
    private discountCalculationService;
    constructor(discountLibrary: DiscountLibService, billLibrary: BillLibraryService, discountCalculationService: DiscountCalculationService);
    getOrderBill(orderItemInfo: OrderItemInfo[], discountInfo: DiscountInterface[], chargesInfo: ChargesInterface[], round_off: RoundOffObj, country_code: string, platform: any, restaurant_platform: any): BillResponseInterface;
    getIndonesiaOrderBill(orderItemInfo: OrderItemInfo[], discountInfo: DiscountInterface[], chargesInfo: ChargesInterface[], round_off: RoundOffObj, country_code: string, taxAfterDiscount: any, platform: any, restaurant_platform: any): BillResponseInterface;
    validateDiscount(discountInfo: DiscountInterface[]): {
        status: number;
        message: string;
    };
    getOfflineCartBill(cart: any, restFee: any, coupon_info: any, offlinePlatform: any, platform: string, round_off: RoundOffObj, country_code?: string): BillResponseInterface;
    getOfflineOrderBill(order: any, restFee: any, couponInfo: any, orderBill: any, offlinePlatform: any, round_off: RoundOffObj, country_code?: string): BillResponseInterface;
    getIndonesiaOfflineCartBill(cart: any, restFee: any, coupon_info: any, offlinePlatform: any, platform: string, round_off: RoundOffObj, country_code: string, taxAfterDiscount: any): BillResponseInterface;
    getIndonesiaOfflineOrderBill(order: any, restFee: any, couponInfo: any, orderBill: any, offlinePlatform: any, round_off: RoundOffObj, country_code: string, taxAfterDiscount: any): BillResponseInterface;
}
