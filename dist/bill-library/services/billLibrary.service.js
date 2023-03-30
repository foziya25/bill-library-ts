"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillLibraryService = void 0;
const country_enum_1 = require("../../enums/country.enum");
const i18n_1 = require("../../locale/i18n");
const number_format_1 = require("../../utils/number-format");
const cartItemInfo_1 = require("../baseClass/cartItemInfo");
const orderItemInfo_1 = require("../baseClass/orderItemInfo");
const common_function_lib_1 = require("../lib/common.function.lib");
class BillLibraryService {
    getCartBill(cartItemInfo, discountInfo, chargesInfo, rest_round_off = 0.05, country_code) {
        const response = {
            fees: [],
            bill_total: 0,
            message: 'Bill generated',
            status: 1,
        };
        const cartCalculationInfo = [];
        const itemTotalFeeObj = {
            name: 'Item Total',
            value: 0,
            id: 'item_total',
        };
        cartItemInfo.forEach((item) => {
            const cartCalculationObj = new cartItemInfo_1.CartCalculationInfo();
            cartCalculationObj.init(item);
            cartCalculationInfo.push(cartCalculationObj);
            itemTotalFeeObj.value += cartCalculationObj.effectivePrice;
        });
        itemTotalFeeObj.value = Number(itemTotalFeeObj.value.toFixed(2));
        response.fees.push(itemTotalFeeObj);
        let effectiveTotal = itemTotalFeeObj.value;
        const discountFeesArray = [];
        discountInfo.forEach((discount) => {
            const discountFee = {
                name: discount.name,
                value: Number(discount.discountValue.toFixed(2)),
                id: discount.id,
                discountCategory: discount.discountCategory,
                reason: discount.reason,
            };
            if (discount.discountCategory === "topUp") {
                effectiveTotal += discount.discountValue;
                if (effectiveTotal > 0) {
                    discount.itemDiscountInfo.forEach((itemDiscount) => {
                        const discountItem = cartCalculationInfo.find((item) => item.cartItemId === itemDiscount.cartItemId);
                        if (discountItem) {
                            discountItem.appliedDiscount += itemDiscount.itemDiscountValue;
                        }
                    });
                    discountFeesArray.push(discountFee);
                }
            }
        });
        discountInfo.forEach((discount) => {
            if (effectiveTotal > 0) {
                const discountFee = {
                    name: discount.name,
                    value: Number(discount.discountValue.toFixed(2)),
                    id: discount.id,
                    discountCategory: discount.discountCategory,
                    reason: discount.reason,
                };
                if (discount.discountCategory === "itemLevel") {
                    effectiveTotal += discount.discountValue;
                    discount.itemDiscountInfo.forEach((itemDiscount) => {
                        const discountItem = cartCalculationInfo.find((item) => item.cartItemId === itemDiscount.cartItemId);
                        if (discountItem) {
                            if (discountItem.effectivePrice + discountItem.appliedDiscount > 0) {
                                discountItem.appliedDiscount += itemDiscount.itemDiscountValue;
                            }
                        }
                    });
                    discountFeesArray.push(discountFee);
                }
            }
        });
        discountInfo.forEach((discount) => {
            if (effectiveTotal > 0) {
                const discountFee = {
                    name: discount.name,
                    value: Number(discount.discountValue.toFixed(2)),
                    id: discount.id,
                    discountCategory: discount.discountCategory,
                    reason: discount.reason,
                };
                if (discount.discountCategory !== "itemLevel" && discount.discountCategory !== "topUp" && discount.discountAction !== "freeDelivery") {
                    if (effectiveTotal >= -1 * discount.discountValue) {
                        effectiveTotal += discount.discountValue;
                        let tempTotal = 0;
                        discount.itemDiscountInfo.forEach((itemDiscount) => {
                            const discountItem = cartCalculationInfo.find((item) => item.cartItemId === itemDiscount.cartItemId);
                            if (discountItem) {
                                if (discountItem.effectivePrice + discountItem.appliedDiscount > 0) {
                                    tempTotal += discountItem.effectivePrice + discountItem.appliedDiscount;
                                }
                            }
                        });
                        discount.itemDiscountInfo.forEach((itemDiscount) => {
                            const discountItem = cartCalculationInfo.find((item) => item.cartItemId === itemDiscount.cartItemId);
                            if (discountItem) {
                                if (discountItem.effectivePrice + discountItem.appliedDiscount > 0) {
                                    const propDiscount = (discountItem.effectivePrice * discount.discountValue) / tempTotal;
                                    discountItem.appliedDiscount += propDiscount;
                                }
                            }
                        });
                        discountFeesArray.push(discountFee);
                    }
                    else {
                        let tempTotal = 0;
                        discount.itemDiscountInfo.forEach((itemDiscount) => {
                            const discountItem = cartCalculationInfo.find((item) => item.cartItemId === itemDiscount.cartItemId);
                            if (discountItem) {
                                if (discountItem.effectivePrice + discountItem.appliedDiscount > 0) {
                                    tempTotal += discountItem.effectivePrice + discountItem.appliedDiscount;
                                }
                            }
                        });
                        discount.itemDiscountInfo.forEach((itemDiscount) => {
                            const discountItem = cartCalculationInfo.find((item) => item.cartItemId === itemDiscount.cartItemId);
                            if (discountItem) {
                                if (discountItem.effectivePrice + discountItem.appliedDiscount > 0) {
                                    const propDiscount = (discountItem.effectivePrice * effectiveTotal) / tempTotal;
                                    discountItem.appliedDiscount -= propDiscount;
                                }
                            }
                        });
                        discount.discountValue = -1 * effectiveTotal;
                        effectiveTotal = 0;
                        discountFee.value = Number(discount.discountValue.toFixed(2));
                        discountFeesArray.push(discountFee);
                    }
                }
            }
        });
        let deliveryCharge = 0;
        const chargesList = [];
        chargesInfo.forEach((charge) => {
            const applicableResponse = this.findApplicableCartItemTotal(charge, cartCalculationInfo);
            if (applicableResponse.status) {
                const chargeResponse = this.calculateCartChargeAmount(charge, applicableResponse);
                if (chargeResponse.status) {
                    if (charge.class === 'DeliveryFee') {
                        deliveryCharge = 1;
                    }
                    chargesList.push(chargeResponse.chargeFee);
                }
            }
        });
        if (deliveryCharge) {
            const freeDeliveryDiscount = discountInfo.find((disc) => {
                if (disc.discountCategory === "coupon" && disc.discountAction === "freeDelivery") {
                    return true;
                }
            });
            if (freeDeliveryDiscount) {
                if (deliveryCharge < -1 * freeDeliveryDiscount.discountValue) {
                    freeDeliveryDiscount.discountValue = deliveryCharge * -1;
                }
                const discountFee = {
                    name: freeDeliveryDiscount.name,
                    value: Number(freeDeliveryDiscount.discountValue.toFixed(2)),
                    id: freeDeliveryDiscount.id,
                    discountCategory: freeDeliveryDiscount.discountCategory,
                    reason: 'delivery',
                };
                discountFeesArray.push(discountFee);
            }
        }
        response.fees.push(...this.mergeItemAndMerchantDiscount(discountFeesArray, country_code));
        response.fees.push(...chargesList);
        const sub_total = this.calculateBillTotal(response);
        const round_off_bill_total = (0, common_function_lib_1.getRoundOffValue)(sub_total, rest_round_off);
        const round_off_diff = round_off_bill_total - sub_total;
        if (round_off_diff && Number(round_off_diff.toFixed(2))) {
            response.fees.push({
                name: 'Round Off',
                value: Number(round_off_diff.toFixed(2)),
                id: 'round_off',
            });
            response.bill_total = this.calculateBillTotal(response);
        }
        else {
            response.bill_total = sub_total;
        }
        return response;
    }
    getOrderBill(orderItemInfo, discountInfo, chargesInfo, rest_round_off = 0.05, country_code = 'MY') {
        let response = {
            fees: [],
            bill_total: 0,
            message: 'Bill generated',
            status: 1,
        };
        const language = (0, country_enum_1.getCountryLanguage)(country_code);
        const orderCalculationInfo = [];
        const itemTotalFeeObj = {
            name: (0, i18n_1.localize)('itemTotal', language),
            value: 0,
            id: 'item_total',
        };
        orderItemInfo.forEach((item) => {
            const orderCalculationObj = new orderItemInfo_1.OrderCalculationInfo();
            orderCalculationObj.init(item);
            orderCalculationInfo.push(orderCalculationObj);
            itemTotalFeeObj.value += orderCalculationObj.effectivePrice;
        });
        itemTotalFeeObj.value = Number(itemTotalFeeObj.value.toFixed(2));
        response.fees.push(itemTotalFeeObj);
        let effectiveTotal = itemTotalFeeObj.value;
        const discountFeesArray = [];
        discountInfo.forEach((discount) => {
            const discountFee = {
                name: discount.name,
                value: Number(discount.discountValue.toFixed(2)),
                id: discount.id,
                discountCategory: discount.discountCategory,
                reason: discount.reason,
            };
            if (discount.discountCategory === "topUp") {
                effectiveTotal += discount.discountValue;
                if (effectiveTotal > 0) {
                    discount.itemDiscountInfo.forEach((itemDiscount) => {
                        const discountItem = orderCalculationInfo.find((item) => item.orderItemId === itemDiscount.orderItemId);
                        if (discountItem) {
                            discountItem.appliedDiscount += itemDiscount.itemDiscountValue;
                        }
                    });
                    discountFeesArray.push(discountFee);
                }
            }
        });
        discountInfo.forEach((discount) => {
            if (effectiveTotal > 0) {
                const discountFee = {
                    name: discount.name,
                    value: Number(discount.discountValue.toFixed(2)),
                    id: discount.id,
                    discountCategory: discount.discountCategory,
                    reason: discount.reason,
                };
                if (discount.discountCategory === "itemLevel") {
                    effectiveTotal += discount.discountValue;
                    discount.itemDiscountInfo.forEach((itemDiscount) => {
                        const discountItem = orderCalculationInfo.find((item) => item.orderItemId === itemDiscount.orderItemId);
                        if (discountItem) {
                            if (discountItem.effectivePrice + itemDiscount.itemDiscountValue >= 0) {
                                discountItem.appliedDiscount += itemDiscount.itemDiscountValue;
                            }
                        }
                    });
                    discountFeesArray.push(discountFee);
                }
            }
        });
        discountInfo.forEach((discount) => {
            if (effectiveTotal > 0) {
                const discountFee = {
                    name: discount.name,
                    value: Number(discount.discountValue.toFixed(2)),
                    id: discount.id,
                    discountCategory: discount.discountCategory,
                    reason: discount.reason,
                };
                if (discount.discountCategory !== "itemLevel" && discount.discountCategory !== "topUp" && discount.discountAction !== "freeDelivery") {
                    if (effectiveTotal >= -1 * discount.discountValue) {
                        effectiveTotal += discount.discountValue;
                        let tempTotal = 0;
                        discount.itemDiscountInfo.forEach((itemDiscount) => {
                            const discountItem = orderCalculationInfo.find((item) => item.orderItemId === itemDiscount.orderItemId);
                            if (discountItem) {
                                if (discountItem.effectivePrice + itemDiscount.itemDiscountValue >= 0) {
                                    tempTotal += discountItem.effectivePrice + discountItem.appliedDiscount;
                                }
                            }
                        });
                        discount.itemDiscountInfo.forEach((itemDiscount) => {
                            const discountItem = orderCalculationInfo.find((item) => item.orderItemId === itemDiscount.orderItemId);
                            if (discountItem) {
                                if (discountItem.effectivePrice + itemDiscount.itemDiscountValue >= 0) {
                                    const propDiscount = ((discountItem.effectivePrice + discountItem.appliedDiscount) * discount.discountValue) / tempTotal;
                                    discountItem.appliedDiscount += propDiscount;
                                }
                            }
                        });
                        discountFeesArray.push(discountFee);
                    }
                    else {
                        let tempTotal = 0;
                        discount.itemDiscountInfo.forEach((itemDiscount) => {
                            const discountItem = orderCalculationInfo.find((item) => item.orderItemId === itemDiscount.orderItemId);
                            if (discountItem) {
                                if (discountItem.effectivePrice + discountItem.appliedDiscount > 0) {
                                    tempTotal += discountItem.effectivePrice + discountItem.appliedDiscount;
                                }
                            }
                        });
                        discount.itemDiscountInfo.forEach((itemDiscount) => {
                            const discountItem = orderCalculationInfo.find((item) => item.orderItemId === itemDiscount.orderItemId);
                            if (discountItem) {
                                if (discountItem.effectivePrice + discountItem.appliedDiscount > 0) {
                                    const propDiscount = ((discountItem.effectivePrice + discountItem.appliedDiscount) * effectiveTotal) / tempTotal;
                                    discountItem.appliedDiscount -= propDiscount;
                                }
                            }
                        });
                        discount.discountValue = -1 * effectiveTotal;
                        effectiveTotal = 0;
                        discountFee.value = Number(discount.discountValue.toFixed(2));
                        discountFeesArray.push(discountFee);
                    }
                }
            }
        });
        let deliveryCharge = 0;
        const chargesList = [];
        chargesInfo.forEach((charge) => {
            const applicableResponse = this.findApplicableOrderItemTotal(charge, orderCalculationInfo, discountInfo);
            if (applicableResponse.status) {
                const chargeResponse = this.calculateOrderChargeAmount(charge, applicableResponse);
                if (chargeResponse.status) {
                    if (charge.class === 'DeliveryFee') {
                        deliveryCharge = charge.chargeValue;
                    }
                    if (chargeResponse.chargeFee.value > 0) {
                        chargesList.push(chargeResponse.chargeFee);
                    }
                }
            }
        });
        if (deliveryCharge) {
            const freeDeliveryDiscount = discountInfo.find((disc) => {
                if (disc.discountCategory === "coupon" && disc.discountAction === "freeDelivery") {
                    return true;
                }
            });
            if (freeDeliveryDiscount) {
                if (deliveryCharge < -1 * freeDeliveryDiscount.discountValue) {
                    freeDeliveryDiscount.discountValue = deliveryCharge * -1;
                }
                const discountFee = {
                    name: freeDeliveryDiscount.name,
                    value: Number(freeDeliveryDiscount.discountValue.toFixed(2)),
                    id: freeDeliveryDiscount.id,
                    discountCategory: freeDeliveryDiscount.discountCategory,
                    reason: 'delivery',
                };
                discountFeesArray.push(discountFee);
            }
        }
        response.fees.push(...this.mergeItemAndMerchantDiscount(discountFeesArray, country_code));
        response.fees.push(...chargesList);
        const sub_total = this.calculateBillTotal(response);
        const round_off_bill_total = (0, common_function_lib_1.getRoundOffValue)(sub_total, rest_round_off);
        const round_off_diff = round_off_bill_total - sub_total;
        if (round_off_diff && Number(round_off_diff.toFixed(2))) {
            response.fees.push({
                name: (0, i18n_1.localize)('roundOff', language),
                value: Number(round_off_diff.toFixed(2)),
                id: 'round_off',
            });
            response.bill_total = this.calculateBillTotal(response);
        }
        else {
            response.bill_total = sub_total;
        }
        const quantity_keys_to_format = ['value', 'bill_total'];
        response = (0, number_format_1.getLocalizedData)(response, '', country_code, [], quantity_keys_to_format);
        return response;
    }
    getIndonesiaOrderBill(orderItemInfo, discountInfo, chargesInfo, rest_round_off = 0.05, country_code = 'ID', taxAfterDiscount) {
        let response = {
            fees: [],
            bill_total: 0,
            message: 'Bill generated',
            status: 1,
        };
        const language = (0, country_enum_1.getCountryLanguage)(country_code);
        const orderCalculationInfo = [];
        const itemTotalFeeObj = {
            name: (0, i18n_1.localize)('itemTotal', language),
            value: 0,
            id: 'item_total',
        };
        orderItemInfo.forEach((item) => {
            const orderCalculationObj = new orderItemInfo_1.OrderCalculationInfo();
            orderCalculationObj.init(item);
            orderCalculationInfo.push(orderCalculationObj);
            itemTotalFeeObj.value += orderCalculationObj.effectivePrice;
        });
        itemTotalFeeObj.value = Number(itemTotalFeeObj.value.toFixed(2));
        response.fees.push(itemTotalFeeObj);
        let effectiveTotal = itemTotalFeeObj.value;
        const discountFeesArray = [];
        discountInfo.forEach((discount) => {
            const discountFee = {
                name: discount.name,
                value: Number(discount.discountValue.toFixed(2)),
                id: discount.id,
                discountCategory: discount.discountCategory,
                reason: discount.reason,
            };
            if (discount.discountCategory === "topUp") {
                effectiveTotal += discount.discountValue;
                if (effectiveTotal > 0) {
                    discount.itemDiscountInfo.forEach((itemDiscount) => {
                        const discountItem = orderCalculationInfo.find((item) => item.orderItemId === itemDiscount.orderItemId);
                        if (discountItem) {
                            discountItem.appliedDiscount += itemDiscount.itemDiscountValue;
                        }
                    });
                    discountFeesArray.push(discountFee);
                }
            }
        });
        discountInfo.forEach((discount) => {
            if (effectiveTotal > 0) {
                const discountFee = {
                    name: discount.name,
                    value: Number(discount.discountValue.toFixed(2)),
                    id: discount.id,
                    discountCategory: discount.discountCategory,
                    reason: discount.reason,
                };
                if (discount.discountCategory === "itemLevel") {
                    effectiveTotal += discount.discountValue;
                    discount.itemDiscountInfo.forEach((itemDiscount) => {
                        const discountItem = orderCalculationInfo.find((item) => item.orderItemId === itemDiscount.orderItemId);
                        if (discountItem) {
                            if (discountItem.effectivePrice + itemDiscount.itemDiscountValue >= 0) {
                                discountItem.appliedDiscount += itemDiscount.itemDiscountValue;
                            }
                        }
                    });
                    discountFeesArray.push(discountFee);
                }
            }
        });
        discountInfo.forEach((discount) => {
            if (effectiveTotal > 0) {
                const discountFee = {
                    name: discount.name,
                    value: Number(discount.discountValue.toFixed(2)),
                    id: discount.id,
                    discountCategory: discount.discountCategory,
                    reason: discount.reason,
                };
                if (discount.discountCategory !== "itemLevel" && discount.discountCategory !== "topUp" && discount.discountAction !== "freeDelivery") {
                    if (effectiveTotal >= -1 * discount.discountValue) {
                        effectiveTotal += discount.discountValue;
                        let tempTotal = 0;
                        discount.itemDiscountInfo.forEach((itemDiscount) => {
                            const discountItem = orderCalculationInfo.find((item) => item.orderItemId === itemDiscount.orderItemId);
                            if (discountItem) {
                                if (discountItem.effectivePrice + itemDiscount.itemDiscountValue >= 0) {
                                    tempTotal += discountItem.effectivePrice + discountItem.appliedDiscount;
                                }
                            }
                        });
                        discount.itemDiscountInfo.forEach((itemDiscount) => {
                            const discountItem = orderCalculationInfo.find((item) => item.orderItemId === itemDiscount.orderItemId);
                            if (discountItem) {
                                if (discountItem.effectivePrice + itemDiscount.itemDiscountValue >= 0) {
                                    const propDiscount = ((discountItem.effectivePrice + discountItem.appliedDiscount) * discount.discountValue) / tempTotal;
                                    discountItem.appliedDiscount += propDiscount;
                                }
                            }
                        });
                        discountFeesArray.push(discountFee);
                    }
                    else {
                        let tempTotal = 0;
                        discount.itemDiscountInfo.forEach((itemDiscount) => {
                            const discountItem = orderCalculationInfo.find((item) => item.orderItemId === itemDiscount.orderItemId);
                            if (discountItem) {
                                if (discountItem.effectivePrice + discountItem.appliedDiscount > 0) {
                                    tempTotal += discountItem.effectivePrice + discountItem.appliedDiscount;
                                }
                            }
                        });
                        discount.itemDiscountInfo.forEach((itemDiscount) => {
                            const discountItem = orderCalculationInfo.find((item) => item.orderItemId === itemDiscount.orderItemId);
                            if (discountItem) {
                                if (discountItem.effectivePrice + discountItem.appliedDiscount > 0) {
                                    const propDiscount = ((discountItem.effectivePrice + discountItem.appliedDiscount) * effectiveTotal) / tempTotal;
                                    discountItem.appliedDiscount -= propDiscount;
                                }
                            }
                        });
                        discount.discountValue = -1 * effectiveTotal;
                        effectiveTotal = 0;
                        discountFee.value = Number(discount.discountValue.toFixed(2));
                        discountFeesArray.push(discountFee);
                    }
                }
            }
        });
        let deliveryCharge = 0;
        const chargesList = [];
        let serviceCharge = null;
        for (const i in chargesInfo) {
            const charge = chargesInfo[i];
            if (charge.id === 'service_tax') {
                const applicableResponse = this.findIndonesiaApplicableOrderItemTotal(charge, orderCalculationInfo, discountInfo, taxAfterDiscount);
                if (applicableResponse.status) {
                    const chargeResponse = this.calculateOrderChargeAmount(charge, applicableResponse);
                    if (chargeResponse.status) {
                        if (chargeResponse.chargeFee.value > 0) {
                            serviceCharge = chargeResponse.chargeFee;
                            chargesList.push(chargeResponse.chargeFee);
                        }
                    }
                }
                break;
            }
        }
        chargesInfo.forEach((charge) => {
            if (charge.id !== 'service_tax') {
                const applicableResponse = this.findIndonesiaApplicableOrderItemTotal(charge, orderCalculationInfo, discountInfo, taxAfterDiscount);
                if (charge.id === 'sst_tax' && serviceCharge) {
                    applicableResponse.itemTotalWithDiscount += serviceCharge.value;
                }
                if (applicableResponse.status) {
                    const chargeResponse = this.calculateOrderChargeAmount(charge, applicableResponse);
                    if (chargeResponse.status) {
                        if (charge.class === 'DeliveryFee') {
                            deliveryCharge = charge.chargeValue;
                        }
                        if (chargeResponse.chargeFee.value > 0) {
                            chargesList.push(chargeResponse.chargeFee);
                        }
                    }
                }
            }
        });
        if (deliveryCharge) {
            const freeDeliveryDiscount = discountInfo.find((disc) => {
                if (disc.discountCategory === "coupon" && disc.discountAction === "freeDelivery") {
                    return true;
                }
            });
            if (freeDeliveryDiscount) {
                if (deliveryCharge < -1 * freeDeliveryDiscount.discountValue) {
                    freeDeliveryDiscount.discountValue = deliveryCharge * -1;
                }
                const discountFee = {
                    name: freeDeliveryDiscount.name,
                    value: Number(freeDeliveryDiscount.discountValue.toFixed(2)),
                    id: freeDeliveryDiscount.id,
                    discountCategory: freeDeliveryDiscount.discountCategory,
                    reason: 'delivery',
                };
                discountFeesArray.push(discountFee);
            }
        }
        response.fees.push(...this.mergeItemAndMerchantDiscount(discountFeesArray, country_code));
        response.fees.push(...chargesList);
        const sub_total = this.calculateBillTotal(response);
        const round_off_bill_total = (0, common_function_lib_1.getRoundOffValue)(sub_total, rest_round_off);
        const round_off_diff = round_off_bill_total - sub_total;
        if (round_off_diff && Number(round_off_diff.toFixed(2))) {
            response.fees.push({
                name: (0, i18n_1.localize)('roundOff', language),
                value: Number(round_off_diff.toFixed(2)),
                id: 'round_off',
            });
            response.bill_total = this.calculateBillTotal(response);
        }
        else {
            response.bill_total = sub_total;
        }
        const quantity_keys_to_format = ['value', 'bill_total'];
        response = (0, number_format_1.getLocalizedData)(response, '', country_code, [], quantity_keys_to_format);
        return response;
    }
    calculateCartChargeAmount(charge, applicableResponse) {
        const response = {
            status: 0,
            chargeFee: null,
        };
        const chargeFee = {
            name: charge.name,
            value: 0,
            id: charge.id,
        };
        const { chargeType, chargeValue } = charge;
        const { itemTotalWithDiscount } = applicableResponse;
        switch (chargeType) {
            case "fixed":
                chargeFee.value = Number(chargeValue.toFixed(2));
                response.status = 1;
                break;
            case "percentage":
                chargeFee.value = Number(((itemTotalWithDiscount * chargeValue) / 100).toFixed(2));
                response.status = 1;
                break;
            default:
                response.status = 0;
                break;
        }
        response.chargeFee = chargeFee;
        return response;
    }
    calculateOrderChargeAmount(charge, applicableResponse) {
        const response = {
            status: 0,
            chargeFee: null,
        };
        const chargeFee = {
            name: charge.name,
            value: 0,
            id: charge.id,
        };
        const { chargeType, chargeValue } = charge;
        const { itemTotalWithDiscount } = applicableResponse;
        switch (chargeType) {
            case "fixed":
                chargeFee.value = chargeValue;
                response.status = 1;
                break;
            case "percentage":
                chargeFee.value = (itemTotalWithDiscount * chargeValue) / 100;
                response.status = 1;
                break;
            default:
                response.status = 0;
                break;
        }
        chargeFee.value = Number(chargeFee.value.toFixed(2));
        response.chargeFee = chargeFee;
        return response;
    }
    findApplicableCartItemTotal(charge, cartItemInfo) {
        const response = {
            itemTotalWithDiscount: 0,
            cartItemList: [],
            status: 0,
        };
        const { chargeApplicableType, applicableOn, class: className } = charge;
        switch (chargeApplicableType) {
            case "item":
                cartItemInfo.forEach((item) => {
                    const itemId = applicableOn.find((itemId) => itemId === item.itemId);
                    if (itemId) {
                        const effectivePrice = item.effectivePrice + item.appliedDiscount;
                        if (effectivePrice > 0) {
                            response.itemTotalWithDiscount += effectivePrice;
                            response.cartItemList.push(item.cartItemId);
                        }
                    }
                });
                break;
            case "subCategory":
                cartItemInfo.forEach((item) => {
                    const subCatId = applicableOn.find((subCatId) => subCatId === item.subcategoryId);
                    if (subCatId) {
                        const effectivePrice = item.effectivePrice + item.appliedDiscount;
                        if (effectivePrice > 0) {
                            response.itemTotalWithDiscount += effectivePrice;
                            response.cartItemList.push(item.cartItemId);
                        }
                    }
                });
                break;
            case "overAll":
                cartItemInfo.forEach((item) => {
                    if (className === 'DeliveryCharge') {
                        response.itemTotalWithDiscount += item.effectivePrice;
                        response.cartItemList.push(item.cartItemId);
                    }
                    else {
                        const effectivePrice = item.effectivePrice + item.appliedDiscount;
                        if (effectivePrice > 0) {
                            response.itemTotalWithDiscount += effectivePrice;
                            response.cartItemList.push(item.cartItemId);
                        }
                    }
                });
                break;
            default:
                response.itemTotalWithDiscount = 0;
        }
        if (response.itemTotalWithDiscount > 0) {
            response.status = 1;
        }
        return response;
    }
    findApplicableOrderItemTotal(charge, orderItemInfo, discountInfo) {
        const response = {
            itemTotalWithDiscount: 0,
            orderItemList: [],
            status: 0,
        };
        let totalDiscount = 0;
        discountInfo.forEach((disc) => {
            totalDiscount += disc.discountValue;
        });
        const { chargeApplicableType, applicableOn, class: className } = charge;
        switch (chargeApplicableType) {
            case "item":
                orderItemInfo.forEach((item) => {
                    const itemId = applicableOn.find((itemId) => itemId === item.itemId);
                    if (itemId) {
                        const effectivePrice = item.effectivePrice;
                        if (effectivePrice > 0) {
                            response.itemTotalWithDiscount += effectivePrice;
                            response.orderItemList.push(item.orderItemId);
                        }
                    }
                });
                if (response.itemTotalWithDiscount + totalDiscount > 0) {
                    response.itemTotalWithDiscount += totalDiscount;
                }
                else {
                    response.itemTotalWithDiscount = 0;
                }
                break;
            case "subCategory":
                orderItemInfo.forEach((item) => {
                    const subCatId = applicableOn.find((subCatId) => subCatId === item.subcategoryId);
                    if (subCatId) {
                        const effectivePrice = item.effectivePrice;
                        if (effectivePrice > 0) {
                            response.itemTotalWithDiscount += effectivePrice;
                            response.orderItemList.push(item.orderItemId);
                        }
                    }
                });
                if (response.itemTotalWithDiscount + totalDiscount > 0) {
                    response.itemTotalWithDiscount += totalDiscount;
                }
                else {
                    response.itemTotalWithDiscount = 0;
                }
                break;
            case "overAll":
                orderItemInfo.forEach((item) => {
                    if (className === 'DeliveryCharge') {
                        response.itemTotalWithDiscount += item.effectivePrice;
                        response.orderItemList.push(item.orderItemId);
                    }
                    else {
                        const effectivePrice = item.effectivePrice;
                        if (effectivePrice > 0) {
                            response.itemTotalWithDiscount += effectivePrice;
                            response.orderItemList.push(item.orderItemId);
                        }
                    }
                });
                if (response.itemTotalWithDiscount + totalDiscount > 0) {
                    response.itemTotalWithDiscount += totalDiscount;
                }
                else {
                    response.itemTotalWithDiscount = 0;
                }
                break;
            default:
                response.itemTotalWithDiscount = 0;
        }
        if (response.itemTotalWithDiscount > 0) {
            response.status = 1;
        }
        return response;
    }
    findIndonesiaApplicableOrderItemTotal(charge, orderItemInfo, discountInfo, taxAfterDiscount) {
        const response = {
            itemTotalWithDiscount: 0,
            orderItemList: [],
            status: 0,
        };
        let totalDiscount = 0;
        if (taxAfterDiscount) {
            discountInfo.forEach((disc) => {
                totalDiscount += disc.discountValue;
            });
        }
        const { chargeApplicableType, applicableOn, class: className } = charge;
        switch (chargeApplicableType) {
            case "item":
                orderItemInfo.forEach((item) => {
                    const itemId = applicableOn.find((itemId) => itemId === item.itemId);
                    if (itemId) {
                        const effectivePrice = item.effectivePrice;
                        if (effectivePrice > 0) {
                            response.itemTotalWithDiscount += effectivePrice;
                            response.orderItemList.push(item.orderItemId);
                        }
                    }
                });
                if (response.itemTotalWithDiscount + totalDiscount > 0) {
                    response.itemTotalWithDiscount += totalDiscount;
                }
                else {
                    response.itemTotalWithDiscount = 0;
                }
                break;
            case "subCategory":
                orderItemInfo.forEach((item) => {
                    const subCatId = applicableOn.find((subCatId) => subCatId === item.subcategoryId);
                    if (subCatId) {
                        const effectivePrice = item.effectivePrice;
                        if (effectivePrice > 0) {
                            response.itemTotalWithDiscount += effectivePrice;
                            response.orderItemList.push(item.orderItemId);
                        }
                    }
                });
                if (response.itemTotalWithDiscount + totalDiscount > 0) {
                    response.itemTotalWithDiscount += totalDiscount;
                }
                else {
                    response.itemTotalWithDiscount = 0;
                }
                break;
            case "overAll":
                orderItemInfo.forEach((item) => {
                    if (className === 'DeliveryCharge') {
                        response.itemTotalWithDiscount += item.effectivePrice;
                        response.orderItemList.push(item.orderItemId);
                    }
                    else {
                        const effectivePrice = item.effectivePrice;
                        if (effectivePrice > 0) {
                            response.itemTotalWithDiscount += effectivePrice;
                            response.orderItemList.push(item.orderItemId);
                        }
                    }
                });
                if (response.itemTotalWithDiscount + totalDiscount > 0) {
                    response.itemTotalWithDiscount += totalDiscount;
                }
                else {
                    response.itemTotalWithDiscount = 0;
                }
                break;
            default:
                response.itemTotalWithDiscount = 0;
        }
        if (response.itemTotalWithDiscount > 0) {
            response.status = 1;
        }
        return response;
    }
    calculateBillTotal(billInfo) {
        let total = 0;
        billInfo.fees.forEach((fee) => {
            total += fee.value;
        });
        return total;
    }
    mergeItemAndMerchantDiscount(discountFeesArray, country_code) {
        const response = [];
        const language = (0, country_enum_1.getCountryLanguage)(country_code);
        const itemLevel = {
            status: 0,
            value: 0,
            name: (0, i18n_1.localize)('itemLevel', language),
            reason: '',
        };
        let itemLevelCount = 0;
        let isTopUp = 0;
        discountFeesArray.forEach((discount) => {
            if (discount.discountCategory === "itemLevel") {
                itemLevel.value += discount.value;
                itemLevel.status = 1;
                itemLevelCount++;
                if (itemLevelCount == 1) {
                    itemLevel.reason = discount.reason;
                }
                else {
                    itemLevel.reason = (0, i18n_1.localize)('itemLevel', language);
                }
            }
        });
        const discountItemMerchant = {
            name: '',
            value: 0,
            id: 'coupon_discount',
            reason: '',
        };
        let flag = 0;
        if (itemLevel.status) {
            discountItemMerchant.value = itemLevel.value;
            discountItemMerchant.name = '(' + '"' + itemLevel.reason + '"';
            flag = 1;
            discountItemMerchant.reason = itemLevel.reason;
        }
        discountFeesArray.forEach((discount) => {
            if (discount.discountCategory === "merchant") {
                if (discount.reason) {
                    discount.name = '"' + discount.reason + '"';
                }
                else {
                    discount.name = '"' + (0, i18n_1.localize)('byRestaurant', language) + '"';
                    discount.reason = (0, i18n_1.localize)('byRestaurant', language);
                }
                discountItemMerchant.value += discount.value;
                if (flag) {
                    discountItemMerchant.name = discountItemMerchant.name + ',' + discount.name;
                    discountItemMerchant.reason = discount.reason + ',' + discountItemMerchant.reason;
                }
                else {
                    discountItemMerchant.name = '(' + discount.name;
                    flag = 1;
                    discountItemMerchant.reason = discount.reason;
                }
            }
            else if (discount.discountCategory === "topUp") {
                isTopUp = 1;
                if (discount.reason) {
                    discount.name = '"' + discount.reason + '"';
                }
                else {
                    discount.name = '"' + (0, i18n_1.localize)('byRestaurant', language) + '"';
                    discount.reason = (0, i18n_1.localize)('byRestaurant', language);
                }
                discountItemMerchant.value += discount.value;
                if (flag) {
                    discountItemMerchant.name = discountItemMerchant.name + ',' + discount.name;
                    discountItemMerchant.reason = discount.reason + ',' + discountItemMerchant.reason;
                }
                else {
                    discountItemMerchant.name = '(' + discount.name;
                    flag = 1;
                    discountItemMerchant.reason = discount.reason;
                }
            }
            else if (discount.discountCategory != "itemLevel") {
                delete discount.discountCategory;
                if (discount.value != 0) {
                    response.push(discount);
                }
            }
        });
        if (flag) {
            if (isTopUp) {
                discountItemMerchant.name = 'TopUp' + discountItemMerchant.name + ')';
            }
            else {
                discountItemMerchant.name = 'Discount' + discountItemMerchant.name + ')';
            }
            if (discountItemMerchant.value != 0) {
                response.push(discountItemMerchant);
            }
        }
        return response;
    }
}
exports.BillLibraryService = BillLibraryService;
//# sourceMappingURL=billLibrary.service.js.map