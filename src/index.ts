import {RoundOffObj} from './bill-library/baseClass/roundOff';
import {getRoundOffDisableStatus} from './bill-library/lib/common.function.lib';
import {BillLibraryService} from './bill-library/services/billLibrary.service';
import {BillOfflineCalculationService} from './bill-library/services/billOffline.service';
import {DiscountLibService} from './bill-library/services/discount-lib.service';
import {DiscountCalculationService} from './bill-library/services/discountCalculation.service';

export function calculateBill(
  cartItemInfo,
  discountInfo,
  chargesInfo,
  rest_round_off: any,
  country_code = 'MY',
) {
  const discountLibrary = new DiscountLibService();
  const billLibrary = new BillLibraryService();
  const discountCalculation = new DiscountCalculationService();
  const billOfflineCalculationService = new BillOfflineCalculationService(
    discountLibrary,
    billLibrary,
    discountCalculation,
  );
  const round_off = new RoundOffObj();
  if (rest_round_off) {
    if (rest_round_off.base_roundoff) {
      round_off.baseRoundOff = rest_round_off.base_roundoff;
    }
    if (rest_round_off.round_off_close) {
      round_off.roundOffClose = rest_round_off.round_off_close;
    }
    if (rest_round_off.roundup) {
      round_off.roundUp = rest_round_off.roundup;
    }
  }

  return billOfflineCalculationService.getOrderBill(
    cartItemInfo,
    discountInfo,
    chargesInfo,
    round_off,
    country_code,
  );
}

export function calculateOfflineCartBill(
  cart: any,
  restFee: any,
  offlinePlatform: any,
  platform: string,
  rest_round_off: any,
  taxAfterDiscount = 1,
  country_code = 'MY',
) {
  const discountLibrary = new DiscountLibService();
  const billLibrary = new BillLibraryService();
  const discountCalculation = new DiscountCalculationService();
  const billOfflineCalculationService = new BillOfflineCalculationService(
    discountLibrary,
    billLibrary,
    discountCalculation,
  );
  const order_type = cart.order_type;
  const round_off = new RoundOffObj();
  if (rest_round_off) {
    if (rest_round_off.base_roundoff) {
      round_off.baseRoundOff = rest_round_off.base_roundoff;
    }
    if (rest_round_off.roundup) {
      round_off.roundUp = rest_round_off.roundup;
    }
    if (rest_round_off.round_off_close) {
      round_off.roundOffClose = getRoundOffDisableStatus(
        order_type,
        rest_round_off.round_off_close,
      );
    }
  }

  if (country_code === 'MY') {
    return billOfflineCalculationService.getOfflineCartBill(
      cart,
      restFee,
      offlinePlatform,
      platform,
      round_off,
      country_code,
    );
  } else {
    return billOfflineCalculationService.getIndonesiaOfflineCartBill(
      cart,
      restFee,
      offlinePlatform,
      platform,
      round_off,
      country_code,
      taxAfterDiscount,
    );
  }
}

export function calculateOfflineOrderBill(
  order,
  restFee,
  coupon_info,
  order_bill,
  offlinePlatform: any,
  rest_round_off,
  taxAfterDiscount = 1,
  country_code = 'MY',
) {
  const discountLibrary = new DiscountLibService();
  const billLibrary = new BillLibraryService();
  const discountCalculation = new DiscountCalculationService();
  const billOfflineCalculationService = new BillOfflineCalculationService(
    discountLibrary,
    billLibrary,
    discountCalculation,
  );
  const order_type = order.order_type;
  const round_off = new RoundOffObj();
  if (rest_round_off) {
    if (rest_round_off.base_roundoff) {
      round_off.baseRoundOff = rest_round_off.base_roundoff;
    }
    if (rest_round_off.roundup) {
      round_off.roundUp = rest_round_off.roundup;
    }
    if (rest_round_off.round_off_close) {
      round_off.roundOffClose = getRoundOffDisableStatus(
        order_type,
        rest_round_off.round_off_close,
      );
    }
  }

  if (country_code === 'MY') {
    return billOfflineCalculationService.getOfflineOrderBill(
      order,
      restFee,
      coupon_info,
      order_bill,
      offlinePlatform,
      round_off,
      country_code,
    );
  } else {
    return billOfflineCalculationService.getIndonesiaOfflineOrderBill(
      order,
      restFee,
      coupon_info,
      order_bill,
      offlinePlatform,
      round_off,
      country_code,
      taxAfterDiscount,
    );
  }
}
