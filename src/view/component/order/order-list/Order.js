import React from "react";
import ComponentFactory from '../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import CoreComponent from "../../../../framework/component/CoreComponent";
import OrderService from "../../../../service/sales/OrderService";
import OrderHelper from "../../../../helper/OrderHelper";

export class Order extends CoreComponent {
    static className = 'Order';

    /**
     * get price label
     * @returns {{className: string, value: string}}
     */
    getPriceLabel() {
        return OrderService.getPriceLabel(this.props.order);
    }

    /**
     * handle select order
     * @param order
     */
    selectOrder(order) {
        this.props.selectOrder(order);
    }

    /**
     * template
     * @returns {*}
     */
    template() {
        let {order, isActive} = this.props;
        let priceLabel = this.getPriceLabel();
        return (
            <li className={"item " + (isActive ? 'active' : '')}
                onClick={() => this.selectOrder(order)}>
                <div className="item-info">
                    <div className="name">
                        <span className="value">{order.increment_id}</span>
                        <span className={"status " + order.status}>
                            {
                                this.props.t(OrderService.getDisplayStatus(order.state, order.status))
                            }
                        </span>
                    </div>
                    <div className="price">
                        <span className="value">{OrderHelper.formatPrice(order.grand_total, order)}</span>
                        <span className={"price-label " + priceLabel.className}>{priceLabel.value}</span>
                    </div>
                </div>
            </li>
        );
    }
}

class OrderContainer extends CoreContainer {
    static className = 'OrderContainer';
}

/**
 * @type {Order}
 */
export default ContainerFactory.get(OrderContainer).withRouter(
    ComponentFactory.get(Order)
);