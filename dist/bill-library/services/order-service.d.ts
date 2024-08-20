import { BillObjectDto } from '../dto/billInfo.dto';
import { ItemInfoDto } from '../interfaces/itemInfo.interface';
import { ChargesService } from './charges-service';
import { DiscountService } from './discount-service';
export declare class OrderService {
    private chargesService;
    private discountService;
    constructor(chargesService: ChargesService, discountService: DiscountService);
    getDeliveryObj(order: any): any;
    calculateAndAddDeliveryFee(itemInfoDto: ItemInfoDto, customDeliveryFee: number, language: string): any;
    calculateAndApplyDiscount(order: any, couponInfo: any, itemInfoDto: ItemInfoDto, language: string, callingFromGetCart?: boolean): any;
    calculateAndUpdateLoyaltyCashback(order: any, itemInfoDto: ItemInfoDto, oldOrderBill: any): any;
    calculateAndApplyCharges(order: any, platform: string, restaurantDetails: any, country_code: string, itemInfoDto: ItemInfoDto): ItemInfoDto;
    calculateAndApplyPlatformChargesAuto(restaurantDetails: any, platform: string, itemInfoDto: ItemInfoDto, discountValue: number, customDeliveryFee: number, bill: BillObjectDto): any;
    applyChargesAndCalculateCommission(itemInfoDto: ItemInfoDto, platform: string, restaurantDetails: any): any;
    getLoyaltyFromOrderBill(orderBill: any): any;
    reCalculateBill(orderBill: any, roundOff: any, language: string): any;
    prorateLoyalty(itemInfoDto: ItemInfoDto, loyaltyAmount: number): ItemInfoDto;
    getRoundOffObject(restaurantDetails: any, orderType: string): any;
    roundOffDisable(roundOffVal: number, orderType: any): any;
    getTopUpFeeObj(order: any, language: string): any;
    reCalculateAndUpdateBill(orderBill: any, roundOff: any, language: string): any;
}
