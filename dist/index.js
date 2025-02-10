"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartBill = exports.getOrderBill = exports.calculateOfflineCartBill2 = exports.calculateOfflineOrderBill2 = exports.calculateOfflineOrderBill = exports.calculateOfflineCartBill = exports.calculateBill = void 0;
const roundOff_1 = require("./bill-library/baseClass/roundOff");
const billInfo_dto_1 = require("./bill-library/dto/billInfo.dto");
const common_function_lib_1 = require("./bill-library/lib/common.function.lib");
const billLibrary_service_1 = require("./bill-library/services/billLibrary.service");
const billOffline_service_1 = require("./bill-library/services/billOffline.service");
const charges_service_1 = require("./bill-library/services/charges-service");
const discount_lib_service_1 = require("./bill-library/services/discount-lib.service");
const discount_service_1 = require("./bill-library/services/discount-service");
const discountCalculation_service_1 = require("./bill-library/services/discountCalculation.service");
const order_service_1 = require("./bill-library/services/order-service");
const country_enum_1 = require("./enums/country.enum");
const i18n_1 = require("./locale/i18n");
const number_format_1 = require("./utils/number-format");
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
function calculateOfflineCartBill(cart, restFee, coupon_info, offlinePlatform, platform, rest_round_off, taxAfterDiscount = 1, country_code = 'MY') {
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
        return billOfflineCalculationService.getOfflineCartBill(cart, restFee, coupon_info, offlinePlatform, platform, round_off, country_code);
    }
    else {
        return billOfflineCalculationService.getIndonesiaOfflineCartBill(cart, restFee, coupon_info, offlinePlatform, platform, round_off, country_code, taxAfterDiscount);
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
function calculateOfflineOrderBill2(order, restaurantDetails, discountInfo = null, oldOrderBill = null) {
    let response = {
        fees: [],
        bill_total: 0,
        message: 'Bill generated',
        status: 1,
        item_info: {},
    };
    const subtotal = oldOrderBill ? oldOrderBill.subtotal : null;
    const { orderBill, itemInfo } = getOrderBill(order, restaurantDetails, restaurantDetails.language, order.platform, subtotal, order.currency.curr_code, oldOrderBill, discountInfo);
    response.bill_total = orderBill.bill_total;
    response.fees = orderBill.fees;
    const quantity_keys_to_format = ['value', 'bill_total'];
    response = response = (0, number_format_1.getLocalizedData)(response, '', restaurantDetails.country_code, [], quantity_keys_to_format);
    response.item_info = itemInfo;
    return response;
}
exports.calculateOfflineOrderBill2 = calculateOfflineOrderBill2;
function calculateOfflineCartBill2(cart, restaurantDetails, discountInfo = null, platform) {
    let response = {
        fees: [],
        bill_total: 0,
        message: 'Bill generated',
        status: 1,
    };
    const bill = getCartBill(cart, restaurantDetails, restaurantDetails.language, platform, discountInfo, restaurantDetails.country_code);
    response.bill_total = bill.bill_total;
    response.fees = bill.fees;
    const quantity_keys_to_format = ['value', 'bill_total'];
    response = response = (0, number_format_1.getLocalizedData)(response, '', restaurantDetails.country_code, [], quantity_keys_to_format);
    return response;
}
exports.calculateOfflineCartBill2 = calculateOfflineCartBill2;
function getOrderBill(order, restaurantDetails, language = 'en-US', platform = 'easyeat', subtotal = null, currCode = 'MYR', oldOrderBill = null, couponInfo = null) {
    const chargesService = new charges_service_1.ChargesService();
    const discountService = new discount_service_1.DiscountService();
    const orderService = new order_service_1.OrderService(chargesService, discountService);
    const orderId = order['order_id'];
    const orderItems = order['items'];
    const countryCode = order['country_code'] || country_enum_1.CountryMapping.MALAYSIA['country_code'];
    const customDeliveryFee = order['delivery_fee'] || 0;
    const bill = new billInfo_dto_1.BillObjectDto(orderId, order['restaurant_id'], order['user_id'], currCode);
    bill.payments = oldOrderBill ? oldOrderBill['payments'] : [];
    const roundOff = orderService.getRoundOffObject(restaurantDetails, order['order_type']);
    const orderFees = [];
    const deliveryInfo = orderService.getDeliveryObj(order, oldOrderBill);
    let itemInfoDto = (0, common_function_lib_1.getOrderItemInfoNew)(orderItems, order['order_type'], deliveryInfo);
    const itemTotalFee = {
        name: (0, i18n_1.localize)('itemTotal', language),
        id: 'item_total',
        value: itemInfoDto.itemTotal,
    };
    if (itemInfoDto.itemTotal)
        orderFees.push(itemTotalFee);
    const deliveryFee = orderService.calculateAndAddDeliveryFee(itemInfoDto, customDeliveryFee, language);
    if (deliveryFee)
        orderFees.push(deliveryFee);
    let discountValue = 0;
    const discountFee = orderService.calculateAndApplyDiscount(order, couponInfo, itemInfoDto, language);
    if (discountFee) {
        orderFees.push(discountFee);
        discountValue = discountFee.fee;
    }
    const loyaltyFee = orderService.calculateAndUpdateLoyaltyCashback(order, itemInfoDto, oldOrderBill);
    if (loyaltyFee)
        orderFees.push(loyaltyFee);
    itemInfoDto = orderService.calculateAndApplyCharges(order, platform, restaurantDetails, countryCode, itemInfoDto);
    if (order['order_by'] == 'auto') {
        const platformFeeObj = orderService.calculateAndApplyPlatformChargesAuto(restaurantDetails, platform, itemInfoDto, discountValue, customDeliveryFee, bill);
        if (platformFeeObj)
            orderFees.push(platformFeeObj);
    }
    else {
        const feesObjects = orderService.applyChargesAndCalculateCommission(itemInfoDto, platform, restaurantDetails);
        orderFees.push(...feesObjects);
    }
    const topUpFee = orderService.getTopUpFeeObj(order, language);
    if (topUpFee['status'] == 1)
        orderFees.push(topUpFee['fee']);
    bill.fees = orderFees;
    if (subtotal)
        bill.subtotal = subtotal;
    const orderBill = orderService.reCalculateAndUpdateBill(bill, roundOff, language);
    return { orderBill, itemInfo: itemInfoDto.itemInfo };
}
exports.getOrderBill = getOrderBill;
function getCartBill(cart, restaurantDetails, language = 'en-US', platform = 'easyeat', couponInfo = null, countryCode = 'MY') {
    const chargesService = new charges_service_1.ChargesService();
    const discountService = new discount_service_1.DiscountService();
    const orderService = new order_service_1.OrderService(chargesService, discountService);
    const cartId = cart['token'];
    const cartItems = cart['cart_items'];
    const customDeliveryFee = cart['delivery_fee'] || 0;
    const bill = new billInfo_dto_1.BillObjectDto(cartId, cart['current_restaurant_id'], cart['user_id'], '');
    const roundOff = orderService.getRoundOffObject(restaurantDetails, cart['order_type']);
    const orderFees = [];
    let itemInfoDto = (0, common_function_lib_1.getCartItemInfoNew)(cartItems, cart['order_type'], platform, null);
    const itemTotalFee = {
        name: (0, i18n_1.localize)('itemTotal', language),
        id: 'item_total',
        value: itemInfoDto.itemTotal,
    };
    if (itemInfoDto.itemTotal)
        orderFees.push(itemTotalFee);
    const deliveryFee = orderService.calculateAndAddDeliveryFee(itemInfoDto, customDeliveryFee, language);
    if (deliveryFee)
        orderFees.push(deliveryFee);
    let discountValue = 0;
    const discountFee = orderService.calculateAndApplyDiscount(cart, couponInfo, itemInfoDto, language, true);
    if (discountFee) {
        orderFees.push(discountFee);
        discountValue = discountFee.fee;
    }
    itemInfoDto = orderService.calculateAndApplyCharges(cart, platform, restaurantDetails, countryCode, itemInfoDto);
    if (cart['order_by'] == 'auto') {
        const platformFeeObj = orderService.calculateAndApplyPlatformChargesAuto(restaurantDetails, platform, itemInfoDto, discountValue, customDeliveryFee, bill);
        if (platformFeeObj)
            orderFees.push(platformFeeObj);
    }
    else {
        const feesObjects = orderService.applyChargesAndCalculateCommission(itemInfoDto, platform, restaurantDetails);
        orderFees.push(...feesObjects);
    }
    const topUpFee = orderService.getTopUpFeeObj(cart, language);
    if (topUpFee['status'] == 1)
        orderFees.push(topUpFee['fee']);
    bill.fees = orderFees;
    const orderBill = orderService.reCalculateAndUpdateBill(bill, roundOff, language);
    return orderBill;
}
exports.getCartBill = getCartBill;
//# sourceMappingURL=index.js.map