import React, {Fragment} from 'react';
import CoreComponent from '../../../framework/component/CoreComponent';
import Cart from "./Cart";
import LeftAction from "./LeftAction";
import CartHeader from "./cart/CartHeader";
import ComponentFactory from "../../../framework/factory/ComponentFactory";
import CoreContainer from "../../../framework/container/CoreContainer";
import ContainerFactory from "../../../framework/factory/ContainerFactory";

export class CheckoutComponent extends CoreComponent {
    static className = 'CheckoutComponent';

    /**
     * Render template
     *
     * @returns {*}
     */
    template() {
        return (
            <Fragment>
                <CartHeader/>
                <LeftAction/>
                <Cart />
                {
                    this.props.pages.map(page => {
                        let Element = page.type || page;
                        return this.props.currentPage === Element.className && (
                            <Element key={Element.className}/>
                        )
                    })
                }
            </Fragment>
        );
    }
}

/**
 *  @type {CheckoutComponent}
 */
const component = ComponentFactory.get(CheckoutComponent);

class CheckoutContainer extends CoreContainer{
    static className = 'CheckoutContainer';

    /**
     * Map state to props
     * @param state
     * @returns {{pages: *, currentPage: *}}
     */
    static mapState(state) {
        const { pages, currentPage } = state.core.checkout.index;

        return {
            pages,
            currentPage
        }
    }

}

/**
 *
 * @type {CheckoutContainer}
 */
const container = ContainerFactory.get(CheckoutContainer);
export default container.withRouter(component);
