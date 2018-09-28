import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import ConfigHelper from "../../helper/ConfigHelper";
import ShippingConfigConstant from "../../view/constant/shipping/ConfigConstant";
import TaxConfigConstant from "../../view/constant/tax/ConfigConstant";
import CustomerGroupHelper from "../../helper/CustomerGroupHelper";
import CurrencyHelper from "../../helper/CurrencyHelper";
import TaxHelper from "../../helper/TaxHelper";
import NumberHelper from "../../helper/NumberHelper";

export class CalculationToolService extends CoreService {
    static className = 'CalculationToolService';

    /**
     * Cache to hold the rates
     */
    _rateCache = {};

    /**
     * Store the rate calculation process
     */
    _rateCalculationProcess = {};


    getDefaultRateRequest(customer) {
        if (TaxHelper.crossBorderTradeEnabled()) {
            return this.getRateRequest(null, null, null, customer);
        } else {
            return this.getRateOriginRequest();
        }
    }

    /**
     * Get tax rate request
     *
     * @param shippingAddress
     * @param billingAddress
     * @param customerTaxClass
     * @param customer
     * @returns {*}
     */
    getRateRequest(shippingAddress = null, billingAddress = null, customerTaxClass = null, customer = null) {
        if (shippingAddress === false && billingAddress === false && customerTaxClass === false) {
            return this.getRateOriginRequest();
        }
        let address = {};
        let basedOn = ConfigHelper.getConfig(TaxConfigConstant.CONFIG_XML_PATH_BASED_ON);
        if ((shippingAddress === false && basedOn === 'shipping') ||
            (billingAddress === false && basedOn === 'billing')) {
            basedOn = 'default';
        } else {
            if (((billingAddress === null || !billingAddress.country_id) && basedOn === 'billing')
                || ((shippingAddress === null || !shippingAddress.country_id) && basedOn === 'shipping')) {
                if (customer && customer.id) {
                    /** @todo get default address of customer for rate request */
                } else {
                    if (basedOn === 'billing' && typeof shippingAddress === 'object' && shippingAddress
                        && shippingAddress.country_id) {
                        billingAddress = shippingAddress;
                    } else if (basedOn === 'shipping' && typeof billingAddress === 'object' && billingAddress
                        && billingAddress.country_id) {
                        shippingAddress = billingAddress;
                    } else {
                        basedOn = 'default';
                    }
                }
            }
        }

        switch (basedOn) {
            case 'billing':
                address = billingAddress;
                break;
            case 'shipping':
                address = shippingAddress;
                break;
            case 'origin':
                address = this.getRateOriginRequest();
                break;
            case 'default':
                address.country_id = ConfigHelper.getConfig(TaxConfigConstant.CONFIG_XML_PATH_DEFAULT_COUNTRY);
                address.region_id = ConfigHelper.getConfig(TaxConfigConstant.CONFIG_XML_PATH_DEFAULT_REGION);
                address.postcode = ConfigHelper.getConfig(TaxConfigConstant.CONFIG_XML_PATH_DEFAULT_POSTCODE);
                break;
            default:
                break;
        }

        if (customerTaxClass === null || customerTaxClass === false) {
            if (customer && customer.id) {
                customerTaxClass = CustomerGroupHelper.getTaxClassId(customer.group_id);
            } else {
                customerTaxClass = CustomerGroupHelper.getTaxClassId(0);
            }
        }
        let request = {};

        let regionId = address.region && address.region.region_id ? address.region.region_id : address.region_id;

        request.country_id = address.country_id;
        request.region_id = regionId;
        request.postcode = address.postcode;
        request.customer_class_id = customerTaxClass;

        return request;
    }

    /**
     * Get rate by request
     *
     * @param request
     * @returns {number}
     */
    getRate(request) {
        if (!request.country_id || !request.customer_class_id || !request.product_class_id) {
            return 0;
        }
        let cacheKey = this._getRequestCacheKey(request);
        if (typeof this._rateCache[cacheKey] === 'undefined') {
            let rateInfo = this.getRateInfo(request);
            this._rateCache[cacheKey] = rateInfo.value;
            this._rateCalculationProcess[cacheKey] = rateInfo.process;
        }
        return this._rateCache[cacheKey];
    }

