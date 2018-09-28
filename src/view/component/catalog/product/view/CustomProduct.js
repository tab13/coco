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
import OptionConstant from "../../../../constant/catalog/OptionConstant";
import InputTextOption from "../options/InputTextOption";
import TextAreaOption from "../options/TextAreaOption";
import RadioOption from "../options/RadioOption";
import CheckboxOption from "../options/CheckboxOption";
import DatePickerOption from "../options/DateTimePickerOption";
import StockService from "../../../../../service/catalog/StockService";
import cloneDeep from "lodash/cloneDeep";

export class CustomProduct extends ProductAbstractViewComponent {
    static className = 'CustomProduct';

    acceptKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', ',', 'Backspace', 'Delete'];
    customOptions = {};

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            currentQty: '',
            customPrice: 0
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
        if (this.needShowCustomPopUp(nextProps.product)) {
            if (this.props.product !== nextProps.product) {
                this.customOptions = {};
                this.resetQty(nextProps.product);
                this.setState(
                    {enableAddToCartButton: this.isChosenAllRequireOptions(nextProps.product)},
                    () => this.collectPrice(this.props.product, this.state.currentQty)
                );
            }
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
        return currentQty;
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
        if (!this.isChosenAllRequireOptions(this.props.product)) {
            toast.error(
                this.props.t('Please choose all required option'),
                {
                    className: 'wrapper-messages messages-warning'
                }
            );
            return false;
        }
        if (this.isSimple() || this.isVirtual()) {
            let product = cloneDeep(this.props.product);
            let infoBuyOptions = this.getInfoBuyOptions();
            product.custom_options.option_ids = Object.keys(infoBuyOptions).join(',');
            Object.keys(infoBuyOptions).forEach(optionId => {
                product.custom_options['option_' + optionId] = infoBuyOptions[optionId];
            });
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
        return {
            info_buyRequest: {
                product: this.props.product.id,
                options: this.getInfoBuyOptions(),
            },
            options: this.getOptions()
        }
    }

    /**
     * get options list in array
     * @returns {Array}
     */
    getOptions() {
        let options = [];
        for (let key in this.customOptions) {
            options.push(this.customOptions[key]);
        }
        return options;
    }

    /**
     * get Options of info_buyRequest
     */
    getInfoBuyOptions() {
        let options = {};
        for (let key in this.customOptions) {
            let option = this.customOptions[key];
            let value = '';
            if (
                option.option_type === OptionConstant.TYPE_CHECK_BOX
                || option.option_type === OptionConstant.TYPE_MULTIPLE
            ) {
                value = option.option_value.split(',');
            } else {
                value = option.option_value
            }
            options[option.option_id] = value;
        }
        return options;
    }

    /**
     * check if all required options were chosen
     * @param product
     * @return {boolean}
     */
    isChosenAllRequireOptions(product) {
        let requireList = [];
        let isChosenAllRequireOptions = true;

        product.custom_options.map(option => {
            if (option.is_require) {
                requireList.push(String(option.option_id));
            }
            return null;
        });

        requireList.map(item => {
            if (Object.keys(this.customOptions).indexOf(item) < 0) {
                isChosenAllRequireOptions = false;
            }
            return null;
        });

        return isChosenAllRequireOptions;
    }

    /**
     * get option price
     * @param price
     * @param priceType
     * @param productPrice
     * @return {*}
     */
    getOptionPrice(price, priceType, productPrice) {
        let optionPrice = price;
        if (priceType === OptionConstant.PRICE_TYPE_PERCENT) {
            optionPrice = (productPrice * price) / 100;
        }
        return optionPrice;
    }

    /**
     * collect product price
     */
    collectPrice(product, qty) {
        if (!qty) {
            qty = this.state.currentQty;
        }
        if (!qty) {
            qty = 1;
        }
        let custom_options = product.custom_options;
        let customPrice = this.getProductPrice(product, qty);

        for (let key in this.customOptions) {
            let optionValue = this.customOptions[key];
            let option = custom_options.find(item => item.option_id === optionValue.option_id);

            if (
                optionValue.option_type === OptionConstant.TYPE_CHECK_BOX
                || optionValue.option_type === OptionConstant.TYPE_MULTIPLE
            ) {
                let valueIds = optionValue.option_value.split(',');
                valueIds.map(id => {  // eslint-disable-line
                    let value = option.values.find(item => String(item.option_type_id) === String(id));
                    customPrice += this.getOptionPrice(value.price, value.price_type, product.price);
                    return null;
                });

            } else if (
                optionValue.option_type === OptionConstant.TYPE_RADIO
                || optionValue.option_type === OptionConstant.TYPE_DROP_DOWN
            ) {
                let value = option.values.find(item =>
                    String(item.option_type_id) === String(optionValue.option_value)
                );
                customPrice += this.getOptionPrice(value.price, value.price_type, product.price);
            } else {
                customPrice += this.getOptionPrice(option.price, option.price_type, product.price);
            }
        }
        this.setState({
            customPrice: customPrice
        });
    }

    /**
     * add custom option
     * @param optionValue
     */
    addCustomOption(optionValue) {
        if (optionValue.option_value) {
            this.customOptions[optionValue.option_id] = optionValue;
        } else {
            delete this.customOptions[optionValue.option_id];
        }

        this.setState({
            enableAddToCartButton: this.isChosenAllRequireOptions(this.props.product)
        });

        this.collectPrice(this.props.product);
    }

    /**
     * Return available qty of product
     * @returns {*}
     */
    getAvailQty() {
        let product = this.props.product;
        if (product) {
            if (!this.isSimple() && !this.isVirtual()) {
                return "";
            } else {
                if (this.props.product.stocks && this.props.product.stocks.length) {
                    let productStockService = StockService.getProductStockService(this.props.product);
                    if (productStockService.isManageStock(this.props.product)) {
                        let qty = 0;
                        if (product.stocks && product.stocks.length) {
                            qty = product.stocks[0].qty
                        }
                        return qty;
                    }
                    return "";
                } else {
                    return "";
                }
            }
        }
        return "";
    }

    /**
     * close popup
     */
    closePopup() {
        this.customOptions = {};
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
     * check need show custom popup
     * @param product
     * @return {*|boolean}
     */
    needShowCustomPopUp(product) {
        return product && (this.isSimple(product) || this.isVirtual(product)) && this.hasCustomOptions(product);
    }

    /**
     * Render template
     *
     * @returns {*}
     */
    template() {
        return (
            <Fragment>
                <div className="modal-content " style={{
                    display: this.needShowCustomPopUp(this.props.product) ? "" : "none",
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
                                this.needShowCustomPopUp(this.props.product) ?
                                    this.props.product.custom_options.map(option => {
                                        switch (option.type) {
                                            case OptionConstant.TYPE_FIELD:
                                                return <InputTextOption key={option.option_id}
                                                                        option={option}
                                                                        productPrice={this.props.product.price}
                                                                        addCustomOption={
                                                                            (optionValue) =>
                                                                                this.addCustomOption(optionValue)
                                                                        }/>;
                                            case OptionConstant.TYPE_AREA:
                                                return <TextAreaOption key={option.option_id}
                                                                       option={option}
                                                                       productPrice={this.props.product.price}
                                                                       addCustomOption={
                                                                           (optionValue) =>
                                                                               this.addCustomOption(optionValue)
                                                                       }/>;
                                            case OptionConstant.TYPE_RADIO:
                                            case OptionConstant.TYPE_DROP_DOWN:
                                                return <RadioOption key={option.option_id}
                                                                    option={option}
                                                                    productPrice={this.props.product.price}
                                                                    addCustomOption={
                                                                        (optionValue) =>
                                                                            this.addCustomOption(optionValue)
                                                                    }/>;
                                            case OptionConstant.TYPE_CHECK_BOX:
                                            case OptionConstant.TYPE_MULTIPLE:
                                                return <CheckboxOption key={option.option_id}
                                                                       option={option}
                                                                       productPrice={this.props.product.price}
                                                                       addCustomOption={
                                                                           (optionValue) =>
                                                                               this.addCustomOption(optionValue)
                                                                       }/>;
                                            case OptionConstant.TYPE_DATE:
                                            case OptionConstant.TYPE_TIME:
                                            case OptionConstant.TYPE_DATE_TIME:
                                                return <DatePickerOption key={option.option_id}
                                                                         option={option}
                                                                         scrollToDateTime={this.scrollToDateTime.bind(this)}
                                                                         productPrice={this.props.product.price}
                                                                         addCustomOption={
                                                                             (optionValue) =>
                                                                                 this.addCustomOption(optionValue)
                                                                         }/>;
                                            default:
                                                return null;
                                        }
                                    })
                                    :
                                    null
                            }
                        </div>
                        <div className="product-info-price">
                            <span className="label">{this.props.t('Price')}</span>
                            <span className="value">
                                {CurrencyHelper.convertAndFormat(this.state.customPrice)}
                            </span>
                        </div>
                        <div className="product-avail-qty">
                            <span className="label">{this.props.t('Avail Qty')}</span>
                            <span className="value">{this.getAvailQty()}</span>
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

class CustomProductContainer extends CoreContainer {
    static className = 'CustomProductContainer';

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
 * @type {CustomProduct}
 */
export default ContainerFactory.get(CustomProductContainer).withRouter(
    ComponentFactory.get(CustomProduct)
);