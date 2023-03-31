"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountLibService = void 0;
const common_function_lib_1 = require("../lib/common.function.lib");
class DiscountLibService {
    applyDiscountOnCart(cartItemInfo, discountInfo) {
        const appliedDiscountResponse = [];
        if (discountInfo) {
            discountInfo.forEach(discount => {
                let discountDto = {
                    itemDiscountInfo: [],
                    discountValue: 0,
                    name: discount.name,
                    id: discount.id,
                    discountCategory: discount.discountCategory,
                    discountAction: discount.discountAction,
                    reason: discount.reason,
                };
                cartItemInfo.forEach(item => {
                    const isApplicable = this.isDiscountApplicableOnCartItem(discount, item);
                    if (isApplicable.status == 1) {
                        const additionalPrice = (0, common_function_lib_1.calculateAddonVariantPrice)(item);
                        const itemDiscountInfo = {
                            cartItemId: item.cartItemId,
                            itemDiscountValue: (item.price + additionalPrice) * item.quantity,
                        };
                        discountDto.itemDiscountInfo.push(itemDiscountInfo);
                    }
                });
                switch (discount.discountAction) {
                    case "normal":
                        discountDto = this.calculateCartProportionalDiscount(discount, discountDto);
                        if (discountDto.discountValue < 0) {
                            appliedDiscountResponse.push(discountDto);
                        }
                        break;
                    case "topUp":
                        discountDto = this.calculateCartTopUpProportionalDiscount(discount, discountDto);
                        if (discountDto.discountValue > 0) {
                            appliedDiscountResponse.push(discountDto);
                        }
                        break;
                    case "freeDelivery":
                        discountDto = this.calculateCartFreeDeliveryDiscount(discount, discountDto);
                        if (discountDto.discountValue < 0) {
                            appliedDiscountResponse.push(discountDto);
                        }
                    default:
                        discountDto.discountValue = 0;
                        discountDto.itemDiscountInfo = [];
                        break;
                }
            });
        }
        return appliedDiscountResponse;
    }
    applyDiscountOnOrder(orderItemInfo, discountInfo) {
        const appliedDiscountResponse = [];
        if (discountInfo) {
            discountInfo.forEach(discount => {
                let discountDto = {
                    itemDiscountInfo: [],
                    discountValue: 0,
                    name: discount.name,
                    id: discount.id,
                    discountCategory: discount.discountCategory,
                    discountAction: discount.discountAction,
                    reason: discount.reason,
                };
                orderItemInfo.forEach(item => {
                    const isApplicable = this.isDiscountApplicableOnOrderItem(discount, item);
                    if (isApplicable.status == 1) {
                        const itemDiscountInfo = {
                            orderItemId: item.orderItemId,
                            itemDiscountValue: item.price * item.quantity,
                        };
                        discountDto.itemDiscountInfo.push(itemDiscountInfo);
                    }
                });
                switch (discount.discountAction) {
                    case "normal":
                        discountDto = this.calculateOrderProportionalDiscount(discount, discountDto);
                        if (discountDto.discountValue < 0) {
                            appliedDiscountResponse.push(discountDto);
                        }
                        break;
                    case "topUp":
                        discountDto = this.calculateOrderTopUpProportionalDiscount(discount, discountDto);
                        if (discountDto.discountValue > 0) {
                            appliedDiscountResponse.push(discountDto);
                        }
                        break;
                    case "freeDelivery":
                        discountDto = this.calculateOrderFreeDeliveryDiscount(discount, discountDto);
                        if (discountDto.discountValue < 0) {
                            appliedDiscountResponse.push(discountDto);
                        }
                        break;
                    default:
                        discountDto.discountValue = 0;
                        discountDto.itemDiscountInfo = [];
                        break;
                }
            });
        }
        return appliedDiscountResponse;
    }
    calculateCartProportionalDiscount(discount, discountDto) {
        const { discountType, value, maxValue } = discount;
        let itemTotal = 0;
        discountDto.itemDiscountInfo.forEach(itemInfo => {
            itemTotal += itemInfo.itemDiscountValue;
        });
        switch (discountType) {
            case "fixed":
                let useValue = value;
                if (maxValue && maxValue < value) {
                    useValue = maxValue;
                }
                if (itemTotal - useValue >= 0) {
                    discountDto.discountValue = useValue;
                }
                else {
                    discountDto.discountValue = itemTotal;
                }
                break;
            case "percentage":
                const percentageValue = (itemTotal * value) / 100;
                let usePercentValue = percentageValue;
                if (maxValue && maxValue < percentageValue) {
                    usePercentValue = maxValue;
                }
                if (itemTotal - usePercentValue >= 0) {
                    discountDto.discountValue = usePercentValue;
                }
                else {
                    discountDto.discountValue = itemTotal;
                }
                break;
            default:
                discountDto.discountValue = 0;
                break;
        }
        discountDto.itemDiscountInfo.forEach(itemInfo => {
            itemInfo.itemDiscountValue =
                -1 *
                    (itemInfo.itemDiscountValue / itemTotal) *
                    discountDto.discountValue;
        });
        discountDto.discountValue = discountDto.discountValue * -1;
        return discountDto;
    }
    calculateCartTopUpProportionalDiscount(discount, discountDto) {
        const { discountType, value, maxValue } = discount;
        let itemTotal = 0;
        discountDto.itemDiscountInfo.forEach(itemInfo => {
            itemTotal += itemInfo.itemDiscountValue;
        });
        switch (discountType) {
            case "fixed":
                let useValue = value;
                if (maxValue && maxValue < value) {
                    useValue = maxValue;
                }
                discountDto.discountValue = useValue;
                break;
            default:
                discountDto.discountValue = 0;
                break;
        }
        discountDto.itemDiscountInfo.forEach(itemInfo => {
            itemInfo.itemDiscountValue =
                (itemInfo.itemDiscountValue / itemTotal) * discountDto.discountValue;
        });
        return discountDto;
    }
    calculateOrderProportionalDiscount(discount, discountDto) {
        const { discountType, value, maxValue } = discount;
        let itemTotal = 0;
        discountDto.itemDiscountInfo.forEach(itemInfo => {
            itemTotal += itemInfo.itemDiscountValue;
        });
        switch (discountType) {
            case "fixed":
                let useValue = value;
                if (maxValue && maxValue < value) {
                    useValue = maxValue;
                }
                if (itemTotal - useValue >= 0) {
                    discountDto.discountValue = useValue;
                }
                else {
                    discountDto.discountValue = itemTotal;
                }
                break;
            case "percentage":
                const percentageValue = (itemTotal * value) / 100;
                let usePercentValue = percentageValue;
                if (maxValue && maxValue < percentageValue) {
                    usePercentValue = maxValue;
                }
                if (itemTotal - usePercentValue >= 0) {
                    discountDto.discountValue = usePercentValue;
                }
                else {
                    discountDto.discountValue = itemTotal;
                }
                break;
            default:
                discountDto.discountValue = 0;
                break;
        }
        discountDto.itemDiscountInfo.forEach(itemInfo => {
            itemInfo.itemDiscountValue =
                -1 *
                    (itemInfo.itemDiscountValue / itemTotal) *
                    discountDto.discountValue;
        });
        discountDto.discountValue = discountDto.discountValue * -1;
        return discountDto;
    }
    calculateOrderTopUpProportionalDiscount(discount, discountDto) {
        const { discountType, value, maxValue } = discount;
        let itemTotal = 0;
        discountDto.itemDiscountInfo.forEach(itemInfo => {
            itemTotal += itemInfo.itemDiscountValue;
        });
        switch (discountType) {
            case "fixed":
                let useValue = value;
                if (maxValue && maxValue < value) {
                    useValue = maxValue;
                }
                discountDto.discountValue = useValue;
                break;
            default:
                discountDto.discountValue = 0;
                break;
        }
        discountDto.itemDiscountInfo.forEach(itemInfo => {
            itemInfo.itemDiscountValue =
                (itemInfo.itemDiscountValue / itemTotal) * discountDto.discountValue;
        });
        return discountDto;
    }
    calculateOrderFreeDeliveryDiscount(discount, discountDto) {
        const { discountType, value, maxValue } = discount;
        switch (discountType) {
            case "fixed":
                let useValue = value;
                if (maxValue && maxValue < value) {
                    useValue = maxValue;
                }
                discountDto.discountValue = useValue;
                break;
            default:
                discountDto.discountValue = 0;
                break;
        }
        discountDto.discountValue = discountDto.discountValue * -1;
        discountDto.itemDiscountInfo.forEach(itemInfo => {
            itemInfo.itemDiscountValue = 0;
        });
        return discountDto;
    }
    calculateCartFreeDeliveryDiscount(discount, discountDto) {
        const { discountType, value, maxValue } = discount;
        switch (discountType) {
            case "fixed":
                let useValue = value;
                if (maxValue && maxValue < value) {
                    useValue = maxValue;
                }
                discountDto.discountValue = useValue;
                break;
            default:
                discountDto.discountValue = 0;
                break;
        }
        discountDto.discountValue = discountDto.discountValue * -1;
        discountDto.itemDiscountInfo.forEach(itemInfo => {
            itemInfo.itemDiscountValue = 0;
        });
        return discountDto;
    }
    isDiscountApplicableOnCartItem(discount, cartItemInfo) {
        const response = { status: 0 };
        const { applicableOn, discountApplicableType } = discount;
        switch (discountApplicableType) {
            case "item":
                const itemId = applicableOn.find(ids => ids === cartItemInfo.itemId);
                if (itemId) {
                    response.status = 1;
                }
                break;
            case "category":
                const categoryId = applicableOn.find(ids => ids === cartItemInfo.categoryId);
                if (categoryId) {
                    response.status = 1;
                }
                break;
            case "subCategory":
                const subCategoryId = applicableOn.find(ids => ids === cartItemInfo.subcategoryId);
                if (subCategoryId) {
                    response.status = 1;
                }
                break;
            case "cartItemId":
                const cartItemId = applicableOn.find(ids => ids === cartItemInfo.cartItemId);
                if (cartItemId) {
                    response.status = 1;
                }
                break;
            case "overAll":
                response.status = 1;
                break;
            default:
                response.status = 0;
        }
        return response;
    }
    isDiscountApplicableOnOrderItem(discount, orderItemInfo) {
        const response = { status: 0 };
        const { applicableOn, discountApplicableType } = discount;
        switch (discountApplicableType) {
            case "item":
                const itemId = applicableOn.find(ids => ids === orderItemInfo.itemId);
                if (itemId) {
                    response.status = 1;
                }
                break;
            case "category":
                const categoryId = applicableOn.find(ids => ids === orderItemInfo.categoryId);
                if (categoryId) {
                    response.status = 1;
                }
                break;
            case "subCategory":
                const subCategoryId = applicableOn.find(ids => ids === orderItemInfo.subcategoryId);
                if (subCategoryId) {
                    response.status = 1;
                }
                break;
            case "orderItemId":
                const orderItemId = applicableOn.find(ids => ids === orderItemInfo.orderItemId);
                if (orderItemId) {
                    response.status = 1;
                }
                break;
            case "overAll":
                response.status = 1;
                break;
            default:
                response.status = 0;
        }
        return response;
    }
}
exports.DiscountLibService = DiscountLibService;
//# sourceMappingURL=discount-lib.service.js.map