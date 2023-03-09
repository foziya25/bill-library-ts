import { DiscountAction, DiscountApplicableType, DiscountCategory, DiscountType } from '../enum/discountLib.enum';

export interface DiscountInterface {
  name: string;
  discountType: DiscountType;
  value: number;
  applicableOn: any[];
  discountApplicableType: DiscountApplicableType;
  id: string;
  discountAction: DiscountAction;
  discountCategory: DiscountCategory;
  maxValue: number;
  reason?: string;
}
