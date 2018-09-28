import {AbstractQuoteService} from "./quote/AbstractService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import AddProductService from "./quote/AddProductService";
import {Observable} from 'rxjs';
import TotalService from "./quote/TotalService";
import AddressService from "./quote/AddressService";
import AddressConstant from "../../view/constant/checkout/quote/AddressConstant";
import UpdateProductService from "./quote/UpdateProductService";
import QuoteItemService from "./quote/ItemService";
import ChangeCustomerService from "./quote/ChangeCustomerService";
import SubmitCouponCodeService from "./quote/SubmitCouponCodeService";
import CurrencyHelper from "../../helper/CurrencyHelper";
import CustomerGroupHelper from "../../helper/CustomerGroupHelper";
import NumberHelper from "../../helper/NumberHelper";
import ResetRewardProcessor from "../reward-point/quote/processor/ResetRewardProcessor";
import EarningPointProcessor from "../reward-point/quote/processor/EarningPointProcessor";
import RewardPointService from "../reward-point/RewardPointService";
import cloneDeep from 'lodash/cloneDeep';
import QuoteAction from "../../view/action/checkout/QuoteAction";
import AppStore from "../../view/store/store";
import PriceService from "../catalog/product/PriceService";

export class QuoteService extends AbstractQuoteService {
    static className = 'QuoteService';

    productListQuote = null;

    beforeCollectTotalProcessors = [
        {
            class: ResetRewardProcessor,
            sort_order: 100
        }
    ];

    afterCollectTotalProcessors = [
        {
            class: EarningPointProcessor,
            sort_order: 100
        },
    ];

    initialQuoteReducerState = {
        id: new Date().getTime(),
        customer_id: null,
        customer_group_id: 0,
        customer_is_guest: 1,
        grand_total: 0,
        base_grand_total: 0,
        items: [],
        payments: [],
        addresses: [],
        customer: null
    };

    /**
     * Reset quote
     *
     * @return {{}}
     */
    resetQuote() {
        return {
            ...this.changeCustomer({
                ...cloneDeep(this.initialQuoteReducerState), id: new Date().getTime()
            })
        }
    }

    collectTotals(quote) {
        if (!quote.addresses || !quote.addresses.length) {
            quote = this.changeCustomer(quote, quote.customer);
        }
        this.beforeCollectTotalProcessors
            .sort((a, b) => a.sort_order - b.sort_order)
            .forEach(processor => processor.class.execute(quote));

        let total = TotalService.collectTotals(quote);
        quote = Object.assign(quote, total);

        this.afterCollectTotalProcessors
            .sort((a, b) => a.sort_order - b.sort_order)
            .forEach(processor => processor.class.execute(quote));

        return quote;
    }

    /**
     * Create default quote data
     *
     * @param quote
     */
    createDefaultQuoteData(quote) {
        AddressService.createTempAddress(quote);
        if (typeof quote.customer_tax_class_id === 'undefined') {
            quote.customer_tax_class_id = CustomerGroupHelper.getTaxClassId(
                CustomerGroupHelper.getQuoteCustomerGroupId(quote)
            );
        }
    }

    /**
     * Get quote to prepare product list price
     *
     * @return {*}
     */
    getProductListQuote() {
        if (!this.productListQuote) {
            this.productListQuote = {addresses: []};
            this.createDefaultQuoteData(this.productListQuote);
        }
        return this.productListQuote;
    }

    /**
     * add product to quote
     * @param quote
     * @param data
     * @returns {*}
     */
    addProduct(quote, data) {
        this.createDefaultQuoteData(quote);

        let addProductResult = AddProductService.addProduct(quote, data);

        if (addProductResult.success === false) {
            return Observable.of(addProductResult);
        }

        // check and remove used reward point
        RewardPointService.getUsedPoint() && RewardPointService.removeUsedPoint();

        AppStore.dispatch(QuoteAction.addProductAfter(quote));

        return Observable.of({
            success: true,
            quote: this.collectTotals(quote),
            added_item_id: addProductResult.added_item_id
        });
    }

    /**
     * update qty after change on number pad
     * @param quote
     * @param item
     * @param qty
     * @return {*}
     */
    updateQtyCartItem(quote, item, qty) {
        AddressService.createTempAddress(quote);

        let updateProductServiceResult = UpdateProductService.updateQty(quote, item, qty);

        if (updateProductServiceResult.success === false) {
            return Observable.of(updateProductServiceResult);
        }

        // check and remove used reward point
        RewardPointService.getUsedPoint() && RewardPointService.removeUsedPoint();

        AppStore.dispatch(QuoteAction.updateQtyCartItemAfter(quote));

        return Observable.of({
            success: true,
            quote: this.collectTotals(quote)
        });
    }

    /**
     * update custom price after change on number pad
     * @param quote
     * @param item
     * @param customPrice
     * @param reason
     * @return {*}
     */
    updateCustomPriceCartItem(quote, item, customPrice, reason) {
        AddressService.createTempAddress(quote);
        let finalPrice = PriceService.getPriceService(item.product).getOriginalFinalPrice(item.qty, item.product, quote, item);
        if(!customPrice || (customPrice && (customPrice === finalPrice))){
            customPrice = null;
            reason = "";
        }
        QuoteItemService.setCustomPrice(item, customPrice, reason);

        // check and remove used reward point
        RewardPointService.getUsedPoint() && RewardPointService.removeUsedPoint();

        return Observable.of({
            success: true,
            quote: this.collectTotals(quote)
        });
    }

