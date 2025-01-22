import {RoundOffObj} from './bill-library/baseClass/roundOff';
import {BillObjectDto} from './bill-library/dto/billInfo.dto';
import {BillResponseInterface} from './bill-library/interfaces/billResponse.interface';
import {
  getCartItemInfoNew,
  getOrderItemInfoNew,
  getRoundOffDisableStatus,
} from './bill-library/lib/common.function.lib';
import {BillLibraryService} from './bill-library/services/billLibrary.service';
import {BillOfflineCalculationService} from './bill-library/services/billOffline.service';
import {ChargesService} from './bill-library/services/charges-service';
import {DiscountLibService} from './bill-library/services/discount-lib.service';
import {DiscountService} from './bill-library/services/discount-service';
import {DiscountCalculationService} from './bill-library/services/discountCalculation.service';
import {OrderService} from './bill-library/services/order-service';
import {CountryMapping} from './enums/country.enum';
import {localize} from './locale/i18n';
import {getLocalizedData} from './utils/number-format';

//Not in use
export function calculateBill(
  cartItemInfo,
  discountInfo,
  chargesInfo,
  rest_round_off: any,
  country_code = 'MY',
  platform,
  restaurant_platform,
) {
  const discountLibrary = new DiscountLibService();
  const billLibrary = new BillLibraryService();
  const discountCalculation = new DiscountCalculationService();
  const billOfflineCalculationService = new BillOfflineCalculationService(
    discountLibrary,
    billLibrary,
    discountCalculation,
  );
  const round_off = new RoundOffObj();
  if (rest_round_off) {
    if (rest_round_off.base_roundoff) {
      round_off.baseRoundOff = rest_round_off.base_roundoff;
    }
    if (rest_round_off.round_off_close) {
      round_off.roundOffClose = rest_round_off.round_off_close;
    }
    if (rest_round_off.roundup) {
      round_off.roundUp = rest_round_off.roundup;
    }
  }

  return billOfflineCalculationService.getOrderBill(
    cartItemInfo,
    discountInfo,
    chargesInfo,
    round_off,
    country_code,
    platform,
    restaurant_platform,
  );
}

//get cart bill
// Remove delivery and loyalty from cart
export function calculateOfflineCartBill(
  cart: any,
  restFee: any,
  coupon_info: any,
  offlinePlatform: any,
  platform: string,
  rest_round_off: any,
  taxAfterDiscount = 1,
  country_code = 'MY',
) {
  const discountLibrary = new DiscountLibService();
  const billLibrary = new BillLibraryService();
  const discountCalculation = new DiscountCalculationService();
  const billOfflineCalculationService = new BillOfflineCalculationService(
    discountLibrary,
    billLibrary,
    discountCalculation,
  );
  const order_type = cart.order_type;
  const round_off = new RoundOffObj();
  if (rest_round_off) {
    if (rest_round_off.base_roundoff) {
      round_off.baseRoundOff = rest_round_off.base_roundoff;
    }
    if (rest_round_off.roundup) {
      round_off.roundUp = rest_round_off.roundup;
    }
    if (rest_round_off.round_off_close) {
      round_off.roundOffClose = getRoundOffDisableStatus(
        order_type,
        rest_round_off.round_off_close,
      );
    }
  }

  // New get cart bill

  if (country_code === 'MY') {
    return billOfflineCalculationService.getOfflineCartBill(
      cart,
      restFee,
      coupon_info,
      offlinePlatform,
      platform,
      round_off,
      country_code,
    );
  } else {
    return billOfflineCalculationService.getIndonesiaOfflineCartBill(
      cart,
      restFee,
      coupon_info,
      offlinePlatform,
      platform,
      round_off,
      country_code,
      taxAfterDiscount,
    );
  }
}

//get order bill
export function calculateOfflineOrderBill(
  order,
  restFee,
  coupon_info,
  order_bill,
  offlinePlatform: any,
  rest_round_off,
  taxAfterDiscount = 1,
  country_code = 'MY',
) {
  const discountLibrary = new DiscountLibService();
  const billLibrary = new BillLibraryService();
  const discountCalculation = new DiscountCalculationService();
  const billOfflineCalculationService = new BillOfflineCalculationService(
    discountLibrary,
    billLibrary,
    discountCalculation,
  );
  const order_type = order.order_type;
  const round_off = new RoundOffObj();
  if (rest_round_off) {
    if (rest_round_off.base_roundoff) {
      round_off.baseRoundOff = rest_round_off.base_roundoff;
    }
    if (rest_round_off.roundup) {
      round_off.roundUp = rest_round_off.roundup;
    }
    if (rest_round_off.round_off_close) {
      round_off.roundOffClose = getRoundOffDisableStatus(
        order_type,
        rest_round_off.round_off_close,
      );
    }
  }

  // New get order bill ==> create or updateorderbill

  if (country_code === 'MY') {
    return billOfflineCalculationService.getOfflineOrderBill(
      order,
      restFee,
      coupon_info,
      order_bill,
      offlinePlatform,
      round_off,
      country_code,
    );
  } else {
    return billOfflineCalculationService.getIndonesiaOfflineOrderBill(
      order,
      restFee,
      coupon_info,
      order_bill,
      offlinePlatform,
      round_off,
      country_code,
      taxAfterDiscount,
    );
  }
}

