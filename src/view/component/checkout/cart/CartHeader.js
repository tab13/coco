import React from 'react';
import CoreComponent from "../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";

export class CartHeaderComponent extends CoreComponent {
    static className = 'CartHeaderComponent';

    /**
     * render template
     *
     * @returns {*}
     */
    template() {
        const { items_qty } = this.props.quote;

        return (
            <div className="wrapper-header">
                <div className="header-left">
                    <div className="header-customer">
                        <strong className="title">
                            Cart { items_qty ? '(' + items_qty + ')': '' }
                        </strong>
                    </div>
                </div>
            </div>
        );
    }
}

/**
 *
 * @type {CartHeaderComponent}
 */
const component = ComponentFactory.get(CartHeaderComponent);

export class CartHeaderContainer extends CoreContainer{
    static className = 'CartHeaderContainer';

    /**
     *
     * @param state
     * @return {{quote: *}}
     */
    static mapState(state) {
        const { quote } = state.core.checkout;
        return {
            quote
        }
    }
}

/**
 *
 * @type {CartFooterContainer}
 */
const container = ContainerFactory.get(CartHeaderContainer);

export default container.getConnect(component);