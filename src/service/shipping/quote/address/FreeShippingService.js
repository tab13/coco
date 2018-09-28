import CoreService from "../../../CoreService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import QuoteItemService from "../../../checkout/quote/ItemService";

export class FreeShippingService extends CoreService {
    static className = 'FreeShippingService';

    FREE_SHIPPING_ITEM = '1';

    /**
     * Free Shipping option "For shipment with matching items"
     */
    FREE_SHIPPING_ADDRESS = '2';

    /**
     *
     * @param quote
     * @param address
     * @param items
     * @return {boolean}
     */
    isFreeShipping(quote, address, items) {
        let addressFreeShipping = true;
        items.forEach(item => {
            if (item.no_discount) {
                addressFreeShipping = false;
                item.free_shipping = false;
                return false;
            }
            if (item.parent_item_id) {
                return false;
            }
            this.processFreeShipping(quote, address, item);

            let itemFreeShipping = !!item.free_shipping;
            addressFreeShipping = addressFreeShipping && itemFreeShipping;

            if (addressFreeShipping && address.free_shipping) {
                address.free_shipping = true;
            }

            this.applyToChildren(quote, address, item, itemFreeShipping);
        });
        return !!address.free_shipping;
    }

    /**
     *
     * @param quote
     * @param address
     * @param item
     */
    processFreeShipping(quote, address, item) {
        item.free_shipping = false;
        if (quote.valid_salesrule && quote.valid_salesrule.length) {
            quote.valid_salesrule.forEach(rule => {
                if (rule.valid_item_ids.includes(+item.item_id)) {
                    switch (rule.simple_free_shipping) {
                        case this.FREE_SHIPPING_ITEM:
                            item.free_shipping = rule.discount_qty ? rule.discount_qty : true;
                            break;
                        case this.FREE_SHIPPING_ADDRESS:
                            address.free_shipping = true;
                            break;
                        default:
                            break;
                    }
                }
            });
        }
    }

    /**
     *
     * @param quote
     * @param address
     * @param item
     * @param isFreeShipping
     */
    applyToChildren(quote, address, item, isFreeShipping) {
        if (item.has_children && QuoteItemService.isChildrenCalculated(item, quote)) {
            QuoteItemService.getChildrenItems(quote, item).forEach(child => {
                this.processFreeShipping(quote, address, child);
                if (isFreeShipping) {
                    child.free_shipping = isFreeShipping;
                }
            });
        }
    }
}

/** @type FreeShippingService */
let freeShippingService = ServiceFactory.get(FreeShippingService);

export default freeShippingService;
