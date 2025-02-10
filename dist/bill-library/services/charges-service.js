"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChargesService = void 0;
const cartItemInfo_1 = require("../baseClass/cartItemInfo");
class ChargesService {
    applyChargesOnItems(itemInfoDto, charge) {
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
            case "subCategory":
                itemInfo.forEach(itemCal => {
                    if (applicableOn.includes(itemCal.subCatId)) {
                        totalPrice += itemCal.effectivePrice;
                        if (itemCal.effectivePrice > 0) {
                            totalQty += itemCal.quantity;
                        }
                        let itemCharge = 0;
                        if (chargeType === "percentage") {
                            itemCharge = (itemCal.effectivePrice * value) / 100;
                        }
                        else if (chargeType === "fixed") {
                            itemCharge = value * itemCal.quantity;
                        }
                        itemCharge = Number((itemCharge).toFixed(4));
                        itemCal.itemCharges.push({ id: chargeId, value: itemCharge });
                    }
                });
                chargeValue = value * totalQty;
                break;
            case "order":
                itemInfo.forEach(itemCal => {
                    totalPrice += itemCal.effectivePrice;
                    if (itemCal.effectivePrice > 0) {
                        totalQty += itemCal.quantity;
                    }
                });
                itemInfo.forEach(itemCal => {
                    let itemCharge = 0;
                    if (chargeType === "percentage") {
                        itemCharge = (itemCal.effectivePrice * value) / 100;
                    }
                    else if (chargeType === "fixed") {
                        itemCharge = (itemCal.effectivePrice * value) / totalPrice;
                    }
                    itemCharge = Number((itemCharge).toFixed(4));
                    itemCal.itemCharges.push({ id: chargeId, value: itemCharge });
                });
                break;
        }
        if (totalPrice > 0) {
            switch (chargeType) {
                case "fixed":
                    chargeValue = Number((chargeValue).toFixed(2));
                    itemInfoDto.charges.push(new cartItemInfo_1.ChargesObjImpl(chargeValue, name, charge.id));
                    break;
                case "percentage":
                    chargeValue = (value * totalPrice) / 100;
                    chargeValue = Number((chargeValue).toFixed(2));
                    itemInfoDto.charges.push(new cartItemInfo_1.ChargesObjImpl(chargeValue, name, charge.id));
                    break;
            }
        }
        return itemInfoDto;
    }
    applyIndonesiaChargesOnItems(itemInfoDto, charge) {
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
            case "subCategory":
                itemInfo.forEach(itemCal => {
                    if (applicableOn.includes(itemCal.subCatId)) {
                        totalPrice += itemCal.effectivePrice;
                        if (itemCal.effectivePrice > 0) {
                            totalQty += itemCal.quantity;
                            let itemCharge = 0;
                            if (chargeType === "percentage") {
                                itemCharge = (itemCal.effectivePrice * value) / 100;
                            }
                            else if (chargeType === "fixed") {
                                itemCharge = value * itemCal.quantity;
                            }
                            itemCharge = Number((itemCharge).toFixed(4));
                            itemCal.itemCharges.push({ id: chargeId, value: itemCharge });
                            if (chargeId === 'service_tax') {
                                itemCal.serviceCharge = itemCharge;
                            }
                            if (chargeId.includes('sst_tax') &&
                                chargeType === "percentage") {
                                totalServiceChargeForSst += itemCal.serviceCharge;
                            }
                        }
                    }
                });
                chargeValue = value * totalQty;
                break;
            case "order":
                itemInfo.forEach(itemCal => {
                    totalPrice += itemCal.effectivePrice;
                    if (itemCal.effectivePrice > 0) {
                        totalQty += itemCal.quantity;
                    }
                    if (chargeId.includes('sst_tax') && chargeType === "percentage") {
                        totalServiceChargeForSst += itemCal.serviceCharge;
                    }
                });
                itemInfo.forEach(itemCal => {
                    let itemCharge = 0;
                    if (chargeType === "percentage") {
                        itemCharge = (itemCal.effectivePrice * value) / 100;
                    }
                    else if (chargeType === "fixed") {
                        itemCharge = (itemCal.effectivePrice * value) / totalPrice;
                    }
                    itemCharge = Number((itemCharge).toFixed(4));
                    itemCal.itemCharges.push({ id: chargeId, value: itemCharge });
                    if (chargeId === 'service_tax') {
                        itemCal.serviceCharge = itemCharge;
                    }
                });
                break;
        }
        if (totalPrice > 0) {
            switch (chargeType) {
                case "fixed":
                    chargeValue = Number((chargeValue).toFixed(2));
                    itemInfoDto.charges.push(new cartItemInfo_1.ChargesObjImpl(chargeValue, name, charge.id));
                    break;
                case "percentage":
                    if (chargeId.includes('sst_tax')) {
                        totalPrice += totalServiceChargeForSst;
                    }
                    chargeValue = (value * totalPrice) / 100;
                    chargeValue = Number((chargeValue).toFixed(2));
                    itemInfoDto.charges.push(new cartItemInfo_1.ChargesObjImpl(chargeValue, name, charge.id));
                    break;
            }
        }
        return itemInfoDto;
    }
}
exports.ChargesService = ChargesService;
//# sourceMappingURL=charges-service.js.map