export function calculateOfflineOrderBill2(
  order: any,
  restaurantDetails: any,
  discountInfo: any | null = null,
  oldOrderBill: any | null = null,
) {
  let response: BillResponseInterface | any = {
    fees: [],
    bill_total: 0,
    message: 'Bill generated',
    status: 1,
    item_info: {},
    // bill_total_text: '0',
  };
  const subtotal = oldOrderBill ? oldOrderBill.subtotal : null;
  const {orderBill, itemInfo} = getOrderBill(
    order,
    restaurantDetails,
    restaurantDetails.language,
    order.platform,
    subtotal,
    order.currency.curr_code,
    oldOrderBill,
    discountInfo,
  );
  response.bill_total = orderBill.bill_total;
  response.fees = orderBill.fees;
  const quantity_keys_to_format = ['value', 'bill_total'];
  response = response = getLocalizedData(
    response,
    '',
    restaurantDetails.country_code,
    [],
    quantity_keys_to_format,
  );
  response.item_info = itemInfo;
  return response;
}

export function calculateOfflineCartBill2(
  cart: any,
  restaurantDetails: any,
  discountInfo: any | null = null,
  platform: string,
) {
  let response: BillResponseInterface = {
    fees: [],
    bill_total: 0,
    message: 'Bill generated',
    status: 1,
    // bill_total_text: '0',
  };
  const bill = getCartBill(
    cart,
    restaurantDetails,
    restaurantDetails.language,
    platform,
    discountInfo,
    restaurantDetails.country_code,
  );
  response.bill_total = bill.bill_total;
  response.fees = bill.fees;
  const quantity_keys_to_format = ['value', 'bill_total'];
  response = response = getLocalizedData(
    response,
    '',
    restaurantDetails.country_code,
    [],
    quantity_keys_to_format,
  );
  return response;
}

// New Function which will be called by Offline for order
export function getOrderBill(
  order: any,
  restaurantDetails: any,
  language = 'en-US',
  platform = 'easyeat',
  subtotal: number | null = null,
  currCode = 'MYR',
  oldOrderBill: any | null = null,
  couponInfo: any | null = null,
) {
  const chargesService = new ChargesService();
  const discountService = new DiscountService();
  const orderService = new OrderService(chargesService, discountService);
  // Extract relevant information
  const orderId = order['order_id'];
  const orderItems = order['items'];
  const countryCode =
    order['country_code'] || CountryMapping.MALAYSIA['country_code'];
  const customDeliveryFee = order['delivery_fee'] || 0;

  // Create a new bill object
  const bill = new BillObjectDto(
    orderId,
    order['restaurant_id'],
    order['user_id'],
    currCode,
  );
  bill.payments = oldOrderBill ? oldOrderBill['payments'] : [];

  // Fetch round-off details
  const roundOff = orderService.getRoundOffObject(
    restaurantDetails,
    order['order_type'],
  );

  // Initialize order fees array
  const orderFees = [];

  // Fetch delivery information
  const deliveryInfo = orderService.getDeliveryObj(order, oldOrderBill);

  // Calculate and add item total fee
  let itemInfoDto = getOrderItemInfoNew(
    orderItems,
    order['order_type'],
    deliveryInfo,
  );
  const itemTotalFee = {
    name: localize('itemTotal', language),
    id: 'item_total',
    value: itemInfoDto.itemTotal,
  };
  if (itemInfoDto.itemTotal) orderFees.push(itemTotalFee);

  // Calculate and add delivery fee
  const deliveryFee = orderService.calculateAndAddDeliveryFee(
    itemInfoDto,
    customDeliveryFee,
    language,
  );
  if (deliveryFee) orderFees.push(deliveryFee);

  // Calculate and apply discount
  let discountValue = 0;
  const discountFee = orderService.calculateAndApplyDiscount(
    order,
    couponInfo,
    itemInfoDto,
    language,
  );
  if (discountFee) {
    orderFees.push(discountFee);
    discountValue = discountFee.fee;
  }

  // Calculate and add loyalty cashback
  const loyaltyFee = orderService.calculateAndUpdateLoyaltyCashback(
    order,
    itemInfoDto,
    oldOrderBill,
  );
  if (loyaltyFee) orderFees.push(loyaltyFee);

  // Calculate and apply charges
  itemInfoDto = orderService.calculateAndApplyCharges(
    order,
    platform,
    restaurantDetails,
    countryCode,
    itemInfoDto,
  );

  // Apply platform charges automatically if order is placed by 'auto'
  if (order['order_by'] == 'auto') {
    const platformFeeObj = orderService.calculateAndApplyPlatformChargesAuto(
      restaurantDetails,
      platform,
      itemInfoDto,
      discountValue,
      customDeliveryFee,
      bill,
    );
    if (platformFeeObj) orderFees.push(platformFeeObj);
  } else {
    // Apply charges and calculate commission for non-automatic orders
    const feesObjects = orderService.applyChargesAndCalculateCommission(
      itemInfoDto,
      platform,
      restaurantDetails,
    );
    orderFees.push(...feesObjects);
  }

  // Calculate and add top-up fee
  const topUpFee = orderService.getTopUpFeeObj(order, language);
  if (topUpFee['status'] == 1) orderFees.push(topUpFee['fee']);

  // Update bill with calculated fees and subtotal
  bill.fees = orderFees;
  if (subtotal) bill.subtotal = subtotal;

  // Convert bill object to array and recalculate
  const orderBill = orderService.reCalculateAndUpdateBill(
    bill as any,
    roundOff,
    language,
  );

  return {orderBill, itemInfo: itemInfoDto.itemInfo};
}

