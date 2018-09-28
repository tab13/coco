import React from "react";
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import CoreComponent from "../../../../../framework/component/CoreComponent";
import OrderService from "../../../../../service/sales/OrderService";
import Config from "../../../../../config/Config";
import DateTimeHelper from "../../../../../helper/DateTimeHelper";
import moment from "moment/moment";

export class ShippingMethod extends CoreComponent {
    static className = 'ShippingMethod';

    /**
     * get display delivery date
     * @return {string}
     */
    getDisplayDeliveryDate() {
        let {order} = this.props;
        let deliveryDate = '';
        if (Config.config.shipping.delivery_date) {
            let date = 'N/A';

            if (order.shipping_method && order.pos_delivery_date) {
                date = moment(
                    DateTimeHelper.convertDatabaseDateTimeToLocalDate(order.pos_delivery_date)
                ).format('L LT');
            }

            deliveryDate = (
                <li>
                    <div className="title">{this.props.t('Delivery Date')}</div>
                    <div className="value">{date}</div>
                </li>
            );
        }
        return deliveryDate;
    }

    /**
     * template
     * @returns {*}
     */
    template() {
        let {order} = this.props;
        return (
            <ul className="shipping-method">
                <li>
                    <div className="title">{order.shipping_description}</div>
                    <div className="value">
                        {OrderService.getShippingMethodAmount(order)}
                    </div>
                </li>
                {this.getDisplayDeliveryDate()}
            </ul>
        );
    }
}

class ShippingMethodContainer extends CoreContainer {
    static className = 'ShippingMethodContainer';
}

/**
 * @type {ShippingMethod}
 */
export default ContainerFactory.get(ShippingMethodContainer).withRouter(
    ComponentFactory.get(ShippingMethod)
);