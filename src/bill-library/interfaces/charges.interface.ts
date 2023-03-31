import {ChargeApplicableType, ChargeType} from '../enum/billLib.enum';

export interface ChargesInterface {
  chargeType: ChargeType;
  chargeValue: number;
  applicableOn: [];
  chargeApplicableType: ChargeApplicableType;
  id: string;
  name: string;
  class: string;
  subName: string;
}
