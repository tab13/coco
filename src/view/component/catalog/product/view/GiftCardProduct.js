import React, {Fragment} from 'react';
import {ProductAbstractViewComponent} from './AbstractView';
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import SmoothScrollbar from 'smooth-scrollbar';
import CurrencyHelper from "../../../../../helper/CurrencyHelper";
import AddProductService from "../../../../../service/checkout/quote/AddProductService";
import {toast} from "react-toastify";
import QuoteAction from "../../../../action/checkout/QuoteAction";
import ProductAction from "../../../../action/ProductAction";
import SyncConstant from "../../../../constant/SyncConstant";
import NumberHelper from "../../../../../helper/NumberHelper";
import {isMobile} from 'react-device-detect';
import InputTextOption from "../gift-card/GiftCardInputTextOption";
import RadioOption from "../gift-card/GiftCardRadioOption";
import StockService from "../../../../../service/catalog/StockService";
import ProductTypeConstant from "../../../../constant/ProductTypeConstant";
import cloneDeep from "lodash/cloneDeep";
import GiftCardProductConstant from "../../../../constant/catalog/GiftCardProductConstant";
import {GiftCardProductHelper} from "../../../../../helper/GiftCardProductHelper";

export class GiftCardProduct extends ProductAbstractViewComponent {
    static className = 'GiftCardProduct';
    static cartItemDisplayFields = [GiftCardProductConstant.GIFT_CARD_AMOUNT];
    static cartItemDisplayMapFieldLabel = {
        [GiftCardProductConstant.GIFT_CARD_AMOUNT]: 'Value'
    };

    requireFields = [GiftCardProductConstant.GIFT_CARD_AMOUNT];
    optionalFields = [
        GiftCardProductConstant.GIFT_CARD_CUSTOMER_NAME,
        GiftCardProductConstant.GIFT_CARD_RECIPIENT_NAME,
        GiftCardProductConstant.GIFT_CARD_RECIPIENT_EMAIL,
        GiftCardProductConstant.GIFT_CARD_MESSAGE,
        GiftCardProductConstant.GIFT_CARD_DAY_TO_SEND,
        GiftCardProductConstant.GIFT_CARD_TIMEZONE_TO_SEND,
        GiftCardProductConstant.GIFT_CARD_RECIPIENT_ADDRESS,
        GiftCardProductConstant.GIFT_CARD_NOTIFY_SUCCESS,
        GiftCardProductConstant.GIFT_CARD_TEMPLATE_IMAGE,
    ];

    acceptKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', ',', 'Backspace', 'Delete'];
    productOptions = {};

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            currentQty: '',
            customPrice: 0,
            showNumPad: false,
            estimatePrice: CurrencyHelper.convertAndFormat(0)
        };
    }

    setModalBodyElement = element => this.modal_body = element;
    setAddToCartButtonElement = element => this.add_button = element;
    setNumpad = element => this.numpad = element;
    setQtyElement = element => this.qty_element = element;


    /**
     * set state for component when view product
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.mode !== this.props.mode && nextProps.mode === SyncConstant.OFFLINE_MODE) {
            this.hideNumpad();
        }
        if (
            nextProps.product
            && this.isGiftCard(nextProps.product)
        ) {
            this.productOptions = {};
            this.resetQty(nextProps.product);
            this.setState(
                {enableAddToCartButton: this.isChosenAllRequireOptions()},
                () => this.collectPrice(this.props.product, this.state.currentQty)
            );
        }
    }

    resetQty(product) {
        let minQty = this.getMinimumValidQty(product);
        this.setState({
            currentQty: minQty,
        });
        if (this.qty_element) {
            this.qty_element.value = minQty;
            this.collectPrice(product, minQty);
        }
    }

    /**
     * get minimum qty
     *
     * @param product
     * @returns {number}
     */
    getMinimumValidQty(product) {
        let productStockService = this.getProductStockService(product);
        let currentQty = productStockService.getAddQtyIncrement(product);
        let items = AddProductService.getItemsByProductId(this.props.quote, product.id);
        if (!items || !items.length) {
            let minSaleQty = productStockService.getMinSaleQty(product);
            if (minSaleQty > currentQty) {
                let qtyIncrement = currentQty;
                currentQty = 0;
                while (minSaleQty > currentQty) {
                    currentQty += qtyIncrement;
                }
            }
        }
        return currentQty || 1;
    }

    /**
     * Init smooth scrollbar for modal body
     */
    componentDidMount() {
        if (!this.scrollbar) {
            this.scrollbar = SmoothScrollbar.init(this.modal_body);
        }
        this.addNumpadModal();
        this.setState({decimal_symbol: CurrencyHelper.getCurrencyFormat().decimal_symbol});
        document.body.addEventListener('keyup', event => this.onKeyupKeyboard(event.key));
    }

    /**
     * Add numpad modal modal and numpad to body
     */
    addNumpadModal() {
        this.numpadModal = document.createElement("div");
        this.numpadModal.className = "modal-backdrop fade in popover-backdrop popover-backdrop_option";
        this.numpadModal.style.position = "absolute";
        this.numpadModal.style.display = "none";
        this.numpadModal.onclick = () => this.hideNumpad();
        document.body.appendChild(this.numpadModal);
        document.body.appendChild(this.numpad);
    }

    /**
     * Show numpad when click qty input
     *
     */
    showNumpad(event) {
        if (isMobile && this.props.product) {
            this.calculateNumpadPosition(event);
            this.setState({showNumPad: true});
            this.numpadModal.style.display = "block";
            this.onKeyupKeyboard = this.enableKeyupKeyboard;
            this.qty_element.blur();
        }
    }

    /**
     * Hide numpad when click anywhere except it-self
     */
    hideNumpad() {
        if (this.props.product) {
            this.numpadModal.style.display = "none";
            this.onKeyupKeyboard = this.disableKeyupKeyboard;
            this.setState({showNumPad: false});
            let minQty = this.getMinimumValidQty(this.props.product);
            if (isNaN(this.state.currentQty) || this.state.currentQty === '' ||
                this.state.currentQty < minQty) {
                this.setState({currentQty: String(minQty)});
            }
        }
    }

    /**
     * Event to press keyboard after show numpad
     *
     * @param key
     */
    onKeyupKeyboard(key) {
        return key;
    }

    /**
     * Disable press keyboard event after hide numpad
     *
     * @param key
     */
    disableKeyupKeyboard(key) {
        return key;
    }

    /**
     * Enable press keyboard event after show numpad
     *
     * @param key
     */
    enableKeyupKeyboard(key) {
        if (!this.acceptKeys.includes(key)) {
            return false;
        }
        let currentQty = this.state.currentQty.toString();
        if (key === 'Backspace' || key === 'Delete') {
            currentQty = currentQty.substring(0, currentQty.length - 1);
        } else {
            currentQty += key;
        }
        currentQty = currentQty !== '' ? parseFloat(currentQty) : '';
        this.setState({currentQty: currentQty});
        this.collectPrice(this.props.product, currentQty);
        this.qty_element.value = currentQty;
    }

    /**
     * Click virtual numpad number
     *
     * @param character
     */
    clickNumpad(character) {
        this.enableKeyupKeyboard(character);
    }

    /**
     * On key down qty
     *
     * @param event
     * @return {boolean}
     */
    onKeyDownQty(event) {
        if (!this.acceptKeys.includes(event.key)) {
            event.preventDefault();
            return false;
        }
    }

    /**
     * Change qty input field
     *
     * @param event
     */
    changeQty(event) {
        this.setState({currentQty: event.target.value});
        return false;
    }

    /**
     * Blur qty input
     */
    blurQty() {
        let qtyIncrement = this.getQtyIncrement(this.props.product);
        let currentQty = this.state.currentQty;
        if (currentQty === '') {
            currentQty = 1;
        }
        currentQty = parseFloat(currentQty);
        if (currentQty % 1 !== 0) {
            currentQty = Math.floor(currentQty);
        }
        if (currentQty % qtyIncrement !== 0) {
            this.showError(this.props.t('Please enter multiple of {{qty}}', {qty: qtyIncrement}));
        }
        if (currentQty !== this.state.currentQty) {
            this.setState({currentQty: String(currentQty)});
            this.collectPrice(this.props.product, currentQty);
            this.qty_element.value = String(currentQty);
        }
    }

    /**
     * Plus qty of product
     */
    plusQty() {
        if (this.props.product) {
            let stock = this.props.product.stocks[0].qty;
            let currentQty = parseFloat(this.state.currentQty);
            let addQtyIncrement = this.getProductStockService(this.props.product)
                .getAddQtyIncrement(this.props.product);
            currentQty = NumberHelper.addNumber(currentQty, addQtyIncrement);
            if (currentQty > stock.qty) {
                currentQty = stock.qty;
            }
            let validateQty = this.validateQty(this.props.product, currentQty);
            if (validateQty) {
                this.setState({currentQty: String(currentQty)});
            }
            this.collectPrice(this.props.product, currentQty);
            this.qty_element.value = String(currentQty);
        }
    }

    /**
     * Minus qty of product
     */
    minusQty() {
        if (this.props.product) {
            let currentQty = parseFloat(this.state.currentQty);
            let addQtyIncrement = this.getProductStockService(this.props.product)
                .getAddQtyIncrement(this.props.product);
            currentQty = NumberHelper.minusNumber(currentQty, addQtyIncrement);
            if (currentQty < addQtyIncrement) {
                currentQty = addQtyIncrement;
            }
            this.validateQty(this.props.product, currentQty);
            this.setState({currentQty: String(currentQty)});
            this.collectPrice(this.props.product, currentQty);
            this.qty_element.value = currentQty;
        }
    }

    /**
     * Add product to cart
     *
     * @return {boolean}
     */
    addToCart() {
        if (!this.isChosenAllRequireOptions()) {
            toast.error(
                this.props.t('Please choose all required option'),
                {
                    className: 'wrapper-messages messages-warning'
                }
            );
            return false;
        }
        if (this.props.product.type_id === ProductTypeConstant.GIFT_CARD) {
            let product = cloneDeep(this.props.product);
            product.price = this.state.customPrice;
            this.props.actions.addProduct({
                product: product,
                product_options: this.getProductOptions(),
                qty: parseFloat(this.state.currentQty)
            });
            this.closePopup();
        }
    }

    /**
     * Get product options before add to cart
     *
     * @return {{info_buyRequest: {product, super_attribute}, attributes_info: *, simple_name, simple_sku: string|string|*}}
     */
    getProductOptions() {

        /*
         array(10) {
         ["qty"]=>
         int(1)
         ["amount"]=>
         int(11)
         ["giftcard_template_id"]=>
         string(1) "1"
         ["giftcard_template_image"]=>
         string(11) "default.png"
         ["customer_name"]=>
         string(0) ""
         ["recipient_name"]=>
         string(0) ""
         ["recipient_email"]=>
         string(0) ""
         ["message"]=>
         string(0) ""
         ["day_to_send"]=>
         string(0) ""
         ["options"]=>
         array(0) {
         }
         }
         */

        let info_buyRequest = {
            product: this.props.product.id,
            ...GiftCardProductHelper.getDefaultTemplateOption(this.props.product),
            ...this.productOptions
        };




        return {
            info_buyRequest
        }
    }

    /**
     * get options list in array
     * @returns {Array}
     */
    getOptions() {
        let options = [];
        for (let key in this.productOptions) {
            options.push({ [key]: this.productOptions[key]});
        }
        return options;
    }

    /**
     * get Options of info_buyRequest
     */
    getInfoBuyOptions() {
        return {};
    }

    /**
     * check if all required options were chosen
     * @return {boolean}
     */
    isChosenAllRequireOptions() {
        let isChosenAllRequireOptions = true;

        this.requireFields.forEach(item => {
            if (Object.keys(this.productOptions).indexOf(item) < 0) {
                isChosenAllRequireOptions = false;
            }
        });

        return isChosenAllRequireOptions;
    }


    /**
     * collect product price
     */
    collectPrice(product) {

        let priceConfig = GiftCardProductHelper.getPriceConfig(product);
        let amount = this.productOptions[GiftCardProductConstant.GIFT_CARD_AMOUNT];
        let giftType = priceConfig[GiftCardProductConstant.GIFT_TYPE];
        let priceType = priceConfig[GiftCardProductConstant.GIFT_PRICE_TYPE];
        let customPrice = amount;

        if (priceType === GiftCardProductConstant.GIFT_PRICE_TYPE_PERCENT) {
            customPrice *= priceConfig[GiftCardProductConstant.GIFT_PRICE] / 100;
        }

        if (
            priceType === GiftCardProductConstant.GIFT_PRICE_TYPE_FIXED
            && giftType === GiftCardProductConstant.GIFT_TYPE_DROPDOWN_VALUES
        ) {
            customPrice = priceConfig[GiftCardProductConstant.GIFT_PRICE];
        }

        let estimatePrice = GiftCardProductHelper.getGiftCardPrice({...product, price: customPrice});

        this.setState({
            customPrice,
            estimatePrice
        });
    }

    /**
     * add custom option
     * @param option
     */
    addCustomOption(option) {
        /*
         "options": [
             {
                 "code": "amount",
                 "value": 2
             },
             {
                 "code": "credit_price_amount",
                 "value": null
             },
             {
                 "code": "customer_name",
                 "value": ""
             },
             {
                 "code": "day_to_send",
                 "value": ""
             },
             {
                 "code": "giftcard_template_id",
                 "value": "1"
             },
             {
                 "code": "giftcard_template_image",
                 "value": "default.png"
             },
             {
                 "code": "message",
                 "value": ""
             },
             {
                 "code": "notify_success",
                 "value": "1"
             },
             {
                 "code": "recipient_address",
                 "value": ""
             },
             {
                 "code": "recipient_email",
                 "value": ""
             },
             {
                 "code": "recipient_name",
                 "value": ""
             },
             {
                 "code": "recipient_ship",
                 "value": ""
             },
             {
                 "code": "send_friend",
                 "value": "0"
             },
             {
                 "code": "timezone_to_send",
                 "value": ""
             }
         ],
         */


        if (option.value) {
            this.productOptions[option.code] = option.value;
        } else {
            delete this.productOptions[option.code];
        }

        this.setState({
            enableAddToCartButton: this.isChosenAllRequireOptions()
        });

        this.collectPrice(this.props.product);
    }

    /**
     * Return available qty of product
     * @returns {*}
     */
    getAvailQty() {
        let product = this.props.product;

        if (!product) {
            return false;
        }

        if (!product.type_id) {
            return false;
        }

        if (![ProductTypeConstant.SIMPLE, ProductTypeConstant.GIFT_CARD].includes(this.props.product.type_id)) {
            return false;
        }

        if (!this.props.product.stocks ||  !this.props.product.stocks.length) {
            return false;
        }

        let productStockService = StockService.getProductStockService(this.props.product);
        if (!productStockService.isManageStock(this.props.product)) {
            return false;
        }

        if (product.stocks && product.stocks.length) {
            return product.stocks[0].qty
        }
    }

    /**
     * close popup
     */
    closePopup() {
        this.productOptions = {};
        this.setState({
            enableAddToCartButton: false
        });
        this.props.actions.closePopup();
    }

    /**
     * scroll to date time option
     * @param input
     * @param element
     */
    scrollToDateTime(input, element) {
        setTimeout(() => {
            this.scrollbar.scrollTo(this.scrollbar.offset.x,
                this.scrollbar.offset.y + element.height() - input.height());
        }, 100);
    }

    /**
     * Render template
     *
     * @returns {*}
     */
    template() {
        let product = this.getProduct();
        let availQty = this.getAvailQty();
        let isGiftCardProduct = product && this.isGiftCard();
        let isGiftCardProductTypeFixedValue = product && GiftCardProductHelper.isTypeFixedValue(product);
        let giftCardPriceConfig = isGiftCardProduct ? product[GiftCardProductConstant.GIFT_CARD_PRICE_CONFIG] : false;
        let { estimatePrice } = this.state;
        return (
            <Fragment>
                <div className="modal-content " style={{
                    display: isGiftCardProduct && !isGiftCardProductTypeFixedValue ? "" : "none",
                }}>
                    <div className="modal-header">
                        <button type="button" className="cancel" data-dismiss="modal" aria-label="Close"
                                onClick={() => this.closePopup()}>
                            {this.props.t('Cancel')}
                        </button>
                        <h4 className="modal-title">{this.props.product ? this.props.product.name : ''}</h4>
                    </div>
                    <div className="modal-body" data-scrollbar ref={this.setModalBodyElement}>
                        <div className="product-custom-wrapper">
                            {
                                giftCardPriceConfig && <Fragment>
                                    {
                                        giftCardPriceConfig[GiftCardProductConstant.GIFT_TYPE]
                                        === GiftCardProductConstant.GIFT_TYPE_RANG_OF_VALUES
                                        && (<InputTextOption option={giftCardPriceConfig}
                                                             productPrice={this.props.product.price}
                                                             addCustomOption={
                                                                 (optionValue) =>
                                                                     this.addCustomOption(optionValue)
                                                             }/>)
                                    }
                                    {
                                        giftCardPriceConfig[GiftCardProductConstant.GIFT_TYPE]
                                        === GiftCardProductConstant.GIFT_TYPE_DROPDOWN_VALUES
                                        && (<RadioOption option={giftCardPriceConfig}
                                                         productPrice={this.props.product.price}
                                                         addCustomOption={
                                                             (optionValue) =>
                                                                 this.addCustomOption(optionValue)
                                                         }/>)
                                    }
                                </Fragment>
                            }
                        </div>
                        <div className="product-info-price">
                            <span className="label">{this.props.t('Price')}</span>
                            <span className="value">
                                {CurrencyHelper.convertAndFormat(estimatePrice)}
                            </span>
                        </div>
                        <div className="product-avail-qty">
                        {
                            availQty !== false && (<Fragment>
                                <span className="label">{this.props.t('Avail Qty')}</span>
                                <span className="value">{this.getAvailQty()}</span>
                            </Fragment>)
                        }
                        </div>
                    </div>
                    <div className="modal-bottom">
                        <div className="product-field-qty">
                            <div className="box-field-qty">
                                <input ref={this.setQtyElement}
                                       name="custom_qty" id="custom_qty" minLength="1" maxLength="12" title="Qty"
                                       className="form-control qty"
                                       defaultValue={this.state.currentQty}
                                       onKeyDown={event => this.onKeyDownQty(event)}
                                       onChange={(event) => this.changeQty(event)}
                                       onBlur={() => this.blurQty()}
                                       onClick={(event) => this.showNumpad(event)}
                                />
                                <a className="btn-number qtyminus"
                                   data-field="custom_qty"
                                   onClick={() => this.minusQty()}
                                >-</a>
                                <a className="btn-number qtyplus"
                                   data-field="custom_qty"
                                   onClick={() => this.plusQty()}
                                >+</a>
                            </div>
                        </div>
                        <button type="button" ref={this.setAddToCartButtonElement}
                                className={"addtocart btn-default" +
                                (!this.state.enableAddToCartButton ? ' disabled' : "")}
                                onClick={() => this.addToCart()}>
                            {this.props.t('Add to Cart')}
                        </button>
                    </div>
                    <div ref={this.setNumpad}
                         className="popover fade right in" role="tooltip" id="numpad-bundle-product"
                         style={{
                             'top': this.state.numpad_top + 'px',
                             'left': this.state.numpad_left + 'px',
                             'display': this.state.showNumPad ? 'block' : 'none'
                         }}>
                        <div className="arrow" style={{'top': '50%'}}>
                        </div>
                        <div className="popover-content">
                            <div className="popup-calculator">
                                <ul className="list-number">
                                    <li onClick={() => this.clickNumpad('1')}>1</li>
                                    <li onClick={() => this.clickNumpad('2')}>2</li>
                                    <li onClick={() => this.clickNumpad('3')}>3</li>
                                    <li onClick={() => this.clickNumpad('4')}>4</li>
                                    <li onClick={() => this.clickNumpad('5')}>5</li>
                                    <li onClick={() => this.clickNumpad('6')}>6</li>
                                    <li onClick={() => this.clickNumpad('7')}>7</li>
                                    <li onClick={() => this.clickNumpad('8')}>8</li>
                                    <li onClick={() => this.clickNumpad('9')}>9</li>
                                    {
                                        this.props.product &&
                                        this.isQtyDecimal(this.props.product) ?
                                            <li onClick={() => this.clickNumpad(this.state.decimal_symbol)}>
                                                <span>{this.state.decimal_symbol}</span>
                                            </li>
                                            : <li></li>
                                    }
                                    <li onClick={() => this.clickNumpad('0')}>0</li>
                                    <li className="clear-number" onClick={() => this.clickNumpad('Delete')}>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }
}

class GiftCardProductContainer extends CoreContainer {
    static className = 'GiftCardProductContainer';

    /**
     * Map state to props
     *
     * @param state
     * @returns {{quote: *, mode}}
     */
    static mapState(state) {
        let {quote} = state.core.checkout;
        let {mode} = state.core.sync;
        return {quote, mode};
    }

    /**
     * Map action
     *
     * @param dispatch
     * @returns {{actions: {addProduct: function(*=): *, closePopup: function(): *}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                addProduct: data => dispatch(QuoteAction.addProduct(data)),
                closePopup: () => dispatch(ProductAction.viewProduct())
            }
        }
    }
}

/**
 * @type {GiftCardProductContainer}
 */
export default ContainerFactory.get(GiftCardProductContainer).withRouter(
    ComponentFactory.get(GiftCardProduct)
);