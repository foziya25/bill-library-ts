import { DiscountCategory } from '../enum/discountLib.enum';
export interface BillResponseInterface {
    fees: FeeObj[];
    bill_total: number;
    message: string;
    status: number;
}
export interface FeeObj {
    name: string;
    value: number;
    id: string;
    reason?: string;
}
export declare class DiscountFeeObj implements FeeObj {
    name: string;
    value: number;
    id: string;
    discountCategory: DiscountCategory;
    reason: string;
}
