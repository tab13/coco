import ServiceFactory from "../../../framework/factory/ServiceFactory";
import {AbstractQuoteService} from "./AbstractService";
import TotalSubtotalService from "./total/SubtotalService";
import TotalTaxSubtotalService from "../../tax/quote/total/TaxSubtotalService";
import TotalShippingService from "./total/ShippingService";
import TotalTaxShippingService from "../../tax/quote/total/TaxShippingService";
import TotalDiscountService from "../../salesrule/quote/total/DiscountService";
import TotalTaxService from "../../tax/quote/total/TotalTaxService";
import TotalWeeeService from "../../weee/quote/total/WeeeService";
import TotalWeeeTaxService from "../../weee/quote/total/WeeeTaxService";
import TotalGrandTotalService from "./total/GrandTotalService";
import PointTotalService from "../../reward-point/quote/total/PointTotalService";
import QuoteTotalGiftcardService from "../../giftcard/quote/total/QuoteTotalGiftcardService";
import QuoteTotalGiftcardAfterTaxService from "../../giftcard/quote/total/QuoteTotalGiftcardAfterTaxService";
import AppStore from "../../../view/store/store";
import TotalsAction from "../../../view/action/checkout/quote/TotalsAction";
import NumberHelper from "../../../helper/NumberHelper";

export class QuoteTotalService extends AbstractQuoteService {
    static className = 'QuoteTotalService';

    isInitTotalCollectors = false;

    totalCollectors = [
        {
            name: "subtotal",
            class: TotalSubtotalService,
            sort_order: 100
        },
        {
            name: "tax_subtotal",
            class: TotalTaxSubtotalService,
            sort_order: 200
        },
        {
            name: "weee",
            class: TotalWeeeService,
            sort_order: 225
        },
        {
            name: "shipping",
            class: TotalShippingService,
            sort_order: 250
        },
        {
            name: "tax_shipping",
            class: TotalTaxShippingService,
            sort_order: 300
        },
        {
            name: "discount",
            class: TotalDiscountService,
            sort_order: 400
        },
        {
            name: "rewardpoint",
            class: PointTotalService,
            sort_order: 410
        },
        {
            name: "giftcard",
            class: QuoteTotalGiftcardService,
            sort_order: 420
        },
        {
            name: "tax",
            class: TotalTaxService,
            sort_order: 450
        },
        {
            name: "weee_tax",
            class: TotalWeeeTaxService,
            sort_order: 460
        },
        {
            name: "giftcard_after_tax",
            class: QuoteTotalGiftcardAfterTaxService,
            sort_order: 470
        },
        {
            name: "grand_total",
            class: TotalGrandTotalService,
            sort_order: 550
        },
    ];

    /**
     * Init total collectors
     */
    initTotalCollectors() {
        if (!this.isInitTotalCollectors) {
            AppStore.dispatch(TotalsAction.salesQuoteInitTotalCollectors(this));
            this.isInitTotalCollectors = true;
        }
    }

