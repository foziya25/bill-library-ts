import { CartCalculationInfo, CartItemInfo } from "../baseClass/cartItemInfo";
import { OrderCalculationInfo, OrderItemInfo } from "../baseClass/orderItemInfo";
import { ApplicableCartResponseDto, ApplicableOrderResponseDto, CalculateCartChargeDto, CalculateOrderChargeDto } from "../baseClass/responseDto";
import { CartDiscountDto } from "../discountClasses/cartDiscountDto";
import { OrderDiscountDto } from "../discountClasses/orderDiscountDto";
import { BillResponseInterface, DiscountFeeObj, FeeObj } from "../interfaces/billResponse.interface";
import { ChargesInterface } from "../interfaces/charges.interface";
export declare class BillLibraryService {
    getCartBill(cartItemInfo: CartItemInfo[], discountInfo: CartDiscountDto[], chargesInfo: ChargesInterface[], rest_round_off?: number): BillResponseInterface;
    getOrderBill(orderItemInfo: OrderItemInfo[], discountInfo: OrderDiscountDto[], chargesInfo: ChargesInterface[], rest_round_off?: number): BillResponseInterface;
    calculateCartChargeAmount(charge: ChargesInterface, applicableResponse: ApplicableCartResponseDto): CalculateCartChargeDto;
    calculateOrderChargeAmount(charge: ChargesInterface, applicableResponse: ApplicableOrderResponseDto): CalculateOrderChargeDto;
    findApplicableCartItemTotal(charge: ChargesInterface, cartItemInfo: CartCalculationInfo[]): ApplicableCartResponseDto;
    findApplicableOrderItemTotal(charge: ChargesInterface, orderItemInfo: OrderCalculationInfo[], discountInfo: OrderDiscountDto[]): ApplicableOrderResponseDto;
    calculateBillTotal(billInfo: BillResponseInterface): number;
    mergeItemAndMerchantDiscount(discountFeesArray: DiscountFeeObj[]): FeeObj[];
}
