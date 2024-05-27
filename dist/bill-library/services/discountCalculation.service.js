"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountCalculationService = void 0;
const common_function_lib_1 = require("../lib/common.function.lib");
class DiscountCalculationService {
    getDiscountFromCart(cart, itemInfo, coupon_info) {
        const discountInterfaceList = [];
        const item_total = (0, common_function_lib_1.getCartItemTotal)(itemInfo);
        const discountInfo = this.getDiscountInfoFromCart(cart, coupon_info, item_total);
        if (discountInfo) {
            for (const i in discountInfo) {
                const discount = discountInfo[i];
                switch (discount.type) {
                    case "coupon":
                        const couponId = discount.info.id;
                        const couponData = discount.info.discountData;
                        const getCouponInfoDto = {
                            couponInfoDto: couponData,
                            itemInfo: itemInfo,
                            coupon_id: couponId,
                        };
                        const couponInterface = this.getOrderCouponDiscountInterface(getCouponInfoDto);
                        if (couponInterface) {
                            discountInterfaceList.push(couponInterface);
                        }
                        else {
                        }
                        break;
                    case "merchant":
                        const discountMData = discount.info.discountData;
                        const discountMid = discount.info.id;
                        const getMerchantDiscountInterfaceDto = {
                            id: discountMid,
                            type: discountMData.type,
                            value: discountMData.value,
                            discountType: discountMData.discountType,
                            reason: discountMData.reason,
                        };
                        const merchantInterface = this.getMerchantDiscountInterface(getMerchantDiscountInterfaceDto);
                        if (merchantInterface) {
                            discountInterfaceList.push(merchantInterface);
                        }
                        break;
                    case "itemLevel":
                        const discountILData = discount.info.discountData;
                        const discountILid = discount.info.id;
                        const getItemLevelDiscountInterfaceDto = {
                            id: discountILid,
                            value: discountILData.value,
                            discountType: discountILData.discountType,
                            itemInfo: itemInfo,
                            quantity: discountILData.quantity,
                            orderItemId: discountILData.orderItemId,
                            reason: discountILData.reason,
                        };
                        const itemLevelInterface = this.getItemLevelDiscountInterface(getItemLevelDiscountInterfaceDto);
                        if (itemLevelInterface) {
                            discountInterfaceList.push(itemLevelInterface);
                        }
                        break;
                }
            }
        }
        return discountInterfaceList;
    }
    getDiscountInfoFromCart(cart, coupon_info, item_total) {
        const discountInfo = [];
        const { coupon_id, reason, coupon_name, dvalue, dtype, cart_items, order_type, } = cart;
        if (coupon_info && coupon_id && coupon_id === coupon_info.coupon_id) {
            const values = coupon_info.values;
            const value_ranges = coupon_info.value_ranges;
            let value = coupon_info.value;
            for (const i in value_ranges) {
                const range = value_ranges[i];
                if (range >= item_total) {
                    value = values[i];
                    break;
                }
            }
            const couponInfoData = {
                applicableOn: coupon_info.applicable_on,
                requiredList: coupon_info.required_list,
                applicableQuantity: coupon_info.applicable_qty,
                applicableType: coupon_info.applicable_type,
                discountType: coupon_info.discount_type,
                applicableDValue: coupon_info.applicable_dvalue,
                applicableDType: null,
                maxValue: coupon_info.max_amount,
                minAmount: coupon_info.min_amount,
                name: coupon_info.code,
                value: value,
                code: coupon_info.code,
                reason: reason,
            };
            if (coupon_info.applicable_dtype === 'flat') {
                couponInfoData.applicableDType = "fixed";
            }
            else if (coupon_info.applicable_dtype === 'percent') {
                couponInfoData.applicableDType = "percentage";
            }
            const discountInfoObj = {
                type: "coupon",
                info: { id: coupon_id, discountData: couponInfoData },
            };
            const discountOrderType = coupon_info.order_type;
            if (discountOrderType) {
                for (const i in discountOrderType) {
                    const applicableOrderType = discountOrderType[i];
                    if (applicableOrderType == order_type) {
                        discountInfo.push(discountInfoObj);
                        break;
                    }
                }
            }
        }
        if (coupon_id === 'mm_discount' || coupon_id === 'mm_topup') {
            const mDiscountObj = {
                type: "merchant",
                info: {
                    id: coupon_id,
                    discountData: {
                        value: dvalue,
                        reason,
                        discountName: coupon_name,
                    },
                },
            };
            if (coupon_id === 'mm_discount') {
                mDiscountObj.info.discountData.type = "normal";
            }
            else if (coupon_id === 'mm_topup') {
                mDiscountObj.info.discountData.type = "topUp";
            }
            if (dtype === 'fixed') {
                mDiscountObj.info.discountData.discountType = "fixed";
            }
            else if (dtype === 'per') {
                mDiscountObj.info.discountData.discountType = "percentage";
            }
            discountInfo.push(mDiscountObj);
        }
        cart_items.forEach(item => {
            const { item_discount } = item;
            if (item_discount) {
                const { value, type, reason, qty } = item_discount;
                const itemLevelDiscountObj = {
                    type: "itemLevel",
                    info: {
                        id: 'IL_' + item.cart_item_id,
                        discountData: {
                            orderItemId: item.cart_item_id,
                            value,
                            quantity: qty,
                            reason,
                        },
                    },
                };
                if (type === 'percent') {
                    itemLevelDiscountObj.info.discountData.discountType =
                        "percentage";
                }
                else if (type === 'fixed') {
                    itemLevelDiscountObj.info.discountData.discountType =
                        "fixed";
                }
                discountInfo.push(itemLevelDiscountObj);
            }
        });
        return discountInfo;
    }
    getDiscountOnOrder(order, couponInfo, itemInfo) {
        const discountInterfaceList = [];
        const item_total = (0, common_function_lib_1.getCartItemTotal)(itemInfo);
        const discountInfo = this.getDiscountInfoFromOrder(order, couponInfo, item_total);
        if (discountInfo) {
            for (const i in discountInfo) {
                const discount = discountInfo[i];
                switch (discount.type) {
                    case "coupon":
                        const couponId = discount.info.id;
                        const couponData = discount.info.discountData;
                        const getCouponInfoDto = {
                            couponInfoDto: couponData,
                            itemInfo: itemInfo,
                            coupon_id: couponId,
                        };
                        const couponInterface = this.getOrderCouponDiscountInterface(getCouponInfoDto);
                        if (couponInterface) {
                            discountInterfaceList.push(couponInterface);
                        }
                        else {
                        }
                        break;
                    case "merchant":
                        const discountMData = discount.info.discountData;
                        const discountMid = discount.info.id;
                        const getMerchantDiscountInterfaceDto = {
                            id: discountMid,
                            type: discountMData.type,
                            value: discountMData.value,
                            discountType: discountMData.discountType,
                            reason: discountMData.reason,
                        };
                        const merchantInterface = this.getMerchantDiscountInterface(getMerchantDiscountInterfaceDto);
                        if (merchantInterface) {
                            discountInterfaceList.push(merchantInterface);
                        }
                        break;
                    case "itemLevel":
                        const discountILData = discount.info.discountData;
                        const discountILid = discount.info.id;
                        const getItemLevelDiscountInterfaceDto = {
                            id: discountILid,
                            value: discountILData.value,
                            discountType: discountILData.discountType,
                            itemInfo: itemInfo,
                            quantity: discountILData.quantity,
                            orderItemId: discountILData.orderItemId,
                            reason: discountILData.reason,
                        };
                        const itemLevelInterface = this.getItemLevelDiscountInterface(getItemLevelDiscountInterfaceDto);
                        if (itemLevelInterface) {
                            discountInterfaceList.push(itemLevelInterface);
                        }
                        break;
                }
            }
        }
        return discountInterfaceList;
    }
    getDiscountInfoFromOrder(order, coupon_info, item_total) {
        const discountInfo = [];
        const { coupon_id, reason, coupon_name, dtype, dvalue, items, order_type } = order;
        if (coupon_info && coupon_id && coupon_id === coupon_info.coupon_id) {
            const values = coupon_info.values;
            const value_ranges = coupon_info.value_ranges;
            let value = coupon_info.value;
            for (const i in value_ranges) {
                const range = value_ranges[i];
                if (range >= item_total) {
                    value = values[i];
                    break;
                }
            }
            const couponInfoData = {
                applicableOn: coupon_info.applicable_on,
                requiredList: coupon_info.required_list,
                applicableQuantity: coupon_info.applicable_qty,
                applicableType: coupon_info.applicable_type,
                discountType: coupon_info.discount_type,
                applicableDValue: coupon_info.applicable_dvalue,
                applicableDType: null,
                maxValue: coupon_info.max_amount,
                minAmount: coupon_info.min_amount,
                name: coupon_info.code,
                value: value,
                code: coupon_info.code,
                reason: reason,
            };
            if (coupon_info.applicable_dtype === 'flat') {
                couponInfoData.applicableDType = "fixed";
            }
            else if (coupon_info.applicable_dtype === 'percent') {
                couponInfoData.applicableDType = "percentage";
            }
            const discountInfoObj = {
                type: "coupon",
                info: { id: coupon_id, discountData: couponInfoData },
            };
            const discountOrderType = coupon_info.order_type;
            if (discountOrderType) {
                for (const i in discountOrderType) {
                    const applicableOrderType = discountOrderType[i];
                    if (applicableOrderType == order_type) {
                        discountInfo.push(discountInfoObj);
                        break;
                    }
                }
            }
        }
        if (coupon_id === 'mm_discount' || coupon_id === 'mm_topup') {
            const mDiscountObj = {
                type: "merchant",
                info: {
                    id: coupon_id,
                    discountData: {
                        value: dvalue,
                        reason,
                        discountName: coupon_name,
                    },
                },
            };
            if (coupon_id === 'mm_discount') {
                mDiscountObj.info.discountData.type = "normal";
            }
            else if (coupon_id === 'mm_topup') {
                mDiscountObj.info.discountData.type = "topUp";
            }
            if (dtype === 'fixed') {
                mDiscountObj.info.discountData.discountType = "fixed";
            }
            else if (dtype === 'per') {
                mDiscountObj.info.discountData.discountType = "percentage";
            }
            discountInfo.push(mDiscountObj);
        }
        items.forEach(item => {
            const { item_discount } = item;
            if (item_discount) {
                const { value, type, reason, qty } = item_discount;
                const itemLevelDiscountObj = {
                    type: "itemLevel",
                    info: {
                        id: 'IL_' + item.order_item_id,
                        discountData: {
                            orderItemId: item.order_item_id,
                            value,
                            quantity: qty,
                            reason,
                        },
                    },
                };
                if (type === 'percent') {
                    itemLevelDiscountObj.info.discountData.discountType =
                        "percentage";
                }
                else if (type === 'fixed') {
                    itemLevelDiscountObj.info.discountData.discountType =
                        "fixed";
                }
                discountInfo.push(itemLevelDiscountObj);
            }
        });
        return discountInfo;
    }
    getOrderCouponDiscountInterface(getCouponInfoDto) {
        const { discountType } = getCouponInfoDto.couponInfoDto;
        switch (discountType) {
            case 'bxgy':
            case 'bxgyoz':
                return this.getBxGyDiscountFromOrder(getCouponInfoDto);
            case 'sxgdo':
            case 'percentage':
            case 'fixed':
                return this.getFPOFdDiscountFromOrder(getCouponInfoDto);
        }
    }
    getFPOFdDiscountFromOrder(getCouponInfoDto) {
        const { couponInfoDto, coupon_id, itemInfo } = getCouponInfoDto;
        const { applicableOn, applicableType, maxValue, minAmount, name, discountType, } = couponInfoDto;
        let { value } = couponInfoDto;
        const itemTotal = (0, common_function_lib_1.getCartItemTotal)(itemInfo);
        if (itemTotal <= minAmount) {
            return null;
        }
        const isApplicableOnItems = this.verifyAppliedOnItems({ applicableType, applicableOn }, itemInfo);
        if (!isApplicableOnItems) {
            return null;
        }
        let discountTypeEnum = null;
        let discountAction = null;
        switch (discountType) {
            case 'fixed':
                discountTypeEnum = "fixed";
                discountAction = "normal";
                break;
            case 'percentage':
                if (value > 100) {
                    value = 100;
                }
                discountTypeEnum = "percentage";
                discountAction = "normal";
                break;
            case 'sxgdo':
                discountTypeEnum = "fixed";
                discountAction = "freeDelivery";
                break;
        }
        const discountInterfaceObj = {
            name: name,
            discountType: discountTypeEnum,
            value: value,
            applicableOn: applicableOn,
            discountApplicableType: this.getDiscountApplicableType(applicableType),
            id: 'coupon_discount',
            discountAction: discountAction,
            discountCategory: "coupon",
            maxValue: maxValue,
        };
        return discountInterfaceObj;
    }
    getBxGyDiscountFromOrder(getCouponInfoDto) {
        const { couponInfoDto, coupon_id, itemInfo } = getCouponInfoDto;
        const { applicableOn, applicableType, applicableDType, maxValue, minAmount, name, } = couponInfoDto;
        const itemTotal = (0, common_function_lib_1.getCartItemTotal)(itemInfo);
        if (itemTotal <= minAmount) {
            return null;
        }
        const discountCal = this.calculateAppliedOnBxGyItems(couponInfoDto, itemInfo);
        if (discountCal && discountCal.status) {
            const discountInterfaceObj = {
                name: name,
                discountType: discountCal.applicableDType,
                value: discountCal.discountValue,
                applicableOn: applicableOn,
                discountApplicableType: this.getDiscountApplicableType(applicableType),
                id: 'coupon_discount',
                discountAction: "normal",
                discountCategory: "coupon",
                maxValue: maxValue,
            };
            return discountInterfaceObj;
        }
    }
    verifyAppliedOnItems(applicableInfo, itemInfo) {
        const { applicableType, applicableOn } = applicableInfo;
        if (applicableType === 0) {
            return true;
        }
        else {
            const key = this.getAppliedOnKey(applicableType);
            for (const i in itemInfo) {
                for (const j in applicableOn) {
                    if (itemInfo[i][key] === applicableOn[j]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    getAppliedOnKey(applicableType) {
        switch (applicableType) {
            case 0:
                return 'order';
            case 1:
                return 'categoryId';
            case 2:
                return 'subcategoryId';
            case 3:
                return 'itemId';
            default:
                return '';
        }
    }
    getDiscountApplicableType(applicableType) {
        switch (applicableType) {
            case 0:
                return "overAll";
            case 1:
                return "category";
            case 2:
                return "subCategory";
            case 3:
                return "item";
            default:
                return null;
        }
    }
    calculateAppliedOnBxGyItems(coupon_info, itemInfo) {
        const response = {
            status: false,
            discountValue: 0,
            applicableDType: null,
        };
        const { requiredList, applicableOn, applicableQuantity, applicableType, discountType, applicableDType, maxValue, } = coupon_info;
        let applicableDValue = coupon_info.applicableDValue;
        if (applicableType === 0) {
            return response;
        }
        else {
            const key = this.getAppliedOnKey(applicableType);
            const appliedItem = { present: 0, qty: 0, price: 0 };
            const applicableList = [];
            for (const i in itemInfo) {
                for (const j in applicableOn) {
                    if (itemInfo[i][key] === applicableOn[j]) {
                        appliedItem.present = 1;
                        const itemY = {
                            qty: itemInfo[i].quantity,
                            price: itemInfo[i].price,
                        };
                        applicableList.push(itemY);
                    }
                }
            }
            if (applicableList.length) {
                applicableList.sort((a, b) => a.price - b.price);
                let requiredQty = applicableQuantity;
                for (const item of applicableList) {
                    if (requiredQty > 0) {
                        if (item.qty <= requiredQty) {
                            appliedItem.price = appliedItem.price + item.qty * item.price;
                            requiredQty = requiredQty - item.qty;
                            appliedItem.qty = appliedItem.qty + item.qty;
                        }
                        else {
                            appliedItem.price = appliedItem.price + requiredQty * item.price;
                            appliedItem.qty = appliedItem.qty + requiredQty;
                            requiredQty = 0;
                        }
                    }
                }
            }
            if (appliedItem.present && appliedItem.qty == applicableQuantity) {
                for (const l in requiredList) {
                    const listData = requiredList[l];
                    const listKey = this.getAppliedOnKey(listData.type);
                    const listQuantity = listData.qty;
                    let totalPresent = 0;
                    for (const i in itemInfo) {
                        for (const j in listData.on) {
                            if (itemInfo[i][listKey] === listData.on[j]) {
                                totalPresent += itemInfo[i].quantity;
                            }
                        }
                    }
                    if (totalPresent < listQuantity) {
                        return response;
                    }
                }
                if (discountType === 'bxgy') {
                    response.status = true;
                    response.discountValue = appliedItem.price;
                    response.applicableDType = "fixed";
                    return response;
                }
                else if (discountType === 'bxgyoz') {
                    response.applicableDType = applicableDType;
                    switch (applicableDType) {
                        case "fixed":
                            let useValue = applicableDValue;
                            if (applicableDValue > appliedItem.price) {
                                useValue = appliedItem.price;
                            }
                            if (useValue > maxValue) {
                                useValue = maxValue;
                            }
                            response.discountValue = useValue;
                            response.status = true;
                            break;
                        case "percentage":
                            if (applicableDValue > 100) {
                                applicableDValue = 100;
                            }
                            let percentageValue = (applicableDValue * appliedItem.price) / 100;
                            if (percentageValue > maxValue) {
                                percentageValue = maxValue;
                            }
                            response.discountValue = percentageValue;
                            response.status = true;
                            response.applicableDType = "fixed";
                            break;
                    }
                    return response;
                }
            }
            else {
                return response;
            }
        }
    }
    getMerchantDiscountInterface(getMerchantDiscountInterfaceDto) {
        const { type, value, discountType, id, reason } = getMerchantDiscountInterfaceDto;
        const discountInterfaceObj = {
            name: 'Merchant',
            discountType: discountType,
            value: value,
            applicableOn: [],
            discountApplicableType: "overAll",
            id: id,
            discountAction: null,
            discountCategory: null,
            maxValue: null,
            reason: reason,
        };
        if (type === "normal") {
            discountInterfaceObj.discountAction = "normal";
            discountInterfaceObj.discountCategory = "merchant";
        }
        else if (type === "topUp") {
            discountInterfaceObj.discountAction = "topUp";
            discountInterfaceObj.discountCategory = "topUp";
        }
        return discountInterfaceObj;
    }
    getItemLevelDiscountInterface(getItemLevelDiscountInterfaceDto) {
        const { value, discountType, id, orderItemId, itemInfo, reason } = getItemLevelDiscountInterfaceDto;
        let { quantity } = getItemLevelDiscountInterfaceDto;
        const itemData = itemInfo.find(item => {
            if (item.orderItemId === orderItemId) {
                return true;
            }
        });
        if (itemData) {
            const itemPrice = itemData.price * itemData.quantity;
            if (quantity > itemData.quantity) {
                quantity = itemData.quantity;
            }
            let useValue = value * quantity;
            if (discountType !== "percentage" && useValue > itemPrice) {
                useValue = itemPrice;
            }
            if (quantity < 0 || itemData.quantity < 0) {
                useValue = 0;
            }
            const discountInterfaceObj = {
                name: 'Item Level',
                discountType: discountType,
                value: useValue,
                applicableOn: [orderItemId],
                discountApplicableType: "orderItemId",
                id: id,
                discountAction: "normal",
                discountCategory: "itemLevel",
                maxValue: null,
                reason: reason,
            };
            return discountInterfaceObj;
        }
    }
}
exports.DiscountCalculationService = DiscountCalculationService;
//# sourceMappingURL=discountCalculation.service.js.map