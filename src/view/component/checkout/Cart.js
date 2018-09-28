import React, {Fragment} from 'react';
import CoreComponent from "../../../framework/component/CoreComponent";
import CartItems from "./cart/CartItems";
import CartFooter from "./cart/CartFooter";
import ComponentFactory from "../../../framework/factory/ComponentFactory";
import CoreContainer from "../../../framework/container/CoreContainer";
import ContainerFactory from "../../../framework/factory/ContainerFactory";

import '../../style/css/Cart.css';
import '../../style/css/Customer.css';
import CustomerButton from "../customer/CustomerButton";
import CartTotals from "./cart/CartTotals";

export class CartComponent extends CoreComponent {
    static className = 'CartComponent';

    /**
     * render template
     *
     * @returns {*}
     */
    template() {
        return (
            <Fragment>
                <div className="wrapper-content-customer">
                    <CustomerButton/>
                    <CartItems/>
                    <CartTotals/>
                    <CartFooter/>
                </div>
            </Fragment>
        );
    }
}

/**
 *
 * @type {CartComponent}
 */
const component = ComponentFactory.get(CartComponent);

export class CartContainer extends CoreContainer{
    static className = 'CartContainer';
}

/**
 *
 * @type {CartContainer}
 */
const container = ContainerFactory.get(CartContainer);
export default container.getConnect(component);