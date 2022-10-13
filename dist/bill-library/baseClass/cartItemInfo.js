"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartCalculationInfo = exports.CartItemInfo = void 0;
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
//# sourceMappingURL=cartItemInfo.js.map