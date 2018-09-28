import {AbstractOrderService} from "../AbstractService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import {AbstractProductTypeService} from "../../catalog/product/type/AbstractTypeService";
import NumberHelper from "../../../helper/NumberHelper";
import StatusItemConstant from "../../../view/constant/order/StatusItemConstant";
import ProductTypeConstant from "../../../view/constant/ProductTypeConstant";
import OrderHelper from "../../../helper/OrderHelper";
import CurrencyHelper from "../../../helper/CurrencyHelper";
import i18n from "../../../config/i18n";
import toNumber from "lodash/toNumber";

export class OrderItemService extends AbstractOrderService {
    static className = 'OrderItemService';

    /**
     * Check item can creditmemo
     *
     * @param item
     * @param order
     * @return {boolean}
     */
    canCreditmemo(item, order) {
        if (item.parent_item_id) {
            return false
        }
        if ([ProductTypeConstant.BUNDLE, ProductTypeConstant.CONFIGURABLE].includes(item.product_type)) {
            if (this.getQtyToRefund(item, order)) {
                return true;
            }
            return !!this.getChildrenItems(item, order).find(
                child => this.getQtyToRefund(child, order) > 0
            );
        }
        return !!this.getQtyToRefund(item, order) > 0;
    }

    /**
     * Retrieve item qty available for refund
     *
     * @param item
     * @param order
     * @return {number}
     */
    getQtyToRefund(item, order) {
        if (this.isDummy(item, order)) {
            return 0;
        }
        let qtyToRefund = Math.max(NumberHelper.minusNumber(item.qty_invoiced, item.qty_refunded), 0);

        if (item.product_type !== ProductTypeConstant.GIFT_CARD) {
            return qtyToRefund;
        }


        return qtyToRefund - toNumber(item.gift_card_qty_used ? item.gift_card_qty_used : 0);
    }

    /**
     * Retrieve item qty available for ship
     *
     * @return {number}
     */
    getQtyToShip(item, order) {
        if (this.isDummy(item, order, true)) {
            return 0;
        }

        return this.getSimpleQtyToShip(item);
    }

    /**
     * Retrieve item qty available for ship
     *
     * @return {number}
     */
    getSimpleQtyToShip(item) {
        let qty = NumberHelper.addNumber(item.qty_ordered, -item.qty_shipped, -item.qty_refunded, -item.qty_canceled);
        return Math.max(qty, 0);
    }


    /**
     * Retrieve item qty available for invoice
     *
     * @return {number}
     */
    getQtyToInvoice(item, order) {
        if (this.isDummy(item, order)) {
            return 0;
        }
        let qty = NumberHelper.addNumber(item.qty_ordered, -item.qty_invoiced, -item.qty_canceled);
        return Math.max(qty, 0);
    }


    /**
     * Retrieve item qty available for cancel
     *
     * @return {number}
     */
    getQtyToCancel(item, order) {
        let qtyToCancel = Math.min(this.getQtyToInvoice(item, order), this.getQtyToShip(item, order));
        return Math.max(qtyToCancel, 0);
    }


    /**
     * Return checking of what calculation
     * type was for this product
     *
     * @param item
     * @param order
     * @return {boolean}
     */
    isChildrenCalculated(item, order) {
        let parentItem = this.getParentItem(item, order);
        let options = null;
        if (parentItem) {
            options = parentItem.product_options;
        } else {
            options = item.product_options;
        }
        options = options ? JSON.parse(options) : {};
        if (options && typeof options.product_calculations !== 'undefined' &&
            +options.product_calculations === AbstractProductTypeService.CALCULATE_CHILD) {
            return true;
        }
        return false;
    }

    /**
     * Return checking of what shipment
     * type was for this product
     *
     * @param item
     * @param order
     * @return {boolean}
     */
    isShipSeparately(item, order) {
        let parentItem = this.getParentItem(item, order);
        let options = null;
        if (parentItem) {
            options = parentItem.product_options;
        } else {
            options = item.product_options;
        }
        options = options ? JSON.parse(options) : {};
        if (options && typeof options.shipment_type !== 'undefined' &&
            +options.shipment_type === AbstractProductTypeService.SHIPMENT_SEPARATELY
        ) {
            return true;
        }
        return false;
    }

