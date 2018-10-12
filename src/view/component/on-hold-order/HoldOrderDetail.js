import React from "react";
import CoreComponent from '../../../framework/component/CoreComponent';
import ComponentFactory from '../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../framework/container/CoreContainer';
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import SmoothScrollbar from "smooth-scrollbar";
import DateTimeHelper from "../../../helper/DateTimeHelper";
import OrderService from "../../../service/sales/OrderService";
import OrderItem from "../order/order-detail/detail-content/OrderItem";
import {Panel} from "react-bootstrap";
import moment from "moment/moment";
import ShippingAddress from '../order/order-detail/detail-content/ShippingAddress';
import BillingAddress from '../order/order-detail/detail-content/BillingAddress';
import OrderHelper from "../../../helper/OrderHelper";
import OnHoldOrderAction from "../../action/OnHoldOrderAction";
import TaxHelper from "../../../helper/TaxHelper";
import OrderWeeeDataService from "../../../service/weee/OrderWeeeDataService";

export class HoldOrderDetail extends CoreComponent {
    static className = 'HoldOrderDetail';

    setBlockContentElement = element => {
        this.block_content = element;
        if (!this.scrollbarOrderDetail) {
            this.scrollbarOrderDetail = SmoothScrollbar.init(this.block_content);
        }
    };

    /**
     * Component will receive props
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.order !== nextProps.order) {
            if (this.scrollbarOrderDetail) {
                this.scrollbarOrderDetail.scrollTo(0, 0);
            }
        }
    }

    /**
     * component will unmount
     */
    componentWillUnmount() {
        if (this.scrollbarOrderDetail) {
            SmoothScrollbar.destroy(this.scrollbarOrderDetail);
        }
    }

    /**
     * handle delete order
     */
    deleteOrder() {
        this.props.actions.deleteOrder(this.props.order);
        this.props.deleteCurrentOrder();
    }

    /**
     * handle click checkout order
     */
    async handleCheckout() {
        this.props.startReorder();
    }

