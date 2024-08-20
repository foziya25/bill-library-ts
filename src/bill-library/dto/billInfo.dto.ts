import {generateRandomString} from '../lib/common.function.lib';

// A class to represent the details of a bill associated with an order at a restaurant.
export class BillObjectDto {
  // Properties of the BillObjectDto
  public bill_id: string;
  public order_id: string;
  public payments: any[]; // Array to hold payment details
  public user_id: string;
  public restaurant_id: string;
  public curr_code: string;
  public fees: any[]; // Additional fees applied to the bill
  public item_total: number; // Total cost of items before taxes and fees
  public tax: number; // Total tax applied to the bill
  public bill_total: number; // Final total of the bill including items, taxes, and fees
  public savings: number; // Total savings applied to the bill, e.g., discounts
  public earnings: number;
  public balance: number; // Outstanding balance, if any
  public paid: number; // Amount already paid
  public subtotal: number;
  public date: string; // The date of the bill creation in "Y-m-d" format
  public timestamp: number; // Epoch timestamp of the bill creation

  // Constructor to initialize a BillObject with essential details
  constructor(
    order_id: string = '',
    restaurant_id: string = '',
    user_id: string = '',
    curr_code: string = '',
  ) {
    const epoch = Date.now();
    // Generate a unique bill ID combining a random string and current epoch time
    this.bill_id = generateRandomString(10) + epoch.toString();
    this.order_id = order_id;
    this.payments = [];
    this.user_id = user_id;
    this.restaurant_id = restaurant_id;
    this.curr_code = curr_code;
    this.fees = [];
    this.item_total = 0;
    this.tax = 0;
    this.bill_total = 0;
    this.savings = 0;
    this.earnings = 0;
    this.balance = 0;
    this.paid = 0;
    this.subtotal = 0;
    // Convert the current epoch time to a date string
    this.date = new Date(epoch).toISOString().split('T')[0];
    this.timestamp = epoch;
  }
}
