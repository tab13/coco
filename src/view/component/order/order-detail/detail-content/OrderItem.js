import React, {Fragment} from "react";
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import CoreComponent from "../../../../../framework/component/CoreComponent";
import OrderService from "../../../../../service/sales/OrderService";
import ProductTypeConstant from "../../../../constant/ProductTypeConstant";
import OrderHelper from "../../../../../helper/OrderHelper";
import StatusConstant from "../../../../constant/order/StatusConstant";
import OrderItemService from "../../../../../service/sales/order/OrderItemService";
import StaffDiscountService from "../../../../../service/staff-discount/StaffDiscountService";

export class OrderItem extends CoreComponent {
    static className = 'OrderItem';

    /**
     * Get display price
     * @param price
     * @param order
     * @return {*}
     */
    getDisplayPrice(price, order) {
        return OrderHelper.formatPrice(price, order);
    }

    /**
     * get option detail like as custom, bundle, configurable option
     * @param item
     * @return {*}
     */
    displayOption(item) {
        let productOptions = (item.product_options && !Array.isArray(item.product_options)) ?
            JSON.parse(item.product_options) : null;
        if(!productOptions) {
            return '';
        }
        let result = [];
        if (
            item.product_type === ProductTypeConstant.SIMPLE
            || item.product_type === ProductTypeConstant.VIRTUAL
        ) {
            result.push(...this.displayCustomOption(productOptions));
        }
        if (item.product_type === ProductTypeConstant.CONFIGURABLE) {
            result.push(...this.displayConfigurableOption(productOptions));
            result.push(...this.displayCustomOption(productOptions));
        }

        if (item.product_type === ProductTypeConstant.GIFT_CARD) {
            result.push(...this.displayGiftCardOption(productOptions));
        }

        return result.join(', ');
    }

    /**
     * display custom options
     * @param productOptions
     * @return {Array}
     */
    displayCustomOption(productOptions) {
        return OrderItemService.getCustomOption(productOptions);
    }

    /**
     * Display option of configurable item
     * @param productOptions
     * @return {*}
     */
    displayConfigurableOption(productOptions) {
        return OrderItemService.getConfigurableOption(productOptions);
    }

    /**
     * display gift card options
     * @param productOptions
     * @return {Array}
     */
    displayGiftCardOption(productOptions) {
        let { order, t } = this.props;
        return OrderItemService.getGiftCardOption(productOptions, order, t );
    }

    isShowShipped(){
        let {order, item} = this.props;
        if (!item.qty_shipped){
            return false;
        }
        if (item.product_type === ProductTypeConstant.BUNDLE){
            return !OrderItemService.isShipSeparately(item, order);
        } else if (OrderItemService.getParentItem(item, order)) {
            let parent = OrderItemService.getParentItem(item, order);
            return (parent.product_type === ProductTypeConstant.BUNDLE && OrderItemService.isShipSeparately(parent, order));
        }
        return true;
    }

    canShowPriceInfo() {
        let {order, item} = this.props;
        return ((OrderItemService.getParentItem(item, order) && OrderItemService.isChildrenCalculated(item, order)) || (!OrderItemService.getParentItem(item, order) && !OrderItemService.isChildrenCalculated(item, order)));
    }

    /**
     * check display original price
     * @param item
     * @returns {*|boolean}
     */
    displayOriginPrice(item) {
        return item && typeof item.pos_base_original_price_incl_tax !== 'undefined' && item.pos_base_original_price_incl_tax != null
            && typeof item.pos_original_price_excl_tax !== 'undefined' && item.pos_original_price_excl_tax != null;
    }

    /**
     * COCO-CUSTOMIZE
     * calculate staff discount on order item
     *
     * @param item
     * @param order
     * @param staffDiscountAmount
     * @returns {*}
     */
    calculateItemStaffDiscountAmount(item, order, staffDiscountAmount) {
        return ((OrderService.getItemOriginalPrice(item, order) * (staffDiscountAmount/100)) * item.qty_ordered) + item.discount_amount;
    }

