import React, {Fragment} from 'react';
import CoreComponent from '../../../../framework/component/CoreComponent';
import ComponentFactory from '../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import ProductAction from "../../../action/ProductAction";
import '../../../style/css/Option.css'
import ConfigurablePopup from './view/Configurable';
import BundlePopup from './view/Bundle';
import GroupedPopup from './view/Grouped';
import CustomProduct from './view/CustomProduct';
import GiftCardProduct from './view/GiftCardProduct';
import ExternalStock from "../../stock/ExternalStock";
import StockAction from "../../../action/StockAction";
import cloneDeep from 'lodash/cloneDeep';
import ProductTypeConstant from "../../../constant/ProductTypeConstant";
import $ from "jquery";

export class ProductViewComponent extends CoreComponent {
    static className = 'ProductViewComponent';
    modal_body = null;

    setModalAddToCartElement = element => this.modal_add_to_cart = element;
    setModalDialogElement = element => this.modal_dialog = element;

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            configOptions: []
        }
    }

    componentDidUpdate(prevProps) {
        if (this.modal_add_to_cart && this.modal_dialog && this.getProduct() &&
            (!prevProps.product || !prevProps.product.id || prevProps.product.id !== this.getProduct().id)
        ) {
            let height = $( window ).height();
            this.modal_dialog.style.height = height + 'px';
            /*$(elm).css('height', height + 'px');
            let modalHeight = this.modal_add_to_cart.getBoundingClientRect().height;
            this.modal_dialog.style.height = modalHeight + 'px';*/
        }
    }

    /**
     * Get product
     *
     * @returns {string}
     */
    getProduct() {
        return this.props.product;
    }

    /**
     * Get Product type
     *
     * @returns {string}
     */
    getProductType() {
        return this.props.product && this.props.product.type_id ? this.props.product.type_id : '';
    }

    /**
     * Show external stock
     */
    showExternalStock() {
        this.props.actions.showExternalStock(true);
    }

    /**
     * Can check external stock
     *
     * @return boolean
     */
    cancelExternalStock() {
        this.props.actions.cancelExternalStock();
        this.props.actions.closePopup();
    }

    /**
     * Back from external stock popup
     */
    backExternalStockPopup() {
        this.props.actions.cancelExternalStock();
    }

    /**
     * set config options
     * @param configOptions
     */
    setConfigOptions(configOptions) {
        if (
            JSON.stringify(this.state.configOptions) !== JSON.stringify(configOptions)
        ) {
            this.setState({
                configOptions: cloneDeep(configOptions)
            });
        }
    }

    /**
     * Render template
     *
     * @returns {*}
     */
    template() {
        let popupId = 'popup-'
                        + (this.getProductType() === ProductTypeConstant.SIMPLE ? 'custom' : this.getProductType())
                        + '-product';
        let modalClass = 'modal fade popup-addtocart ' + popupId;
        let fadeClass = 'popup-catalog modal-backdrop fade';
        if (this.getProduct() && this.getProduct().id) {
            modalClass += ' in';
            fadeClass += ' in';
        }
        let {product, isShowExternalStock, canBack} = this.props;
        let productConfig = false;
        let showExternalStock = "modal-content modal-content-check simple";
        if (isShowExternalStock) {
            if (product && product.type_id === 'configurable') {
                showExternalStock = "modal-content modal-content-check";
                productConfig = true;
            } else {
                showExternalStock = "modal-content modal-content-check check-simple"
            }
        } else {
            showExternalStock = "modal-content modal-content-check hidden";
        }
        return (
            <Fragment>
                <div className={modalClass} data-backdrop="static" id={popupId} tabIndex="-1"
                     ref={this.setModalAddToCartElement}
                     role="dialog">
                    <div className="modal-dialog" role="document" ref={this.setModalDialogElement}>
                        <div className={isShowExternalStock ? " hidden" : ""} style={{height: '100%'}}>
                            <ConfigurablePopup product={this.props.product}
                                               closePopup={() => this.props.actions.closePopup()}
                                               showExternalStock={this.showExternalStock.bind(this)}
                                               setConfigOptions={this.setConfigOptions.bind(this)}
                            />
                            <BundlePopup product={this.props.product}
                                         closePopup={() => this.props.actions.closePopup()}
                            />
                            <GroupedPopup product={this.props.product}
                                          closePopup={() => this.props.actions.closePopup()}
                            />
                            <CustomProduct product={this.props.product}
                                           closePopup={() => this.props.actions.closePopup()}/>
                            <GiftCardProduct product={this.props.product}
                                           closePopup={() => this.props.actions.closePopup()}/>
                        </div>
                        <div className={showExternalStock} id="check-stock">
                            <ExternalStock product={this.props.product}
                                           productConfig={productConfig}
                                           configOptions={this.state.configOptions}
                                           canBack={canBack}
                                           cancelExternalStock={this.cancelExternalStock.bind(this)}
                                           backExternalStockPopup={this.backExternalStockPopup.bind(this)}/>
                        </div>
                    </div>
                </div>
                <div className={fadeClass}/>
            </Fragment>
        );
    }
}

class ProductViewContainer extends CoreContainer {
    static className = 'ProductViewContainer';

    /**
     * This maps the state to the property of the component
     *
     * @param state
     * @returns {{product}}
     */
    static mapState(state) {
        let {product, isShowExternalStock, canBack} = state.core.product.viewProduct;
        return {product: product, isShowExternalStock: isShowExternalStock, canBack: canBack};
    }

    /**
     * This maps the state to the property of the component
     *
     * @param dispatch
     * @returns {{product}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                closePopup: () => dispatch(ProductAction.viewProduct()),
                showExternalStock: (canBack) => dispatch(StockAction.showExternalStock(canBack)),
                cancelExternalStock: () => dispatch(StockAction.cancelExternalStock()),
            }
        }
    }
}

export default ContainerFactory.get(ProductViewContainer).withRouter(
    ComponentFactory.get(ProductViewComponent)
);

