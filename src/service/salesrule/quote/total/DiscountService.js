import {AbstractTotalService} from "../../../checkout/quote/total/AbstractService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import AddressService from "../../../checkout/quote/AddressService";
import ValidatorService from "../../ValidatorService";
import QuoteItemService from "../../../checkout/quote/ItemService";
import CurrencyHelper from "../../../../helper/CurrencyHelper";

export class QuoteTotalDiscountService extends AbstractTotalService {
    static className = 'QuoteTotalDiscountService';

    code = 'discount';

    /**
     * Collect address subtotal
     *
     * @param {object} quote
     * @param {object} address
     * @param {object} total
     * @return {QuoteTotalDiscountService}
     */
    collect(quote, address, total) {
        super.collect(quote, address, total);
        ValidatorService.sortSalesRuleByPriority(quote);
        ValidatorService.reset(quote, address);
        let isVirtual = this.isVirtual(quote);
        if ((isVirtual && AddressService.isBillingAddress(address)) ||
            (!isVirtual && AddressService.isShippingAddress(address))
        ) {
            ValidatorService.initTotals(quote, address, quote.items);
            address.discount_description = {};
            quote.items = ValidatorService.sortItemsByPriority(quote, quote.valid_salesrule, quote.items);
            quote.items.map(item => {
                // to determine the child item discount, we calculate the parent
                if (item.parent_item_id) {
                    return false;
                }
                if (item.has_children && QuoteItemService.isChildrenCalculated(item, quote)) {
                    ValidatorService.process(quote, address, item);
                    this.distributeDiscount(quote, item);
                    QuoteItemService.getChildrenItems(quote, item).map(child => {
                        this.aggregateItemDiscount(child);
                        return child;
                    });
                } else {
                    ValidatorService.process(quote, address, item);
                    this.aggregateItemDiscount(item);
                }
                return item;
            });
            quote.items.sort((a, b) => a.item_id - b.item_id);
        }

        address.shipping_discount_amount = 0;
        address.base_shipping_discount_amount = 0;
        address.shipping_discount_percent = 0;

        if(address.shipping_amount) {
            ValidatorService.processShippingAmount(quote, address);
            this._addAmount(-address.shipping_discount_amount);
            this._addBaseAmount(-address.base_shipping_discount_amount);
            total.shipping_discount_amount = address.shipping_discount_amount;
            total.base_shipping_discount_amount = address.base_shipping_discount_amount;
        }

        total.discount_description = address.discount_description;
        total.subtotal_with_discount = total.subtotal + total.discount_amount;
        total.base_subtotal_with_discount = total.base_subtotal + total.base_discount_amount;
        return this;
    }

    /**
     * Aggregate item discount information to total data and related properties
     *
     * @param {object} item
     */
    aggregateItemDiscount(item) {
        this._addAmount(-item.discount_amount);
        this._addBaseAmount(-item.base_discount_amount);
    }

    /**
     * Distribute discount at parent item to children items
     *
     * @param quote
     * @param item
     * @return {QuoteTotalDiscountService}
     */
    distributeDiscount(quote, item) {
        let parentBaseRowTotal = item.base_row_total;
        let keys = [
            'discount_amount',
            'base_discount_amount',
            'original_discount_amount',
            'base_original_discount_amount',
        ];
        let roundingDelta = {};
        keys.map(key => {
            //Initialize the rounding delta to a tiny number to avoid floating point precision problem
            roundingDelta[key] = 0.0000001;
            return key;
        });
        QuoteItemService.getChildrenItems(quote, item).map(child => {
            let ratio = child.base_row_total / parentBaseRowTotal;
            keys.map(key => {
                if (typeof item[key] === 'undefined' || item[key] === null) {
                    return key;
                }
                let value = item[key] * ratio;
                let roundedValue = CurrencyHelper.roundToFloat(value + roundingDelta[key]);
                roundingDelta[key] += (value - roundedValue);
                child[key] = roundedValue;
                return key;
            });
            return child;
        });
        keys.map(key => {
            item[key] = 0;
            return key;
        });
        return this;
    }
}

let quoteTotalDiscountService = ServiceFactory.get(QuoteTotalDiscountService);

export default quoteTotalDiscountService;