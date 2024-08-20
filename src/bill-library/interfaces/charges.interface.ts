import {ChargeApplicableType, ChargeType} from '../enum/billLib.enum';

// Same as ChargesDetailDto of PHP
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

// Same as ChargesObj of PHP
export interface ChargesObjInterface {
  value: number;
  name: string;
  id: string;
}
