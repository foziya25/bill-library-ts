"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillObjectDto = void 0;
const common_function_lib_1 = require("../lib/common.function.lib");
class BillObjectDto {
    constructor(order_id = '', restaurant_id = '', user_id = '', curr_code = '') {
        const epoch = Date.now();
        this.bill_id = (0, common_function_lib_1.generateRandomString)(10) + epoch.toString();
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
        this.date = new Date(epoch).toISOString().split('T')[0];
        this.timestamp = epoch;
    }
}
exports.BillObjectDto = BillObjectDto;
//# sourceMappingURL=billInfo.dto.js.map