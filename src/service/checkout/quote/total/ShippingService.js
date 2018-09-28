import {AbstractTotalService} from "./AbstractService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import AddressService from "../AddressService";
import QuoteItemService from "../ItemService";
import NumberHelper from "../../../../helper/NumberHelper";
import FreeShippingService from "../../../shipping/quote/address/FreeShippingService";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import ShippingService from "../../../shipping/ShippingService";

export class QuoteTotalShippingService extends AbstractTotalService {
    static className = 'QuoteTotalShippingService';

    code = "shipping";

    /**
     * Collect shipping
     *
     * @param quote
     * @param address
     * @param total
     * @return {QuoteTotalShippingService}
     */
    collect(quote, address, total) {
        super.collect(quote, address, total);
        let isVirtual = this.isVirtual(quote);
        if (!isVirtual && AddressService.isShippingAddress(address)
        ) {
            address.weight = 0;
            address.free_method_weight = 0;

            let addressWeight = address.weight;
            let freeMethodWeight = address.free_method_weight;
            let addressFreeShipping = address.free_shipping;

            this._setAmount(0);
            this._setBaseAmount(0);

            if (!quote.items || !quote.items.length) {
                return this;
            }

            let addressQty = 0;

            quote.items.forEach(item => {
                if (item.product.is_virtual) {
                    return false;
                }
                if (item.parent_item_id) {
                    return false;
                }
                if (item.has_children && QuoteItemService.isShipSeparately(item, quote)) {
                    QuoteItemService.getChildrenItems(quote, item).forEach(child => {
                        if (child.product.is_virtual) {
                            return false;
                        }
                        let itemQty = QuoteItemService.getTotalQty(child, quote);
                        addressQty = NumberHelper.addNumber(addressQty, itemQty);

                        if (!item.product.weight_type) {
                            let itemWeight = child.weight;
                            let rowWeight = NumberHelper.multipleNumber(itemWeight, itemQty);
                            addressWeight = NumberHelper.addNumber(addressWeight, rowWeight);
                            if (addressFreeShipping && child.free_shipping === true) {
                                rowWeight = 0;
                            } else if (!isNaN(child.free_shipping)) {
                                let freeQty = child.free_shipping;
                                if (itemQty > freeQty) {
                                    rowWeight = NumberHelper.multipleNumber(
                                        itemWeight, NumberHelper.minusNumber(itemQty, freeQty)
                                    );
                                } else {
                                    rowWeight = 0;
                                }
                            }
                            freeMethodWeight = NumberHelper.addNumber(freeMethodWeight, rowWeight);
                            item.row_weight = rowWeight;
                        }
                    });
                    if (item.product.weight_type) {
                        let itemWeight = item.weight;
                        let rowWeight = NumberHelper.multipleNumber(itemWeight, item.qty);
                        addressWeight = NumberHelper.addNumber(addressWeight, rowWeight);
                        if (addressFreeShipping && item.free_shipping === true) {
                            rowWeight = 0;
                        } else if (!isNaN(item.free_shipping)) {
                            let freeQty = item.free_shipping;
                            if (item.qty > freeQty) {
                                rowWeight = NumberHelper.multipleNumber(
                                    itemWeight, NumberHelper.minusNumber(item.qty, freeQty)
                                );
                            } else {
                                rowWeight = 0;
                            }
                        }
                        freeMethodWeight = NumberHelper.addNumber(freeMethodWeight, rowWeight);
                        item.row_weight = rowWeight;
                    }
                } else {
                    if (!item.product.is_virtual) {
                        addressQty = NumberHelper.addNumber(addressQty, item.qty);
                    }
                    let itemWeight = item.weight;
                    let rowWeight = NumberHelper.multipleNumber(itemWeight, item.qty);
                    if (addressFreeShipping && item.free_shipping === true) {
                        rowWeight = 0;
                    } else if (!isNaN(item.free_shipping)) {
                        let freeQty = item.free_shipping;
                        if (item.qty > freeQty) {
                            rowWeight = NumberHelper.multipleNumber(
                                itemWeight, NumberHelper.minusNumber(item.qty, freeQty)
                            );
                        } else {
                            rowWeight = 0;
                        }
                    }
                    freeMethodWeight = NumberHelper.addNumber(freeMethodWeight, rowWeight);
                    item.row_weight = rowWeight;
                }
            });

            if (typeof addressQty !== 'undefined') {
                address.item_qty = addressQty;
            }
            address.weight = addressWeight;
            address.free_method_weight = freeMethodWeight;

            address.free_shipping = FreeShippingService.isFreeShipping(quote, address, quote.items);

            let allowMethods = ShippingService.getAllowShippingMethods();

            let shippingMethods = AddressService.requestShippingRates(quote, address, allowMethods);

            let method = shippingMethods.find(method => method.code === address.shipping_method);

            if (method) {
                address.current_shipping_method = method;
            } else {
                address.shipping_amount = 0;
                address.base_shipping_amount = 0;
                total.shipping_method = "";
                total.shipping_description = "";
            }

            if (address.shipping_method) {
                let method = address.current_shipping_method;
                let amountPrice = CurrencyHelper.convert(method.price);
                this._setAmount(amountPrice);
                this._setBaseAmount(method.price);
                address.shipping_description = method.title;
                total.base_shipping_amount = method.price;
                total.shipping_amount = amountPrice;
                total.shipping_description = method.title;
            }
            quote.shipping_method = address.shipping_method;
        }
        return this;
    }
}

/** @type QuoteTotalShippingService */
let quoteTotalShippingService = ServiceFactory.get(QuoteTotalShippingService);

export default quoteTotalShippingService;