import { CartItemInfo } from "../baseClass/cartItemInfo";
import { OrderItemInfo } from "../baseClass/orderItemInfo";
import { CartDiscountDto } from "../discountClasses/cartDiscountDto";
import { OrderDiscountDto } from "../discountClasses/orderDiscountDto";
import { DiscountInterface } from "../interfaces/discount.interface";
export declare class DiscountLibService {
    applyDiscountOnCart(cartItemInfo: CartItemInfo[], discountInfo: DiscountInterface[]): any[];
    applyDiscountOnOrder(orderItemInfo: OrderItemInfo[], discountInfo: DiscountInterface[]): any[];
    calculateCartProportionalDiscount(discount: DiscountInterface, discountDto: CartDiscountDto): CartDiscountDto;
    calculateCartTopUpProportionalDiscount(discount: DiscountInterface, discountDto: CartDiscountDto): CartDiscountDto;
    calculateOrderProportionalDiscount(discount: DiscountInterface, discountDto: OrderDiscountDto): OrderDiscountDto;
    calculateOrderTopUpProportionalDiscount(discount: DiscountInterface, discountDto: OrderDiscountDto): OrderDiscountDto;
    calculateOrderFreeDeliveryDiscount(discount: DiscountInterface, discountDto: OrderDiscountDto): OrderDiscountDto;
    calculateCartFreeDeliveryDiscount(discount: DiscountInterface, discountDto: CartDiscountDto): CartDiscountDto;
    isDiscountApplicableOnCartItem(discount: DiscountInterface, cartItemInfo: CartItemInfo): {
        status: number;
    };
    isDiscountApplicableOnOrderItem(discount: DiscountInterface, orderItemInfo: OrderItemInfo): {
        status: number;
    };
}
