"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountCalculationDtoImpl = exports.ChargesObjImpl = exports.ItemCalculationDtoImpl = exports.DeliveryInfoImpl = exports.ItemInfoDtoImpl = exports.CartCalculationInfo = exports.CartItemInfo = void 0;
class CartItemInfo {
}
exports.CartItemInfo = CartItemInfo;
class CartCalculationInfo extends CartItemInfo {
    init(cartItemInfo) {
        Object.assign(this, cartItemInfo);
        this.appliedCharges = 0;
        this.appliedDiscount = 0;
        this.effectivePrice = this.price * this.quantity;
    }
}
exports.CartCalculationInfo = CartCalculationInfo;
class ItemInfoDtoImpl {
    constructor() {
        this.itemInfo = [];
        this.itemTotal = 0;
        this.deliveryInfo = null;
        this.charges = [];
        this.commission = [];
        this.isCouponDiscountApplied = false;
        this.couponDiscount = 0;
        this.discountName = '';
        this.discountMessage = '';
        this.loyaltyAmount = 0;
    }
}
exports.ItemInfoDtoImpl = ItemInfoDtoImpl;
class DeliveryInfoImpl {
    constructor(distance, fee, discount) {
        this.distance = distance;
        this.fee = fee;
        this.discount = discount;
    }
}
exports.DeliveryInfoImpl = DeliveryInfoImpl;
class ItemCalculationDtoImpl {
    constructor(originalItemId = '', price = 0, quantity = 0, discount = 0, itemId = '', subCatId = '', catId = '', itemLevelDiscount = {}, effectivePrice = 0, loyaltyItemAmount = 0, serviceCharge = 0, itemCharges = []) {
        this.originalItemId = originalItemId;
        this.price = price;
        this.quantity = quantity;
        this.discount = discount;
        this.itemId = itemId;
        this.subCatId = subCatId;
        this.catId = catId;
        this.itemLevelDiscount = itemLevelDiscount;
        this.effectivePrice = effectivePrice;
        this.loyaltyItemAmount = loyaltyItemAmount;
        this.serviceCharge = serviceCharge;
        this.itemCharges = itemCharges;
    }
}
exports.ItemCalculationDtoImpl = ItemCalculationDtoImpl;
class ChargesObjImpl {
    constructor(value, name, id) {
        this.value = value;
        this.name = name;
        this.id = id;
    }
}
exports.ChargesObjImpl = ChargesObjImpl;
class DiscountCalculationDtoImpl {
    constructor(itemLevel, coupon, merchant) {
        this.itemLevel = itemLevel;
        this.coupon = coupon;
        this.merchant = merchant;
    }
}
exports.DiscountCalculationDtoImpl = DiscountCalculationDtoImpl;
//# sourceMappingURL=cartItemInfo.js.map