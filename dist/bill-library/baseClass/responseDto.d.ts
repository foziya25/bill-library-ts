import { FeeObj } from '../interfaces/billResponse.interface';
export declare class ApplicableCartResponseDto {
    status: number;
    itemTotalWithDiscount: number;
    cartItemList: string[];
}
export declare class ApplicableOrderResponseDto {
    status: number;
    itemTotalWithDiscount: number;
    orderItemList: string[];
}
export declare class CalculateCartChargeDto {
    status: number;
    chargeFee: FeeObj;
}
export declare class CalculateOrderChargeDto {
    status: number;
    chargeFee: FeeObj;
}
