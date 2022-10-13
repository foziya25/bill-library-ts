"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderCalculationInfo = exports.OrderItemInfo = void 0;
class OrderItemInfo {
}
exports.OrderItemInfo = OrderItemInfo;
class OrderCalculationInfo extends OrderItemInfo {
    init(orderItemInfo) {
        Object.assign(this, orderItemInfo);
        this.appliedCharges = 0;
        this.appliedDiscount = 0;
        this.effectivePrice = this.price * this.quantity;
    }
}
exports.OrderCalculationInfo = OrderCalculationInfo;
//# sourceMappingURL=orderItemInfo.js.map