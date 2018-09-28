import {AbstractPriceService} from "./AbstractPriceService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import NumberHelper from "../../../../helper/NumberHelper";
import cloneDeep from 'lodash/cloneDeep';
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import CustomerGroupConstant from "../../../../view/constant/customer/CustomerGroupConstant";
import ProductService from "../../ProductService";
import DateTimeHelper from "../../../../helper/DateTimeHelper";

export class BundlePriceService extends AbstractPriceService {
    static className = 'BundleProductPriceService';

    /**
     * Fixed bundle price type
     */
    PRICE_TYPE_FIXED = 1;

    /**
     * Dynamic bundle price type
     */
    PRICE_TYPE_DYNAMIC = 0;

    /**
     * Return product base price
     *
     * @param product
     * @return {number}
     */
    getPrice(product) {
        if (product.price_type === this.PRICE_TYPE_FIXED) {
            return product.price;
        } else {
            return 0;
        }
    }

    /**
     * Get product final price
     *
     * @param qty
     * @param product
     * @param quote
     * @param item
     * @return {number}
     */
    getFinalPrice(qty, product, quote, item) {
        let finalPrice = this.getBasePrice(product, qty, quote);
        let catalogRuleProductPrice = this.getCatalogRulePrice(product, finalPrice, quote);
        product.final_price = Math.min(finalPrice, catalogRuleProductPrice);
        /*$this->_eventManager->dispatch('catalog_product_get_final_price', ['product' => $product, 'qty' => $qty]);*/

        finalPrice = product.final_price;
        finalPrice = this._applyOptionsPrice(product, qty, finalPrice);
        finalPrice += this.getTotalBundleItemsPrice(product, qty, quote);
        finalPrice = Math.max(0, finalPrice);
        finalPrice = this._applyCustomPrice(item, finalPrice);
        product.final_price = finalPrice;
        return finalPrice;
    }

    /**
     * Get product original final price
     *
     * @param qty
     * @param product
     * @param quote
     * @param item
     * @return {number}
     */
    getOriginalFinalPrice(qty, product, quote, item) {
        let finalPrice = this.getBasePrice(product, qty, quote);
        let catalogRuleProductPrice = this.getCatalogRulePrice(product, finalPrice, quote);
        product.final_price = Math.min(finalPrice, catalogRuleProductPrice);
        /*$this->_eventManager->dispatch('catalog_product_get_final_price', ['product' => $product, 'qty' => $qty]);*/

        finalPrice = product.final_price;
        finalPrice = this._applyOptionsPrice(product, qty, finalPrice);
        finalPrice += this.getTotalBundleItemsPrice(product, qty, quote);
        finalPrice = Math.max(0, finalPrice);
        product.final_price = finalPrice;
        return finalPrice;
    }

    /**
     * Get child final price
     *
     * @param product
     * @param productQty
     * @param childProduct
     * @param childProductQty
     * @param quote
     * @param item
     * @return {number}
     */
    getChildFinalPrice(product, productQty, childProduct, childProductQty, quote, item) {
        return this.getSelectionFinalTotalPrice(product, childProduct, productQty, childProductQty, quote, false);
    }

    /**
     * Get Total price  for Bundle items
     *
     * @param product
     * @param qty
     * @param quote
     * @return {number}
     */
    getTotalBundleItemsPrice(product, qty = null, quote) {
        let price = 0;
        let selectionIds = this.getBundleSelectionIds(product);
        if (selectionIds) {
            let selections = this.getSelectionsByIds(selectionIds, product);
            selections.map(selection => {
                if (ProductService.isSalable(selection.product)) {
                    let selectionQty = product.custom_options['selection_qty_' + selection.id];
                    if (selectionQty) {
                        price = NumberHelper.addNumber(price, this.getSelectionFinalTotalPrice(
                            product, selection, qty, selection.qty, quote
                        ));
                    }
                }
                return selection;
            });
        }
        return price;
    }

    /**
     * Retrieve array of bundle selection IDs
     *
     * @param product
     * @return {*}
     */
    getBundleSelectionIds(product) {
        let selectionIds = product.custom_options ? product.custom_options.bundle_selection_ids : null;
        if (selectionIds && selectionIds.length) {
            if (Array.isArray(selectionIds)) {
                return selectionIds;
            } else {
                selectionIds = selectionIds.split(',');
                if (selectionIds.length) {
                    return selectionIds;
                }
            }
        }
        return null;
    }

