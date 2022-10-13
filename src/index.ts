import { BillLibraryService } from './bill-library/services/billLibrary.service';
import { BillOfflineCalculationService } from './bill-library/services/billOffline.service';
import { DiscountLibService } from './bill-library/services/discount-lib.service';
import { DiscountCalculationService } from './bill-library/services/discountCalculation.service';

export function calculateBill(
  cartItemInfo,
  discountInfo,
  chargesInfo,
  rest_round_off = 0.05,
) {
  const discountLibrary = new DiscountLibService();
  const billLibrary = new BillLibraryService();
  const discountCalculation = new DiscountCalculationService();
  const billOfflineCalculationService = new BillOfflineCalculationService(
    discountLibrary,
    billLibrary,
    discountCalculation,
  );

  return billOfflineCalculationService.getOrderBill(
    cartItemInfo,
    discountInfo,
    chargesInfo,
    rest_round_off,
  );
}

export function calculateOfflineCartBill(cart:any, restFee:any, rest_round_off:any) {
  const discountLibrary = new DiscountLibService();
  const billLibrary = new BillLibraryService();
  const discountCalculation = new DiscountCalculationService();
  const billOfflineCalculationService = new BillOfflineCalculationService(
    discountLibrary,
    billLibrary,
    discountCalculation,
  );

  return billOfflineCalculationService.getOfflineCartBill(
    cart,
    restFee,
    rest_round_off,
  );
}

export function calculateOfflineOrderBill(
  order,
  restFee,
  coupon_info,
  order_bill,
  rest_round_off,
) {
  const discountLibrary = new DiscountLibService();
  const billLibrary = new BillLibraryService();
  const discountCalculation = new DiscountCalculationService();
  const billOfflineCalculationService = new BillOfflineCalculationService(
    discountLibrary,
    billLibrary,
    discountCalculation,
  );

  return billOfflineCalculationService.getOfflineOrderBill(
    order,
    restFee,
    coupon_info,
    order_bill,
    rest_round_off,
  );
}
