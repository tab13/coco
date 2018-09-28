import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import CustomerService from "../customer/CustomerService";
import CustomerGroupHelper from "../../helper/CustomerGroupHelper";
import CalculationToolService from "../tax/CalculationToolService";
import WeeeHelper from "../../helper/WeeeHelper";
import TaxHelper from "../../helper/TaxHelper";
import NumberHelper from "../../helper/NumberHelper";
import CurrencyHelper from "../../helper/CurrencyHelper";

export class WeeeTaxService extends CoreService {
    static className = 'WeeeTaxService';

    /**
     * Get product attributes
     *
     * @param quote
     * @param product
     * @param shipping
     * @param billing
     * @param calculateTax
     * @param round
     * @return {Array}
     */
    getProductWeeeAttributes(quote, product, shipping = null, billing = null, calculateTax = null, round = null) {
        let result = [];
        let customer = quote ? quote.customer : null;
        let customerTaxClass = null;
        if (shipping && shipping.country_id) {
            customerTaxClass = quote ? quote.customer_tax_class_id : CustomerGroupHelper.getTaxClassId(0);
        } else {
            if (customer && customer.id) {
                shipping = CustomerService.getDefaultShippingAddress(customer);
                billing = CustomerService.getDefaultBillingAddress(customer);
                customerTaxClass = CustomerGroupHelper.getTaxClassId(0);
            } else {
                shipping = CustomerService.getDefaultShippingAddress();
                billing = CustomerService.getDefaultBillingAddress();
                customerTaxClass = quote ? quote.customer_tax_class_id : CustomerGroupHelper.getTaxClassId(0);
            }
        }

        let rateRequest = CalculationToolService.getRateRequest(shipping, billing, customerTaxClass, customer);

        let defaultRateRequest = CalculationToolService.getDefaultRateRequest();

        let productAttributes = this.fetchWeeeTaxCalculationsByProduct(
            rateRequest.country_id, rateRequest.region_id, product
        );

        productAttributes.forEach(attribute => {
            let value = attribute.weee_value;
            if (value) {
                let taxAmount = 0,
                    amount = value,
                    amountExclTax = value;

                if (calculateTax && WeeeHelper.isTaxable()) {
                    defaultRateRequest.product_class_id = product.tax_class_id;
                    rateRequest.product_class_id = product.tax_class_id;
                    let defaultPercent = CalculationToolService.getRate(defaultRateRequest);
                    let currentPercent = CalculationToolService.getRate(rateRequest);
                    if (TaxHelper.priceIncludesTax()) {
                        let amountInclTax = value / NumberHelper.addNumber(100, defaultPercent) *
                            NumberHelper.addNumber(100, currentPercent);
                        if (round) {
                            amountInclTax = CurrencyHelper.roundToFloat(amountInclTax);
                        }
                        taxAmount = amountInclTax - amountInclTax / NumberHelper.addNumber(100, currentPercent) * 100;
                        if (round) {
                            taxAmount = CurrencyHelper.roundToFloat(taxAmount);
                        }
                        amountExclTax = amountInclTax - taxAmount;
                    } else {
                        let appliedRates = CalculationToolService.getAppliedRates(rateRequest);
                        if (appliedRates && appliedRates.length && appliedRates.length > 1) {

                        } else {
                            taxAmount = NumberHelper.multipleNumber(value, currentPercent) / 100
                            if (round) {
                                taxAmount = CurrencyHelper.roundToFloat(taxAmount);
                            }
                        }
                    }
                }
                let one = {
                    name: attribute.label_value ? attribute.label_value : attribute.frontend_label,
                    amount: amount,
                    tax_amount: taxAmount,
                    amount_excl_tax: amountExclTax,
                    code: attribute.attribute_code
                };
                result.push(one);
            }
        });
        return result;
    }

    fetchWeeeTaxCalculationsByProduct(countryId, regionId, product) {
        if (!product || !product.fpt || !product.fpt.length) {
            return [];
        }
        let appliedTaxArray = [];
        product.fpt.forEach(attribute => {
            let attributeArray = JSON.parse(attribute);
            if (attributeArray && Array.isArray(attributeArray) && attributeArray.length) {
                attributeArray.forEach(weeTax => {
                    if (weeTax.country !== countryId) {
                        return false;
                    }
                    let regionArray = [0, '0', regionId];
                    if (regionId) {
                        regionArray.push(regionId.toString());
                    }
                    if (!regionArray.includes(weeTax.state)) {
                        return false;
                    }
                    appliedTaxArray.push({
                        attribute_code: 'fpt',
                        frontend_label: 'FPT',
                        label_value: '',
                        weee_value: parseFloat(weeTax.value),
                    });
                });
            }
        });
        return appliedTaxArray;
    }
}

/** @type WeeeTaxService */
let weeeTaxService = ServiceFactory.get(WeeeTaxService);

export default weeeTaxService;