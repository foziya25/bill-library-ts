import {ChargesObjImpl} from '../baseClass/cartItemInfo';
import {ChargeApplicableType, ChargeType} from '../enum/billLib.enum';
import {ChargesInterface} from '../interfaces/charges.interface';
import {ItemInfoDto} from '../interfaces/itemInfo.interface';

export class ChargesService {
  applyChargesOnItems(itemInfoDto: ItemInfoDto, charge: ChargesInterface) {
    const applicableOn = charge.applicableOn;
    const name = charge.name;
    const chargeApplicableType = charge.chargeApplicableType;
    const value = charge.chargeValue;
    const itemInfo = itemInfoDto.itemInfo;
    const chargeType = charge.chargeType;
    let totalPrice = 0;
    let totalQty = 0;
    let chargeValue = value;
    const chargeId = charge.id;

    switch (chargeApplicableType) {
      case ChargeApplicableType.SUB_CATEGORY:
        itemInfo.forEach(itemCal => {
          if ((applicableOn as string[]).includes(itemCal.subCatId)) {
            itemCal.effectivePrice = Math.round(itemCal.effectivePrice * 10000) / 10000;
            totalPrice += itemCal.effectivePrice;
            if (itemCal.effectivePrice > 0) {
              totalQty += itemCal.quantity;
            }
            let itemCharge = 0;
            if (chargeType === ChargeType.PERCENTAGE) {
              itemCharge = (itemCal.effectivePrice * value) / 100;
            } else if (chargeType === ChargeType.FIXED) {
              itemCharge = value * itemCal.quantity;
            }
            itemCharge = Math.round(itemCharge * 10000) / 10000;
            itemCal.itemCharges.push({id: chargeId, value: itemCharge});
          }
        });
        chargeValue = value * totalQty;
        break;
      case ChargeApplicableType.ORDER:
        itemInfo.forEach(itemCal => {
          itemCal.effectivePrice = Math.round(itemCal.effectivePrice * 10000) / 10000;
          totalPrice += itemCal.effectivePrice;
          if (itemCal.effectivePrice > 0) {
            totalQty += itemCal.quantity;
          }
        });

        itemInfo.forEach(itemCal => {
          let itemCharge = 0;
          if (chargeType === ChargeType.PERCENTAGE) {
            itemCharge = (itemCal.effectivePrice * value) / 100;
          } else if (chargeType === ChargeType.FIXED) {
            itemCharge = (itemCal.effectivePrice * value) / totalPrice;
          }
          itemCharge = Math.round(itemCharge * 10000) / 10000;
          itemCal.itemCharges.push({id: chargeId, value: itemCharge});
        });
        break;
    }

    if (totalPrice > 0) {
      switch (chargeType) {
        case ChargeType.FIXED:
          chargeValue = Math.round(chargeValue * 100) / 100;
          itemInfoDto.charges.push(
            new ChargesObjImpl(chargeValue, name, charge.id),
          );
          break;
        case ChargeType.PERCENTAGE:
          chargeValue = (value * totalPrice) / 100;
          chargeValue = Math.round(chargeValue * 100) / 100;
          itemInfoDto.charges.push(
            new ChargesObjImpl(chargeValue, name, charge.id),
          );
          break;
      }
    }

    return itemInfoDto;
  }

  applyIndonesiaChargesOnItems(
    itemInfoDto: ItemInfoDto,
    charge: ChargesInterface,
  ) {
    const applicableOn = charge.applicableOn;
    const name = charge.name;
    const chargeApplicableType = charge.chargeApplicableType;
    const value = charge.chargeValue;
    const itemInfo = itemInfoDto.itemInfo;
    const chargeType = charge.chargeType;
    let totalPrice = 0;
    let totalQty = 0;
    let chargeValue = value;
    const chargeId = charge.id;
    let totalServiceChargeForSst = 0;

    switch (chargeApplicableType) {
      case ChargeApplicableType.SUB_CATEGORY:
        itemInfo.forEach(itemCal => {
          if ((applicableOn as string[]).includes(itemCal.subCatId)) {
            itemCal.effectivePrice = Math.round(itemCal.effectivePrice * 10000) / 10000;
            totalPrice += itemCal.effectivePrice;
            if (itemCal.effectivePrice > 0) {
              totalQty += itemCal.quantity;

              let itemCharge = 0;
              if (chargeType === ChargeType.PERCENTAGE) {
                itemCharge = (itemCal.effectivePrice * value) / 100;
              } else if (chargeType === ChargeType.FIXED) {
                itemCharge = value * itemCal.quantity;
              }
              itemCharge = Math.round(itemCharge * 10000) / 10000;
              itemCal.itemCharges.push({id: chargeId, value: itemCharge});
              if (chargeId === 'service_tax') {
                itemCal.serviceCharge = itemCharge;
              }
              if (
                chargeId.includes('sst_tax') &&
                chargeType === ChargeType.PERCENTAGE
              ) {
                totalServiceChargeForSst += itemCal.serviceCharge;
              }
            }
          }
        });
        chargeValue = value * totalQty;
        break;
      case ChargeApplicableType.ORDER:
        itemInfo.forEach(itemCal => {
          itemCal.effectivePrice = Math.round(itemCal.effectivePrice * 10000) / 10000;
          totalPrice += itemCal.effectivePrice;
          if (itemCal.effectivePrice > 0) {
            totalQty += itemCal.quantity;
          }

          if (chargeId.includes('sst_tax') && chargeType === ChargeType.PERCENTAGE) {
            totalServiceChargeForSst += itemCal.serviceCharge;
          }
        });
        itemInfo.forEach(itemCal => {
          let itemCharge = 0;
          if (chargeType === ChargeType.PERCENTAGE) {
            itemCharge = (itemCal.effectivePrice * value) / 100;
          } else if (chargeType === ChargeType.FIXED) {
            itemCharge = (itemCal.effectivePrice * value) / totalPrice;
          }
          itemCharge = Math.round(itemCharge * 10000) / 10000;
          itemCal.itemCharges.push({id: chargeId, value: itemCharge});
          if (chargeId === 'service_tax') {
            itemCal.serviceCharge = itemCharge;
          }
        });
        break;
    }

    if (totalPrice > 0) {
      switch (chargeType) {
        case ChargeType.FIXED:
          chargeValue = Math.round(chargeValue * 100) / 100;
          itemInfoDto.charges.push(
            new ChargesObjImpl(chargeValue, name, charge.id),
          );
          break;
        case ChargeType.PERCENTAGE:
          if (chargeId.includes('sst_tax')) {
            totalPrice += totalServiceChargeForSst;
          }
          chargeValue = (value * totalPrice) / 100;
          chargeValue = Math.round(chargeValue * 100) / 100;
          itemInfoDto.charges.push(
            new ChargesObjImpl(chargeValue, name, charge.id),
          );
          break;
      }
    }

    return itemInfoDto;
  }
}
