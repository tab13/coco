import React from "react";
import ComponentFactory from '../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import CoreComponent from "../../../../framework/component/CoreComponent";
import OrderHelper from "../../../../helper/OrderHelper";

export class HoldOrder extends CoreComponent {
    static className = 'HoldOrder';

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
        return (
            <li className={"item " + (isActive ? 'active' : '')}
                onClick={() => this.selectOrder(order)}>
                <div className="item-info">
                    <div className="name">
                        <span className="value">{order.increment_id}</span>
                    </div>
                    <div className="price">
                        <span className="value">{OrderHelper.formatPrice(order.grand_total, order)}</span>
                    </div>
                </div>
            </li>
        );
    }
}

class HoldOrderContainer extends CoreContainer {
    static className = 'HoldOrderContainer';
}

/**
 * @type {HoldOrder}
 */
export default ContainerFactory.get(HoldOrderContainer).withRouter(
    ComponentFactory.get(HoldOrder)
);