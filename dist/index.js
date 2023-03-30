"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOfflineOrderBill = exports.calculateOfflineCartBill = exports.calculateBill = void 0;
const billLibrary_service_1 = require("./bill-library/services/billLibrary.service");
const billOffline_service_1 = require("./bill-library/services/billOffline.service");
const discount_lib_service_1 = require("./bill-library/services/discount-lib.service");
const discountCalculation_service_1 = require("./bill-library/services/discountCalculation.service");
function calculateBill(cartItemInfo, discountInfo, chargesInfo, rest_round_off = 0.05, country_code = 'MY') {
    const discountLibrary = new discount_lib_service_1.DiscountLibService();
    const billLibrary = new billLibrary_service_1.BillLibraryService();
    const discountCalculation = new discountCalculation_service_1.DiscountCalculationService();
    const billOfflineCalculationService = new billOffline_service_1.BillOfflineCalculationService(discountLibrary, billLibrary, discountCalculation);
    return billOfflineCalculationService.getOrderBill(cartItemInfo, discountInfo, chargesInfo, rest_round_off, country_code);
}
exports.calculateBill = calculateBill;
function calculateOfflineCartBill(cart, restFee, offlinePlatform, platform, rest_round_off, taxAfterDiscount = 1, country_code = 'MY') {
    const discountLibrary = new discount_lib_service_1.DiscountLibService();
    const billLibrary = new billLibrary_service_1.BillLibraryService();
    const discountCalculation = new discountCalculation_service_1.DiscountCalculationService();
    const billOfflineCalculationService = new billOffline_service_1.BillOfflineCalculationService(discountLibrary, billLibrary, discountCalculation);
    if (country_code === 'MY') {
        return billOfflineCalculationService.getOfflineCartBill(cart, restFee, offlinePlatform, platform, rest_round_off, country_code);
    }
    else {
        return billOfflineCalculationService.getIndonesiaOfflineCartBill(cart, restFee, offlinePlatform, platform, rest_round_off, country_code, taxAfterDiscount);
    }
}
exports.calculateOfflineCartBill = calculateOfflineCartBill;
function calculateOfflineOrderBill(order, restFee, coupon_info, order_bill, offlinePlatform, rest_round_off, taxAfterDiscount = 1, country_code = 'MY') {
    const discountLibrary = new discount_lib_service_1.DiscountLibService();
    const billLibrary = new billLibrary_service_1.BillLibraryService();
    const discountCalculation = new discountCalculation_service_1.DiscountCalculationService();
    const billOfflineCalculationService = new billOffline_service_1.BillOfflineCalculationService(discountLibrary, billLibrary, discountCalculation);
    if (country_code === 'MY') {
        return billOfflineCalculationService.getOfflineOrderBill(order, restFee, coupon_info, order_bill, offlinePlatform, rest_round_off, country_code);
    }
    else {
        return billOfflineCalculationService.getIndonesiaOfflineOrderBill(order, restFee, coupon_info, order_bill, offlinePlatform, rest_round_off, country_code, taxAfterDiscount);
    }
}
exports.calculateOfflineOrderBill = calculateOfflineOrderBill;
//# sourceMappingURL=index.js.map