"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOfflineOrderBill = exports.calculateOfflineCartBill = exports.calculateBill = void 0;
const billLibrary_service_1 = require("./bill-library/services/billLibrary.service");
const billOffline_service_1 = require("./bill-library/services/billOffline.service");
const discount_lib_service_1 = require("./bill-library/services/discount-lib.service");
const discountCalculation_service_1 = require("./bill-library/services/discountCalculation.service");
function calculateBill(cartItemInfo, discountInfo, chargesInfo, rest_round_off = 0.05) {
    const discountLibrary = new discount_lib_service_1.DiscountLibService();
    const billLibrary = new billLibrary_service_1.BillLibraryService();
    const discountCalculation = new discountCalculation_service_1.DiscountCalculationService();
    const billOfflineCalculationService = new billOffline_service_1.BillOfflineCalculationService(discountLibrary, billLibrary, discountCalculation);
    return billOfflineCalculationService.getOrderBill(cartItemInfo, discountInfo, chargesInfo, rest_round_off);
}
exports.calculateBill = calculateBill;
function calculateOfflineCartBill(cart, restFee, rest_round_off) {
    const discountLibrary = new discount_lib_service_1.DiscountLibService();
    const billLibrary = new billLibrary_service_1.BillLibraryService();
    const discountCalculation = new discountCalculation_service_1.DiscountCalculationService();
    const billOfflineCalculationService = new billOffline_service_1.BillOfflineCalculationService(discountLibrary, billLibrary, discountCalculation);
    return billOfflineCalculationService.getOfflineCartBill(cart, restFee, rest_round_off);
}
exports.calculateOfflineCartBill = calculateOfflineCartBill;
function calculateOfflineOrderBill(order, restFee, coupon_info, order_bill, rest_round_off) {
    const discountLibrary = new discount_lib_service_1.DiscountLibService();
    const billLibrary = new billLibrary_service_1.BillLibraryService();
    const discountCalculation = new discountCalculation_service_1.DiscountCalculationService();
    const billOfflineCalculationService = new billOffline_service_1.BillOfflineCalculationService(discountLibrary, billLibrary, discountCalculation);
    return billOfflineCalculationService.getOfflineOrderBill(order, restFee, coupon_info, order_bill, rest_round_off);
}
exports.calculateOfflineOrderBill = calculateOfflineOrderBill;
//# sourceMappingURL=index.js.map