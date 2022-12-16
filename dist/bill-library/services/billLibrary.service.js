"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillLibraryService = void 0;
const cartItemInfo_1 = require("../baseClass/cartItemInfo");
const orderItemInfo_1 = require("../baseClass/orderItemInfo");
const common_function_lib_1 = require("../lib/common.function.lib");
class BillLibraryService {
    getCartBill(cartItemInfo, discountInfo, chargesInfo, rest_round_off = 0.05) {
        const response = {
            fees: [],
            bill_total: 0,
            message: "Bill generated",
            status: 1,
            bill_total_text: "0",
        };
        const cartCalculationInfo = [];
        const itemTotalFeeObj = {
            name: "Item Total",
            value: 0,
            value_text: "0",
            id: "item_total",
        };
        cartItemInfo.forEach((item) => {
            const cartCalculationObj = new cartItemInfo_1.CartCalculationInfo();
            cartCalculationObj.init(item);
            cartCalculationInfo.push(cartCalculationObj);
            itemTotalFeeObj.value += cartCalculationObj.effectivePrice;
        });
        itemTotalFeeObj.value = Number(itemTotalFeeObj.value.toFixed(2));
        itemTotalFeeObj.value_text = itemTotalFeeObj.value.toFixed(2);
        response.fees.push(itemTotalFeeObj);
        let effectiveTotal = itemTotalFeeObj.value;
        const discountFeesArray = [];
        discountInfo.forEach((discount) => {
            const discountFee = {
                name: discount.name,
                value: Number(discount.discountValue.toFixed(2)),
                value_text: discount.discountValue.toFixed(2),
                id: discount.id,
                discountCategory: discount.discountCategory,
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
                    value_text: discount.discountValue.toFixed(2),
                    id: discount.id,
                    discountCategory: discount.discountCategory,
                };
                if (discount.discountCategory === "itemLevel") {
                    effectiveTotal += discount.discountValue;
                    discount.itemDiscountInfo.forEach((itemDiscount) => {
                        const discountItem = cartCalculationInfo.find((item) => item.cartItemId === itemDiscount.cartItemId);
                        if (discountItem) {
                            if (discountItem.effectivePrice + discountItem.appliedDiscount >
                                0) {
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
                    value_text: discount.discountValue.toFixed(2),
                    id: discount.id,
                    discountCategory: discount.discountCategory,
                };
                if (discount.discountCategory !== "itemLevel" &&
                    discount.discountCategory !== "topUp" &&
                    discount.discountAction !== "freeDelivery") {
                    if (effectiveTotal >= -1 * discount.discountValue) {
                        effectiveTotal += discount.discountValue;
                        let tempTotal = 0;
                        discount.itemDiscountInfo.forEach((itemDiscount) => {
                            const discountItem = cartCalculationInfo.find((item) => item.cartItemId === itemDiscount.cartItemId);
                            if (discountItem) {
                                if (discountItem.effectivePrice + discountItem.appliedDiscount >
                                    0) {
                                    tempTotal +=
                                        discountItem.effectivePrice + discountItem.appliedDiscount;
                                }
                            }
                        });
                        discount.itemDiscountInfo.forEach((itemDiscount) => {
                            const discountItem = cartCalculationInfo.find((item) => item.cartItemId === itemDiscount.cartItemId);
                            if (discountItem) {
                                if (discountItem.effectivePrice + discountItem.appliedDiscount >
                                    0) {
                                    const propDiscount = (discountItem.effectivePrice * discount.discountValue) /
                                        tempTotal;
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
                                if (discountItem.effectivePrice + discountItem.appliedDiscount >
                                    0) {
                                    tempTotal +=
                                        discountItem.effectivePrice + discountItem.appliedDiscount;
                                }
                            }
                        });
                        discount.itemDiscountInfo.forEach((itemDiscount) => {
                            const discountItem = cartCalculationInfo.find((item) => item.cartItemId === itemDiscount.cartItemId);
                            if (discountItem) {
                                if (discountItem.effectivePrice + discountItem.appliedDiscount >
                                    0) {
                                    const propDiscount = (discountItem.effectivePrice * effectiveTotal) / tempTotal;
                                    discountItem.appliedDiscount -= propDiscount;
                                }
                            }
                        });
                        discount.discountValue = -1 * effectiveTotal;
                        effectiveTotal = 0;
                        discountFee.value = Number(discount.discountValue.toFixed(2));
                        discountFee.value_text = discountFee.value.toFixed(2);
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
                    if (charge.class === "DeliveryFee") {
                        deliveryCharge = 1;
                    }
                    chargesList.push(chargeResponse.chargeFee);
                }
            }
        });
        if (deliveryCharge) {
            const freeDeliveryDiscount = discountInfo.find((disc) => {
                if (disc.discountCategory === "coupon" &&
                    disc.discountAction === "freeDelivery") {
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
                    value_text: freeDeliveryDiscount.discountValue.toFixed(2),
                    id: freeDeliveryDiscount.id,
                    discountCategory: freeDeliveryDiscount.discountCategory,
                };
                discountFeesArray.push(discountFee);
            }
        }
        response.fees.push(...this.mergeItemAndMerchantDiscount(discountFeesArray));
        response.fees.push(...chargesList);
        const sub_total = this.calculateBillTotal(response);
        const round_off_bill_total = (0, common_function_lib_1.getRoundOffValue)(sub_total, rest_round_off);
        const round_off_diff = round_off_bill_total - sub_total;
        if (round_off_diff && Number(round_off_diff.toFixed(2))) {
            response.fees.push({
                name: "Round Off",
                value: Number(round_off_diff.toFixed(2)),
                value_text: Number(round_off_diff).toFixed(2),
                id: "round_off",
            });
            response.bill_total = this.calculateBillTotal(response);
        }
        else {
            response.bill_total = sub_total;
        }
        response.bill_total_text = response.bill_total.toFixed(2);
        return response;
    }
    getOrderBill(orderItemInfo, discountInfo, chargesInfo, rest_round_off = 0.05) {
        const response = {
            fees: [],
            bill_total: 0,
            message: "Bill generated",
            status: 1,
            bill_total_text: "0",
        };
        const orderCalculationInfo = [];
        const itemTotalFeeObj = {
            name: "Item Total",
            value: 0,
            value_text: "0",
            id: "item_total",
        };
        orderItemInfo.forEach((item) => {
            const orderCalculationObj = new orderItemInfo_1.OrderCalculationInfo();
            orderCalculationObj.init(item);
            orderCalculationInfo.push(orderCalculationObj);
            itemTotalFeeObj.value += orderCalculationObj.effectivePrice;
        });
        itemTotalFeeObj.value = Number(itemTotalFeeObj.value.toFixed(2));
        itemTotalFeeObj.value_text = itemTotalFeeObj.value.toFixed(2);
        response.fees.push(itemTotalFeeObj);
        let effectiveTotal = itemTotalFeeObj.value;
        const discountFeesArray = [];
        discountInfo.forEach((discount) => {
            const discountFee = {
                name: discount.name,
                value: Number(discount.discountValue.toFixed(2)),
                value_text: discount.discountValue.toFixed(2),
                id: discount.id,
                discountCategory: discount.discountCategory,
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
                    value_text: discount.discountValue.toFixed(2),
                    id: discount.id,
                    discountCategory: discount.discountCategory,
                };
                if (discount.discountCategory === "itemLevel") {
                    effectiveTotal += discount.discountValue;
                    discount.itemDiscountInfo.forEach((itemDiscount) => {
                        const discountItem = orderCalculationInfo.find((item) => item.orderItemId === itemDiscount.orderItemId);
                        if (discountItem) {
                            if (discountItem.effectivePrice + itemDiscount.itemDiscountValue >=
                                0) {
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
                    value_text: discount.discountValue.toFixed(2),
                    id: discount.id,
                    discountCategory: discount.discountCategory,
                };
                if (discount.discountCategory !== "itemLevel" &&
                    discount.discountCategory !== "topUp" &&
                    discount.discountAction !== "freeDelivery") {
                    if (effectiveTotal >= -1 * discount.discountValue) {
                        effectiveTotal += discount.discountValue;
                        let tempTotal = 0;
                        discount.itemDiscountInfo.forEach((itemDiscount) => {
                            const discountItem = orderCalculationInfo.find((item) => item.orderItemId === itemDiscount.orderItemId);
                            if (discountItem) {
                                if (discountItem.effectivePrice +
                                    itemDiscount.itemDiscountValue >=
                                    0) {
                                    tempTotal +=
                                        discountItem.effectivePrice + discountItem.appliedDiscount;
                                }
                            }
                        });
                        discount.itemDiscountInfo.forEach((itemDiscount) => {
                            const discountItem = orderCalculationInfo.find((item) => item.orderItemId === itemDiscount.orderItemId);
                            if (discountItem) {
                                if (discountItem.effectivePrice +
                                    itemDiscount.itemDiscountValue >=
                                    0) {
                                    const propDiscount = ((discountItem.effectivePrice +
                                        discountItem.appliedDiscount) *
                                        discount.discountValue) /
                                        tempTotal;
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
                                if (discountItem.effectivePrice + discountItem.appliedDiscount >
                                    0) {
                                    tempTotal +=
                                        discountItem.effectivePrice + discountItem.appliedDiscount;
                                }
                            }
                        });
                        discount.itemDiscountInfo.forEach((itemDiscount) => {
                            const discountItem = orderCalculationInfo.find((item) => item.orderItemId === itemDiscount.orderItemId);
                            if (discountItem) {
                                if (discountItem.effectivePrice + discountItem.appliedDiscount >
                                    0) {
                                    const propDiscount = ((discountItem.effectivePrice +
                                        discountItem.appliedDiscount) *
                                        effectiveTotal) /
                                        tempTotal;
                                    discountItem.appliedDiscount -= propDiscount;
                                }
                            }
                        });
                        discount.discountValue = -1 * effectiveTotal;
                        effectiveTotal = 0;
                        discountFee.value = Number(discount.discountValue.toFixed(2));
                        discountFee.value_text = discountFee.value.toFixed(2);
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
                    if (charge.class === "DeliveryFee") {
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
                if (disc.discountCategory === "coupon" &&
                    disc.discountAction === "freeDelivery") {
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
                    value_text: freeDeliveryDiscount.discountValue.toFixed(2),
                    id: freeDeliveryDiscount.id,
                    discountCategory: freeDeliveryDiscount.discountCategory,
                };
                discountFeesArray.push(discountFee);
            }
        }
        response.fees.push(...this.mergeItemAndMerchantDiscount(discountFeesArray));
        response.fees.push(...chargesList);
        const sub_total = this.calculateBillTotal(response);
        const round_off_bill_total = (0, common_function_lib_1.getRoundOffValue)(sub_total, rest_round_off);
        const round_off_diff = round_off_bill_total - sub_total;
        if (round_off_diff && Number(round_off_diff.toFixed(2))) {
            response.fees.push({
                name: "Round Off",
                value: Number(round_off_diff.toFixed(2)),
                value_text: Number(round_off_diff).toFixed(2),
                id: "round_off",
            });
            response.bill_total = this.calculateBillTotal(response);
        }
        else {
            response.bill_total = sub_total;
        }
        response.bill_total_text = response.bill_total.toFixed(2);
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
            value_text: "",
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
        chargeFee.value_text = chargeFee.value.toFixed(2);
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
            value_text: "",
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
        chargeFee.value_text = chargeFee.value.toFixed(2);
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
                    if (className === "DeliveryCharge") {
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
                    if (className === "DeliveryCharge") {
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
    mergeItemAndMerchantDiscount(discountFeesArray) {
        const response = [];
        const itemLevel = {
            status: 0,
            value: 0,
            name: "ITEM LEVEL",
        };
        discountFeesArray.forEach((discount) => {
            if (discount.discountCategory === "itemLevel") {
                itemLevel.value += discount.value;
                itemLevel.status = 1;
            }
        });
        const discountItemMerchant = {
            name: "",
            value: 0,
            value_text: "",
            id: "coupon_discount",
        };
        let flag = 0;
        if (itemLevel.status) {
            discountItemMerchant.value = itemLevel.value;
            discountItemMerchant.name = "(" + itemLevel.name;
            flag = 1;
        }
        discountFeesArray.forEach((discount) => {
            if (discount.discountCategory === "merchant") {
                discount.name = "By Restaurant";
                discountItemMerchant.value += discount.value;
                if (flag) {
                    discountItemMerchant.name =
                        discountItemMerchant.name + "," + discount.name;
                }
                else {
                    discountItemMerchant.name = "(" + discount.name;
                    flag = 1;
                }
            }
            else if (discount.discountCategory === "topUp") {
                discount.name = "By Restaurant";
                discountItemMerchant.value += discount.value;
                if (flag) {
                    discountItemMerchant.name =
                        discountItemMerchant.name + "," + discount.name;
                }
                else {
                    discountItemMerchant.name = "(" + discount.name;
                    flag = 1;
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
            discountItemMerchant.name = discountItemMerchant.name + ")";
            discountItemMerchant.value_text = discountItemMerchant.value.toFixed(2);
            if (discountItemMerchant.value != 0) {
                response.push(discountItemMerchant);
            }
        }
        return response;
    }
}
exports.BillLibraryService = BillLibraryService;
//# sourceMappingURL=billLibrary.service.js.map