    /**
     * COCO-CUSTOMIZE
     * template
     * @returns {*}
     */
    template() {
        let {order, item} = this.props;
        let isHolded = (order.status === StatusConstant.STATUS_HOLDED);

        let hasStaffDiscount = order.staff_discount.manager_discount_applied > 0 || order.staff_discount.staff_discount_applied > 0;
        let staffDiscountAmount = 0;
        if (order.staff_discount.manager_discount_applied > 0) {
            staffDiscountAmount = parseFloat(order.staff_discount.manager_discount_applied);
        }
        if (order.staff_discount.staff_discount_applied > 0) {
            staffDiscountAmount = parseFloat(order.staff_discount.staff_discount_applied);
        }

        if (item.product_type === ProductTypeConstant.BUNDLE) {
            return  (
                <div className="item-ordered">
                    <div className="item-detail">
                        <div className="name">{item.name}</div>
                        <div className="sku">{'[' + item.sku + ']'}</div>
                        <div className="option">
                            {
                                this.displayOption(item)
                            }
                        </div>
                        <div className="item-status">
                            <span>{this.props.t("Ordered: {{qty}}",{qty: item.qty_ordered})}</span>
                            {
                                !isHolded && this.isShowShipped() ?
                                    <Fragment>
                                        <span>
                                            {
                                                this.props.t(
                                                    "Shipped: {{qty}}",
                                                    {qty: (item.qty_shipped ? item.qty_shipped : 0)}
                                                )
                                            }
                                        </span>
                                    </Fragment>
                                    :
                                    null
                            }
                        </div>
                    </div>
                    {
                        this.canShowPriceInfo() ?
                            <div className="item-order">
                                <div>
                                    <b>{OrderService.getRowTotal(item, order)}</b>
                                    <b>
                                        {
                                            hasStaffDiscount ? ' / ' : ''
                                        }
                                        {
                                            hasStaffDiscount ? <b className="before-staff-discount">{OrderHelper.formatPrice((OrderService.getItemOriginalPrice(item, order) * item.qty_ordered),order)}</b> : ''
                                        }
                                    </b>
                                </div>
                                {
                                    hasStaffDiscount ?
                                        '': this.displayOriginPrice(item) ?
                                        <div className="origin-price">
                                            {this.props.t("Origin Price: {{original_price}}", {original_price: OrderService.getItemDisplayOriginalPrice(item, order)})}
                                        </div> : ''
                                }
                                <div>
                                    {
                                        hasStaffDiscount ? this.props.t("Price")+':'+ OrderService.getItemDisplayPrice(item, order) + ' / ' : this.props.t("Price: {{price}}", {price: OrderService.getItemDisplayPrice(item, order)})
                                    }
                                    {
                                        hasStaffDiscount ? <span className="before-staff-discount">{OrderService.getItemDisplayOriginalPrice(item, order)}</span> : ''
                                    }
                                </div>
                                <div>
                                    {this.props.t("Tax: {{tax}}", {tax: this.getDisplayPrice(item.tax_amount, order)})}
                                </div>
                                {
                                    item.weee_tax_applied_row_amount ?
                                        <div>
                                            {
                                                this.props.t(
                                                    "FPT: {{fpt}}",
                                                    {fpt: this.getDisplayPrice(item.weee_tax_applied_row_amount, order)}
                                                )
                                            }
                                        </div>
                                        :
                                        null
                                }
                                {
                                    !isHolded ?
                                        <div>
                                            {
                                                hasStaffDiscount ?
                                                    this.props.t("Discount") + ': ' + this.getDisplayPrice(this.calculateItemStaffDiscountAmount(item, order, staffDiscountAmount),order) : this.props.t("Discount: {{discount}}", {discount: this.getDisplayPrice(item.discount_amount, order)})
                                            }
                                        </div>
                                        :
                                        null
                                }
                            </div>
                            :null
                    }
                </div>
            )
        }

        if (item.parent_item_id) {
            let parent = order.items.find(x => Number(x.item_id) === Number(item.parent_item_id));
            if (parent && parent.product_type !== ProductTypeConstant.BUNDLE) {
                return null;
            }
        }

        return (
            <div className={item.parent_item_id?"item-ordered has-parent-order-item":'item-ordered'}>
                <div className="item-detail">
                    <div className="name">{item.name}</div>
                    <div className="sku">{'[' + item.sku + ']'}</div>
                    <div className="option">
                        {
                            this.displayOption(item)
                        }
                    </div>
                    <div className="item-status">
                        <span>{this.props.t("Ordered: {{qty}}",{qty: item.qty_ordered})}</span>
                        {
                            !isHolded ?
                                <Fragment>
                                    {
                                        item.qty_invoiced ?
                                            <span>
                                                {
                                                    this.props.t(
                                                        "Invoiced: {{qty}}",
                                                        {qty: (item.qty_invoiced ? item.qty_invoiced : 0)}
                                                    )
                                                }
                                            </span>
                                            : null
                                    }
                                    {
                                        this.isShowShipped() ?
                                            <span>
                                                {
                                                    this.props.t(
                                                        "Shipped: {{qty}}",
                                                        {qty: (item.qty_shipped ? item.qty_shipped : 0)}
                                                    )
                                                }
                                            </span>
                                            : null
                                    }
                                    {
                                        item.qty_refunded ?
                                            <span>
                                                {
                                                    this.props.t(
                                                        "Refunded: {{qty}}",
                                                        {qty: (item.qty_refunded ? item.qty_refunded : 0)}
                                                    )
                                                }
                                            </span>
                                            : null
                                    }
                                    {
                                        item.qty_canceled ?
                                            <span>
                                                {
                                                    this.props.t(
                                                        "Canceled: {{qty}}",
                                                        {qty: (item.qty_canceled ? item.qty_canceled : 0)}
                                                    )
                                                }
                                            </span>
                                            : null
                                    }
                                </Fragment>
                                : null
                        }
                    </div>
                    {
                        item.os_pos_custom_price_reason ?
                           <div className="custom-reason">
                               <span>{item.os_pos_custom_price_reason}</span>
                           </div>
                           : ''
                    }

                </div>
                {
                    this.canShowPriceInfo() ?
                    <div className="item-order">
                    <div>
                        <b>{OrderService.getRowTotal(item, order)}</b>
                        <b>
                            {
                                hasStaffDiscount ? ' / ' : ''
                            }
                            {
                                hasStaffDiscount ? <b className="before-staff-discount">{OrderHelper.formatPrice((OrderService.getItemOriginalPrice(item, order) * item.qty_ordered),order)}</b> : ''
                            }
                        </b>
                    </div>
                        {
                            hasStaffDiscount ?
                                '': this.displayOriginPrice(item) ?
                                <div className="origin-price">
                                    {this.props.t("Origin Price: {{original_price}}", {original_price: OrderService.getItemDisplayOriginalPrice(item, order)})}
                                </div> : ''
                        }
                        <div>
                            {
                                hasStaffDiscount ? this.props.t("Price")+':'+ OrderService.getItemDisplayPrice(item, order) + ' / ' : this.props.t("Price: {{price}}", {price: OrderService.getItemDisplayPrice(item, order)})
                            }
                            {
                                hasStaffDiscount ? <span className="before-staff-discount">{OrderService.getItemDisplayOriginalPrice(item, order)}</span> : ''
                            }
                        </div>
                        <div>
                            {this.props.t("Tax: {{tax}}", {tax: this.getDisplayPrice(item.tax_amount, order)})}
                        </div>
                        {
                            item.weee_tax_applied_row_amount ?
                                <div>
                                    {
                                        this.props.t(
                                            "FPT: {{fpt}}",
                                            {fpt: this.getDisplayPrice(item.weee_tax_applied_row_amount, order)}
                                        )
                                    }
                                </div>
                                :
                                null
                        }
                        {
                            !isHolded ?
                                <div>
                                    {
                                        hasStaffDiscount ?
                                            this.props.t("Discount") + ': ' + this.getDisplayPrice(this.calculateItemStaffDiscountAmount(item, order, staffDiscountAmount),order) : this.props.t("Discount: {{discount}}", {discount: this.getDisplayPrice(item.discount_amount, order)})
                                    }
                                </div>
                                :
                                null
                        }
                        </div>
                        : null
                }
            </div>
        );
    }
}

class OrderItemContainer extends CoreContainer {
    static className = 'OrderItemContainer';
}

/**
 * @type {OrderItem}
 */
export default ContainerFactory.get(OrderItemContainer).withRouter(
    ComponentFactory.get(OrderItem)
);