import React from 'react';
import SmoothScrollbar from "smooth-scrollbar";
import CartItem from './CartItem';
import CoreComponent from "../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import $ from "jquery";
import _ from 'lodash';
import {isMobile} from "react-device-detect";
import Swiper from 'swiper/dist/js/swiper';
import QuoteAction from "../../../action/checkout/QuoteAction";

export class CartItemsComponent extends CoreComponent {
    static className = 'CartItemsComponent';

    /**
     * Init smooth scrollbar for content modal
     */
    initScrollbar(minicart) {
        if (!minicart) return;

        if (this.scrollbar) {
            this.scrollbar.destroy();
        }
        this.scrollbar = SmoothScrollbar.init(minicart);
        if (isMobile) {
            let miniCartEl = $('.minicart');
            if (!miniCartEl.hasClass('minicart-mobile')) {
                miniCartEl.addClass('minicart-mobile');
            }
            new Swiper('.swiper-container', {
                slidesPerView: 'auto',
                grabCursor: true,
                autoHeight: false,
            });
        }

        // scroll to new item add to cart
        if (this.scrollbar.containerEl) {
            if (this.props.added_item_id) {
                let elements = this.scrollbar.containerEl
                    .getElementsByClassName('item ' + this.props.added_item_id);
                if (elements && elements.length) {
                    setTimeout(() => this.scrollbar.scrollTo(0, elements[0].offsetTop));
                } else {
                    setTimeout(() => this.scrollbar.scrollTo(0, 0));
                }
                this.props.addedItemIdInQuote(null);
            }
        }
    }

    /**
     * render template
     * @return {*}
     */
    template() {
        let items = _.orderBy(this.props.quote.items, 'item_id', 'desc');
        return (
            <ul className="minicart" ref={this.initScrollbar.bind(this)}>
                <div>
                    {
                        items.map((item, index = 0) => {
                            return !item.parent_item_id &&
                                <CartItem item={item} key={item.item_id}/>
                        })
                    }
                </div>
            </ul>
        );
    }
}

/**
 *
 * @type {CartItemsComponent}
 */
const component = ComponentFactory.get(CartItemsComponent);

export class CartItemsContainer extends CoreContainer {
    static className = 'CartItemsContainer';

    /**
     *
     * @param state
     * @return {{quote: *}}
     */
    static mapState(state) {
        const {quote} = state.core.checkout;
        const {added_item_id} = state.core.checkout.addedItemIdInQuote;
        return {
            quote,
            added_item_id
        }
    }

    static mapDispatch(dispatch) {
        return {
            addedItemIdInQuote: (product) => dispatch(QuoteAction.addedItemIdInQuote(product))
        }
    }
}

/**
 *
 * @type {CartItemsContainer} container
 */
const container = ContainerFactory.get(CartItemsContainer);

export default container.getConnect(component);