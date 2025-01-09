"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomString = exports.getPlatformCommission = exports.getRoundOffDisableStatus = exports.getCartItemTotal = exports.getTransformedRestaurantCharges = exports.getOrderItemInfoNew = exports.getOrderItemInfo = exports.getCartItemInfoNew = exports.getCartItemInfo = exports.getRoundOffValue = exports.calculateAddonVariantPrice = void 0;
const cartItemInfo_1 = require("../baseClass/cartItemInfo");
const common_enum_1 = require("../enum/common.enum");
const calculateAddonVariantPrice = (itemInfo) => {
    let totalPrice = 0;
    if (itemInfo.addons) {
        itemInfo.addons.forEach(addon => {
            totalPrice += addon.price * addon.quantity;
        });
    }
    if (itemInfo.variants) {
        itemInfo.variants.forEach(variations => {
            if (variations.options) {
                variations.options.forEach(option => {
                    totalPrice += option.price;
                });
            }
        });
    }
    return totalPrice;
};
exports.calculateAddonVariantPrice = calculateAddonVariantPrice;
const getRoundOffValue = (value, round_off) => {
    if (round_off.roundOffClose) {
        return value;
    }
    else {
        let base = round_off.baseRoundOff;
        const roundUp = round_off.roundUp;
        const roundDown = round_off.roundDown;
        base = base > 0 ? base : 1;
        const a = parseInt((Number(value) / base).toString()) * base;
        const b = a + base;
        if (roundDown && !roundUp) {
            return Number((value - a).toFixed(2)) != base ? a : b;
        }
        return Number((value - a).toFixed(2)) >= Number((b - value).toFixed(2)) ||
            (roundUp == true && Number((value - a).toFixed(2)) > 0)
            ? b
            : a;
    }
};
exports.getRoundOffValue = getRoundOffValue;
function getPriceKeyByOrderType(orderType, platform) {
    if (platform == common_enum_1.Platform.EASYEAT) {
        if (orderType == 1) {
            return 'delivery_price';
        }
        else if (orderType == 2) {
            return 'takeaway_price';
        }
        else {
            return 'price';
        }
    }
    else {
        return 'original_price';
    }
}
function getCartItemInfo(items, orderType, platform) {
    const cartItemInfo = [];
    const priceKey = getPriceKeyByOrderType(orderType, platform);
    if (items && items.length) {
        items.forEach(item => {
            const { addons, new_variation } = item;
            const cartItemInfoObj = {
                addons: [],
                variants: [],
                price: item[priceKey],
                quantity: item.quantity,
                subcategoryId: item.subcategory_id,
                categoryId: item.category_id,
                itemId: item.item_id,
                orderItemId: item.cart_item_id,
            };
            if (addons && addons.length) {
                addons.forEach(addon => {
                    const addonInfo = {
                        id: addon.id,
                        price: addon.price,
                        quantity: addon.qty,
                    };
                    cartItemInfoObj.addons.push(addonInfo);
                });
            }
            cartItemInfo.push(cartItemInfoObj);
        });
    }
    return cartItemInfo;
}
exports.getCartItemInfo = getCartItemInfo;
function getCartItemInfoNew(items, orderType, platform = 'easyeat', deliveryInfo = null) {
    const cartItemInfo = new cartItemInfo_1.ItemInfoDtoImpl();
    if (orderType === 1 && deliveryInfo) {
        cartItemInfo.deliveryInfo = new cartItemInfo_1.DeliveryInfoImpl(deliveryInfo['distance'], deliveryInfo['fee'], 0);
    }
    const priceKey = getPriceKeyByOrderType(orderType, platform);
    if (items.length > 0) {
        for (const item of items) {
            const itemLevelDiscount = [{ value: 0, qty: 0 }];
            const itemCalculationObj = new cartItemInfo_1.ItemCalculationDtoImpl(item['item_id'], item[priceKey], item['quantity'], 0, item['cart_item_id'], item['subcategory_id'], item['category_id'], itemLevelDiscount, item[priceKey] * item['quantity'], 0);
            cartItemInfo.itemInfo.push(itemCalculationObj);
            cartItemInfo.itemTotal += item[priceKey] * item['quantity'];
        }
    }
    return cartItemInfo;
}
exports.getCartItemInfoNew = getCartItemInfoNew;
function getOrderItemInfo(items) {
    const orderItemInfo = [];
    if (items && items.length) {
        items.forEach(item => {
            const { addons, new_variation } = item;
            const orderItemInfoObj = {
                addons: [],
                variants: [],
                price: item.item_price,
                quantity: item.item_quantity,
                subcategoryId: item.subcategory_id,
                categoryId: item.category_id,
                itemId: item.item_id,
                orderItemId: item.order_item_id,
            };
            if (addons && addons.length) {
                addons.forEach(addon => {
                    const addonInfo = {
                        id: addon.id,
                        price: addon.price,
                        quantity: addon.qty,
                    };
                    orderItemInfoObj.addons.push(addonInfo);
                });
            }
            orderItemInfo.push(orderItemInfoObj);
        });
    }
    return orderItemInfo;
}
exports.getOrderItemInfo = getOrderItemInfo;
function getOrderItemInfoNew(items, orderType, deliveryInfo = null) {
    const orderItemInfo = new cartItemInfo_1.ItemInfoDtoImpl();
    if (orderType === 1 && deliveryInfo) {
        orderItemInfo.deliveryInfo = new cartItemInfo_1.DeliveryInfoImpl(deliveryInfo['distance'], deliveryInfo['fee'], 0);
    }
    if (items.length > 0) {
        for (const item of items) {
            if (item['item_status'] != 5 && item['item_status'] != 6) {
                const itemLevelDiscount = { value: 0, qty: 0 };
                const itemCalculationObj = new cartItemInfo_1.ItemCalculationDtoImpl(item['item_id'], item['item_price'], item['item_quantity'], 0, item['order_item_id'], item['subcategory_id'], item['category_id'], itemLevelDiscount, item['item_price'] * item['item_quantity'], 0);
                orderItemInfo.itemInfo.push(itemCalculationObj);
                orderItemInfo.itemTotal += item['item_price'] * item['item_quantity'];
            }
        }
    }
    return orderItemInfo;
}
exports.getOrderItemInfoNew = getOrderItemInfoNew;
function getTransformedRestaurantCharges(charges, order_type, skip_packaging_charge_operation = false, packagingChargeDisabled = false, skip_service_charge_operation = false) {
    const chargesList = [];
    if (charges === null || charges === void 0 ? void 0 : charges.length) {
        charges.forEach(charge => {
            const { order_type: applicableOrderType } = charge;
            if ((skip_packaging_charge_operation || packagingChargeDisabled) &&
                charge.class === 'packaging_charge') {
                return;
            }
            else if (skip_service_charge_operation &&
                charge.class === 'service_tax') {
                return;
            }
            if (charge.status && charge.id !== 'delivery') {
                const applicable = applicableOrderType.find(ot => {
                    if (ot === order_type) {
                        return true;
                    }
                });
                if (applicable != undefined) {
                    const chargeInfo = getChargesTypeAndValue(charge.type, charge.data);
                    const applicableInfo = getApplicableOnInfo(charge.applicable_on, charge.applicable_subcat);
                    const restCharge = {
                        chargeType: chargeInfo.type,
                        chargeValue: chargeInfo.value,
                        applicableOn: applicableInfo.applicableList,
                        chargeApplicableType: applicableInfo.chargeApplicableType,
                        id: charge.id,
                        name: charge.sub_name,
                        class: charge.class,
                        subName: charge.sub_name,
                    };
                    if (restCharge.chargeType == "percentage") {
                        restCharge.name =
                            restCharge.name + ' @' + restCharge.chargeValue + '%';
                    }
                    chargesList.push(restCharge);
                }
            }
        });
    }
    return chargesList;
}
exports.getTransformedRestaurantCharges = getTransformedRestaurantCharges;
function getChargesTypeAndValue(chargeType, data) {
    switch (chargeType) {
        case 'fixed':
            return { type: "fixed", value: data.fixed_amount };
        case 'percentage':
            return { type: "percentage", value: data.percentage_amount };
    }
}
function getApplicableOnInfo(applicableOn, applicableSubcat) {
    if (applicableOn[0] === 'category') {
        return {
            chargeApplicableType: "subCategory",
            applicableList: applicableSubcat,
        };
    }
    else if (applicableOn[0] === 'order') {
        return {
            chargeApplicableType: "order",
            applicableList: [],
        };
    }
}
function getCartItemTotal(itemInfo) {
    let itemTotal = 0;
    itemInfo.forEach(item => {
        itemTotal += item.price * item.quantity;
    });
    return itemTotal;
}
exports.getCartItemTotal = getCartItemTotal;
function getRoundOffDisableStatus(order_type, round_off_close) {
    let response = false;
    const orderTypeMask = common_enum_1.RoundOffMasks[order_type];
    if (round_off_close && orderTypeMask & round_off_close) {
        response = true;
    }
    return response;
}
exports.getRoundOffDisableStatus = getRoundOffDisableStatus;
function getPlatformCommission(platform, restaurant_platforms, item_total) {
    const fees = {
        name: '',
        value: 0,
        id: 'platform_commision',
    };
    const response = {
        status: 0,
        fees: fees,
    };
    for (const i in restaurant_platforms) {
        const commission = restaurant_platforms[i];
        if (commission['id'] == platform) {
            if (commission['comm_typ'] == 'percentage') {
                fees.value = Number(((item_total * commission['comm_amt']) / 100).toFixed(2));
                fees.name =
                    'Commission(' +
                        commission['name'] +
                        ')@' +
                        commission['comm_amt'] +
                        '%';
            }
            else if (commission['comm_typ'] == 'fixed') {
                fees.value = Number(commission['comm_amt'].toFixed(2));
                fees.name = 'Commission ' + commission['name'];
            }
            if (fees.value > item_total) {
                fees.value = Number(item_total.toFixed(2));
            }
            break;
        }
    }
    if (fees.value > 0) {
        fees.value = -1 * fees.value;
        response.status = 1;
        response.fees = fees;
    }
    return response;
}
exports.getPlatformCommission = getPlatformCommission;
function generateRandomString(length = 10) {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    let randomString = '';
    for (let i = 0; i < length; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return randomString;
}
exports.generateRandomString = generateRandomString;
//# sourceMappingURL=common.function.lib.js.map