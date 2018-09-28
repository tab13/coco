import React, {Fragment} from 'react';
import CoreComponent from "../../../framework/component/CoreComponent";
import ComponentFactory from "../../../framework/factory/ComponentFactory";
import CoreContainer from "../../../framework/container/CoreContainer";
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import MultiCheckoutAction from "../../action/MultiCheckoutAction";
import DateTimeHelper from "../../../helper/DateTimeHelper";
import SmoothScrollbar from "smooth-scrollbar";
import QuoteAction from "../../action/checkout/QuoteAction";

export class MultiCheckoutComponent extends CoreComponent {
    static className = 'MultiCheckoutComponent';

    setListElement = element => this.listElement = element;
    /**
     *
     * @param cart
     * @return {boolean}
     */
    isActiveCart = (cart) => {
        return cart.id === this.props.activeCart.id;
    };

    /**
     * check allowable use multi cart or not
     * @returns {boolean}
     */
    canUseMultiCart = () => {
        let currentPage = this.props.index.currentPage;
        return currentPage === 'ProductList';
    };

    /**
     * check allowable add multi cart or not
     * @returns {boolean}
     */
    canAddNewMultiCart = () => {
        return this.canUseMultiCart() && (this.props.quote.items.length || !this.props.carts.length);
    };

    /**
     * componentWillMount: load list cart when start
     */
    componentWillMount() {
        /** get list cart and active latest cart */
        !this.props.quote.items.length && this.props.actions.getListCart(false, true);
    }

    /**
     * componentWillUnmount update cart if refresh or do something
     */
    componentWillUnmount() {
        this.updateCart();
        window.removeEventListener("beforeunload", this.updateCart)
    }

    /**
     * componentDidMount update cart if refresh or do something
     */
    componentDidMount() {
        window.addEventListener("beforeunload", this.updateCart)
    }


    updateCart = () => {
       return this.props.actions.updateCart(this.props.activeCart)
    };

    template() {
        if (this.listElement) {
            SmoothScrollbar.destroy(this.listElement);
            this.scrollbar = null;
        }
        if (!this.scrollbar && this.listElement) {
            this.scrollbar = SmoothScrollbar.init(this.listElement);
        }

        const isAllow = this.canUseMultiCart();
        return (
            <Fragment>
                <button
                    disabled={!this.canAddNewMultiCart()}
                    onClick={async() => {
                        /** update prev cart  */
                        this.props.activeCart && await this.props.actions.updateCart(this.props.activeCart);
                        await this.props.actions.selectCartResult(false);
                        await this.props.actions.removeQuote();
                        await this.props.actions.addCart();
                    }}
                    className="btn btn-add" type="button" ><span>add</span></button>
                <ul className="multi-order" data-scrollbar ref={this.setListElement}>
                    <div>
                        {
                            this.props.carts.map((cart) => {
                                return <li
                                    key={cart.id}
                                    className={ this.isActiveCart(cart) ? 'active' : ''}
                                    onClick={ async () => {
                                        if (!isAllow) return;

                                        /** update prev cart  */
                                        await this.props.actions.updateCart(this.props.activeCart);
                                        await this.props.actions.getListCart(cart.id, false)
                                    }}
                                >
                                <span className="box">
                                    <span className="count">{ cart.count }</span>
                                    <span className="time">{
                                        DateTimeHelper.getTimeFromTimestamp(cart.id)
                                    }</span>
                                </span>
                                </li>
                            })
                        }
                    </div>
                </ul>
            </Fragment>
        );
    }
}

/**
 *
 * @type {MultiCheckoutComponent}
 */
const component = ComponentFactory.get(MultiCheckoutComponent);

export class MultiCheckoutContainer extends CoreContainer{
    static className = 'MultiCheckoutComponent';

    static mapState(state) {
        const { activeCart, carts } = state.core.multiCheckout;
        const { quote, index } = state.core.checkout;
        return {
            activeCart,
            carts,
            quote,
            index
        }
    }

    static mapDispatch(dispatch) {
        return {
            actions: {
                getListCart : (activeCartId, isActiveLatest) =>
                    dispatch(MultiCheckoutAction.getListCart(activeCartId, isActiveLatest)),
                addCart     : () => dispatch(MultiCheckoutAction.addCart()),
                selectCart  : (cart) => dispatch(MultiCheckoutAction.selectCart(cart)),
                selectCartResult  : (cart) => dispatch(MultiCheckoutAction.selectCartResult(cart)),
                updateCart  : (cart) => dispatch(MultiCheckoutAction.updateCart(cart)),
                removeQuote  : () => dispatch(QuoteAction.removeCart()),
            }
        }
    }
}

/**
 *
 * @type {MultiCheckoutContainer}
 */
const container = ContainerFactory.get(MultiCheckoutContainer);
export default container.getConnect(component)