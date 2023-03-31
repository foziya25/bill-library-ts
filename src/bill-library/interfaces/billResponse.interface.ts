import {DiscountCategory} from '../enum/discountLib.enum';

export interface BillResponseInterface {
  fees: FeeObj[];
  bill_total: number;
  message: string;
  status: number;
  // bill_total_text: string;
}

export interface FeeObj {
  name: string;
  value: number;
  // value_text: string;
  id: string;

  reason?: string;
}

export class DiscountFeeObj implements FeeObj {
  name: string;
  value: number;
  // value_text: string;
  id: string;
  discountCategory: DiscountCategory;
  reason: string;
}
