"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountService = void 0;
const i18n_1 = require("../../locale/i18n");
const cartItemInfo_1 = require("../baseClass/cartItemInfo");
const country_enum_1 = require("../../enums/country.enum");
const common_function_lib_1 = require("../lib/common.function.lib");
class DiscountService {
    extractCouponInfo(discountCalculationDto, couponInfo, orderType, reason) {
        if (couponInfo) {
            const couponInfoData = {
                applicableOn: couponInfo.applicable_on || null,
                requiredList: couponInfo.required_list || null,
                applicableQuantity: couponInfo.applicable_qty || null,
                applicableType: couponInfo.applicable_type != undefined
                    ? couponInfo.applicable_type
                    : null,
                discountType: couponInfo.discount_type || null,
                applicableDValue: couponInfo.applicable_dvalue != undefined
                    ? couponInfo.applicable_dvalue
                    : null,
                applicableDType: null,
                maxValue: couponInfo.max_amount || null,
                minAmount: couponInfo.min_amount || null,
                name: couponInfo.code || null,
                value: couponInfo.value || null,
                code: couponInfo.code || null,
                reason: reason,
                freeDelLimit: couponInfo.free_del_limit != undefined
                    ? couponInfo.free_del_limit
                    : null,
                values: couponInfo.values || null,
                valueRanges: couponInfo.value_ranges || null,
            };
            if (couponInfo.applicable_dtype) {
                switch (couponInfo.applicable_dtype) {
                    case 'flat':
                        couponInfoData.applicableDType = "fixed";
                        break;
                    case 'percent':
                        couponInfoData.applicableDType = "percentage";
                        break;
                }
            }
            const discountOrderType = Array.isArray(couponInfo.order_type)
                ? couponInfo.order_type
                : [];
            if (discountOrderType.length > 0 &&
                discountOrderType.includes(orderType)) {
                discountCalculationDto.coupon = couponInfoData;
            }
        }
        return discountCalculationDto;
    }
    getDiscountInfoFromCart(cart, couponInfo) {
        let discountCalculationDto = new cartItemInfo_1.DiscountCalculationDtoImpl([], null, null);
        const couponId = cart['coupon_id'] || null;
        const reason = cart['reason'] || null;
        const couponName = cart['coupon_name'] || null;
        const dValue = cart['dvalue'] || 0;
        const dType = cart['dtype'] || null;
        const orderType = cart['order_type'];
        discountCalculationDto = this.extractCouponInfo(discountCalculationDto, couponInfo, orderType, reason);
        if (couponId === 'mm_discount') {
            const discountData = {
                value: dValue,
                reason: reason,
                discountName: couponName,
            };
            if (dType === 'fixed') {
                discountData['discountType'] = "fixed";
            }
            else if (dType === 'per') {
                discountData['discountType'] = "percentage";
            }
            discountCalculationDto.merchant = discountData;
        }
        for (const item of cart['cart_items'] || []) {
            const itemDiscount = item['item_discount'];
            if (itemDiscount && itemDiscount['value']) {
                const type = itemDiscount['type'];
                const discountData = {
                    itemId: item['cart_item_id'],
                    value: itemDiscount['value'],
                    quantity: itemDiscount['qty'],
                    reason: itemDiscount['reason'],
                    discountType: type === 'percent' ? "percentage" : "fixed",
                };
                discountCalculationDto.itemLevel.push(discountData);
            }
        }
        return discountCalculationDto;
    }
    getDiscountInfoFromOrder(order, couponInfo) {
        let discountCalculationDto = new cartItemInfo_1.DiscountCalculationDtoImpl([], null, null);
        const couponId = order['coupon_id'] || null;
        const reason = order['reason'] || null;
        const couponName = order['coupon_name'] || null;
        const dvalue = order['dvalue'] || null;
        const dtype = order['dtype'] || null;
        const orderItems = order['items'] || [];
        const orderType = order['order_type'];
        discountCalculationDto = this.extractCouponInfo(discountCalculationDto, couponInfo, orderType, reason);
        if (['mm_discount', 'mm_topup', 'fp_discount', 'gf_discount'].includes(couponId)) {
            const discountData = {
                value: dvalue,
                reason: reason,
                discountName: couponName,
            };
            discountData['discountType'] =
                dtype === 'fixed' ? "fixed" : "percentage";
            discountCalculationDto.merchant = discountData;
        }
        for (const item of orderItems) {
            const itemDiscount = item['item_discount'];
            if (itemDiscount && itemDiscount['value']) {
                const discountData = {
                    itemId: item['order_item_id'],
                    value: itemDiscount['value'],
                    quantity: itemDiscount['qty'],
                    reason: itemDiscount['reason'],
                    discountType: itemDiscount['type'] === 'percent'
                        ? "percentage"
                        : "fixed",
                };
                discountCalculationDto.itemLevel.push(discountData);
            }
        }
        return discountCalculationDto;
    }
    applyCouponDiscount(itemInfoDto, couponData) {
        let currentDiscount = 0;
        let newDiscount = 0;
        const discountType = couponData.discountType;
        for (const item of itemInfoDto.itemInfo) {
            currentDiscount += item.discount;
        }
        switch (discountType) {
            case 'bxgy':
            case 'bxgyoz':
                itemInfoDto = this.applyBxGyDiscount(couponData, itemInfoDto);
                break;
            case 'sxgdo':
            case 'percentage':
            case 'fixed':
                itemInfoDto = this.applyFPOFdDiscount(couponData, itemInfoDto);
                break;
        }
        for (const itemCal of itemInfoDto.itemInfo) {
            newDiscount += itemCal.discount;
        }
        if (itemInfoDto.deliveryInfo && itemInfoDto.deliveryInfo.discount > 0) {
            newDiscount += itemInfoDto.deliveryInfo.discount;
        }
        itemInfoDto.couponDiscount = newDiscount - currentDiscount;
        itemInfoDto.couponDiscount = Number((itemInfoDto.couponDiscount).toFixed(2));
        if (itemInfoDto.couponDiscount > 0) {
            itemInfoDto.isCouponDiscountApplied = true;
            itemInfoDto.discountName = itemInfoDto.discountName
                ? `${itemInfoDto.discountName}, ${couponData.code}`
                : couponData.code;
            itemInfoDto.discountMessage = 'Coupon applied';
        }
        return itemInfoDto;
    }
    applyBxGyDiscount(couponData, itemInfoDto) {
        const itemInfo = itemInfoDto.itemInfo;
        const requiredList = couponData.requiredList;
        const applicableOn = couponData.applicableOn;
        const applicableQuantity = couponData.applicableQuantity;
        const applicableType = couponData.applicableType;
        const discountType = couponData.discountType;
        const minAmount = couponData.minAmount;
        let effectiveTotal = 0;
        for (const item of itemInfo) {
            effectiveTotal += item.effectivePrice;
        }
        if (effectiveTotal <= minAmount) {
            itemInfoDto.discountMessage = `Minimum item total required is ${minAmount}`;
            return itemInfoDto;
        }
        if (applicableType === 0) {
            return itemInfoDto;
        }
        else {
            let totalPrice = 0;
            let requiredEffectiveTotal = 0;
            const requiredItemData = [];
            const requiredItemDataInChosen = [];
            for (const listData of requiredList) {
                const listKey = this.getAppliedOnKey(listData.type);
                const listQuantity = listData.qty;
                let totalPresent = 0;
                for (const item of itemInfo) {
                    for (const on of listData.on) {
                        if (item[listKey] === on) {
                            requiredEffectiveTotal += item.effectivePrice;
                            const qty = item.quantity;
                            let ildQty = item.itemLevelDiscount.qty;
                            const ildValue = ildQty !== 0 ? item.itemLevelDiscount.value : 0;
                            for (let i = 0; i < qty; i++) {
                                let itemY;
                                if (ildQty > 0) {
                                    itemY = {
                                        effectivePrice: item.price - ildValue,
                                        itemId: item.itemId,
                                    };
                                    ildQty--;
                                }
                                else {
                                    itemY = { effectivePrice: item.price, itemId: item.itemId };
                                }
                                if (itemY['effectivePrice'] > 0) {
                                    totalPresent = totalPresent + 1;
                                    requiredItemData.push(itemY);
                                }
                            }
                        }
                    }
                }
                if (totalPresent < listQuantity) {
                    itemInfoDto.discountMessage = `Minimum item quantity required for this coupon ${listQuantity}`;
                    return itemInfoDto;
                }
                if (requiredEffectiveTotal === 0) {
                    itemInfoDto.discountMessage =
                        'Minimum item total of required items for this coupon must be greater than 0';
                    return itemInfoDto;
                }
                if (requiredItemData.length) {
                    requiredItemData.sort((b, a) => a.effectivePrice - b.effectivePrice);
                    let requiredQty = listQuantity;
                    for (const item of requiredItemData) {
                        if (requiredQty > 0) {
                            requiredItemDataInChosen.push(item);
                            requiredQty--;
                        }
                    }
                }
            }
            const appliedItemInfo = itemInfo.map(item => (Object.assign({}, item)));
            appliedItemInfo.forEach(aItem => {
                requiredItemDataInChosen.forEach(item => {
                    if (item.itemId === aItem.itemId) {
                        aItem.quantity -= 1;
                        aItem.effectivePrice -= item.effectivePrice;
                    }
                });
            });
            const key = this.getAppliedOnKey(applicableType);
            let appliedItemPresent = false;
            let appliedItemData = [];
            let applicableList = [];
            for (const item of appliedItemInfo) {
                for (const applicable of applicableOn) {
                    if (item[key] === applicable) {
                        appliedItemPresent = true;
                        const qty = item.quantity;
                        let ildQty = item.itemLevelDiscount.qty;
                        const ildValue = ildQty !== 0 ? item.itemLevelDiscount.value : 0;
                        for (let i = 0; i < qty; i++) {
                            let itemY;
                            if (ildQty > 0) {
                                itemY = {
                                    effectivePrice: item.price - ildValue,
                                    itemId: item.itemId,
                                };
                                ildQty--;
                            }
                            else {
                                itemY = { effectivePrice: item.price, itemId: item.itemId };
                            }
                            if (itemY['effectivePrice'] > 0) {
                                applicableList.push(itemY);
                            }
                        }
                    }
                }
            }
            if (applicableList.length) {
                applicableList.sort((a, b) => a.effectivePrice - b.effectivePrice);
                let requiredQty = applicableQuantity;
                for (const item of applicableList) {
                    if (requiredQty > 0) {
                        appliedItemData.push(item);
                        totalPrice += item.effectivePrice;
                        requiredQty--;
                    }
                }
            }
            if (appliedItemPresent) {
                if (discountType === 'bxgy') {
                    return this.applyBxGyDiscountType(itemInfoDto, appliedItemData);
                }
                else if (discountType === 'bxgyoz') {
                    return this.applyBxGyOzDiscountType(itemInfoDto, appliedItemData, couponData, totalPrice);
                }
            }
            else {
                itemInfoDto.discountMessage = 'No item of applicable list present';
                return itemInfoDto;
            }
        }
        return itemInfoDto;
    }
    applyBxGyDiscountType(itemInfoDto, appliedItemData) {
        const itemInfo = itemInfoDto.itemInfo;
        appliedItemData.forEach((itemData) => {
            const discountValue = itemData.effectivePrice;
            const itemId = itemData.itemId;
            itemInfo.forEach((itemCal, key) => {
                if (itemCal.itemId === itemId) {
                    itemInfo[key] = this.updateItemDiscount(itemCal, discountValue);
                }
            });
        });
        return itemInfoDto;
    }
    applyBxGyOzDiscountType(itemInfoDto, appliedItemData, couponData, totalPrice) {
        const itemInfo = itemInfoDto.itemInfo;
        const applicableDType = couponData.applicableDType;
        const applicableDValue = couponData.applicableDValue;
        const useValue = this.calculateUseValue(totalPrice, applicableDValue, couponData.maxValue, applicableDType);
        appliedItemData.forEach((itemData) => {
            const discountValue = (itemData.effectivePrice / totalPrice) * useValue;
            const itemId = itemData.itemId;
            itemInfo.forEach((itemCal, key) => {
                if (itemCal.itemId === itemId) {
                    itemInfo[key] = this.updateItemDiscount(itemCal, discountValue);
                }
            });
        });
        return itemInfoDto;
    }
    updateItemDiscount(itemCal, discountValue) {
        let effectivePrice = itemCal.effectivePrice;
        if (effectivePrice > 0) {
            if (effectivePrice - discountValue > 0) {
                effectivePrice = effectivePrice - discountValue;
                itemCal.discount += discountValue;
            }
            else {
                itemCal.discount += effectivePrice;
                effectivePrice = 0;
            }
            itemCal.effectivePrice = effectivePrice;
        }
        return itemCal;
    }
    calculateUseValue(totalPrice, applicableDValue, maxValue, applicableDType) {
        let useValue = 0;
        switch (applicableDType) {
            case "fixed":
                useValue = applicableDValue;
                if (useValue > totalPrice) {
                    useValue = totalPrice;
                }
                break;
            case "percentage":
                if (applicableDValue > 100) {
                    applicableDValue = 100;
                }
                useValue = (applicableDValue * totalPrice) / 100;
                break;
        }
        if (useValue > maxValue) {
            useValue = maxValue;
        }
        return useValue;
    }
    getAppliedOnKey(applicableType) {
        switch (applicableType) {
            case 0:
                return 'order';
            case 1:
                return 'catId';
            case 2:
                return 'subCatId';
            case 3:
                return 'originalItemId';
            default:
                return '';
        }
    }
    applyFPOFdDiscount(couponInfoDto, itemInfoDto) {
        const itemInfo = itemInfoDto.itemInfo;
        const applicableOn = couponInfoDto.applicableOn;
        const applicableType = couponInfoDto.applicableType;
        const maxValue = couponInfoDto.maxValue;
        const minAmount = couponInfoDto.minAmount;
        const discountType = couponInfoDto.discountType;
        let value = couponInfoDto.value;
        const freeDelLimit = couponInfoDto.freeDelLimit;
        const applicableItems = [];
        let applicableTotal = 0;
        if (applicableType === 0) {
            for (const item of itemInfo) {
                applicableItems.push(item.itemId);
                applicableTotal += item.effectivePrice;
            }
        }
        else {
            const key = this.getAppliedOnKey(applicableType);
            for (const item of itemInfo) {
                for (const applicableValue of applicableOn) {
                    if (item[key] && item[key] === applicableValue) {
                        applicableItems.push(item.itemId);
                        applicableTotal += item.effectivePrice;
                    }
                }
            }
        }
        if (applicableTotal === 0) {
            itemInfoDto.discountMessage =
                'Applicable items for this coupon are not present';
            return itemInfoDto;
        }
        if (applicableTotal < minAmount) {
            itemInfoDto.discountMessage = `Minimum item total required is ${minAmount}`;
            return itemInfoDto;
        }
        const valueRanges = couponInfoDto.valueRanges;
        const values = couponInfoDto.values;
        for (let i = 0; i < valueRanges.length; i++) {
            if (applicableTotal <= valueRanges[i]) {
                value = values[i];
                break;
            }
        }
        let useValue = 0;
        switch (discountType) {
            case 'fixed':
            case 'percentage':
                useValue =
                    discountType === 'fixed'
                        ? Math.min(value, maxValue, applicableTotal)
                        : Math.min((value * applicableTotal) / 100, maxValue);
                for (const itemId of applicableItems) {
                    for (const [key, itemCal] of itemInfo.entries()) {
                        if (itemCal.itemId === itemId) {
                            let effectivePrice = itemCal.effectivePrice;
                            const discountValue = (effectivePrice / applicableTotal) * useValue;
                            if (effectivePrice > 0) {
                                if (effectivePrice - discountValue > 0) {
                                    effectivePrice = effectivePrice - discountValue;
                                    itemCal.discount += discountValue;
                                }
                                else {
                                    itemCal.discount += effectivePrice;
                                    effectivePrice = 0;
                                }
                                itemCal.effectivePrice = effectivePrice;
                                itemInfo[key] = itemCal;
                            }
                            break;
                        }
                    }
                }
                break;
            case 'sxgdo':
                const deliveryInfo = itemInfoDto.deliveryInfo;
                if (deliveryInfo) {
                    useValue = Math.min(value, maxValue, deliveryInfo.fee);
                    if (freeDelLimit >= deliveryInfo.distance) {
                        deliveryInfo.discount = useValue;
                    }
                }
                break;
        }
        return itemInfoDto;
    }
    applyItemLevelDiscount(itemInfoDto, itemLevelData, country_code = 'MY') {
        const itemInfo = itemInfoDto.itemInfo;
        let discountFlag = false;
        const language = (0, country_enum_1.getCountryLanguage)(country_code);
        for (const itemData of itemLevelData) {
            for (let i = 0; i < itemInfo.length; i++) {
                const itemCal = itemInfo[i];
                if (itemCal.itemId === itemData.itemId) {
                    let qty = itemData.quantity;
                    const value = itemData.value;
                    const price = itemCal.price;
                    const itemQty = itemCal.quantity;
                    if (itemQty < qty) {
                        qty = itemQty;
                    }
                    discountFlag = true;
                    const discountType = itemData.discountType;
                    let discountValue = 0;
                    if (discountType === "percentage") {
                        discountValue = (price * value) / 100;
                    }
                    else if (discountType === "fixed") {
                        discountValue = Math.min(value, price);
                    }
                    itemCal.discount += discountValue * qty;
                    itemCal.effectivePrice -= discountValue * qty;
                    discountValue = Number((discountValue).toFixed(2));
                    itemCal.itemLevelDiscount = {
                        value: discountValue,
                        qty: qty,
                    };
                    itemInfo[i] = itemCal;
                    break;
                }
            }
        }
        if (discountFlag) {
            const itemNameSuffix = (0, i18n_1.localize)('itemLevel', language);
            itemInfoDto.discountName = itemInfoDto.discountName
                ? `${itemInfoDto.discountName}, ${itemNameSuffix}`
                : itemNameSuffix;
        }
        return itemInfoDto;
    }
    applyMerchantDiscount(itemInfoDto, merchantData, country_code = 'MY') {
        const itemInfo = itemInfoDto.itemInfo;
        const discountType = merchantData.discountType;
        let value = merchantData.value;
        const language = (0, country_enum_1.getCountryLanguage)(country_code);
        const effectiveItemTotal = itemInfo.reduce((total, item) => total + item.effectivePrice, 0);
        let totalDiscount = 0;
        if (discountType === "percentage") {
            value = Math.min(value, 100);
            totalDiscount = (effectiveItemTotal * value) / 100;
        }
        else if (discountType === "fixed") {
            totalDiscount = Math.min(value, effectiveItemTotal);
        }
        if (totalDiscount > 0) {
            const itemNameSuffix = merchantData.reason
                ? merchantData.reason
                : (0, i18n_1.localize)('byRest', language);
            itemInfoDto.discountName = itemInfoDto.discountName
                ? `${itemInfoDto.discountName}, ${itemNameSuffix}`
                : itemNameSuffix;
        }
        itemInfo.forEach((itemCal, key) => {
            const effectivePrice = itemCal.effectivePrice;
            const discountValue = (totalDiscount * effectivePrice) / effectiveItemTotal;
            itemCal.discount += discountValue;
            itemCal.effectivePrice -= discountValue;
            itemInfo[key] = itemCal;
        });
        return itemInfoDto;
    }
    applyDiscount(itemInfoDto, discountInfo) {
        const itemLevelDiscount = discountInfo.itemLevel;
        if (itemLevelDiscount) {
            itemInfoDto = this.applyItemLevelDiscount(itemInfoDto, itemLevelDiscount);
        }
        const couponDiscount = discountInfo.coupon;
        if (couponDiscount) {
            itemInfoDto = this.applyCouponDiscount(itemInfoDto, couponDiscount);
        }
        const merchantDiscount = discountInfo.merchant;
        if (merchantDiscount) {
            itemInfoDto = this.applyMerchantDiscount(itemInfoDto, merchantDiscount);
        }
        return itemInfoDto;
    }
    checkCouponApplicable(cart, discount, timezone, language, platform = 'easyeat', deliveryInfo = null) {
        const cartItems = cart.cart_items;
        const orderType = cart.order_type;
        const itemInfoDto = (0, common_function_lib_1.getCartItemInfoNew)(cartItems, orderType, platform, deliveryInfo);
        const discountInfo = this.getDiscountInfoFromCart(cart, discount);
        const itemInfoDtoWithDiscount = this.applyDiscount(itemInfoDto, discountInfo);
        const response = {
            status: itemInfoDtoWithDiscount.isCouponDiscountApplied ? 1 : 0,
            message: itemInfoDtoWithDiscount.discountMessage,
            discountAmount: itemInfoDtoWithDiscount.couponDiscount,
        };
        return response;
    }
}
exports.DiscountService = DiscountService;
//# sourceMappingURL=discount-service.js.map