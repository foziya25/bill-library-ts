import { ChargesInterface } from '../interfaces/charges.interface';
import { ItemInfoDto } from '../interfaces/itemInfo.interface';
export declare class ChargesService {
    applyChargesOnItems(itemInfoDto: ItemInfoDto, charge: ChargesInterface): ItemInfoDto;
    applyIndonesiaChargesOnItems(itemInfoDto: ItemInfoDto, charge: ChargesInterface): ItemInfoDto;
}