    /**
     * This is Dummy item or not
     * if $shipment is true then we checking this for shipping situation if not
     * then we checking this for calculation
     *
     * @param item
     * @param order
     * @param shipment
     * @return {boolean}
     */
    isDummy(item, order, shipment = false) {
        if (shipment) {
            if (this.getHasChildren(item, order) && this.isShipSeparately(item, order)) {
                return true;
            }
            if (this.getHasChildren(item, order) && !this.isShipSeparately(item, order)) {
                return false;
            }
            if (this.getParentItem(item, order) && this.isShipSeparately(item, order)) {
                return false;
            }
            if (this.getParentItem(item, order) && !this.isShipSeparately(item, order)) {
                return true;
            }
        } else {
            if (this.getHasChildren(item, order) && this.isChildrenCalculated(item, order)) {
                return true;
            }
            if (this.getHasChildren(item, order) && !this.isChildrenCalculated(item, order)) {
                return false;
            }
            if (this.getParentItem(item, order) && this.isChildrenCalculated(item, order)) {
                return false;
            }
            if (this.getParentItem(item, order) && !this.isChildrenCalculated(item, order)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check order item has children
     *
     * @param item
     * @param order
     * @return {boolean|*}
     */
    getHasChildren(item, order) {
        if (typeof item.has_children === 'undefined') {
            if (item.parent_item_id) {
                item.has_children = false;
            } else {
                let childrenItems = this.getChildrenItems(item, order);
                item.has_children = childrenItems && childrenItems.length;
            }
        }
        return item.has_children;
    }


    isProcessingAvailable(item, order) {
        return this.getQtyToShip(item, order) - this.getQtyToCancel(item, order);
    }

    _getQtyChildrenBackordered(item, order) {
        let backordered = null;
        let childrenItems = this.getChildrenItems(item, order);
        childrenItems.forEach(childrenItem => {
            backordered += childrenItem.qty_backordered;
        });
        return backordered;
    }


    getStatusId(item, order) {

        let backordered = item.qty_backordered;
        if (!backordered && this.getHasChildren(item, order)) {
            backordered = this._getQtyChildrenBackordered(item, order);
        }

        let canceled = item.qty_canceled;
        let invoiced = item.qty_invoiced;
        let ordered = item.qty_ordered;
        let refunded = item.qty_refunded;
        let shipped = item.qty_shipped;

        let actuallyOrdered = ordered - canceled - refunded;

        if (!invoiced && !shipped && !refunded && !canceled && !backordered) {
            return StatusItemConstant.STATUS_PENDING;
        }
        if (shipped && invoiced && actuallyOrdered === shipped) {
            return StatusItemConstant.STATUS_SHIPPED;
        }

        if (invoiced && !shipped && actuallyOrdered === invoiced) {
            return StatusItemConstant.STATUS_INVOICED;
        }

        if (backordered && actuallyOrdered === backordered) {
            return StatusItemConstant.STATUS_BACKORDERED;
        }

        if (refunded && ordered === refunded) {
            return StatusItemConstant.STATUS_REFUNDED;
        }

        if (canceled && ordered === canceled) {
            return StatusItemConstant.STATUS_CANCELED;
        }

        if (Math.max(shipped, invoiced) < actuallyOrdered) {
            return StatusItemConstant.STATUS_PARTIAL;
        }

        return StatusItemConstant.STATUS_MIXED;
    }

    cancel(item, order) {
        if (this.getStatusId(item, order) !== StatusItemConstant.STATUS_CANCELED) {
            item.qty_canceled = this.getQtyToCancel(item, order)
            item.tax_canceld = item.tax_canceld + item.base_tax_amount * (item.qty_canceled / item.qty_ordered);
            item.discount_tax_compensation_canceled = item.discount_tax_compensation_canceled + item.discount_tax_compensation_amount * (item.qty_canceled / item.qty_ordered);
        }
        return item;
    }



    /**
     * Get Order Item option label as array
     * @param orderItem
     * @param order
     * @return {Array}
     */
    getOrderItemOptionLabelsAsArray(orderItem, order) {
        let productOptions = (orderItem.product_options && !Array.isArray(orderItem.product_options)) ?
            JSON.parse(orderItem.product_options) : null;
        if (!productOptions) {
            return [];
        }
        if (
            ![
                ProductTypeConstant.CONFIGURABLE,
                ProductTypeConstant.SIMPLE,
                ProductTypeConstant.VIRTUAL,
                ProductTypeConstant.GIFT_CARD
            ].includes(orderItem.product_type)
        ) {
            return [];
        }
        let result = [];
        result.push(...this.getConfigurableOption(productOptions));
        result.push(...this.getCustomOption(productOptions));

        if ( orderItem.product_type === ProductTypeConstant.GIFT_CARD) {
            result.push(...this.getGiftCardOption(productOptions, order));
        }

        return result;
    }

    /**
     * get option of configurable item
     * @param productOptions
     * @return {*}
     */
    getConfigurableOption(productOptions) {
        if (!productOptions) return [];
        const {attributes_info} = productOptions;
        if (!attributes_info) return [];
        return attributes_info.map(attribute_info => {
            return `${attribute_info.value}`;
        });
    }

    /**
     * display custom options
     * @param productOptions
     * @return {Array}
     */
    getCustomOption(productOptions) {
        let result = [];
        let customOptions = productOptions && productOptions.options ?
            productOptions.options : [];
        customOptions.map(option => {
            return result.push(option.value);
        });
        return result;
    }

    /**
     * display gift card options
     * @param productOptions
     * @param order
     * @param t
     * @return {Array}
     */
    getGiftCardOption(productOptions, order, t) {
        order              = order || false;
        t                  = t || i18n.translator.translate;
        let result         = [];
        let infoBuyRequest = productOptions.info_buyRequest ? productOptions.info_buyRequest : {};
        let amount         = infoBuyRequest.amount ? infoBuyRequest.amount : 0;

        result.push(t(
            "Value: {{value}}",
            {value: order ? OrderHelper.formatPrice(amount, order) : CurrencyHelper.format(amount)}
        ));

        return result;
    }
}

/** @type OrderItemService */
let orderItemService = ServiceFactory.get(OrderItemService);

export default orderItemService;