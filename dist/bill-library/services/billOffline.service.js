"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillOfflineCalculationService = void 0;
const common_function_lib_1 = require("../lib/common.function.lib");
class BillOfflineCalculationService {
    constructor(discountLibrary, billLibrary, discountCalculationService) {
        this.discountLibrary = discountLibrary;
        this.billLibrary = billLibrary;
        this.discountCalculationService = discountCalculationService;
    }
    getOrderBill(orderItemInfo, discountInfo, chargesInfo, rest_round_off = 0.05, country_code = 'MY') {
        const validationResponse = this.validateDiscount(discountInfo);
        if (!validationResponse.status) {
            const bill = {
                fees: [],
                bill_total: 0,
                status: 0,
                message: validationResponse.message,
            };
            return bill;
        }
        const discountDto = this.discountLibrary.applyDiscountOnOrder(orderItemInfo, discountInfo);
        return this.billLibrary.getOrderBill(orderItemInfo, discountDto, chargesInfo, rest_round_off, country_code);
    }
    getIndonesiaOrderBill(orderItemInfo, discountInfo, chargesInfo, rest_round_off = 0.05, country_code = 'ID', taxAfterDiscount) {
        const validationResponse = this.validateDiscount(discountInfo);
        if (!validationResponse.status) {
            const bill = {
                fees: [],
                bill_total: 0,
                status: 0,
                message: validationResponse.message,
            };
            return bill;
        }
        const discountDto = this.discountLibrary.applyDiscountOnOrder(orderItemInfo, discountInfo);
        return this.billLibrary.getIndonesiaOrderBill(orderItemInfo, discountDto, chargesInfo, rest_round_off, country_code, taxAfterDiscount);
    }
    validateDiscount(discountInfo) {
        const discountMap = [];
        let flag = 1;
        let message = '';
        for (const ele in discountInfo) {
            if (discountInfo[ele].discountCategory === "coupon") {
                if (!discountMap['merchant'] && !discountMap['topUp'] && !discountMap['coupon']) {
                    discountMap['coupon'] = 1;
                }
                else if (!discountMap['coupon'] && (discountMap['merchant'] || discountMap['topUp'])) {
                    flag = 0;
                    message = 'Cannot add coupon ,merchant and top up discounts on same order';
                    break;
                }
                else {
                    flag = 0;
                    message = 'Duplicate coupon discount';
                    break;
                }
            }
            else if (discountInfo[ele].discountCategory === "merchant") {
                if (!discountMap['merchant'] && !discountMap['topUp'] && !discountMap['coupon']) {
                    discountMap['merchant'] = 1;
                }
                else if (!discountMap['merchant'] && (discountMap['topUp'] || discountMap['coupon'])) {
                    flag = 0;
                    message = 'Cannot add coupon ,merchant and top up discounts on same order';
                    break;
                }
                else {
                    flag = 0;
                    message = 'Duplicate merchant discount';
                    break;
                }
            }
            else if (discountInfo[ele].discountCategory === "topUp") {
                if (!discountMap['topUp'] && !discountMap['merchant'] && !discountMap['coupon']) {
                    discountMap['topUp'] = 1;
                }
                else if (!discountMap['topUp'] && (discountMap['merchant'] || discountMap['coupon'])) {
                    flag = 0;
                    message = 'Cannot add coupon ,merchant and top up discounts on same order';
                    break;
                }
                else {
                    flag = 0;
                    message = 'Duplicate topUp discount ';
                    break;
                }
            }
        }
        return { status: flag, message: message };
    }
    getOfflineCartBill(cart, restFee, offlinePlatform, platform = 'easyeat', rest_round_off, country_code = 'MY') {
        const { cart_items, order_type, skip_service_charge_operation, skip_packaging_charge_operation } = cart;
        const itemInfo = (0, common_function_lib_1.getCartItemInfo)(cart_items, order_type);
        let restCharges = (0, common_function_lib_1.getTransformedRestaurantCharges)(restFee, order_type);
        const discountInfo = this.discountCalculationService.getDiscountFromCart(cart, itemInfo);
        let packagingChargeDisabled = false;
        if (platform && platform != 'easyeat' && offlinePlatform && Array.isArray(offlinePlatform) && offlinePlatform.length) {
            packagingChargeDisabled = true;
            for (const i in offlinePlatform) {
                const platformSettings = offlinePlatform[i];
                if (platformSettings['id'] == platform && platformSettings['pkg_applicable']) {
                    packagingChargeDisabled = false;
                }
            }
        }
        restCharges = restCharges.filter((charges) => {
            if (((skip_packaging_charge_operation || packagingChargeDisabled) && charges.class === 'packaging_charge') || (skip_service_charge_operation && charges.class === 'service_tax')) {
                return false;
            }
            else {
                return true;
            }
        });
        return this.getOrderBill(itemInfo, discountInfo, restCharges, rest_round_off, country_code);
    }
    getOfflineOrderBill(order, restFee, couponInfo, orderBill, offlinePlatform, rest_round_off, country_code = 'MY') {
        const { items, order_type, skip_service_charge_operation, skip_packaging_charge_operation, platform } = order;
        const { fees } = orderBill;
        const itemInfo = (0, common_function_lib_1.getOrderItemInfo)(items);
        let restCharges = (0, common_function_lib_1.getTransformedRestaurantCharges)(restFee, order_type);
        const discountInfo = this.discountCalculationService.getDiscountOnOrder(order, couponInfo, itemInfo);
        let packagingChargeDisabled = false;
        if (platform && platform != 'easyeat' && offlinePlatform && Array.isArray(offlinePlatform) && offlinePlatform.length) {
            packagingChargeDisabled = true;
            for (const i in offlinePlatform) {
                const platformSettings = offlinePlatform[i];
                if (platformSettings['id'] == platform && platformSettings['pkg_applicable']) {
                    packagingChargeDisabled = false;
                }
            }
        }
        restCharges = restCharges.filter((charges) => {
            if (((skip_packaging_charge_operation || packagingChargeDisabled) && charges.class === 'packaging_charge') || (skip_service_charge_operation && charges.class === 'service_tax')) {
                return false;
            }
            else {
                return true;
            }
        });
        if (fees && fees.length) {
            fees.forEach((fee) => {
                if (order_type == 1 && fee.id === 'delivery') {
                    const deliveryChargeInterface = {
                        chargeType: "fixed",
                        chargeValue: fee.fee,
                        applicableOn: [],
                        chargeApplicableType: "overAll",
                        id: fee.id,
                        name: fee.fee_name,
                        class: 'DeliveryCharge',
                        subName: 'DeliveryCharge',
                    };
                    restCharges.push(deliveryChargeInterface);
                }
                if (fee.id === 'loyalty_cashback') {
                    const loyaltyDiscount = {
                        name: fee.fee_name,
                        discountType: "fixed",
                        value: -1 * fee.fee,
                        applicableOn: [],
                        discountApplicableType: "overAll",
                        id: fee.id,
                        discountAction: "normal",
                        discountCategory: "merchant",
                        maxValue: 0,
                    };
                    discountInfo.push(loyaltyDiscount);
                }
            });
        }
        return this.getOrderBill(itemInfo, discountInfo, restCharges, rest_round_off, country_code);
    }
    getIndonesiaOfflineCartBill(cart, restFee, offlinePlatform, platform = 'easyeat', rest_round_off, country_code = 'ID', taxAfterDiscount) {
        const { cart_items, order_type, skip_service_charge_operation, skip_packaging_charge_operation } = cart;
        const itemInfo = (0, common_function_lib_1.getCartItemInfo)(cart_items, order_type);
        let restCharges = (0, common_function_lib_1.getTransformedRestaurantCharges)(restFee, order_type);
        const discountInfo = this.discountCalculationService.getDiscountFromCart(cart, itemInfo);
        let packagingChargeDisabled = false;
        if (platform && platform != 'easyeat' && offlinePlatform && Array.isArray(offlinePlatform) && offlinePlatform.length) {
            packagingChargeDisabled = true;
            for (const i in offlinePlatform) {
                const platformSettings = offlinePlatform[i];
                if (platformSettings['id'] == platform && platformSettings['pkg_applicable']) {
                    packagingChargeDisabled = false;
                }
            }
        }
        restCharges = restCharges.filter((charges) => {
            if (((skip_packaging_charge_operation || packagingChargeDisabled) && charges.class === 'packaging_charge') || (skip_service_charge_operation && charges.class === 'service_tax')) {
                return false;
            }
            else {
                return true;
            }
        });
        return this.getIndonesiaOrderBill(itemInfo, discountInfo, restCharges, rest_round_off, country_code, taxAfterDiscount);
    }
    getIndonesiaOfflineOrderBill(order, restFee, couponInfo, orderBill, offlinePlatform, rest_round_off, country_code = 'ID', taxAfterDiscount) {
        const { items, order_type, skip_service_charge_operation, skip_packaging_charge_operation, platform } = order;
        const { fees } = orderBill;
        const itemInfo = (0, common_function_lib_1.getOrderItemInfo)(items);
        let restCharges = (0, common_function_lib_1.getTransformedRestaurantCharges)(restFee, order_type);
        const discountInfo = this.discountCalculationService.getDiscountOnOrder(order, couponInfo, itemInfo);
        let packagingChargeDisabled = false;
        if (platform && platform != 'easyeat' && offlinePlatform && Array.isArray(offlinePlatform) && offlinePlatform.length) {
            packagingChargeDisabled = true;
            for (const i in offlinePlatform) {
                const platformSettings = offlinePlatform[i];
                if (platformSettings['id'] == platform && platformSettings['pkg_applicable']) {
                    packagingChargeDisabled = false;
                }
            }
        }
        restCharges = restCharges.filter((charges) => {
            if (((skip_packaging_charge_operation || packagingChargeDisabled) && charges.class === 'packaging_charge') || (skip_service_charge_operation && charges.class === 'service_tax')) {
                return false;
            }
            else {
                return true;
            }
        });
        if (fees && fees.length) {
            fees.forEach((fee) => {
                if (order_type == 1 && fee.id === 'delivery') {
                    const deliveryChargeInterface = {
                        chargeType: "fixed",
                        chargeValue: fee.fee,
                        applicableOn: [],
                        chargeApplicableType: "overAll",
                        id: fee.id,
                        name: fee.fee_name,
                        class: 'DeliveryCharge',
                        subName: 'DeliveryCharge',
                    };
                    restCharges.push(deliveryChargeInterface);
                }
                if (fee.id === 'loyalty_cashback') {
                    const loyaltyDiscount = {
                        name: fee.fee_name,
                        discountType: "fixed",
                        value: -1 * fee.fee,
                        applicableOn: [],
                        discountApplicableType: "overAll",
                        id: fee.id,
                        discountAction: "normal",
                        discountCategory: "merchant",
                        maxValue: 0,
                    };
                    discountInfo.push(loyaltyDiscount);
                }
            });
        }
        return this.getIndonesiaOrderBill(itemInfo, discountInfo, restCharges, rest_round_off, country_code, taxAfterDiscount);
    }
}
exports.BillOfflineCalculationService = BillOfflineCalculationService;
//# sourceMappingURL=billOffline.service.js.map