    /**
     * Retrieve array of bundle selection
     *
     * @param selectionIds
     * @param product
     * @return {Array}
     */
    getSelectionsByIds(selectionIds, product) {
        let selections = [];
        if (product.extension_attributes && product.extension_attributes.bundle_product_options) {
            let bundleOptions = product.extension_attributes.bundle_product_options;
            bundleOptions.map(option => {
                if (option.product_links && option.product_links.length) {
                    option.product_links.map(productLink => {
                        if (selectionIds.includes(productLink.id)) {
                            selections.push(productLink);
                        }
                        return productLink;
                    });
                }
                return bundleOptions;
            })
        }
        return selections;
    }

    /**
     * Returns final price of a child product
     *
     * @param bundleProduct
     * @param selectionProduct
     * @param bundleQty
     * @param selectionQty
     * @param quote
     * @param multiplyQty
     * @param takeTierPrice
     * @return {number}
     */
    getSelectionFinalTotalPrice(bundleProduct, selectionProduct, bundleQty, selectionQty, quote,
                                multiplyQty = true, takeTierPrice = true) {
        let price = 0;
        if (!bundleQty) {
            bundleQty = 1;
        }
        if (selectionQty === null) {
            selectionQty = selectionProduct.qty;
        }
        if (bundleProduct.price_type === this.PRICE_TYPE_DYNAMIC) {
            price = this.getPriceService(selectionProduct.product ? selectionProduct.product : selectionProduct)
                .getFinalPrice(
                    takeTierPrice ? selectionQty : 1,
                    selectionProduct.product ? selectionProduct.product : selectionProduct,
                    quote
                );
        } else {
            if (selectionProduct.price_type) {
                let product = cloneDeep(bundleProduct);
                product.final_price = this.getPrice(product);
                // $this->_eventManager->dispatch(
                //     'catalog_product_get_final_price',
                //     ['product' => $product, 'qty' => $bundleQty]
                // );
                price = NumberHelper.multipleNumber(product.final_price, selectionProduct.price / 100);
            } else {
                price = selectionProduct.price;
            }
        }
        if (multiplyQty) {
            price = NumberHelper.multipleNumber(price, selectionQty);
        }
        return Math.min(
            price,
            this._applyTierPrice(bundleProduct, bundleQty, price, quote),
            this._applySpecialPrice(bundleProduct, price)
        );
    }

    /**
     * Apply tier price for bundle
     *
     * @param {object} product
     * @param {number} qty
     * @param {number} finalPrice
     * @param quote
     * @return {number}
     */
    _applyTierPrice(product, qty, finalPrice, quote) {
        if (qty === null) {
            return finalPrice;
        }

        let tierPrice = this.getTierPrice(qty, product, quote);
        if (!isNaN(tierPrice)) {
            tierPrice = finalPrice - finalPrice * (tierPrice / 100);
            finalPrice = Math.min(finalPrice, tierPrice);
        }

        return finalPrice;
    }

    /**
     *
     * @param qty
     * @param product
     * @param quote
     * @return {*}
     */
    getTierPrice(qty, product, quote) {
        if (!quote || !product.tier_prices || !Array.isArray(product.tier_prices) || !product.tier_prices.length) {
            return null;
        }
        let customerGroup = quote.customer_group_id;
        if (qty) {
            let prevQty = 1,
                prevPrice = 0,
                prevGroup = CustomerGroupConstant.CUST_GROUP_ALL;
            product.tier_prices.forEach(price => {
                let percentageValue = price.extension_attributes && price.extension_attributes.percentage_value ?
                    price.extension_attributes.percentage_value : 0;
                if(percentageValue <= 0) {
                    return false;
                }
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
                if(percentageValue > prevPrice) {
                    prevPrice = percentageValue;
                    prevQty = price.qty;
                    prevGroup = price.customer_group_id;
                }
            });
            return prevPrice;
        }
        return null;
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
                specialPrice = finalPrice * (specialPrice / 100);
                finalPrice = Math.min(finalPrice, specialPrice)
            }
        }
        return finalPrice;
    }

    /**
     * Get selection product price
     *
     * @param bundleProduct
     * @param selectionProduct
     * @param childProduct
     * @return {*|number}
     */
    getSelectionPrice(bundleProduct, selectionProduct, childProduct) {
        if (bundleProduct.price_type === this.PRICE_TYPE_FIXED) {
            if (+selectionProduct.price_type) {
                return CurrencyHelper.roundToFloat(bundleProduct.price * selectionProduct.price / 100);
            }
            return CurrencyHelper.roundToFloat(selectionProduct.price);
        }
        return childProduct.price;
    }
}

/** @type BundlePriceService */
let bundlePriceService = ServiceFactory.get(BundlePriceService);

export default bundlePriceService;