    /**
     * Collect total of quote
     *
     * @param quote
     * @return {object}
     */
    collectTotals(quote) {
        this.initTotalCollectors();
        this.resetQuoteData(quote);
        AppStore.dispatch(TotalsAction.salesQuoteCollectTotalsBefore(quote));
        let totalFieldArray = [
            'subtotal',
            'base_subtotal',
            'discount_amount',
            'base_discount_amount',
            'subtotal_with_discount',
            'base_subtotal_with_discount',
            'subtotal_incl_tax',
            'base_subtotal_incl_tax',
            'shipping_amount',
            'base_shipping_amount',
            'shipping_incl_tax',
            'base_shipping_incl_tax',
            'tax_amount',
            'base_tax_amount',
            'grand_total',
            'base_grand_total'
        ];

        let total = {};

        totalFieldArray.forEach(totalField => total[totalField] = 0);

        this.collectItemsQtys(quote);

        quote.is_virtual = +this.isVirtual(quote);

        this.totalCollectors.sort((a, b) => a.sort_order - b.sort_order);

        quote.addresses.map(address => {
            let addressTotal = this.collectAddressTotals(quote, address);
            // total.shipping_amount = addressTotal.shipping_amount ? addressTotal.shipping_amount : 0;
            // total.base_shipping_amount = addressTotal.base_shipping_amount ? addressTotal.base_shipping_amount : 0;
            total.shipping_description = addressTotal.shipping_description ? addressTotal.shipping_description : '';
            totalFieldArray.forEach(totalField => {
                total[totalField] = addressTotal[totalField] ?
                    NumberHelper.addNumber(total[totalField], addressTotal[totalField]) :
                    total[totalField];
            });
            /*total.subtotal = addressTotal.subtotal ?
                NumberHelper.addNumber(total.subtotal, addressTotal.subtotal)
                : total.subtotal;
            total.base_subtotal = addressTotal.base_subtotal ?
                NumberHelper.addNumber(total.base_subtotal, addressTotal.base_subtotal) :
                total.base_subtotal;
            total.discount_amount = addressTotal.discount_amount ?
                NumberHelper.addNumber(total.discount_amount, addressTotal.discount_amount) :
                total.discount_amount;
            total.base_discount_amount = addressTotal.base_discount_amount ?
                NumberHelper.addNumber(total.base_discount_amount, addressTotal.base_discount_amount) :
                total.base_discount_amount;
            total.subtotal_with_discount = addressTotal.subtotal_with_discount ?
                NumberHelper.addNumber(total.subtotal_with_discount, addressTotal.subtotal_with_discount) :
                total.subtotal_with_discount;
            total.base_subtotal_with_discount = addressTotal.base_subtotal_with_discount ?
                NumberHelper.addNumber(total.base_subtotal_with_discount, addressTotal.base_subtotal_with_discount) :
                total.base_subtotal_with_discount;
            total.tax_amount = addressTotal.tax_amount ?
                NumberHelper.addNumber(total.tax_amount, addressTotal.tax_amount) :
                total.tax_amount;
            total.base_tax_amount = addressTotal.base_tax_amount ?
                NumberHelper.addNumber(total.base_tax_amount, addressTotal.base_tax_amount) :
                total.base_tax_amount;
            total.grand_total = addressTotal.grand_total ?
                NumberHelper.addNumber(total.grand_total, addressTotal.grand_total) :
                total.grand_total;
            total.base_grand_total = addressTotal.base_grand_total ?
                NumberHelper.addNumber(total.base_grand_total, addressTotal.base_grand_total) :
                total.base_grand_total;*/
            return true;
        });
        AppStore.dispatch(TotalsAction.salesQuoteCollectTotalsAfter(quote));
        return total;
    }

    /**
     * Collect item qty of quote
     *
     * @param {object} quote
     * @return {QuoteTotalService}
     */
    collectItemsQtys(quote) {
        quote.items_count = 0;
        quote.items_qty = 0;
        quote.virtual_items_qty = 0;
        this.getAllVisibleItems(quote).map(item => {
            if (item.parent_item_id) {
                return false;
            }
            let children = this.getChildrenItems(quote, item);
            if (children && item.product.shipment_type === 1) {
                children.map(child => {
                    if (child.product.is_virtual) {
                        quote.virtual_items_qty += (child.qty * item.qty);
                    }
                    return true;
                })
            }

            if (item.product.is_virtual) {
                quote.virtual_items_qty += item.qty;
            }
            quote.items_count++;
            quote.items_qty = NumberHelper.addNumber(quote.items_qty, item.qty);
            return true;
        });
        return this;
    }

    /**
     * Collect address total
     *
     * @param {object} quote
     * @param {object} address
     * @return {{}}
     */
    collectAddressTotals(quote, address) {
        let total = {};
        this.totalCollectors.map(collector => collector.class.collect(quote, address, total));
        /*address = {...address, ...total};*/
        /*Object.key(total).map(item => {
            address[item] = total[item];
        });*/
        Object.assign(address, total);
        return total;
    }
}

/** @type QuoteTotalService */
let quoteTotalService = ServiceFactory.get(QuoteTotalService);

export default quoteTotalService;