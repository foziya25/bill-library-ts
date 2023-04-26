import { CartCalculationInfo, CartItemInfo } from '../baseClass/cartItemInfo';
import { OrderCalculationInfo, OrderItemInfo } from '../baseClass/orderItemInfo';
import { ApplicableCartResponseDto, ApplicableOrderResponseDto, CalculateCartChargeDto, CalculateOrderChargeDto } from '../baseClass/responseDto';
import { RoundOffObj } from '../baseClass/roundOff';
import { CartDiscountDto } from '../discountClasses/cartDiscountDto';
import { OrderDiscountDto } from '../discountClasses/orderDiscountDto';
import { BillResponseInterface, DiscountFeeObj, FeeObj } from '../interfaces/billResponse.interface';
import { ChargesInterface } from '../interfaces/charges.interface';
export declare class BillLibraryService {
    getCartBill(cartItemInfo: CartItemInfo[], discountInfo: CartDiscountDto[], chargesInfo: ChargesInterface[], round_off: RoundOffObj, country_code: any): BillResponseInterface;
    getOrderBill(orderItemInfo: OrderItemInfo[], discountInfo: OrderDiscountDto[], chargesInfo: ChargesInterface[], round_off: RoundOffObj, country_code?: string): BillResponseInterface;
    getIndonesiaOrderBill(orderItemInfo: OrderItemInfo[], discountInfo: OrderDiscountDto[], chargesInfo: ChargesInterface[], round_off: RoundOffObj, country_code: string, taxAfterDiscount: any): BillResponseInterface;
    calculateCartChargeAmount(charge: ChargesInterface, applicableResponse: ApplicableCartResponseDto): CalculateCartChargeDto;
    calculateOrderChargeAmount(charge: ChargesInterface, applicableResponse: ApplicableOrderResponseDto): CalculateOrderChargeDto;
    findApplicableCartItemTotal(charge: ChargesInterface, cartItemInfo: CartCalculationInfo[]): ApplicableCartResponseDto;
    findApplicableOrderItemTotal(charge: ChargesInterface, orderItemInfo: OrderCalculationInfo[], discountInfo: OrderDiscountDto[]): ApplicableOrderResponseDto;
    findIndonesiaApplicableOrderItemTotal(charge: ChargesInterface, orderItemInfo: OrderCalculationInfo[], discountInfo: OrderDiscountDto[], taxAfterDiscount: any): ApplicableOrderResponseDto;
    calculateBillTotal(billInfo: BillResponseInterface): number;
    mergeItemAndMerchantDiscount(discountFeesArray: DiscountFeeObj[], country_code: any): FeeObj[];
}
