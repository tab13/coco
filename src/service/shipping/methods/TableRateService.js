import {AbstractShippingMethodService} from "./AbstractShippingMethodService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import QuoteItemService from "../../checkout/quote/ItemService";
import NumberHelper from "../../../helper/NumberHelper";
import ConfigHelper from "../../../helper/ConfigHelper";

export class TableRateService extends AbstractShippingMethodService {
    static className = 'TableRateService';
    static methodCode = "tablerate_tablerate";

    _defaultConditionName = 'package_weight';

    /**
     * Collect Rate
     *
     * @param request
     * @param quote
     * @return {Array}
     */
    collectRates(request, quote) {
        if (!this.getConfigData('include_virtual_price') && request.all_items) {
            request.all_items.forEach(item => {
                if (item.parent_item_id) {
                    return true;
                }
                if (item.has_children && QuoteItemService.isShipSeparately(item, quote)) {
                    QuoteItemService.getChildrenItems(quote, item).forEach(child => {
                        if (child.product.is_virtual) {
                            request.package_value = NumberHelper.minusNumber(
                                request.package_value, child.base_row_total
                            );
                        }
                    });
                } else if (item.product.is_virtual) {
                    request.package_value = NumberHelper.minusNumber(request.package_value, item.base_row_total);
                }
            });
        }

        let freeQty = 0;
        let freePackageValue = 0;
        if (request.all_items) {
            request.all_items.forEach(item => {
                if (item.product.is_virtual || item.parent_item_id) {
                    return false;
                }

                if (item.has_children && QuoteItemService.isShipSeparately(item, quote)) {
                    QuoteItemService.getChildrenItems(quote, item).forEach(child => {
                        if (child.free_shipping && !child.product.is_virtual) {
                            let freeShipping = !isNaN(child.free_shipping) && typeof child.free_shipping !== 'boolean' ?
                                child.free_shipping : 0;
                            freeQty = NumberHelper.addNumber(
                                freeQty,
                                NumberHelper.multipleNumber(item.qty, NumberHelper.minusNumber(child.qty, freeShipping))
                            );
                        }
                    });
                } else if (item.free_shipping) {
                    let freeShipping = !isNaN(item.free_shipping) && typeof item.free_shipping !== 'boolean' ?
                        item.free_shipping : 0;
                    freeQty = NumberHelper.addNumber(freeQty, NumberHelper.minusNumber(item.qty, freeShipping));
                    freePackageValue = NumberHelper.addNumber(freePackageValue, item.base_row_total);
                }
            });
            let oldValue = request.package_value;
            request.package_value = NumberHelper.minusNumber(oldValue, freePackageValue);
        }

        if (!request.condition_name) {
            let conditionName = this.getConfigData('condition_name');
            request.condition_name = conditionName ? conditionName : this._defaultConditionName;
        }

        let oldWeight = request.package_weight;
        let oldQty = request.package_qty;

        request.package_weight = request.free_method_weight;
        request.package_qty = NumberHelper.minusNumber(oldQty, freeQty);

        let result = [];

        let rate = this.getRate(request);

        request.package_weight = oldWeight;
        request.package_qty = oldQty;

        if (rate && +rate.price >= 0) {
            let shippingPrice = 0;
            if (request.package_qty !== freeQty) {
                shippingPrice = this.getFinalPriceWithHandlingFee(+rate.price);
            }
            let method = this.createShippingMethod(shippingPrice, +rate.cost);
            result.push(method);
        } else if (request.package_qty === freeQty) {
            request.package_value = freePackageValue;
            request.package_qty = freeQty;
            rate = this.getRate(request);
            if (rate && +rate.price >= 0) {
                let method = this.createShippingMethod(0, 0);
                result.push(method);
            }
        }
        return result;
    }

    /**
     * Get valid rate
     *
     * @param request
     * @return {boolean}
     */
    getRate(request) {
        let rates = this.getConfigData('rates');
        if (rates && Array.isArray(rates) && rates.length) {
            let countryId = request.dest_country_id;
            let regionId = request.dest_region_id;
            if (regionId !== null && typeof regionId !== 'undefined') {
                regionId = regionId.toString();
            } else {
                regionId = "";
            }
            let postCode = request.dest_postcode;
            let validRates = rates.filter(rate => {
                rate.condition_value = +rate.condition_value;
                if (rate.condition_name !== request.condition_name) {
                    return false;
                }
                if (rate.condition_value > request[request.condition_name]) {
                    return false;
                }
                if (rate.dest_country_id === countryId) {
                    if (rate.dest_region_id === regionId) {
                        return [postCode, "", '*'].includes(rate.dest_zip)
                    }
                    if (rate.dest_region_id === '0') {
                        return [postCode, "", '*'].includes(rate.dest_zip)
                    }
                }
                if (rate.dest_country_id === '0') {
                    return (rate.dest_region_id === regionId && rate.dest_zip === "*") ||
                        (rate.dest_region_id === '0' && rate.dest_zip === '*')
                }
                return false;
            });
            if (!validRates || !validRates.length) {
                return false;
            }
            let sortFields = ['dest_country_id', 'dest_region_id', 'dest_zip', 'condition_value'];
            validRates = ConfigHelper.sortArrayObjectsByArrayFields(validRates, sortFields, 'DESC');
            return validRates[0];
        }
        return false;
    }

    /**
     * Create shipping method by shipping price and cost
     *
     * @param shippingPrice
     * @param cost
     * @return {{carrier: string, method: string, code: *, title: *, description: *, price: *, cost: *}}
     */
    createShippingMethod(shippingPrice, cost) {
        let method = {
            carrier: 'tablerate',
            method: 'bestway',
            code: this.getConfigData('code'),
            title: this.getConfigData('title'),
            description: this.getConfigData('description'),
            price: shippingPrice,
            cost: cost
        };
        return method;
    }
}

/** @type TableRateService */
let tableRateService = ServiceFactory.get(TableRateService);

export default tableRateService;
