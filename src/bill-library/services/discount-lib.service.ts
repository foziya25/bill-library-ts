import { CartItemInfo } from '../baseClass/cartItemInfo';
import { OrderItemInfo } from '../baseClass/orderItemInfo';
import { CartDiscountDto, CartItemDiscountInfo } from '../discountClasses/cartDiscountDto';
import { OrderDiscountDto, OrderItemDiscountInfo } from '../discountClasses/orderDiscountDto';
import { DiscountAction, DiscountApplicableType, DiscountType } from '../enum/discountLib.enum';
import { DiscountInterface } from '../interfaces/discount.interface';
import { calculateAddonVariantPrice } from '../lib/common.function.lib';

export class DiscountLibService {
  applyDiscountOnCart(cartItemInfo: CartItemInfo[], discountInfo: DiscountInterface[]) {
    const appliedDiscountResponse = [];
    if (discountInfo) {
      discountInfo.forEach((discount) => {
        let discountDto: CartDiscountDto = {
          itemDiscountInfo: [],
          discountValue: 0,
          name: discount.name,
          id: discount.id,
          discountCategory: discount.discountCategory,
          discountAction: discount.discountAction,
          reason: discount.reason,
        };
        cartItemInfo.forEach((item) => {
          const isApplicable = this.isDiscountApplicableOnCartItem(discount, item);
          if (isApplicable.status == 1) {
            const additionalPrice = calculateAddonVariantPrice(item);
            const itemDiscountInfo: CartItemDiscountInfo = {
              cartItemId: item.cartItemId,
              itemDiscountValue: (item.price + additionalPrice) * item.quantity,
            };
            discountDto.itemDiscountInfo.push(itemDiscountInfo);
          }
        });
        switch (discount.discountAction) {
          case DiscountAction.NORMAL:
            discountDto = this.calculateCartProportionalDiscount(discount, discountDto);
            if (discountDto.discountValue < 0) {
              appliedDiscountResponse.push(discountDto);
            }
            break;
          case DiscountAction.TOP_UP:
            discountDto = this.calculateCartTopUpProportionalDiscount(discount, discountDto);
            if (discountDto.discountValue > 0) {
              appliedDiscountResponse.push(discountDto);
            }
            break;
          case DiscountAction.FREE_DELIVERY:
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

  applyDiscountOnOrder(orderItemInfo: OrderItemInfo[], discountInfo: DiscountInterface[]) {
    const appliedDiscountResponse = [];
    if (discountInfo) {
      discountInfo.forEach((discount) => {
        let discountDto: OrderDiscountDto = {
          itemDiscountInfo: [],
          discountValue: 0,
          name: discount.name,
          id: discount.id,
          discountCategory: discount.discountCategory,
          discountAction: discount.discountAction,
          reason: discount.reason,
        };
        orderItemInfo.forEach((item) => {
          const isApplicable = this.isDiscountApplicableOnOrderItem(discount, item);
          if (isApplicable.status == 1) {
            const itemDiscountInfo: OrderItemDiscountInfo = {
              orderItemId: item.orderItemId,
              itemDiscountValue: item.price * item.quantity,
            };
            discountDto.itemDiscountInfo.push(itemDiscountInfo);
          }
        });

        switch (discount.discountAction) {
          case DiscountAction.NORMAL:
            discountDto = this.calculateOrderProportionalDiscount(discount, discountDto);
            if (discountDto.discountValue < 0) {
              appliedDiscountResponse.push(discountDto);
            }
            break;
          case DiscountAction.TOP_UP:
            discountDto = this.calculateOrderTopUpProportionalDiscount(discount, discountDto);
            if (discountDto.discountValue > 0) {
              appliedDiscountResponse.push(discountDto);
            }
            break;
          case DiscountAction.FREE_DELIVERY:
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

  calculateCartProportionalDiscount(discount: DiscountInterface, discountDto: CartDiscountDto) {
    const { discountType, value, maxValue } = discount;
    let itemTotal = 0;
    discountDto.itemDiscountInfo.forEach((itemInfo) => {
      itemTotal += itemInfo.itemDiscountValue;
    });

    switch (discountType) {
      case DiscountType.FIXED:
        let useValue = value;
        if (maxValue && maxValue < value) {
          useValue = maxValue;
        }
        if (itemTotal - useValue >= 0) {
          discountDto.discountValue = useValue;
        } else {
          discountDto.discountValue = itemTotal;
        }
        break;
      case DiscountType.PERCENTAGE:
        const percentageValue = (itemTotal * value) / 100;
        let usePercentValue = percentageValue;
        if (maxValue && maxValue < percentageValue) {
          usePercentValue = maxValue;
        }
        if (itemTotal - usePercentValue >= 0) {
          discountDto.discountValue = usePercentValue;
        } else {
          discountDto.discountValue = itemTotal;
        }
        break;
      default:
        discountDto.discountValue = 0;
        break;
    }

    discountDto.itemDiscountInfo.forEach((itemInfo) => {
      itemInfo.itemDiscountValue = -1 * (itemInfo.itemDiscountValue / itemTotal) * discountDto.discountValue;
    });
    discountDto.discountValue = discountDto.discountValue * -1;
    return discountDto;
  }

  calculateCartTopUpProportionalDiscount(discount: DiscountInterface, discountDto: CartDiscountDto) {
    const { discountType, value, maxValue } = discount;
    let itemTotal = 0;
    discountDto.itemDiscountInfo.forEach((itemInfo) => {
      itemTotal += itemInfo.itemDiscountValue;
    });

    switch (discountType) {
      case DiscountType.FIXED:
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

    discountDto.itemDiscountInfo.forEach((itemInfo) => {
      itemInfo.itemDiscountValue = (itemInfo.itemDiscountValue / itemTotal) * discountDto.discountValue;
    });

    return discountDto;
  }

  calculateOrderProportionalDiscount(discount: DiscountInterface, discountDto: OrderDiscountDto) {
    const { discountType, value, maxValue } = discount;
    let itemTotal = 0;
    discountDto.itemDiscountInfo.forEach((itemInfo) => {
      itemTotal += itemInfo.itemDiscountValue;
    });

    switch (discountType) {
      case DiscountType.FIXED:
        let useValue = value;
        if (maxValue && maxValue < value) {
          useValue = maxValue;
        }
        if (itemTotal - useValue >= 0) {
          discountDto.discountValue = useValue;
        } else {
          discountDto.discountValue = itemTotal;
        }
        break;
      case DiscountType.PERCENTAGE:
        const percentageValue = (itemTotal * value) / 100;
        let usePercentValue = percentageValue;
        if (maxValue && maxValue < percentageValue) {
          usePercentValue = maxValue;
        }
        if (itemTotal - usePercentValue >= 0) {
          discountDto.discountValue = usePercentValue;
        } else {
          discountDto.discountValue = itemTotal;
        }
        break;
      default:
        discountDto.discountValue = 0;
        break;
    }

    discountDto.itemDiscountInfo.forEach((itemInfo) => {
      itemInfo.itemDiscountValue = -1 * (itemInfo.itemDiscountValue / itemTotal) * discountDto.discountValue;
    });
    discountDto.discountValue = discountDto.discountValue * -1;
    return discountDto;
  }

  calculateOrderTopUpProportionalDiscount(discount: DiscountInterface, discountDto: OrderDiscountDto) {
    const { discountType, value, maxValue } = discount;
    let itemTotal = 0;
    discountDto.itemDiscountInfo.forEach((itemInfo) => {
      itemTotal += itemInfo.itemDiscountValue;
    });

    switch (discountType) {
      case DiscountType.FIXED:
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

    discountDto.itemDiscountInfo.forEach((itemInfo) => {
      itemInfo.itemDiscountValue = (itemInfo.itemDiscountValue / itemTotal) * discountDto.discountValue;
    });

    return discountDto;
  }

  calculateOrderFreeDeliveryDiscount(discount: DiscountInterface, discountDto: OrderDiscountDto) {
    const { discountType, value, maxValue } = discount;

    switch (discountType) {
      case DiscountType.FIXED:
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
    discountDto.itemDiscountInfo.forEach((itemInfo) => {
      itemInfo.itemDiscountValue = 0;
    });

    return discountDto;
  }

  calculateCartFreeDeliveryDiscount(discount: DiscountInterface, discountDto: CartDiscountDto) {
    const { discountType, value, maxValue } = discount;

    switch (discountType) {
      case DiscountType.FIXED:
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
    discountDto.itemDiscountInfo.forEach((itemInfo) => {
      itemInfo.itemDiscountValue = 0;
    });

    return discountDto;
  }

  isDiscountApplicableOnCartItem(discount: DiscountInterface, cartItemInfo: CartItemInfo) {
    const response = { status: 0 };
    const { applicableOn, discountApplicableType } = discount;
    switch (discountApplicableType) {
      case DiscountApplicableType.ITEM:
        const itemId = applicableOn.find((ids) => ids === cartItemInfo.itemId);
        if (itemId) {
          response.status = 1;
        }
        break;
      case DiscountApplicableType.CATEGORY:
        const categoryId = applicableOn.find((ids) => ids === cartItemInfo.categoryId);
        if (categoryId) {
          response.status = 1;
        }
        break;
      case DiscountApplicableType.SUB_CATEGORY:
        const subCategoryId = applicableOn.find((ids) => ids === cartItemInfo.subcategoryId);
        if (subCategoryId) {
          response.status = 1;
        }
        break;
      case DiscountApplicableType.CART_ITEM_ID:
        const cartItemId = applicableOn.find((ids) => ids === cartItemInfo.cartItemId);
        if (cartItemId) {
          response.status = 1;
        }
        break;
      case DiscountApplicableType.OVER_ALL:
        response.status = 1;
        break;
      default:
        response.status = 0;
    }
    return response;
  }

  isDiscountApplicableOnOrderItem(discount: DiscountInterface, orderItemInfo: OrderItemInfo) {
    const response = { status: 0 };
    const { applicableOn, discountApplicableType } = discount;
    switch (discountApplicableType) {
      case DiscountApplicableType.ITEM:
        const itemId = applicableOn.find((ids) => ids === orderItemInfo.itemId);
        if (itemId) {
          response.status = 1;
        }
        break;
      case DiscountApplicableType.CATEGORY:
        const categoryId = applicableOn.find((ids) => ids === orderItemInfo.categoryId);
        if (categoryId) {
          response.status = 1;
        }
        break;
      case DiscountApplicableType.SUB_CATEGORY:
        const subCategoryId = applicableOn.find((ids) => ids === orderItemInfo.subcategoryId);
        if (subCategoryId) {
          response.status = 1;
        }
        break;
      case DiscountApplicableType.ORDER_ITEM_ID:
        const orderItemId = applicableOn.find((ids) => ids === orderItemInfo.orderItemId);
        if (orderItemId) {
          response.status = 1;
        }
        break;
      case DiscountApplicableType.OVER_ALL:
        response.status = 1;
        break;
      default:
        response.status = 0;
    }
    return response;
  }
}
