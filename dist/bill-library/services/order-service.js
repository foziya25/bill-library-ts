"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const country_enum_1 = require("../../enums/country.enum");
const common_function_lib_1 = require("../lib/common.function.lib");
const i18n_1 = require("../../locale/i18n");
class OrderService {
    constructor(chargesService, discountService) {
        this.chargesService = chargesService;
        this.discountService = discountService;
    }
    getDeliveryObj(order, oldOrderBill) {
        let deliveryInfo = null;
        if (oldOrderBill) {
            const fees = oldOrderBill.fees;
            fees.forEach(fee => {
                if (fee.id == 'delivery' && order.order_type == 1) {
                    deliveryInfo = {
                        distance: order.distance,
                        fee: fee.fee,
                    };
                }
            });
        }
        return deliveryInfo;
    }
    calculateAndAddDeliveryFee(itemInfoDto, customDeliveryFee = 0, language) {
        let deliveryFee = null;
        if (itemInfoDto.deliveryInfo &&
            (itemInfoDto.deliveryInfo.fee || customDeliveryFee)) {
            deliveryFee = {
                name: (0, i18n_1.localize)('deliveryFee', language),
                value: Number((itemInfoDto.deliveryInfo.fee || customDeliveryFee).toFixed(2)),
                id: 'delivery',
            };
        }
        return deliveryFee;
    }
    calculateAndApplyDiscount(order, couponInfo, itemInfoDto, language, callingFromGetCart = false) {
        var _a;
        let discountInfo = null;
        if (!callingFromGetCart) {
            discountInfo = this.discountService.getDiscountInfoFromOrder(order, couponInfo);
        }
        else {
            discountInfo = this.discountService.getDiscountInfoFromCart(order, couponInfo);
        }
        itemInfoDto = this.discountService.applyDiscount(itemInfoDto, discountInfo);
        let discountValue = 0;
        for (const item of itemInfoDto.itemInfo) {
            discountValue += item.discount;
            item.discount = Number((item.discount).toFixed(4));
        }
        if (((_a = itemInfoDto.deliveryInfo) === null || _a === void 0 ? void 0 : _a.discount) &&
            itemInfoDto.deliveryInfo.discount > 0) {
            discountValue += itemInfoDto.deliveryInfo.discount;
            itemInfoDto.deliveryInfo.discount = Number((itemInfoDto.deliveryInfo.discount).toFixed(2));
        }
        const discountFee = {
            id: 'coupon_discount',
            name: (0, i18n_1.localize)('discount', language) + '(' + itemInfoDto.discountName + ')',
            value: -Number(discountValue.toFixed(2)),
        };
        return discountValue ? discountFee : null;
    }
    calculateAndUpdateLoyaltyCashback(order, itemInfoDto, oldOrderBill) {
        var _a;
        let loyaltyFee = null;
        const loyaltyExists = ((_a = order === null || order === void 0 ? void 0 : order.loyalty) === null || _a === void 0 ? void 0 : _a.amount) > 0;
        if (loyaltyExists) {
            const loyaltyObj = this.getLoyaltyFromOrderBill(oldOrderBill);
            if (loyaltyObj) {
                loyaltyFee = {
                    id: 'loyalty_cashback',
                    name: 'Loyalty Cashback',
                    value: Number((loyaltyObj.value).toFixed(2)),
                };
                const loyaltyAmount = -loyaltyObj.value;
                this.prorateLoyalty(itemInfoDto, loyaltyAmount);
            }
        }
        return loyaltyFee;
    }
    calculateAndApplyCharges(order, platform, restaurantDetails, country_code, itemInfoDto) {
        const skip_service_charge_operation = order.skip_service_charge_operation || false;
        const skip_packaging_charge_operation = order.skip_packaging_charge_operation || false;
        const orderType = order.order_type;
        const offlinePlatform = restaurantDetails.offline_platforms || [];
        const restaurantFees = restaurantDetails.fees || [];
        let packagingChargeDisabled = false;
        if (platform &&
            platform !== 'easyeat' &&
            offlinePlatform &&
            offlinePlatform.length > 0) {
            packagingChargeDisabled = true;
            for (const platformSettings of offlinePlatform) {
                if (platformSettings.id === platform &&
                    platformSettings.pkg_applicable) {
                    packagingChargeDisabled = false;
                    break;
                }
            }
        }
        const restCharges = (0, common_function_lib_1.getTransformedRestaurantCharges)(restaurantFees, orderType, skip_packaging_charge_operation, packagingChargeDisabled, skip_service_charge_operation);
        if (country_code === country_enum_1.CountryMapping.MALAYSIA.country_code) {
            for (const charge of restCharges) {
                itemInfoDto = this.chargesService.applyChargesOnItems(itemInfoDto, charge);
            }
        }
        if (country_code === country_enum_1.CountryMapping.INDONESIA.country_code) {
            for (const charge of restCharges) {
                if (charge.id === 'service_tax') {
                    itemInfoDto = this.chargesService.applyIndonesiaChargesOnItems(itemInfoDto, charge);
                    break;
                }
            }
            for (const charge of restCharges) {
                if (charge.id !== 'service_tax') {
                    itemInfoDto = this.chargesService.applyIndonesiaChargesOnItems(itemInfoDto, charge);
                }
            }
        }
        return itemInfoDto;
    }
    calculateAndApplyPlatformChargesAuto(restaurantDetails, platform, itemInfoDto, discountValue, customDeliveryFee, bill) {
        let op_new_calculation = 0;
        let platformFeeObj = null;
        const settings = restaurantDetails.settings;
        const restOfflinePlatform = restaurantDetails.offline_platforms || [];
        if (settings.global.is_gf_new_calculation ||
            settings.global.is_fp_new_calculation) {
            op_new_calculation = 1;
        }
        if (platform === 'foodpanda' || platform === 'grab') {
            if (op_new_calculation) {
                bill.subtotal = itemInfoDto.itemTotal;
            }
            else {
                const discount = discountValue;
                if (platform === 'grab') {
                    bill.subtotal = itemInfoDto.itemTotal - Math.abs(discount);
                }
                else {
                    bill.subtotal =
                        itemInfoDto.itemTotal +
                            itemInfoDto.deliveryInfo.fee -
                            Math.abs(discount);
                }
                const comm_applied_on = bill.subtotal - customDeliveryFee;
                const platform_commision = (0, common_function_lib_1.getPlatformCommission)(platform, restOfflinePlatform, comm_applied_on);
                const commission_value = platform_commision.status === 1 ? platform_commision.fees.value : 0;
                if (commission_value) {
                    platformFeeObj = {
                        id: 'platform_commision',
                        name: platform_commision.fees.name,
                        value: commission_value,
                    };
                }
            }
        }
        return platformFeeObj;
    }
    applyChargesAndCalculateCommission(itemInfoDto, platform, restaurantDetails) {
        const orderFees = [];
        const restOfflinePlatform = restaurantDetails.offline_platforms || [];
        const chargesObj = itemInfoDto.charges;
        for (const charge of chargesObj) {
            if (charge.value) {
                const chargeFeeObj = {
                    id: charge.id,
                    name: charge.name,
                    value: charge.value,
                };
                orderFees.push(chargeFeeObj);
            }
        }
        const platformCommission = (0, common_function_lib_1.getPlatformCommission)(platform, restOfflinePlatform, itemInfoDto.itemTotal);
        if (platformCommission.status === 1 && platformCommission.fees.value) {
            const platformFeeObj = {
                id: 'platform_commision',
                name: platformCommission.fees.name,
                value: platformCommission.fees.value,
            };
            orderFees.push(platformFeeObj);
        }
        return orderFees;
    }
    getLoyaltyFromOrderBill(orderBill) {
        let loyalty_obj = null;
        try {
            const { fees } = orderBill;
            if (fees === null || fees === void 0 ? void 0 : fees.length) {
                fees.forEach(fee => {
                    if (fee.id === 'loyalty_cashback') {
                        loyalty_obj = {
                            name: fee.fee_name,
                            value: fee.fee,
                            id: fee.id,
                        };
                    }
                });
            }
        }
        catch (e) { }
        return loyalty_obj;
    }
    reCalculateBill(orderBill, roundOff, language) {
        const oldFees = orderBill.fees;
        const newFees = [];
        const payments = orderBill.payments || [];
        const subtotal = orderBill.subtotal || 0;
        let billTotal = 0;
        let paid = 0;
        let itemTotal = 0;
        let couponExists = false;
        let topUpExists = false;
        for (const fee of oldFees) {
            if (fee.id !== 'round_off') {
                billTotal += Number(fee.value.toFixed(2));
                newFees.push(fee);
            }
            if (fee.id === 'item_total') {
                itemTotal = fee.value;
            }
            if (fee.id === 'coupon_discount') {
                couponExists = true;
            }
            if (fee.id === 'topup') {
                topUpExists = true;
            }
        }
        if (!couponExists) {
            newFees.push({
                id: 'coupon_discount',
                name: (0, i18n_1.localize)('discount', language),
                value: 0,
                reason: '',
            });
        }
        if (!topUpExists) {
            newFees.push({
                id: 'topup',
                name: (0, i18n_1.localize)('topup', language),
                value: 0,
                reason: '',
            });
        }
        for (const payment of payments) {
            if (payment.status === 1) {
                paid += payment.amount;
            }
        }
        billTotal = Number(billTotal.toFixed(2));
        const roundOffStatus = roundOff.status;
        if (roundOffStatus === 1) {
            const roundValue = (0, common_function_lib_1.getRoundOffValue)(billTotal, roundOff);
            const roundDiff = roundValue - billTotal;
            billTotal = Number(roundValue.toFixed(2));
            if (roundDiff != 0) {
                newFees.push({
                    id: 'round_off',
                    name: (0, i18n_1.localize)('roundOff', language),
                    value: Number(roundDiff.toFixed(2)),
                });
            }
        }
        if (subtotal > 0) {
            billTotal = subtotal;
        }
        const balance = billTotal - paid;
        orderBill.fees = newFees;
        orderBill.paid = Number((paid).toFixed(2));
        orderBill.balance = Number((balance).toFixed(2));
        orderBill.bill_total = Number((billTotal).toFixed(2));
        orderBill.item_total = Number((itemTotal).toFixed(2));
        return orderBill;
    }
    prorateLoyalty(itemInfoDto, loyaltyAmount) {
        if (loyaltyAmount > 0) {
            const itemInfo = itemInfoDto.itemInfo;
            let effectivePriceSum = 0;
            itemInfo.forEach(itemCal => {
                effectivePriceSum += itemCal.effectivePrice;
            });
            itemInfo.forEach(itemCal => {
                itemCal.loyaltyItemAmount =
                    itemCal.effectivePrice * (loyaltyAmount / effectivePriceSum);
                itemCal.effectivePrice -= itemCal.loyaltyItemAmount;
                itemCal.loyaltyItemAmount = Number((itemCal.loyaltyItemAmount).toFixed(4));
            });
            loyaltyAmount = Number((loyaltyAmount).toFixed(2));
            itemInfoDto.loyaltyAmount = loyaltyAmount;
        }
        return itemInfoDto;
    }
    getRoundOffObject(restaurantDetails, orderType) {
        const roundOff = {};
        roundOff.baseRoundOff =
            restaurantDetails.base_roundoff || restaurantDetails.base_roundoff == 0
                ? restaurantDetails.base_roundoff
                : 0;
        roundOff.roundUp = restaurantDetails.roundup || false;
        roundOff.roundDown = restaurantDetails.rounddown || false;
        const roundOffDisable = restaurantDetails.round_off_close || 0;
        roundOff.status = this.roundOffDisable(roundOffDisable, orderType) ? 0 : 1;
        return roundOff;
    }
    roundOffDisable(roundOffVal, orderType) {
        let roundOffDisable = 0;
        if (roundOffVal !== 0) {
            if ((roundOffVal & 1 && orderType === 0) ||
                (roundOffVal & 2 && orderType === 1) ||
                (roundOffVal & 4 && orderType === 2)) {
                roundOffDisable = 1;
            }
        }
        return roundOffDisable;
    }
    getTopUpFeeObj(order, language) {
        const response = { status: 0, fee: null };
        if (order.topup_id === 'mm_topup' && order.tvalue) {
            const topUpValue = Number(order.tvalue.toFixed(2));
            const tName = order.treason ? order.treason : order.topup_name;
            const topUpName = tName
                ? (0, i18n_1.localize)('topup', language) + '(' + tName + ')'
                : (0, i18n_1.localize)('topup', language);
            const topUpFee = {
                id: 'topup',
                name: topUpName,
                value: topUpValue,
            };
            response.status = 1;
            response.fee = topUpFee;
        }
        return response;
    }
    reCalculateAndUpdateBill(orderBill, roundOff, language) {
        orderBill = this.reCalculateBill(orderBill, roundOff, language);
        return orderBill;
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=order-service.js.map