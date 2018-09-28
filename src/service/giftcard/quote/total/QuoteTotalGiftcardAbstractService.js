import {AbstractTotalService} from "../../../checkout/quote/total/AbstractService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import AddressService from "../../../checkout/quote/AddressService";
import CalculationService from "../../redeem/CalculationService";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import GiftcardHelper from "../../../../helper/GiftcardHelper";
import GiftcardService from "../../GiftcardService";
import QuoteItemService from "../../../checkout/quote/ItemService";
import NumberHelper from "../../../../helper/NumberHelper";

export class QuoteTotalGiftcardAbstractService extends AbstractTotalService {
    static className = 'QuoteTotalGiftcardAbstractService';

    calculateDiscount(quote, address, total, isApplyAfterTax = false) {
        if (!GiftcardHelper.isGiftcardEnable()) {
            return this;
        }
        if (!GiftcardHelper.canUseWithCoupon() && quote.coupon_code) {
            return this;
        }
        let isVirtual = this.isVirtual(quote);
        let giftcodes = quote.gift_voucher_applied_codes;
        let codes = [];
        if (!giftcodes || !Array.isArray(giftcodes) || !giftcodes.length) {
            return this;
        }
        if (!quote.items || !Array.isArray(quote.items) || !quote.items.length) {
            return this;
        }
        if ((isVirtual && AddressService.isBillingAddress(address)) ||
            (!isVirtual && AddressService.isShippingAddress(address))
        ) {
            CalculationService.initTotals(quote, quote.items, giftcodes, isApplyAfterTax);
            let codesBaseDiscount = [],
                codesDiscount = [];
            let isAllowDiscountForShipping = GiftcardHelper.isAllowDiscountForShipping();

            giftcodes.forEach(giftcode => {
                let totalBaseDiscount = 0,
                    totalDiscount = 0;
                let maxBaseDiscount = GiftcardService.getBaseBalance(giftcode);
                if (typeof giftcode.applied_amount !== 'undefined' && giftcode.applied_amount !== null) {
                    maxBaseDiscount = Math.min(maxBaseDiscount, CurrencyHelper.convertToBase(giftcode.applied_amount));
                }
                let baseAvailableDiscount = maxBaseDiscount;
                let itemsTotal = CalculationService.getGiftCodeItemsTotal(giftcode.code);
                if (itemsTotal) {
                    let baseItemsPrice = 0;
                    let totalItemApplied = 0;
                    let totalValidItemIds = Array.isArray(giftcode.valid_item_ids) ? giftcode.valid_item_ids.length : 0;
                    quote.items.forEach(item => {
                        if (item.parent_item_id) {
                            return false;
                        }
                        if (!giftcode.valid_item_ids.includes(+item.item_id)) {
                            return false;
                        }
                        totalItemApplied++;
                        let qty = QuoteItemService.getTotalQty(item, quote);
                        let itemPrice = NumberHelper.multipleNumber(CalculationService.getItemPrice(item), qty);
                        let baseItemPrice = NumberHelper.multipleNumber(CalculationService.getItemBasePrice(item), qty);
                        let itemPriceAfterDiscount = NumberHelper.minusNumber(itemPrice, item.discount_amount);
                        let baseItemPriceAfterDiscount = NumberHelper.minusNumber(
                            baseItemPrice, item.base_discount_amount
                        );
                        if (isApplyAfterTax) {
                            itemPriceAfterDiscount = NumberHelper.addNumber(itemPriceAfterDiscount, item.tax_amount);
                            baseItemPriceAfterDiscount = NumberHelper.addNumber(
                                baseItemPriceAfterDiscount, item.base_tax_amount
                            );
                        }

                        let baseGiftCardDiscountAmount = 0;
                        baseItemsPrice = NumberHelper.addNumber(
                            baseItemsPrice, baseItemPriceAfterDiscount, item.base_gift_voucher_discount
                        );
                        if (baseItemPrice === itemsTotal.base_items_price) {
                            baseGiftCardDiscountAmount = NumberHelper.minusNumber(maxBaseDiscount, totalBaseDiscount);
                        } else {
                            let discountRate = NumberHelper.addNumber(
                                baseItemPriceAfterDiscount, item.base_gift_voucher_discount
                            ) / itemsTotal.base_items_price;
                            baseGiftCardDiscountAmount = NumberHelper.multipleNumber(maxBaseDiscount, discountRate);
                        }
                        baseGiftCardDiscountAmount = Math.min(baseGiftCardDiscountAmount, baseItemPriceAfterDiscount);
                        baseGiftCardDiscountAmount = CurrencyHelper.roundToFloat(baseGiftCardDiscountAmount);

                        baseAvailableDiscount = NumberHelper.minusNumber(
                            baseAvailableDiscount, baseGiftCardDiscountAmount
                        );
                        if (baseAvailableDiscount < 0) {
                            baseGiftCardDiscountAmount = NumberHelper.addNumber(
                                baseGiftCardDiscountAmount, baseAvailableDiscount
                            );
                        }

                        if(totalItemApplied === totalValidItemIds && giftcode.applied_amount) {
                            if(baseAvailableDiscount === 0.01) {
                                baseGiftCardDiscountAmount = NumberHelper.addNumber(baseGiftCardDiscountAmount, 0.01);
                            }
                        }

                        let giftCardDiscountAmount = CurrencyHelper.convert(baseGiftCardDiscountAmount);
                        giftCardDiscountAmount = Math.min(giftCardDiscountAmount, itemPriceAfterDiscount);
                        giftCardDiscountAmount = CurrencyHelper.roundToFloat(giftCardDiscountAmount);

                        item.base_gift_voucher_discount = NumberHelper.addNumber(
                            item.base_gift_voucher_discount, baseGiftCardDiscountAmount
                        );
                        item.gift_voucher_discount = NumberHelper.addNumber(
                            item.gift_voucher_discount, giftCardDiscountAmount
                        );
                        item.magestore_base_discount = NumberHelper.addNumber(
                            item.magestore_base_discount, baseGiftCardDiscountAmount
                        );
                        item.magestore_discount = NumberHelper.addNumber(
                            item.magestore_discount, giftCardDiscountAmount
                        );
                        item.base_discount_amount = NumberHelper.addNumber(
                            item.base_discount_amount, baseGiftCardDiscountAmount
                        );
                        item.discount_amount = NumberHelper.addNumber(item.discount_amount, giftCardDiscountAmount);
                        totalBaseDiscount = NumberHelper.addNumber(totalBaseDiscount, baseGiftCardDiscountAmount);
                        totalDiscount = NumberHelper.addNumber(totalDiscount, giftCardDiscountAmount);
                    });
                    if (maxBaseDiscount > totalBaseDiscount && isAllowDiscountForShipping) {
                        let shippingAmount = address.shipping_amount_for_discount;
                        let baseShippingAmount = address.base_shipping_amount;
                        if (shippingAmount !== null && typeof shippingAmount !== 'undefined') {
                            baseShippingAmount = address.base_shipping_amount_for_discount;
                        }
                        baseShippingAmount = NumberHelper.addNumber(
                            baseShippingAmount, address.base_shipping_discount_amount
                        );
                        baseShippingAmount = NumberHelper.minusNumber(
                            baseShippingAmount, total.magestore_base_discount_for_shipping
                        );
                        if (isApplyAfterTax) {
                            baseShippingAmount = NumberHelper.addNumber(
                                baseShippingAmount, address.base_shipping_tax_amount
                            );
                        }
                        let baseDiscountShipping = NumberHelper.minusNumber(maxBaseDiscount, totalBaseDiscount);
                        baseDiscountShipping = Math.min(baseDiscountShipping, baseShippingAmount);
                        baseDiscountShipping = CurrencyHelper.roundToFloat(baseDiscountShipping);

                        baseAvailableDiscount = NumberHelper.minusNumber(baseAvailableDiscount, baseDiscountShipping);
                        if (baseAvailableDiscount < 0) {
                            baseDiscountShipping = NumberHelper.addNumber(baseDiscountShipping, baseAvailableDiscount);
                        }

                        let discountShipping = CurrencyHelper.convert(baseDiscountShipping);
                        discountShipping = CurrencyHelper.roundToFloat(discountShipping);


                        totalBaseDiscount = NumberHelper.addNumber(totalBaseDiscount, baseDiscountShipping);
                        totalDiscount = NumberHelper.addNumber(totalDiscount, discountShipping);

                        total.base_giftvoucher_discount_for_shipping = NumberHelper.addNumber(
                            total.base_giftvoucher_discount_for_shipping, baseDiscountShipping
                        );
                        total.giftvoucher_discount_for_shipping = NumberHelper.addNumber(
                            total.giftvoucher_discount_for_shipping, discountShipping
                        );
                        total.magestore_base_discount_for_shipping = NumberHelper.addNumber(
                            total.magestore_base_discount_for_shipping, baseDiscountShipping
                        );
                        total.magestore_discount_for_shipping = NumberHelper.addNumber(
                            total.magestore_discount_for_shipping, discountShipping
                        );
                        total.base_shipping_discount_amount = Math.max(0, NumberHelper.addNumber(
                            total.base_shipping_discount_amount, baseDiscountShipping
                        ));
                        total.shipping_discount_amount = Math.max(0, NumberHelper.addNumber(
                            total.shipping_discount_amount, discountShipping
                        ));
                    }
                }
                codes.push(giftcode.code);
                codesBaseDiscount.push(totalBaseDiscount);
                codesDiscount.push(totalDiscount);
            });
            codes = codes.join(',');
            let baseGiftVoucherDiscount = codesBaseDiscount.length ?
                codesBaseDiscount.reduce((a, b) => NumberHelper.addNumber(a, b)) :
                0;
            let giftVoucherDiscount = codesDiscount.length ?
                codesDiscount.reduce((a, b) => NumberHelper.addNumber(a, b)) :
                0;
            let codesBaseDiscountString = codesBaseDiscount.join(',');
            let codesDiscountString = codesDiscount.join(',');

            total.base_gift_voucher_discount = baseGiftVoucherDiscount;
            total.gift_voucher_discount = giftVoucherDiscount;
            total.magestore_base_discount = NumberHelper.addNumber(
                total.magestore_base_discount, baseGiftVoucherDiscount
            );
            total.magestore_discount = NumberHelper.addNumber(total.magestore_discount, giftVoucherDiscount);
            total.codes_base_discount = codesBaseDiscountString;
            total.codes_discount = codesDiscountString;
            total.base_discount_amount = NumberHelper.minusNumber(total.base_discount_amount, baseGiftVoucherDiscount);
            total.discount_amount = NumberHelper.minusNumber(total.discount_amount, giftVoucherDiscount);
            total.base_subtotal_with_discount = NumberHelper.minusNumber(
                total.base_subtotal_with_discount, baseGiftVoucherDiscount
            );
            total.subtotal_with_discount = NumberHelper.minusNumber(total.subtotal_with_discount, giftVoucherDiscount);

            quote.base_gift_voucher_discount = total.base_gift_voucher_discount;
            quote.gift_voucher_discount = total.gift_voucher_discount;
            quote.magestore_base_discount = total.magestore_base_discount;
            quote.magestore_discount = total.magestore_discount;
            quote.gift_voucher_gift_codes = codes;
            quote.gift_voucher_gift_codes_discount = codesDiscountString;
            quote.codes_base_discount = codesBaseDiscountString;
            quote.codes_discount = codesDiscountString;
            quote.base_giftvoucher_discount_for_shipping = total.base_giftvoucher_discount_for_shipping;
            quote.giftvoucher_discount_for_shipping = total.giftvoucher_discount_for_shipping;
            quote.magestore_base_discount_for_shipping = total.magestore_base_discount_for_shipping;
            quote.magestore_discount_for_shipping = total.magestore_discount_for_shipping;

            this._addAmount(-giftVoucherDiscount);
            this._addBaseAmount(-baseGiftVoucherDiscount);
        }
        return this;
    }
}

let quoteTotalGiftcardAbstractService = ServiceFactory.get(QuoteTotalGiftcardAbstractService);

export default quoteTotalGiftcardAbstractService;