    /**
     *  remove cart item
     * @param quote
     * @param item
     * @return {*}
     */
    removeItem(quote, item) {
        if (item.product_type === 'configurable' || item.product_type === 'bundle') {
            let children = QuoteItemService.getChildrenItems(quote, item);
            quote.items = quote.items.filter(quoteItem => {
                return children.indexOf(quoteItem) === -1;
            })
        }
        const index = quote.items.indexOf(item);
        if (index !== -1) {
            quote.items.splice(index, 1);
        }
        AddressService.createTempAddress(quote);

        // check and remove used reward point
        RewardPointService.getUsedPoint() && RewardPointService.removeUsedPoint();

        AppStore.dispatch(QuoteAction.removeCartItemAfter(quote));

        return Observable.of({
            success: true,
            quote: this.collectTotals(quote)
        });
    }

    /**
     * Get quote billing address
     *
     * @param {object} quote
     * @return {object}
     */
    getBillingAddress(quote) {
        if (!quote.addresses || quote.addresses.length < 1) {
            return false;
        }
        return quote.addresses.find(address => address.address_type === AddressConstant.BILLING_ADDRESS_TYPE);
    }

    /**
     * Get quote shipping address
     *
     * @param {object} quote
     * @return {object}
     */
    getShippingAddress(quote) {
        if (!quote.addresses || quote.addresses.length < 1) {
            return false;
        }
        return quote.addresses.find(address => address.address_type === AddressConstant.SHIPPING_ADDRESS_TYPE);
    }

    /**
     * Get base total paid
     *
     * @param quote
     * @returns {number}
     */
    getBaseTotalPaid(quote) {
        let baseTotalPaid = 0;
        let baseGrandTotal = quote.base_grand_total;
        quote.payments.forEach(payment => {
            let paidAmount = payment.is_pay_later ? 0 : payment.base_amount_paid;
            baseTotalPaid = NumberHelper.addNumber(baseTotalPaid, paidAmount);
        });
        if (baseTotalPaid > baseGrandTotal) {
            baseTotalPaid = baseGrandTotal;
        }
        return baseTotalPaid;
    }

    /**
     * Get total paid
     * @param quote
     * @returns {number}
     */
    getTotalPaid(quote) {
        let totalPaid = 0;
        let grandTotal = quote.grand_total;
        quote.payments.forEach(payment => {
            let paidAmount = payment.is_pay_later ? 0 : payment.amount_paid;
            totalPaid = NumberHelper.addNumber(totalPaid, paidAmount);
        });
        if (totalPaid > grandTotal) {
            totalPaid = grandTotal;
        }
        return totalPaid;
    }

    /**
     * get total due
     *
     * @param quote
     * @returns {number}
     */
    getTotalDue(quote) {
        let totalPaid = this.getTotalPaid(quote);
        let grandTotal = quote.grand_total;
        if (!totalPaid) {
            return grandTotal;
        } else if (grandTotal > totalPaid) {
            return grandTotal - totalPaid;
        }
        return 0;
    }

    /**
     * Get base total due
     *
     * @param quote
     * @returns {number}
     */
    getBaseTotalDue(quote) {
        let baseTotalPaid = this.getBaseTotalPaid(quote);
        let baseGrandTotal = quote.base_grand_total;
        if (!baseTotalPaid) {
            return baseGrandTotal;
        } else if (baseGrandTotal > baseTotalPaid) {
            return baseGrandTotal - baseTotalPaid;
        }
        return 0;
    }

    /**
     * get base total change
     * @param quote
     * @return {number}
     */
    getBasePosChange(quote) {
        let baseTotalPaid = 0;
        let baseGrandTotal = quote.base_grand_total;
        quote.payments.forEach(item => baseTotalPaid = NumberHelper.addNumber(baseTotalPaid, item.base_amount_paid));
        if (baseGrandTotal < baseTotalPaid) {
            return baseTotalPaid - baseGrandTotal;
        }
        return 0;
    }

    /**
     * get total change
     * @param quote
     * @return {number}
     */
    getPosChange(quote) {
        let totalPaid = 0;
        let grandTotal = quote.base_grand_total;
        quote.payments.forEach(item => totalPaid = NumberHelper.addNumber(totalPaid, item.amount_paid));
        if (grandTotal < totalPaid) {
            return totalPaid - grandTotal;
        }
        return 0;
    }

    /**
     * Set additional data for quote before place order
     *
     * @param quote
     * @return {*}
     */
    placeOrderBefore(quote) {
        quote.global_currency_code = CurrencyHelper.getGlobalCurrencyCode();
        quote.base_currency_code = CurrencyHelper.getBaseCurrencyCode();
        quote.store_currency_code = CurrencyHelper.getBaseCurrencyCode();
        quote.quote_currency_code = CurrencyHelper.getCurrentCurrencyCode();
        quote.base_to_global_rate = CurrencyHelper.getBaseCurrency().currency_rate;
        quote.base_to_quote_rate = CurrencyHelper.getCurrentCurrency().currency_rate;
        quote.store_to_base_rate = 1 / CurrencyHelper.getCurrentCurrency().currency_rate;
        quote.store_to_quote_rate = 1 / CurrencyHelper.getCurrentCurrency().currency_rate;

        AppStore.dispatch(QuoteAction.placeOrderBefore(quote));

        return quote;
    }

    /**
     * Customer for quote
     *
     * @param {object} quote
     * @param {object} customer
     */
    changeCustomer(quote, customer = null) {
        return ChangeCustomerService.changeCustomer(quote, customer);
    }

    /**
     * submit coupon code
     * @param quote
     * @param couponCode
     * @returns {*}
     */
    submitCouponCode(quote, couponCode) {
        return SubmitCouponCodeService.submit(quote, couponCode);
    }


}

/** @type QuoteService */
let quoteService = ServiceFactory.get(QuoteService);

export default quoteService;