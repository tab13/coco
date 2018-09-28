import CoreService from "../../CoreService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import CurrencyHelper from "../../../helper/CurrencyHelper";
import CalculationToolService from "../CalculationToolService";
import TaxHelper from "../../../helper/TaxHelper";

export class AbstractCalculatorService extends CoreService {
    static className = 'AbstractCalculatorService';

    /**#@+
     * Constants for delta rounding key
     */
    KEY_REGULAR_DELTA_ROUNDING = 'regular';

    KEY_APPLIED_TAX_DELTA_ROUNDING = 'applied_tax_amount';

    KEY_TAX_BEFORE_DISCOUNT_DELTA_ROUNDING = 'tax_before_discount';

    billingAddress = null;
    shippingAddress = null;
    customerTaxClassId = null;
    customerId = null;
    customer = null;

    roundingDeltas = {};

    /**
     * Reset calculate data
     */
    reset() {
        this.billingAddress = null;
        this.shippingAddress = null;
        this.customerTaxClassId = null;
        this.customerId = null;
        this.customer = null;
        this.roundingDeltas = {};
    }

    /**
     * Set billing address
     *
     * @param {object} billingAddress
     */
    setBillingAddress(billingAddress) {
        this.billingAddress = billingAddress;
    }

    /**
     * Set shipping address
     *
     * @param {object} shippingAddress
     */
    setShippingAddress(shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    /**
     * Set customer tax class id
     *
     * @param {number} customerTaxClassId
     */
    setCustomerTaxClassId(customerTaxClassId) {
        this.customerTaxClassId = customerTaxClassId;
    }

    /**
     * Set customer
     *
     * @param {object} customer
     */
    setCustomer(customer) {
        this.customer = customer;
    }

    /**
     * Calculate tax details for quote item with given quantity
     *
     * @param {object} item
     * @param {number} quantity
     * @param {boolean} round
     * @return {object}
     */
    calculate(item, quantity, round = true) {
        if (item.is_tax_included) {
            return this.calculateWithTaxInPrice(item, quantity, round);
        } else {
            return this.calculateWithTaxNotInPrice(item, quantity, round);
        }
    }

    /**
     * Calculate tax details for quote item with tax in price with given quantity
     *
     * @param {object} item
     * @param {number} quantity
     * @param {boolean} round
     * @return {object}
     */
    calculateWithTaxInPrice(item, quantity, round = true) {
    }

    /**
     * Calculate tax details for quote item with tax not in price with given quantity
     *
     * @param {object} item
     * @param {number} quantity
     * @param {boolean} round
     * @return {object}
     */
    calculateWithTaxNotInPrice(item, quantity, round = true) {
    }

    /**
     * Get address rate request
     *
     * @return {object}
     */
    getAddressRateRequest() {
        return CalculationToolService.getRateRequest(
            this.shippingAddress,
            this.billingAddress,
            this.customerTaxClassId,
            this.customer
        );
    }

    /**
     * Check if tax rate is same as store tax rate
     *
     * @param {number} rate
     * @param {number} storeRate
     * @return {boolean}
     */
    isSameRateAsStore(rate, storeRate) {
        if (TaxHelper.crossBorderTradeEnabled()) {
            return true;
        } else {
            return Math.abs(rate - storeRate) < 0.00001;
        }
    }

    /**
     * **
     * Create AppliedTax data object based applied tax rates and tax amount
     *
     * @param {number} rowTax
     * @param {object} appliedRate
     * @return {{amount: *, percent: *, tax_rate_key: *}}
     */
    getAppliedTax(rowTax, appliedRate) {
        let appliedTaxDataObject = {
            amount: rowTax,
            percent: appliedRate['percent'],
            tax_rate_key: appliedRate['id']
        };

        let rateDataObjects = {};
        appliedRate['rates'].map(rate => {
            rateDataObjects[rate['code']] = {
                percent: rate['percent'],
                code: rate['code'],
                title: rate['title']
            };
            return rate;
        });
        appliedTaxDataObject.rates = rateDataObjects;
        return appliedTaxDataObject;
    }

    /**
     * Create AppliedTax data object based on applied tax rates and tax amount
     *
     * @param {number} rowTax
     * @param {number} totalTaxRate
     * @param {object} appliedRates
     * @return {object}
     */
    getAppliedTaxes(rowTax, totalTaxRate, appliedRates) {
        let appliedTaxes = {};
        let totalAppliedAmount = 0;
        appliedRates.map(appliedRate => {
            if (appliedRate['percent'] === 0) {
                return appliedRate;
            }
            let appliedAmount = rowTax / totalTaxRate * appliedRate['percent'];
            /*Use delta rounding to split tax amounts for each tax rates between items*/
            appliedAmount = this.deltaRound(
                appliedAmount,
                appliedRate['id'],
                true,
                this.KEY_APPLIED_TAX_DELTA_ROUNDING
            );
            if (totalAppliedAmount + appliedAmount > rowTax) {
                appliedAmount = rowTax - totalAppliedAmount;
            }
            totalAppliedAmount += appliedAmount;

            let appliedTaxDataObject = {
                amount: appliedAmount,
                percent: appliedRate['percent'],
                tax_rate_key: appliedRate['id']
            };
            let rateDataObjects = {};
            appliedRate['rates'].map(rate => {
                rateDataObjects[rate['code']] = {
                    percent: rate['percent'],
                    code: rate['code'],
                    title: rate['title']
                };
                return rate;
            });

            appliedTaxDataObject.rates = rateDataObjects;
            appliedTaxes[appliedTaxDataObject.tax_rate_key] = appliedTaxDataObject;

            return appliedRate;
        });

        return appliedTaxes;
    }

    /**
     * Round price based on previous rounding operation delta
     *
     * @param {number} price
     * @param {number} rate
     * @param {boolean} direction
     * @param {string} type
     * @param {boolean} round
     * @return {number}
     */
    deltaRound(price, rate, direction, type = this.KEY_REGULAR_DELTA_ROUNDING, round = true) {
        if (price) {
            rate = String(rate);
            type = type + direction;
            // initialize the delta to a small number to avoid non-deterministic behavior with rounding of 0.5
            let delta = 0.000001;
            if (typeof this.roundingDeltas[type] !== 'undefined' &&
                typeof this.roundingDeltas[type][rate] !== 'undefined')
                delta = this.roundingDeltas[type][rate];
            price += delta;
            let roundPrice = price;
            if (round) {
                roundPrice = CurrencyHelper.roundToFloat(roundPrice);
            }
            if (!this.roundingDeltas[type]) {
                this.roundingDeltas[type] = {};
            }
            this.roundingDeltas[type][rate] = price - roundPrice;
            price = roundPrice;
        }
        return price;
    }

    /**
     * Given a store price that includes tax at the store rate, this function will back out the store's tax, and add in
     * the customer's tax.  Returns this new price which is the customer's price including tax.
     *
     * @param float $storePriceInclTax
     * @param float $storeRate
     * @param float $customerRate
     * @param boolean $round
     * @return float
     */
    calculatePriceInclTax(storePriceInclTax, storeRate, customerRate, round = true) {
        let storeTax = CalculationToolService.calcTaxAmount(storePriceInclTax, storeRate, true, false);
        let priceExclTax = storePriceInclTax - storeTax;
        let customerTax = CalculationToolService.calcTaxAmount(priceExclTax, customerRate, false, false);
        let customerPriceInclTax = priceExclTax + customerTax;
        if (round) {
            customerPriceInclTax = CurrencyHelper.roundToFloat(customerPriceInclTax);
        }
        return customerPriceInclTax;
    }
}

/** @type AbstractCalculatorService */
let abstractCalculatorService = ServiceFactory.get(AbstractCalculatorService);

export default abstractCalculatorService;