    /**
     * Retrieve Calculation Process
     *
     * @param request
     * @param rates
     * @return {Array}
     */
    getCalculationProcess(request, rates = null) {
        if (rates === null) {
            rates = this._getRates(request);
        }

        let result = [],
            row = {},
            ids = [],
            currentRate = 0,
            totalPercent = 0,
            countedRates = rates.length;
        for (let index = 0; index < countedRates; index++) {
            let rate = rates[index];
            let value = (typeof rate['value'] !== 'undefined' ? rate['value'] : rate['percent']) * 1;

            let oneRate = {
                code: rate['code'],
                title: rate['title'],
                percent: value,
                position: rate['position'],
                priority: rate['priority']
            };

            if (typeof rate.tax_calculation_rule_id !== 'undefined') {
                oneRate.rule_id = rate.tax_calculation_rule_id;
            }

            if (typeof rate.hidden !== 'undefined') {
                row.hidden = rate.hidden;
            }

            if (typeof rate.amount !== 'undefined') {
                row.amount = rate.amount;
            }

            if (typeof rate.base_amount !== 'undefined') {
                row.base_amount = rate.base_amount;
            }
            if (typeof rate.base_real_amount !== 'undefined') {
                row.base_real_amount = rate.base_real_amount;
            }
            if (!row.rates) {
                row.rates = [];
            }
            row.rates.push(oneRate);

            let ruleId = null;
            if (typeof rates[index + 1] !== 'undefined' &&
                typeof rates[index + 1]['tax_calculation_rule_id'] !== 'undefined') {
                ruleId = rate.tax_calculation_rule_id;
            }
            let priority = rate.priority;
            ids.push(rate.code);

            if (typeof rates[index + 1] !== 'undefined' &&
                typeof rates[index + 1]['tax_calculation_rule_id'] !== 'undefined') {
                while (typeof rates[index + 1] !== 'undefined' &&
                rates[index + 1]['tax_calculation_rule_id'] === ruleId) {
                    index++;
                }
            }

            currentRate = NumberHelper.addNumber(currentRate, value);

            /* eslint-disable */
            if (typeof rates[index + 1] === 'undefined' ||
                rates[index + 1]['priority'] !== priority ||
                typeof rates[index + 1]['process'] !== 'undefined' &&
                rates[index + 1]['process'] !== rate.process
            ) {
                if (rates[index]['calculate_subtotal']) {
                    row.percent = currentRate;
                    totalPercent = NumberHelper.addNumber(totalPercent, currentRate);
                } else {
                    row.percent = this._collectPercent(totalPercent, currentRate);
                    totalPercent = NumberHelper.addNumber(totalPercent, row.percent);
                }
                row.id = ids.join('');
                result.push(row);
                row = {};
                ids = [];
                currentRate = 0;
            }
            /* eslint-enable */
        }

        return result;
    }

    /**
     * Return combined percent value
     *
     * @param percent
     * @param rate
     * @return {*|number}
     * @private
     */
    _collectPercent(percent, rate) {
        return NumberHelper.multipleNumber(NumberHelper.addNumber(100, percent), (rate / 100));
    }

    /**
     * Calculate rate
     *
     * @param rates
     * @return {number}
     * @private
     */
    _calculateRate(rates) {
        let result = 0;
        let currentRate = 0;
        let countedRates = rates.length;
        for (let index = 0; index < countedRates; index++) {
            let rate = rates[index];
            let rule = rate.tax_calculation_rule_id;
            let value = rate.value;
            let priority = rate.priority;

            while (typeof rates[index + 1] !== 'undefined' && rates[index + 1]['tax_calculation_rule_id'] === rule) {
                index++;
            }

            currentRate = NumberHelper.addNumber(currentRate, value);

            if (typeof rates[index + 1] === 'undefined' || rates[index + 1]['priority'] !== priority) {
                if (rates[index]['calculate_subtotal']) {
                    result = NumberHelper.addNumber(result, currentRate);
                } else {
                    result += this._collectPercent(result, currentRate);
                }
                currentRate = 0;
            }
        }

        return result;
    }

    /**
     * Get tax rate information: calculation process data and tax rate
     *
     * @param request
     * @return {{process, value}}
     */
    getRateInfo(request) {
        let rates = this._getRates(request);
        return {
            process: this.getCalculationProcess(request, rates),
            value: this._calculateRate(rates)
        }
    }

    /**
     * Returns tax rates for request - either pereforms SELECT from DB, or returns already cached result
     * Notice that productClassId due to optimization can be array of ids
     *
     * @param request
     * @private
     */
    _getRates(request) {
        let appliedRules = this.getAppliedRules(request);
        let rates = this.getAppliedRatesByRules(request, appliedRules);
        return rates;
    }

    /**
     * Get all rule is applied by request
     *
     * @param request
     */
    getAppliedRules(request) {
        let taxRules = TaxHelper.getAllTaxRules();
        let appliedRules = taxRules.filter(rule => {
            return rule.product_tax_class_ids.includes(request.product_class_id) &&
                rule.customer_tax_class_ids.includes(request.customer_class_id);
        });
        appliedRules.sort((a, b) => {
            if (a.priority === b.priority) {
                return a.id - b.id;
            } else {
                if (a.priority > b.priority) {
                    return 1;
                }
                return -1;
            }
        });
        return appliedRules;
    }

