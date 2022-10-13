import { FeeObj } from '../interfaces/billResponse.interface';

export class ApplicableCartResponseDto {
  status: number;
  itemTotalWithDiscount: number;
  cartItemList: string[];
}

export class ApplicableOrderResponseDto {
  status: number;
  itemTotalWithDiscount: number;
  orderItemList: string[];
}

export class CalculateCartChargeDto {
  status: number;
  chargeFee: FeeObj;
}

export class CalculateOrderChargeDto {
  status: number;
  chargeFee: FeeObj;
}