    /**
     * template
     * @returns {*}
     */
    template() {
        let {order, isLoading} = this.props;
        let created_at = order ?
            moment(DateTimeHelper.convertDatabaseDateTimeToLocalDate(order.created_at)).format('L LT') : "";
        let weeeTotal = order && order.items ? OrderWeeeDataService.getTotalAmounts(order.items, order) : "";

        let staffDiscount = (order && (order.staff_discount !== undefined)) ? order.staff_discount : '';
        if (staffDiscount !== '') {
            while(typeof staffDiscount === 'string'){
                staffDiscount = JSON.parse(staffDiscount);
            }
        }

        return (
            <div className="wrapper-order-right wrapper-onhold-details">
                <div className="block-title">
                    <span className="title">{order ? order.increment_id : ''}</span>

                    <span className="price">{order ? OrderHelper.formatPrice(order.grand_total, order) : ''}</span>
                </div>

                <div data-scrollbar ref={this.setBlockContentElement} className="block-content">
                    {
                        !order ?
                            (
                                isLoading ?
                                    <div/>
                                    :
                                    <div className="page-notfound">
                                        <div className="icon"></div>
                                        {
                                            this.props.t('No order is found.')
                                        }
                                    </div>
                            )
                            :
                            <div>
                                <div className="order-info">
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="order-detail">
                                                <div>
                                                    {
                                                        this.props.t(
                                                            "Order Date: {{created_at}}",
                                                            {created_at: created_at}
                                                        )
                                                    }
                                                </div>
                                                <div>
                                                    {
                                                        this.props.t(
                                                            "Customer: {{name}}",
                                                            {name: order.customer_firstname+' '+order.customer_lastname}
                                                        )
                                                    }
                                                </div>
                                                <div>
                                                    {
                                                        order.pos_staff_name ?
                                                            this.props.t("Staff: {{name}}",{name: order.pos_staff_name})
                                                            :
                                                            ''
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="order-total">
                                                <ul>
                                                    <li>
                                                        <span className="title">{this.props.t('Subtotal')}</span>
                                                        <span className="value">
                                                            {OrderService.getDisplaySubtotal(order)}
                                                        </span>
                                                    </li>
                                                    <li>
                                                        <span className="title">{this.props.t('FPT')}</span>
                                                        <span className="value">
                                                            {OrderHelper.formatPrice(weeeTotal, order)}
                                                        </span>
                                                    </li>
                                                    {
                                                        !TaxHelper.orderDisplayZeroTaxSubTotal() && order.tax_amount===0
                                                            ?
                                                            null
                                                            :
                                                            <li>
                                                                <span className="title">{this.props.t('Tax')}</span>
                                                                <span className="value">
                                                                    {OrderHelper.formatPrice(order.tax_amount, order)}
                                                                </span>
                                                            </li>
                                                    }
                                                    <li>
                                                        <span className="title">{this.props.t('Grand Total')}</span>
                                                        <span className="value">
                                                            {/* COCO-CUSTOMIZE */}
                                                            <span className="value">
                                                                <span>{OrderHelper.formatPrice(order.grand_total, order)}</span>
                                                                {
                                                                    (order.staff_discount !== undefined && (staffDiscount.manager_discount_applied > 0 || staffDiscount.staff_discount_applied > 0)) ? <span className="before-staff-discount">{OrderHelper.formatPrice(staffDiscount.total_amount)}</span> : ''
                                                                }
                                                            </span>
                                                        </span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="accordion" className="panel-group" role="tablist" aria-multiselectable="true">
                                    <Panel eventKey="1" defaultExpanded key={Math.random()}>
                                        <Panel.Heading>
                                            <Panel.Title toggle>{this.props.t('Items Ordered')}</Panel.Title>
                                        </Panel.Heading>
                                        <Panel.Body collapsible>
                                            {
                                                order.items.map(item => {
                                                    return <OrderItem key={'' + item.item_id + Math.random()}
                                                                      item={item} order={order}/>
                                                })
                                            }
                                        </Panel.Body>
                                    </Panel>
                                    <div className="panel-flex">
                                        {
                                            !order.is_virtual ?
                                                <Panel eventKey="2" key={Math.random()}>
                                                    <Panel.Heading>
                                                        <Panel.Title toggle>
                                                            {this.props.t('Shipping Address')}
                                                        </Panel.Title>
                                                    </Panel.Heading>
                                                    <Panel.Body collapsible>
                                                        <ShippingAddress order={order}/>
                                                    </Panel.Body>
                                                </Panel>
                                                : null
                                        }
                                        <Panel eventKey="3" key={Math.random()}>
                                            <Panel.Heading>
                                                <Panel.Title toggle>{this.props.t('Billing Address')}</Panel.Title>
                                            </Panel.Heading>
                                            <Panel.Body collapsible>
                                                <BillingAddress order={order}/>
                                            </Panel.Body>
                                        </Panel>
                                    </div>
                                </div>
                            </div>
                    }
                </div>
                {
                    order ?
                        <div className="block-actions">
                            <ul className="actions">
                                <li>
                                    <button className="btn btn-cannel"
                                            onClick={() => this.deleteOrder()}>
                                        {this.props.t('Delete')}
                                    </button>
                                </li>
                                <li>
                                    <button className="btn btn-default"
                                            onClick={() => this.handleCheckout()}>
                                        {this.props.t('Checkout')}
                                    </button>
                                </li>
                            </ul>
                        </div>
                        :
                        null
                }
            </div>
        )
    }
}

class HoldOrderDetailContainer extends CoreContainer {
    static className = 'HoldOrderDetailContainer';

    static mapState(state) {
        return {};
    }

    static mapDispatch(dispatch) {
        return {
            actions: {
                deleteOrder: (order) => dispatch(OnHoldOrderAction.deleteOrder(order)),
            }
        }
    }
}

/**
 * @type {HoldOrderDetail}
 */
export default ContainerFactory.get(HoldOrderDetailContainer).withRouter(
    ComponentFactory.get(HoldOrderDetail)
);