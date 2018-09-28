import CoreService from "../../../CoreService";
import CurrencyHelper from '../../../../helper/CurrencyHelper';
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import PriceService from "../PriceService";
import NumberHelper from "../../../../helper/NumberHelper";
import DateTimeHelper from "../../../../helper/DateTimeHelper";
import CustomerGroupConstant from "../../../../view/constant/customer/CustomerGroupConstant";
import UserService from "../../../user/UserService";

export class AbstractPriceService extends CoreService {
    static className = 'AbstractProductPriceService';

    getPriceService(product) {
        return PriceService.getPriceService(product);
    }

    /**
     * Get currency helper
     *
     * @return {CurrencyHelper}
     */
    getCurrencyHelper() {
        return CurrencyHelper;
    }

    /**
     * Retrieve children product final price
     *
     * @param {object} product
     * @param {number} productQty
     * @param {object} childProduct
     * @param {number} childProductQty
     * @param {object} quote
     * @param {object} item
     * @return {number}
     */
    getChildFinalPrice(product, productQty, childProduct, childProductQty, quote, item) {
        return this.getFinalPrice(childProductQty, childProduct, quote, item);
    }

    /**
     * Retrieve product final price
     *
     * @param {number} qty
     * @param {object} product
     * @param {object} quote
     * @param {object} item
     * @return {number}
     */
    getFinalPrice(qty, product, quote, item) {
        /*if (qty === null && product.calculated_final_price !== null) {
            return product.calculated_final_price;
        }*/
        let finalPrice = this.getBasePrice(product, qty, quote);
        let catalogRuleProductPrice = this.getCatalogRulePrice(product, finalPrice, quote);
        product.final_price = Math.min(finalPrice, catalogRuleProductPrice);

        /*$this->_eventManager->dispatch('catalog_product_get_final_price', ['product' => $product, 'qty' => $qty]);*/

        finalPrice = product.final_price;
        finalPrice = this._applyOptionsPrice(product, qty, finalPrice);
        finalPrice = Math.max(0, finalPrice);
        finalPrice = this._applyCustomPrice(item, finalPrice);
        product.final_price = finalPrice;

        return finalPrice;
    }

    /**
     * Retrieve product final price
     *
     * @param {number} qty
     * @param {object} product
     * @param {object} quote
     * @param {object} item
     * @return {number}
     */
    getOriginalFinalPrice(qty, product, quote, item) {
        /*if (qty === null && product.calculated_final_price !== null) {
            return product.calculated_final_price;
        }*/
        let finalPrice = this.getBasePrice(product, qty, quote);
        let catalogRuleProductPrice = this.getCatalogRulePrice(product, finalPrice, quote);
        product.final_price = Math.min(finalPrice, catalogRuleProductPrice);

        /*$this->_eventManager->dispatch('catalog_product_get_final_price', ['product' => $product, 'qty' => $qty]);*/

        finalPrice = product.final_price;
        finalPrice = this._applyOptionsPrice(product, qty, finalPrice);
        finalPrice = Math.max(0, finalPrice);
        product.final_price = finalPrice;

        return finalPrice;
    }

    /**
     * get catalog rule product price
     * @param product
     * @param finalPrice
     * @param quote
     * @return {*}
     */
    getCatalogRulePrice(product, finalPrice, quote) {
        let catalogRulePrices = product.catalogrule_prices ? product.catalogrule_prices : [];
        if(!catalogRulePrices.length) {
            return finalPrice;
        }
        let groupId = quote.customer_group_id;
        if (typeof groupId === undefined) {
            return finalPrice;
        }
        let websiteId = UserService.getWebsiteId();
        let date = DateTimeHelper.getDatabaseDateTime().split(' ')[0];
        let rulePrice = catalogRulePrices.find(item =>
            Number(item.customer_group_id) === Number(groupId)
            && Number(item.website_id) === Number(websiteId)
            && item.rule_date === date
        );
        if (rulePrice) {
            return rulePrice.rule_price;
        }
        return finalPrice;
    }

    /**
     * Get base price with apply Group, Tier, Special prises
     *
     * @param {object} product
     * @param {number} qty
     * @param {object} quote
     * @return {number}
     */
    getBasePrice(product, qty = null, quote) {
        let price = parseFloat(product.price);
        let basePrice = Math.min(
            this._applyTierPrice(product, qty, price, quote),
            this._applySpecialPrice(product, price)
        );
        return basePrice;
    }

    /**
     * Apply custom price
     * @param item
     * @param finalPrice
     * @returns {*}
     */
    _applyCustomPrice(item, finalPrice) {
        if(item && (item.custom_price != null)){
            finalPrice = item.custom_price
        }
        return finalPrice;
    }

    /**
     * Apply tier price for product if not return price that was before
     *
     * @param {object} product
     * @param {number} qty
     * @param {number} finalPrice
     * @param {Object} quote
     * @return {number}
     */
    _applyTierPrice(product, qty, finalPrice, quote) {
        if (qty === null) {
            return finalPrice;
        }
        let tierPrice = this.getTierPrice(qty, product, quote);
        if (!isNaN(tierPrice)) {
            finalPrice = Math.min(finalPrice, tierPrice);
        }
        return finalPrice;
    }