    /**
     * Get all rates applied by rules
     *
     * @param request
     * @param appliedRules
     * @return {Array}
     */
    getAppliedRatesByRules(request, appliedRules) {
        let taxRates = this.getAllTaxRates();
        let appliedRates = [];
        let validRates = {},
            invalidRates = {};
        appliedRules.forEach(rule => {
            let rates = taxRates.filter(taxRate => rule.tax_rate_ids.includes(taxRate.id));
            rates.forEach(taxRate => {
                if (typeof validRates[taxRate.id] === 'undefined' && typeof invalidRates[taxRate.id] === 'undefined') {
                    if (this.validateTaxRate(request, taxRate)) {
                        appliedRates.push({
                            tax_calculation_rate_id: taxRate.id,
                            tax_calculation_rule_id: rule.id,
                            customer_tax_class_id: request.customer_class_id,
                            product_tax_class_id: request.product_class_id,
                            priority: rule.priority,
                            position: rule.position,
                            calculate_subtotal: rule.calculate_subtotal,
                            value: taxRate.rate,
                            tax_country_id: taxRate.tax_country_id,
                            tax_region_id: taxRate.tax_region_id,
                            tax_postcode: taxRate.tax_postcode,
                            code: taxRate.code,
                            title: taxRate.titles && taxRate.titles.length ? taxRate.titles[0] : taxRate.code
                        });
                        validRates[taxRate.id] = taxRate;
                    } else {
                        invalidRates[taxRate.id] = taxRate;
                    }
                }
            });
        });
        return appliedRates;
    }

    /**
     * Get and sort all tax rate
     *
     * @return {*}
     */
    getAllTaxRates() {
        let taxRates = TaxHelper.getAllTaxRates();
        let sortFields = ['tax_country_id', 'tax_region_id', 'tax_postcode', 'value', 'id'];
        taxRates = ConfigHelper.sortArrayObjectsByArrayFields(taxRates, sortFields, 'DESC');
        return taxRates;
    }

    /**
     * Validate tax rate by request
     *
     * @param request
     * @param taxRate
     * @return {boolean}
     */
    validateTaxRate(request, taxRate) {
        let countryId = request.country_id,
            regionId = parseFloat(request.region_id),
            postcode = request.postcode;
        if (countryId !== taxRate.tax_country_id) {
            return false;
        }
        if (![0, regionId].includes(taxRate.tax_region_id)) {
            return false;
        }
        if (taxRate.zip_is_range === 1) {
            return taxRate.zip_from <= postcode <= taxRate.zip_to;
        } else {
            return taxRate.tax_postcode === '*' || postcode === taxRate.tax_postcode;
        }
    }

    /**
     * Get cache key value for specific tax rate request
     *
     * @param {object} request
     * @return {string}
     */
    _getRequestCacheKey(request) {
        let key = request.product_class_id + '|'
            + request.customer_class_id + '|'
            + request.country_id + '|'
            + request.region_id + '|'
            + request.postcode;
        return key;
    }

    /**
     * Get tax rate based on store shipping origin address settings
     * This rate can be used for conversion store price including tax to
     * store price excluding tax
     *
     * @param request
     * @return {number}
     */
    getStoreRate(request) {
        let storeRequest = this.getRateOriginRequest();
        storeRequest.product_class_id = request.product_class_id;
        return this.getRate(storeRequest);
    }

    /**
     *  Get request object for getting tax rate based on store shipping original address
     *
     * @return {{country_id: *, region_id: *, postcode: *, customer_tax_class_id: *}}
     */
    getRateOriginRequest() {
        return {
            country_id: ConfigHelper.getConfig(ShippingConfigConstant.XML_PATH_ORIGIN_COUNTRY_ID),
            region_id: ConfigHelper.getConfig(ShippingConfigConstant.XML_PATH_ORIGIN_REGION_ID),
            postcode: ConfigHelper.getConfig(ShippingConfigConstant.XML_PATH_ORIGIN_POSTCODE),
            customer_class_id: this.getDefaultCustomerTaxClass()
        }
    }

    /**
     * Get information about tax rates applied to request
     *
     * @param request
     * @return {*}
     */
    getAppliedRates(request) {
        if (!request.country_id || !request.customer_class_id || !request.product_class_id) {
            return [];
        }

        let cacheKey = this._getRequestCacheKey(request);
        if (typeof this._rateCalculationProcess[cacheKey] === 'undefined') {
            this.getRate(request);
        }
        return this._rateCalculationProcess[cacheKey];
    }

    /**
     * Fetch default customer tax class
     *
     * @return {function(*): ((function(*): *)|*)}
     */
    getDefaultCustomerTaxClass() {
        return CustomerGroupHelper.getTaxClassId(CustomerGroupHelper.getDefaultCustomerGroupId());
    }

    /**
     * Calculate rated tax amount based on price and tax rate.
     * If you are using price including tax $priceIncludeTax should be true.
     *
     * @param price
     * @param taxRate
     * @param priceIncludeTax
     * @param round
     * @return {*}
     */
    calcTaxAmount(price, taxRate, priceIncludeTax = false, round = true) {
        taxRate = taxRate / 100;
        let amount = 0;
        if (priceIncludeTax) {
            amount = price * (1 - 1 / (1 + taxRate));
        } else {
            amount = price * taxRate;
        }

        if (round) {
            return CurrencyHelper.roundToFloat(amount);
        }

        return amount;
    }
}

/** @type CalculationToolService */
let calculationToolService = ServiceFactory.get(CalculationToolService);

export default calculationToolService;