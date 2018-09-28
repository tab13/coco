import React, {Fragment} from 'react';
import {Modal} from 'react-bootstrap'
import CoreComponent from "../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import QuoteAction from "../../../action/checkout/QuoteAction";
import ProductList from "../../catalog/ProductList";
import CheckoutHelper from "../../../../helper/CheckoutHelper"


export class RemoveCartComponent extends CoreComponent {
    static className = 'RemoveCartComponent';

    /**
     *
     */
    constructor() {
        super();
        this.state = {
            isOpen : false,
        }
    }


    /**
     * check delete cart or not
     *
     * @param quote
     * @returns {boolean}
     */
    canDeleteCart(quote, index) {
        let currentPage = index.currentPage;
        let items = quote.items;
        return items.length && currentPage === ProductList.className;
    }

    /**
     * Hide popup
     *
     * @returns {*}
     */
    toggle() {
        this.setState( prevState => ({
            isOpen: !prevState.isOpen
        }))
    }

    /**
     * Cart button handle
     */
    removeCardHandle() {
        if(CheckoutHelper.needConfirmDeleteCart()) {
            this.toggle();
        } else {
            this.props.removeCart({});
        }
    }

    /**
     * Remove cart
     */
    removeCart() {
        this.toggle();
        this.props.removeCart({});
    }

    /**
     * Render template
     *
     * @returns {*}
     */
    template() {
        let buttonClass = 'btn btn-delete disabled';
        let isDisabled = true;
        if(this.canDeleteCart(this.props.quote, this.props.index)) {
            buttonClass = 'btn btn-delete';
            isDisabled = false;
        }
        return (
            <Fragment>
                <button className={buttonClass} disabled={isDisabled} type="button"
                    onClick={() => this.removeCardHandle()}
                    >
                    <span>delete</span>
                </button>
                <Modal
                    bsSize={"small"}
                    className={"popup-messages"}
                    show={this.state.isOpen}
                    onHide={ this.toggle.bind(this) }>
                    <Modal.Body>
                        <h3 className="title">{ this.props.t('Delete Cart') }</h3>
                        <p> { this.props.t('You will lose any data associated with the current cart') }.</p>
                    </Modal.Body>
                    <Modal.Footer className={"logout-actions"}>
                        <a onClick={ this.toggle.bind(this) }> { this.props.t('Cancel') } </a>
                        <a onClick={() => this.removeCart()}> { this.props.t('Confirm') } </a>
                    </Modal.Footer>
                </Modal>
            </Fragment>
        );
    }
}

/**
 *
 * @type {CartComponent}
 */
const component = ComponentFactory.get(RemoveCartComponent);

export class RemoveCartContainer extends CoreContainer{
    static className = 'RemoveCartContainer';
    static mapDispatch(dispatch) {
        return {
            removeCart: () => dispatch(QuoteAction.removeCart())
        }
    }

    /**
     *
     * @param state
     * @return {{quote: *}}
     */
    static mapState(state) {
        const { quote, index } = state.core.checkout;
        return {
            quote: quote, index:index
        }
    }
}

/**
 *
 * @type {RemoveCartContainer}
 */
const container = ContainerFactory.get(RemoveCartContainer);
export default container.getConnect(component)