// New Function which will be called by Offline for cart
export function getCartBill(
  cart: any,
  restaurantDetails: any,
  language = 'en-US',
  platform = 'easyeat',
  couponInfo: any | null = null,
  countryCode = 'MY',
) {
  const chargesService = new ChargesService();
  const discountService = new DiscountService();
  const orderService = new OrderService(chargesService, discountService);
  // Extract relevant information
  const cartId = cart['token'];
  const cartItems = cart['cart_items'];
  const customDeliveryFee = cart['delivery_fee'] || 0;

  // Create a new bill object
  const bill = new BillObjectDto(
    cartId,
    cart['current_restaurant_id'],
    cart['user_id'],
    '',
  );

  // Fetch round-off details
  const roundOff = orderService.getRoundOffObject(
    restaurantDetails,
    cart['order_type'],
  );

  // Initialize order fees array
  const orderFees = [];

  // Fetch delivery information

  // Calculate and add item total fee
  let itemInfoDto = getCartItemInfoNew(
    cartItems,
    cart['order_type'],
    platform,
    null,
  );
  const itemTotalFee = {
    name: localize('itemTotal', language),
    id: 'item_total',
    value: itemInfoDto.itemTotal,
  };
  if (itemInfoDto.itemTotal) orderFees.push(itemTotalFee);

  // Calculate and add delivery fee
  const deliveryFee = orderService.calculateAndAddDeliveryFee(
    itemInfoDto,
    customDeliveryFee,
    language,
  );
  if (deliveryFee) orderFees.push(deliveryFee);

  // Calculate and apply discount
  let discountValue = 0;
  const discountFee = orderService.calculateAndApplyDiscount(
    cart,
    couponInfo,
    itemInfoDto,
    language,
    true,
  );
  if (discountFee) {
    orderFees.push(discountFee);
    discountValue = discountFee.fee;
  }

  // Calculate and add loyalty cashback

  // Calculate and apply charges
  itemInfoDto = orderService.calculateAndApplyCharges(
    cart,
    platform,
    restaurantDetails,
    countryCode,
    itemInfoDto,
  );

  // Apply platform charges automatically if order is placed by 'auto'
  if (cart['order_by'] == 'auto') {
    const platformFeeObj = orderService.calculateAndApplyPlatformChargesAuto(
      restaurantDetails,
      platform,
      itemInfoDto,
      discountValue,
      customDeliveryFee,
      bill,
    );
    if (platformFeeObj) orderFees.push(platformFeeObj);
  } else {
    // Apply charges and calculate commission for non-automatic orders
    const feesObjects = orderService.applyChargesAndCalculateCommission(
      itemInfoDto,
      platform,
      restaurantDetails,
    );
    orderFees.push(...feesObjects);
  }

  // Calculate and add top-up fee
  const topUpFee = orderService.getTopUpFeeObj(cart, language);
  if (topUpFee['status'] == 1) orderFees.push(topUpFee['fee']);

  // Update bill with calculated fees and subtotal
  bill.fees = orderFees;

  const orderBill = orderService.reCalculateAndUpdateBill(
    bill as any,
    roundOff,
    language,
  );

  // Return the modified itemInfoDto
  return orderBill;
}
