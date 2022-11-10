"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartItemTotal = exports.getTransformedRestaurantCharges = exports.getOrderItemInfo = exports.getCartItemInfo = exports.getRoundOffValue = exports.calculateAddonVariantPrice = void 0;
const calculateAddonVariantPrice = (itemInfo) => {
    let totalPrice = 0;
    if (itemInfo.addons) {
        itemInfo.addons.forEach((addon) => {
            totalPrice += addon.price * addon.quantity;
        });
    }
    if (itemInfo.variants) {
        itemInfo.variants.forEach((variations) => {
            if (variations.options) {
                variations.options.forEach((option) => {
                    totalPrice += option.price;
                });
            }
        });
    }
    return totalPrice;
};
exports.calculateAddonVariantPrice = calculateAddonVariantPrice;
const getRoundOffValue = (value, base) => {
    base = base > 0 ? base : 1;
    const a = parseInt((Number(value) / base).toString()) * base;
    const b = a + base;
    return value - a >= b - value ? b : a;
};
exports.getRoundOffValue = getRoundOffValue;
function getPriceKeyByOrderType(orderType) {
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
function getCartItemInfo(items, orderType) {
    const cartItemInfo = [];
    const priceKey = getPriceKeyByOrderType(orderType);
    if (items && items.length) {
        items.forEach((item) => {
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
                addons.forEach((addon) => {
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
function getOrderItemInfo(items) {
    const orderItemInfo = [];
    if (items && items.length) {
        items.forEach((item) => {
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
                addons.forEach((addon) => {
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
function getTransformedRestaurantCharges(charges) {
    const chargesList = [];
    if (charges && charges.length) {
        charges.forEach((charge) => {
            if (charge.status && charge.id !== 'delivery') {
                const chargeInfo = getChargesTypeAndValue(charge.type, charge.data);
                const applicableInfo = getApplicableOnInfo(charge.applicable_on, charge.applicable_subcat);
                const restCharge = {
                    chargeType: chargeInfo.type,
                    chargeValue: chargeInfo.value,
                    applicableOn: applicableInfo.applicableList,
                    chargeApplicableType: applicableInfo.chargeApplicableType,
                    id: charge.id,
                    name: charge.name,
                    class: charge.class,
                    subName: charge.sub_name,
                };
                if (restCharge.chargeType == "percentage") {
                    restCharge.name = restCharge.name + '@' + restCharge.chargeValue + '%';
                }
                chargesList.push(restCharge);
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
            chargeApplicableType: "overAll",
            applicableList: [],
        };
    }
}
function getCartItemTotal(itemInfo) {
    let itemTotal = 0;
    itemInfo.forEach((item) => {
        itemTotal += item.price * item.quantity;
    });
    return itemTotal;
}
exports.getCartItemTotal = getCartItemTotal;
//# sourceMappingURL=common.function.lib.js.map