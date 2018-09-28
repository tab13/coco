import React, {Fragment} from 'react';
import {ProductAbstractViewComponent} from './AbstractView';
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import SmoothScrollbar from 'smooth-scrollbar';
import CurrencyHelper from "../../../../../helper/CurrencyHelper";
import QuoteAction from "../../../../action/checkout/QuoteAction";
import ProductAction from "../../../../action/ProductAction";
import SyncConstant from "../../../../constant/SyncConstant";
import NumberHelper from "../../../../../helper/NumberHelper";
import {isMobile} from 'react-device-detect';
import AddProductService from "../../../../../service/checkout/quote/AddProductService";
import i18n from "../../../../../config/i18n";
import ProductTypeConstant from "../../../../constant/ProductTypeConstant";
import ProductService from "../../../../../service/catalog/ProductService";


export class ProductGroupedViewComponent extends ProductAbstractViewComponent {
    static className = 'ProductGroupedViewComponent';

    bundleOptions = {};
    acceptKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace', 'Delete'];
    input_qty_element = {};

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {childrenProducts: []};
    }

    setModalBodyElement = element => this.modal_body = element;
    setNumpad = element => this.numpad = element;
    setAddToCartButtonElement = element => this.add_button = element;
    setInputQtyElement = (element, childrenProduct) => this.input_qty_element[childrenProduct.id] = element;

    /**
     * set state for component when view product
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.mode !== this.props.mode && nextProps.mode === SyncConstant.OFFLINE_MODE) {
            this.hideNumpad();
        }
        if ((this.props.product && this.props.product.id && (!nextProps.product || !nextProps.product.id))) {
            this.setState({childrenProducts: [], childrenProductPrices: {}});
        }
        if (nextProps.product && nextProps.product.id && nextProps.product.type_id === ProductTypeConstant.GROUPED &&
            (!this.getProduct() || nextProps.product.id !== this.getProduct().id)) {
            if (this.isOfflineMode()) {
                this.recollectChildrenProducts(nextProps.product);
            } else {
                this.getStockChildrens(nextProps.product);
            }
        }
    }

    /**
     * collect children product
     *
     * @param product
     */
    recollectChildrenProducts(product) {
        let childrenProducts = product ? JSON.parse(JSON.stringify(product.children_products)) : [];
        let childrenProductPrices = this.getChildrenProductsPrice(childrenProducts);
        this.setState({childrenProducts: childrenProducts, childrenProductPrices: childrenProductPrices});
    }

    /**
     * recollect children product price
     */
    recollectChildrenProductsPrice() {
        let childrenProducts = this.state.childrenProducts;
        let childrenProductPrices = this.getChildrenProductsPrice(childrenProducts);
        this.setState({childrenProductPrices: childrenProductPrices});
    }

    /**
     * Get children product price
     *
     * @param childrenProducts
     * @return {{}}
     */
    getChildrenProductsPrice(childrenProducts) {
        let childrenProductPrices = {};
        childrenProducts.forEach(children => {
            let price = this.getProductPrice(children, children.qty ? children.qty : 1);
            childrenProductPrices[children.id] = CurrencyHelper.format(price, null, null);
        });
        return childrenProductPrices;
    }

    getStockChildrens(product) {
        this.setState({is_loading: true});
        let productIds = this.getChildrenProductIds(product);
        let request = ProductService.getStockProducts(productIds);
        request.then(stocks => {
            if (product.children_products && product.children_products.length > 0 && stocks) {
                product.children_products.map(children => stocks[children.id] ?
                    children.stocks = stocks[children.id] :
                    null
                );
            }
            this.recollectChildrenProducts(product);
            this.setState({is_loading: false});
        });
    }

    /**
     * Init smooth scrollbar for modal body
     */
    componentDidMount() {
        if (!this.scrollbar) {
            this.scrollbar = SmoothScrollbar.init(this.modal_body);
        }
        this.addNumpadModal();
        document.body.addEventListener('keyup', event => this.onKeyupKeyboard(event.key));
        this.setState({decimal_symbol: CurrencyHelper.getCurrencyFormat().decimal_symbol});
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
     * Show numpad when click qty field
     */
    showNumpad(event, product) {
        if (isMobile) {
            if (product) {
                this.calculateNumpadPosition(event);
                this.setState({showNumPad: true, numpadProduct: product});
                this.numpadModal.style.display = "block";
                this.onKeyupKeyboard = this.enableKeyupKeyboard;
            }
            event.target.blur();
        }
    }

    /**
     * Hide numpad when click anywhere except it-self
     */
    hideNumpad() {
        let product = this.state.numpadProduct;
        if (product) {
            this.validateQty(product, product.qty);
            this.setInputQtyValue(product, parseFloat(product.qty));
        }
        this.numpadModal.style.display = "none";
        this.onKeyupKeyboard = this.disableKeyupKeyboard;
        this.setState({showNumPad: false});
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
     * Enable press keyboard event after hide numpad
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
        if (this.state.numpadProduct) {
            let numpadProduct = this.state.numpadProduct;
            let currentQty = numpadProduct.qty.toString();
            if (!this.acceptKeys.includes(key) && key !== this.state.decimal_symbol) {
                return false;
            } else {
                if (!this.isQtyDecimal(this.state.numpadProduct) && key === this.state.decimal_symbol) {
                    return false;
                }
                if (currentQty.toString().includes('.') && key === this.state.decimal_symbol) {
                    return false;
                }
            }
            if (key === 'Backspace' || key === 'Delete') {
                currentQty = currentQty.substring(0, currentQty.length - 1);
            } else {
                if ((currentQty === 0 || currentQty === '0') && key === '0') {
                    return false;
                } else {
                    if (key === this.state.decimal_symbol) {
                        key = '.';
                    }
                    currentQty += key;
                }
            }
            if (!currentQty)
                currentQty = 0;
            // currentQty = parseFloat(currentQty);
            this.setInputQtyValue(numpadProduct, currentQty);
            numpadProduct.qty = currentQty;
            this.setState({numpadProduct: numpadProduct}, this.recollectChildrenProductsPrice());
        }
    }

    /**
     * set value for input qty
     * @param product
     * @param qty
     */
    setInputQtyValue(product, qty) {
        if (this.input_qty_element[product.id]) {
            this.input_qty_element[product.id].value = qty.toString().replace('.', this.state.decimal_symbol);
        }
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
     * Get product link of option after key down qty input
     *
     * @param eventKey
     * @param product
     * @return {boolean}
     */
    canChangeQty(eventKey, product) {
        if (!this.acceptKeys.includes(eventKey) && eventKey !== this.state.decimal_symbol) {
            return false;
        } else {
            if (!this.isQtyDecimal(product) && eventKey === this.state.decimal_symbol) {
                return false;
            }
            return !(product.qty.toString().includes('.') && eventKey === this.state.decimal_symbol);
        }
    }

    /**
     * Handle key down qty input
     *
     * @param event
     * @param product
     * @return {boolean}
     */
    onKeyDownQty(event, product) {
        if (!this.canChangeQty(event.key, product)) {
            event.preventDefault();
            return false;
        }
    }

    /**
     * On change qty input
     *
     * @param event
     * @param product
     */
    onChangeQty(event, product) {
        if (product) {
            product.qty = event.target.value;
        }
    }

    /**
     * Plus qty input
     *
     * @param product
     */
    plusQty(product) {
        if (product) {
            this.plusOrMinusQty(product);
        }
    }

    /**
     * Minus qty input
     *
     * @param product
     */
    minusQty(product) {
        if (product) {
            this.plusOrMinusQty(product, false);
        }
    }

    /**
     * Get qty after click plus or minus
     *
     * @param product
     * @param isPlus
     */
    plusOrMinusQty(product, isPlus = true) {
        let qty = product.qty;
        let isEnableQtyIncrement = this.isEnableQtyIncrements(product);
        if (isEnableQtyIncrement) {
            let qtyIncrement = this.getQtyIncrement(product);
            qty = NumberHelper.addNumber(qty, isPlus ? qtyIncrement : -qtyIncrement);
            if (qty % qtyIncrement !== 0) {
                let multipleIncrement = isPlus ? Math.floor(qty / qtyIncrement) : Math.ceil(qty / qtyIncrement);
                qty = NumberHelper.multipleNumber(qtyIncrement, multipleIncrement);
            }
        } else {
            qty = NumberHelper.addNumber(qty, isPlus ? 1 : -1);
        }
        if (qty < 0) {
            qty = 0;
        }
        let validate = this.validateQty(product, qty);
        if (!validate && isPlus) {
            return false;
        }
        product.qty = qty;
        this.setInputQtyValue(product, qty);
        this.recollectChildrenProductsPrice(this.props.product);
    }

    /**
     * Blur qty input
     *
     * @param product
     */
    blurQty(product) {
        if (!product.qty) {
            product.qty = 0;
            this.setInputQtyValue(product, 0);
        }
        this.validateQty(product, product.qty);
    }

    /**
     * Validate qty before add
     *
     * @param product
     * @param qty
     * @return {boolean}
     */
    validateQty(product, qty) {
        qty = parseFloat(qty);
        let cartItemQtys = AddProductService.getProductTotalItemsQtyInCart(null, this.props.quote, product.id);
        let totalQtys = NumberHelper.addNumber(qty, cartItemQtys);
        let validateQty = AddProductService.getAddProductService(this.props.product)
            .validateChildrenQty(product, qty, totalQtys);
        if (validateQty.success === false) {
            this.showError(i18n.translator.translate(validateQty.message));
            return false;
        }
        return true;
    }

    /**
     * Add product to cart
     *
     * @return {boolean}
     */
    addToCart() {
        let product = this.props.product;
        let superProductConfig = {
            product_type: product.type_id,
            product_id: product.id
        };
        let productOptions = {
            info_buyRequest: {
                super_product_config: superProductConfig
            },
            super_product_config: {
                product_code: "product_type",
                ...superProductConfig
            }
        };

        let childrens = [];
        let validate = this.prepareChildrens(childrens, productOptions);
        if (!validate) {
            return false;
        }
        if (!childrens || !childrens.length) {
            this.showError(this.props.t('Please specify the quantity of product(s).'));
            return false;
        }
        this.props.actions.addProduct({
            product: product,
            childrens: childrens,
        });
        this.props.actions.closePopup();
    }

    /**
     * Prepare children product before add to cart
     *
     * @param childrens
     * @param productOptions
     * @return {boolean}
     */
    prepareChildrens(childrens, productOptions) {
        let validate = true;
        this.state.childrenProducts.map(children => {
            if (children.qty > 0) {
                if (super.validateQty(children, children.qty)) {
                    childrens.push({
                        product: children,
                        qty: parseFloat(children.qty),
                        product_options: productOptions
                    });
                } else {
                    validate = false;
                }
            }
            return children;
        });
        return validate;
    }

    template() {
        return (
            <Fragment>
                <div className="modal-content" style={{
                    display: this.getProduct() && this.isGrouped() ? "" : "none",
                }}>
                    <div className="modal-header">
                        <button type="button" className="cancel" data-dismiss="modal" aria-label="Close"
                                onClick={this.props.closePopup}>
                            {this.props.t('Cancel')}
                        </button>
                        <h4 className="modal-title">{this.props.product ? this.props.product.name : ''}</h4>
                    </div>
                    <div className="modal-body" ref={this.setModalBodyElement}>
                        <div className="product-grouped-wrapper">
                            {
                                this.state.childrenProducts ?
                                    this.state.childrenProducts.map(child => {
                                        return child.status ?
                                            <div key={child.id} className="grouped-item">
                                                <div className="product-field-qty">
                                                    <div className="box-field-qty">
                                                        <input ref={(el) => this.setInputQtyElement(el, child)}
                                                               name="qty" id="qty" minLength="1" maxLength="12"
                                                               title="Qty" className="form-control qty"
                                                               defaultValue={child.qty}
                                                               onClick={(event) => this.showNumpad(event, child)}
                                                               onKeyDown={(event) => this.onKeyDownQty(event, child)}
                                                               onChange={(event) => this.onChangeQty(event, child)}
                                                               onBlur={() => this.blurQty(child)}
                                                        />
                                                        <a className="btn-number qtyminus"
                                                           onClick={() => this.minusQty(child)}>-</a>
                                                        <a className="btn-number qtyplus"
                                                           onClick={() => this.plusQty(child)}>+</a>
                                                    </div>
                                                </div>
                                                <div className="product-name">{child.name}</div>
                                                <div className="product-price">
                                                    {this.state.childrenProductPrices[child.id]}
                                                </div>
                                            </div>
                                            : ""
                                    }) : ""
                            }
                            <div className={(this.state.is_loading ? "loader-product" : "")}></div>
                        </div>
                    </div>
                    <div className="modal-bottom">
                        <button type="button" ref={this.setAddToCartButtonElement}
                                className="addtocart btn-default" onClick={() => this.addToCart()}>
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
                                        this.state.numpadProduct && this.state.numpadProduct.id &&
                                        this.isQtyDecimal(this.state.numpadProduct) ?
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

class ProductGroupedViewContainer extends CoreContainer {
    static className = 'ProductGroupedViewContainer';

    static mapState(state) {
        let {quote} = state.core.checkout;
        let {mode} = state.core.sync;
        return {quote, mode};
    }

    static mapDispatch(dispatch) {
        return {
            actions: {
                addProduct: data => dispatch(QuoteAction.addProduct(data)),
                closePopup: () => dispatch(ProductAction.viewProduct())
            }
        }
    }
}

export default ContainerFactory.get(ProductGroupedViewContainer).withRouter(
    ComponentFactory.get(ProductGroupedViewComponent)
);

