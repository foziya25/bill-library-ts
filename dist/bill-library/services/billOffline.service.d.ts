import { OrderItemInfo } from '../baseClass/orderItemInfo';
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
    getOrderBill(orderItemInfo: OrderItemInfo[], discountInfo: DiscountInterface[], chargesInfo: ChargesInterface[], rest_round_off?: number, country_code?: string): BillResponseInterface;
    validateDiscount(discountInfo: DiscountInterface[]): {
        status: number;
        message: string;
    };
    getOfflineCartBill(cart: any, restFee: any, rest_round_off: any, country_code?: string): BillResponseInterface;
    getOfflineOrderBill(order: any, restFee: any, couponInfo: any, orderBill: any, rest_round_off: any, country_code?: string): BillResponseInterface;
}
