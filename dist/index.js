"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOfflineOrderBill = exports.calculateOfflineCartBill = exports.calculateBill = void 0;
const roundOff_1 = require("./bill-library/baseClass/roundOff");
const common_function_lib_1 = require("./bill-library/lib/common.function.lib");
const billLibrary_service_1 = require("./bill-library/services/billLibrary.service");
const billOffline_service_1 = require("./bill-library/services/billOffline.service");
const discount_lib_service_1 = require("./bill-library/services/discount-lib.service");
const discountCalculation_service_1 = require("./bill-library/services/discountCalculation.service");
function calculateBill(cartItemInfo, discountInfo, chargesInfo, rest_round_off, country_code = 'MY', platform, restaurant_platform) {
    const discountLibrary = new discount_lib_service_1.DiscountLibService();
    const billLibrary = new billLibrary_service_1.BillLibraryService();
    const discountCalculation = new discountCalculation_service_1.DiscountCalculationService();
    const billOfflineCalculationService = new billOffline_service_1.BillOfflineCalculationService(discountLibrary, billLibrary, discountCalculation);
    const round_off = new roundOff_1.RoundOffObj();
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
    return billOfflineCalculationService.getOrderBill(cartItemInfo, discountInfo, chargesInfo, round_off, country_code, platform, restaurant_platform);
}
exports.calculateBill = calculateBill;
function calculateOfflineCartBill(cart, restFee, offlinePlatform, platform, rest_round_off, taxAfterDiscount = 1, country_code = 'MY') {
    const discountLibrary = new discount_lib_service_1.DiscountLibService();
    const billLibrary = new billLibrary_service_1.BillLibraryService();
    const discountCalculation = new discountCalculation_service_1.DiscountCalculationService();
    const billOfflineCalculationService = new billOffline_service_1.BillOfflineCalculationService(discountLibrary, billLibrary, discountCalculation);
    const order_type = cart.order_type;
    const round_off = new roundOff_1.RoundOffObj();
    if (rest_round_off) {
        if (rest_round_off.base_roundoff) {
            round_off.baseRoundOff = rest_round_off.base_roundoff;
        }
        if (rest_round_off.roundup) {
            round_off.roundUp = rest_round_off.roundup;
        }
        if (rest_round_off.round_off_close) {
            round_off.roundOffClose = (0, common_function_lib_1.getRoundOffDisableStatus)(order_type, rest_round_off.round_off_close);
        }
    }
    if (country_code === 'MY') {
        return billOfflineCalculationService.getOfflineCartBill(cart, restFee, offlinePlatform, platform, round_off, country_code);
    }
    else {
        return billOfflineCalculationService.getIndonesiaOfflineCartBill(cart, restFee, offlinePlatform, platform, round_off, country_code, taxAfterDiscount);
    }
}
exports.calculateOfflineCartBill = calculateOfflineCartBill;
function calculateOfflineOrderBill(order, restFee, coupon_info, order_bill, offlinePlatform, rest_round_off, taxAfterDiscount = 1, country_code = 'MY') {
    const discountLibrary = new discount_lib_service_1.DiscountLibService();
    const billLibrary = new billLibrary_service_1.BillLibraryService();
    const discountCalculation = new discountCalculation_service_1.DiscountCalculationService();
    const billOfflineCalculationService = new billOffline_service_1.BillOfflineCalculationService(discountLibrary, billLibrary, discountCalculation);
    const order_type = order.order_type;
    const round_off = new roundOff_1.RoundOffObj();
    if (rest_round_off) {
        if (rest_round_off.base_roundoff) {
            round_off.baseRoundOff = rest_round_off.base_roundoff;
        }
        if (rest_round_off.roundup) {
            round_off.roundUp = rest_round_off.roundup;
        }
        if (rest_round_off.round_off_close) {
            round_off.roundOffClose = (0, common_function_lib_1.getRoundOffDisableStatus)(order_type, rest_round_off.round_off_close);
        }
    }
    if (country_code === 'MY') {
        return billOfflineCalculationService.getOfflineOrderBill(order, restFee, coupon_info, order_bill, offlinePlatform, round_off, country_code);
    }
    else {
        return billOfflineCalculationService.getIndonesiaOfflineOrderBill(order, restFee, coupon_info, order_bill, offlinePlatform, round_off, country_code, taxAfterDiscount);
    }
}
exports.calculateOfflineOrderBill = calculateOfflineOrderBill;
//# sourceMappingURL=index.js.map