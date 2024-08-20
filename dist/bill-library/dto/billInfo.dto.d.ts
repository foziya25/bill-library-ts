export declare class BillObjectDto {
    bill_id: string;
    order_id: string;
    payments: any[];
    user_id: string;
    restaurant_id: string;
    curr_code: string;
    fees: any[];
    item_total: number;
    tax: number;
    bill_total: number;
    savings: number;
    earnings: number;
    balance: number;
    paid: number;
    subtotal: number;
    date: string;
    timestamp: number;
    constructor(order_id?: string, restaurant_id?: string, user_id?: string, curr_code?: string);
}