    /**
     * @param {number} qty
     * @param {object} product
     * @param {object} quote
     * @return {number}
     */
    getTierPrice(qty, product, quote) {
        if (!quote || !product.tier_prices || !Array.isArray(product.tier_prices) || !product.tier_prices.length) {
            return product.price;
        }
        let customerGroup = quote.customer_group_id;
        if (qty) {
            let prevQty = 1,
                prevPrice = product.price,
                prevGroup = CustomerGroupConstant.CUST_GROUP_ALL;
            product.tier_prices.forEach(price => {
                if (price.customer_group_id !== customerGroup &&
                    price.customer_group_id !== CustomerGroupConstant.CUST_GROUP_ALL) {
                    return false;
                }
                if (qty < price.qty) {
                    return false;
                }
                if(price.qty < prevQty) {
                    return false;
                }
                if(price.qty === prevQty &&
                    prevGroup !== CustomerGroupConstant.CUST_GROUP_ALL &&
                    price.customer_group_id === CustomerGroupConstant.CUST_GROUP_ALL) {
                    return false;
                }
                if(price.value < prevPrice) {
                    prevPrice = price.value;
                    prevQty = price.qty;
                    prevGroup = price.customer_group_id;
                }
            });
            return prevPrice;
        }
        return product.price;
    }

    /**
     * Apply special price for product if not return price that was before
     *
     * @param product
     * @param finalPrice
     * @return {*}
     * @private
     */
    _applySpecialPrice(product, finalPrice) {
        return this.calculateSpecialPrice(
            finalPrice,
            product.special_price,
            product.special_from_date,
            product.special_to_date,
        );
    }

    /**
     * Calculate and apply special price
     *
     * @param finalPrice
     * @param specialPrice
     * @param specialPriceFrom
     * @param specialPriceTo
     * @return {*}
     */
    calculateSpecialPrice(finalPrice,
                          specialPrice,
                          specialPriceFrom,
                          specialPriceTo) {
        if (typeof specialPrice !== 'undefined' && specialPrice !== null && specialPrice !== false) {
            if (DateTimeHelper.isCurrentDateInInterval(specialPriceFrom, specialPriceTo)) {
                finalPrice = Math.min(finalPrice, specialPrice)
            }
        }
        return finalPrice;
    }

    /**
     * Appy option price for product
     *
     * @param product
     * @param qty
     * @param finalPrice
     * @return {*}
     * @private
     */
    _applyOptionsPrice(product, qty, finalPrice) {
        if (product.custom_options) {
            let optionIds = product.custom_options.option_ids;
            if (optionIds) {
                let basePrice = finalPrice;
                optionIds = optionIds.split(',');
                optionIds.forEach(optionId => {
                    let option = this.getProductOption(product, optionId);
                    if (option && option.option_id) {
                        let optionValue = product.custom_options['option_' + optionId];
                        if (typeof optionValue !== 'undefined' && optionValue !== null) {
                            let price = this.getOptionPrice(option, optionValue, basePrice);
                            finalPrice = NumberHelper.addNumber(finalPrice, price);
                        }
                    }
                });
            }
        }
        return finalPrice;
    }

    /**
     * get select custom option
     *
     * @param product
     * @param optionId
     * @return {null}
     */
    getProductOption(product, optionId) {
        if (product.custom_options && product.custom_options.length) {
            let option = product.custom_options.find(option => option.option_id === +optionId);
            if (option && option.option_id) {
                return option;
            }
        }
        return null;
    }

    /**
     * Get price of option by selected values
     *
     * @param option
     * @param optionValue
     * @param basePrice
     * @return {number}
     */
    getOptionPrice(option, optionValue, basePrice) {
        let price = 0;
        let calculationArray = [];
        if (option.values && option.values.length) {
            let arrayValue = Array.isArray(optionValue) ? optionValue.map(Number) : [+optionValue];
            option.values.forEach(value => {
                if (arrayValue.includes(value.option_type_id) &&
                    typeof value.price_type !== 'undefined' && typeof value.price !== 'undefined') {
                    calculationArray.push({price_type: value.price_type, price: value.price});
                }
            });
        } else {
            if (typeof option.price_type !== 'undefined' && typeof option.price !== 'undefined') {
                calculationArray.push({price_type: option.price_type, price: option.price});
            }
        }
        calculationArray.forEach(calculation => {
            price = NumberHelper.addNumber(price, this._getChargableOptionPrice(
                calculation.price, calculation.price_type === 'percent', basePrice
            ));
        });
        return price;
    }

    /**
     * Return final chargable price for option
     *
     * @param optionPrice
     * @param isPercent
     * @param basePrice
     * @return {*}
     * @private
     */
    _getChargableOptionPrice(optionPrice, isPercent, basePrice) {
        if (isPercent) {
            return NumberHelper.multipleNumber(basePrice, optionPrice) / 100;
        } else {
            return optionPrice;
        }
    }
}


let abstractPriceService = ServiceFactory.get(AbstractPriceService);

export default abstractPriceService;
