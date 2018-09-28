import React, {Fragment} from 'react';
import {ProductAbstractViewComponent} from './AbstractView';
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import SmoothScrollbar from 'smooth-scrollbar';
import BundleOption from "../options/BundleOption";
import CurrencyHelper from "../../../../../helper/CurrencyHelper";
import AddProductService from "../../../../../service/checkout/quote/AddProductService";
import QuoteAction from "../../../../action/checkout/QuoteAction";
import ProductAction from "../../../../action/ProductAction";
import SyncConstant from "../../../../constant/SyncConstant";
import NumberHelper from "../../../../../helper/NumberHelper";
import ProductService from "../../../../../service/catalog/ProductService";
import {isMobile} from 'react-device-detect';
import CheckoutHelper from "../../../../../helper/CheckoutHelper";
import cloneDeep from 'lodash/cloneDeep';
import BundlePriceService from "../../../../../service/catalog/product/price/BundlePriceService";
import QuoteService from "../../../../../service/checkout/QuoteService";
import QuoteItemService from "../../../../../service/checkout/quote/ItemService";


export class ProductBundleViewComponent extends ProductAbstractViewComponent {
    static className = 'ProductBundleViewComponent';

    bundleOptions = {};
    acceptKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace', 'Delete'];

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {bundleOptions: [], currentQtys: {}};
    }

    setModalBodyElement = element => this.modal_body = element;
    setBundleQtyElement = element => this.bundle_qty_element = element;
    setNumpad = element => this.numpad = element;
    setAddToCartButtonElement = element => this.add_button = element;


    /**
     * Check bundle option is select one
     *
     * @param option
     * @return {boolean}
     */
    isOptionSelectOne(option) {
        return option.type === 'radio' || option.type === 'select';
    }

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
            this.setState({product: null, bundleOptions: [], currentQtys: {}});
        }
        if (nextProps.product && nextProps.product.id && this.isBundle(nextProps.product) &&
            (!this.getProduct() || nextProps.product.id !== this.getProduct().id)) {
            this.setState({product: nextProps.product});
            if (this.isOfflineMode()) {
                this.recollectBundleOptions(nextProps.product);
            } else {
                this.getStockChildrens(nextProps.product);
            }
        }
    }

    /**
     * Prepare data to view product
     *
     * @param product
     */
    recollectBundleOptions(product) {
        let bundleOptions = JSON.parse(JSON.stringify(product.extension_attributes.bundle_product_options));
        let childrenProducts = product.children_products || [];
        let currentQtys = {};
        let bundleOptionPrices = {};
        bundleOptions.forEach(option => {
            if (option.product_links && option.product_links.length) {
                option.product_links.forEach(productLink => {
                    let findProduct = childrenProducts.find(childrenProduct => childrenProduct.sku === productLink.sku);
                    if (findProduct && findProduct.status === 1) {
                        findProduct = cloneDeep(findProduct);
                        findProduct.price = BundlePriceService.getSelectionPrice(product, productLink, findProduct);
                        if(product.price_type === BundlePriceService.PRICE_TYPE_FIXED) {
                            delete findProduct.special_price;
                            delete findProduct.tier_prices;
                        }
                        productLink.product = findProduct;
                        productLink.isChosen = productLink.is_default ||
                            (option.product_links.length === 1 && option.required);
                        productLink.defaultQty = productLink.qty;
                        if (productLink.isChosen) {
                            option.can_change_quantity = productLink.can_change_quantity;
                            currentQtys[option.option_id] = productLink.qty;
                        }
                        if (!bundleOptionPrices[option.option_id + "_" + findProduct.id]) {
                            let price = this.getProductPrice(findProduct, productLink.isChosen ? productLink.qty : 1);
                            bundleOptionPrices[option.option_id + "_" + findProduct.id] =
                                CurrencyHelper.format(price, null, null);
                        }
                    }
                });
            }
        });
        let bundleQtyIncrement = this.getQtyIncrement(product);
        this.setState({
            bundleOptions: bundleOptions,
            currentQtys: currentQtys,
            bundleQty: bundleQtyIncrement,
            collectBundlePrice: true,
            bundleOptionPrices: bundleOptionPrices
        });
        if (this.bundle_qty_element) {
            this.bundle_qty_element.value = bundleQtyIncrement;
        }
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
            this.recollectBundleOptions(product);
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
    showNumpadOption(event, option) {
        // if (isMobile) {
            if (option) {
                this.calculateNumpadPosition(event);
                let productLink = option.product_links.find(productLink => productLink.isChosen);
                if (productLink && productLink.product) {
                    this.setState({showNumPad: true, numpadBundleOption: option, numpadProductLink: productLink});
                    this.numpadModal.style.display = "block";
                    this.onKeyupKeyboard = this.enableKeyupKeyboard;
                }
            }
            event.target.blur();
        // }
    }

    /**
     * Show numpad when click bundle qty input
     *
     */
    showNumpadBundle(event) {
        if (isMobile) {
            this.calculateNumpadPosition(event);
            this.setState({showNumPad: true, numpadBundleOption: false, numpadProductLink: false});
            this.numpadModal.style.display = "block";
            this.onKeyupKeyboard = this.enableKeyupKeyboard;
            this.bundle_qty_element.blur();
        }
    }

    /**
     * Hide numpad when click anywhere except it-self
     */
    hideNumpad() {
        if (this.state.numpadBundleOption) {
            let option = this.state.numpadBundleOption;
            let productLink = this.state.numpadProductLink;
            let currentQty = productLink.qty;
            this.validateOptionQty(productLink.product, currentQty);
            if (currentQty <= 0) {
                let currentQtys = this.state.currentQtys;
                currentQty = 1;
                productLink.qty = currentQty;
                currentQtys[option.option_id] = currentQty;
                this.setState({currentQtys: currentQtys});
            }
        } else {
            if (this.props.product) {
                this.blurBundleQty();
            }
        }
        this.numpadModal.style.display = "none";
        this.onKeyupKeyboard = this.disableKeyupKeyboard;
        this.setState({showNumPad: false, collectBundlePrice: true});
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
        if (this.state.numpadBundleOption) {
            let currentQtys = this.state.currentQtys;
            let currentQty = currentQtys[this.state.numpadBundleOption.option_id].toString();
            let productLink = this.getProductLinkAfterKeyDownOptionQty(key, this.state.numpadBundleOption);
            if (!productLink) {
                return false;
            }
            if (key === 'Backspace' || key === 'Delete') {
                currentQty = currentQty.substring(0, currentQty.length - 1);
            } else {
                if (key === this.state.decimal_symbol) {
                    key = '.';
                }
                currentQty += key;
            }
            /*currentQty = currentQty ? parseFloat(currentQty) : 0;*/
            productLink.qty = currentQty;
            currentQtys[this.state.numpadBundleOption.option_id] = currentQty;
            this.setState({currentQtys: currentQtys, collectBundlePrice: true});
        } else {
            if (!this.acceptKeys.includes(key)) {
                return false;
            }
            let bundleQty = this.state.bundleQty.toString();
            if (key === 'Backspace' || key === 'Delete') {
                bundleQty = bundleQty.substring(0, bundleQty.length - 1);
            } else {
                bundleQty += key;
            }
            bundleQty = bundleQty !== '' ? parseFloat(bundleQty) : '';
            this.setState({bundleQty: bundleQty, collectBundlePrice: true});
            this.bundle_qty_element.value = bundleQty;
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
     * Get product link of option after key down option qty input
     *
     * @param eventKey
     * @param option
     * @return {boolean}
     */
    getProductLinkAfterKeyDownOptionQty(eventKey, option) {
        if (!option.can_change_quantity) {
            return false;
        } else if (!this.acceptKeys.includes(eventKey) && eventKey !== this.state.decimal_symbol) {
            return false;
        } else {
            let productLink = option.product_links.find(productLink => productLink.isChosen);
            if (!productLink || !productLink.product) {
                return false;
            }
            if (!this.isQtyDecimal(productLink.product) && eventKey === this.state.decimal_symbol) {
                return false;
            }
            if (productLink.qty.toString().includes('.') && eventKey === this.state.decimal_symbol) {
                return false;
            }
            return productLink;
        }
    }

    /**
     * Handle key down option qty input
     *
     * @param event
     * @param option
     * @return {boolean}
     */
    onKeyDownOptionQty(event, option) {
        let productLink = this.getProductLinkAfterKeyDownOptionQty(event.key, option);
        if (!productLink) {
            event.preventDefault();
            return false;
        }
    }

    /**
     * Change option qty input
     *
     * @param option
     * @param event
     */
    changeOptionQty(option, event) {
        if (option && this.isOptionSelectOne(option)) {
            let currentQtys = this.state.currentQtys;
            let qty = event.target.value;
            option.product_links.map(productLink => {
                if (productLink.isChosen && productLink.product) {
                    productLink.qty = qty;
                    currentQtys[option.option_id] = qty;
                }
                return productLink;
            });
            this.setState({currentQtys: currentQtys, collectBundlePrice: true});
        }
    }

    /**
     * Plus option qty input
     *
     * @param option
     */
    plusOptionQty(option) {
        let currentQtys = this.state.currentQtys;
        if (this.isOptionSelectOne(option)) {
            option.product_links.map(productLink => {
                if (productLink.isChosen && option.can_change_quantity) {
                    let currentQty = productLink.qty;
                    currentQty = NumberHelper.addNumber(currentQty, 1);
                    this.validateOptionQty(productLink.product, currentQty);

                    let product = productLink.product;
                    let bundleQty = this.state.bundleQty === '' ? 0 : parseFloat(this.state.bundleQty);
                    let qty = NumberHelper.multipleNumber(currentQty, bundleQty);
                    let cartItemQtys = AddProductService.getProductTotalItemsQtyInCart(null, this.props.quote, product.id);
                    let totalQtys = NumberHelper.addNumber(qty, cartItemQtys);

                    let productStockService = this.getProductStockService(product);
                    let maxSaleQty = productStockService.getMaxSaleQty(product);
                    if (!CheckoutHelper.isAllowToAddOutOfStockProduct()) {
                        let minQty = productStockService.getOutOfStockThreshold(product);
                        let productQty = productStockService.getProductQty(product);
                        maxSaleQty = Math.min(maxSaleQty, productQty - minQty);
                    }
                    if (qty <= maxSaleQty && totalQtys <= maxSaleQty) {
                        productLink.qty = currentQty;
                        currentQtys[option.option_id] = currentQty;
                    }

                }
                return productLink;
            });
        }
        this.setState({currentQtys: currentQtys, collectBundlePrice: true});
    }

    /**
     * Minus option qty input
     *
     * @param option
     */
    minusOptionQty(option) {
        let currentQtys = this.state.currentQtys;
        if (this.isOptionSelectOne(option)) {
            option.product_links.map(productLink => {
                if (productLink.isChosen && productLink.qty > 0 && option.can_change_quantity) {
                    let currentQty = productLink.qty;
                    currentQty = NumberHelper.minusNumber(currentQty, 1);
                    this.validateOptionQty(productLink.product, currentQty);
                    if (currentQty <= 0) {
                        currentQty = 1;
                    }
                    productLink.qty = currentQty;
                    currentQtys[option.option_id] = currentQty;
                }
                return productLink;
            });
        }
        this.setState({currentQtys: currentQtys, collectBundlePrice: true});
    }

    /**
     * Blur option qty input
     *
     * @param option
     */
    blurOptionQty(option) {
        let currentQtys = this.state.currentQtys;
        let productLink = option.product_links.find(productLink => productLink.isChosen);
        if (productLink && productLink.product) {
            let product = productLink.product;
            if (!this.validateOptionQty(product, productLink.qty || 0)) {
                let stock = product.stocks && product.stocks.length ? product.stocks[0] : null;
                if (!stock) {
                    return null;
                }
                let bundleQty = this.state.bundleQty === '' ? 0 : parseFloat(this.state.bundleQty);
                let qty = NumberHelper.multipleNumber(productLink.qty || 0, bundleQty);
                let productStockService = this.getProductStockService(product);
                let minSaleQty = productStockService.getMinSaleQty(product);
                if (stock.is_qty_decimal) {
                    minSaleQty = Math.max(0, minSaleQty);
                } else {
                    minSaleQty = Math.max(1, minSaleQty);
                }
                if (minSaleQty > qty) {
                    qty = Math.ceil(minSaleQty / bundleQty);
                    productLink.qty = qty;
                    currentQtys[option.option_id] = qty;
                } else {
                    let maxSaleQty = productStockService.getMaxSaleQty(product);
                    if (!CheckoutHelper.isAllowToAddOutOfStockProduct()) {
                        let minQty = productStockService.getOutOfStockThreshold(product);
                        let productQty = productStockService.getProductQty(product);
                        maxSaleQty = Math.min(maxSaleQty, productQty - minQty);
                    }
                    let cartItemQtys = AddProductService.getProductTotalItemsQtyInCart(null, this.props.quote, product.id);
                    let totalQtys = NumberHelper.addNumber(qty, cartItemQtys);
                    if (qty > maxSaleQty || totalQtys > maxSaleQty) {
                        qty = Math.floor(NumberHelper.minusNumber(maxSaleQty, cartItemQtys) / bundleQty);
                        productLink.qty = qty;
                        currentQtys[option.option_id] = qty;
                    }
                }
            }
        }
        this.setState({currentQtys: currentQtys});
    }

    /**
     * Change product option
     *
     * @param option
     * @param productLinkOption
     */
    changeOptions(option, productLinkOption = null) {
        let currentQtys = this.state.currentQtys;
        if (option) {
            let isOptionSelectOne = this.isOptionSelectOne(option);
            option.product_links.map(productLink => {
                productLink.isChosen = isOptionSelectOne ? false : productLink.isChosen;
                if (productLinkOption && productLink.id === productLinkOption.id) {
                    productLink.isChosen = isOptionSelectOne ? true : !productLink.isChosen;
                    currentQtys[option.option_id] = productLink.qty;
                    option.can_change_quantity = productLink.can_change_quantity;
                } else if (!productLinkOption) {
                    option.can_change_quantity = false;
                    currentQtys[option.option_id] = 0;
                }
                return productLink;
            })
        }
        this.setState({currentQtys: currentQtys, collectBundlePrice: true});
    }

    /**
     * On key down bundle option qty
     *
     * @param event
     * @return {boolean}
     */
    onKeyDownBundleQty(event) {
        if (!this.acceptKeys.includes(event.key)) {
            event.preventDefault();
            return false;
        }
    }

    /**
     * Change bundle qty input field
     *
     * @param event
     */
    changeBundleQty(event) {
        this.setState({bundleQty: event.target.value, collectBundlePrice: true});
        return false;
    }

    /**
     * Blur bundle qty input
     */
    blurBundleQty() {
        let bundleQtyIncrement = this.getQtyIncrement(this.props.product);
        let bundleQty = this.state.bundleQty;
        if (!bundleQty) {
            bundleQty = 1;
        }
        bundleQty = parseFloat(bundleQty);
        if (bundleQty % 1 !== 0) {
            bundleQty = Math.floor(bundleQty);
        }
        if (bundleQty % bundleQtyIncrement !== 0) {
            this.showError(this.props.t('Please enter multiple of {{qty}}', {qty: bundleQtyIncrement}));
        }
        if (bundleQty !== this.state.bundleQty) {
            this.setState({bundleQty: bundleQty, collectBundlePrice: true});
            this.bundle_qty_element.value = bundleQty;
        }
    }

    /**
     * Plus qty of bundle product
     */
    plusBundleQty() {
        let bundleQty = this.state.bundleQty;
        let qtyIncrement = this.getQtyIncrement(this.props.product);
        bundleQty = NumberHelper.addNumber(bundleQty, qtyIncrement);
        if (bundleQty % qtyIncrement !== 0) {
            let multipleIncrement = Math.floor(bundleQty / qtyIncrement);
            bundleQty = NumberHelper.multipleNumber(qtyIncrement, multipleIncrement);
        }
        this.setState({bundleQty: bundleQty, collectBundlePrice: true});
        this.bundle_qty_element.value = bundleQty;
    }

    /**
     * Minus qty of bundle product
     */
    minusBundleQty() {
        let bundleQty = this.state.bundleQty;
        let qtyIncrement = this.getQtyIncrement(this.props.product);
        bundleQty = NumberHelper.minusNumber(bundleQty, qtyIncrement);
        if (bundleQty < qtyIncrement) {
            bundleQty = qtyIncrement;
        }
        if (bundleQty % qtyIncrement !== 0) {
            let multipleIncrement = Math.ceil(bundleQty / qtyIncrement);
            bundleQty = NumberHelper.multipleNumber(qtyIncrement, multipleIncrement);
        }
        this.setState({bundleQty: bundleQty, collectBundlePrice: true});
        this.bundle_qty_element.value = bundleQty;
    }

    /**
     * Validate qty before add
     *
     * @param product
     * @param qty
     * @return {boolean}
     */
    validateOptionQty(product, qty) {
        let bundleQty = this.state.bundleQty === '' ? 0 : parseFloat(this.state.bundleQty);
        qty = NumberHelper.multipleNumber(parseFloat(qty), bundleQty);
        let cartItemQtys = AddProductService.getProductTotalItemsQtyInCart(null, this.props.quote, product.id);
        let totalQtys = NumberHelper.addNumber(qty, cartItemQtys);
        let validateQty = AddProductService.getAddProductService(this.props.product)
            .validateOptionQty(product, qty, totalQtys);
        if (validateQty.success === false) {
            this.showError(this.props.t(validateQty.message));
            return false;
        }
        return true;
    }

    /**
     * Component will update after change props or state
     *
     * @param nextProps
     * @param nextState
     */
    componentWillUpdate(nextProps, nextState) {
        if (nextState.collectBundlePrice === true) {
            this.collectBundlePrice(nextState);
        }
        return true;
    }

    /**
     * Collect bundle price when choose option or change option qty
     *
     * @param state
     */
    collectBundlePrice(state) {
        if (state.product) {
            let price = this.getProductPrice(state.product, 1);
            let enableAddToCartButton = true;
            let childrenProducts = state.product.children_products || [];
            let bundleOptionPrices = {};
            state.bundleOptions.forEach(option => {
                if (option.required) {
                    let isChosenProduct = option.product_links.find(productLink => productLink.isChosen);
                    if (!isChosenProduct) {
                        enableAddToCartButton = false;
                    }
                }
                if (option.product_links && option.product_links.length) {
                    option.product_links.forEach(productLink => {
                        let findProduct = childrenProducts.find(childrenProduct =>
                            childrenProduct.sku === productLink.sku
                        );
                        if (findProduct && findProduct.status === 1) {
                            findProduct = cloneDeep(findProduct);
                            findProduct.price = BundlePriceService.getSelectionPrice(state.product, productLink, findProduct);
                            if(state.product.price_type === BundlePriceService.PRICE_TYPE_FIXED) {
                                delete findProduct.special_price;
                                delete findProduct.tier_prices;
                            }
                            if (!bundleOptionPrices[option.option_id + "_" + findProduct.id]) {
                                let price = this.getProductPrice(findProduct, productLink.isChosen ? productLink.qty : 1);
                                bundleOptionPrices[option.option_id + "_" + findProduct.id] =
                                    CurrencyHelper.format(price, null, null);
                            }
                        }
                    });
                }
            });

            let product = JSON.parse(JSON.stringify(state.product));
            let bundle_options = {};
            let childrens = [];
            let info_buyRequest = {
                product: state.product.id,
                bundle_option: {},
                bundle_option_qty: {},
                qty: state.bundleQty
            };
            let customOptions = {
                bundle_option_ids: [],
                bundle_selection_ids: [],
                bundle_identity: [product.id]
            };
            state.bundleOptions.forEach(option => {
                this.validateBundleOption(
                    option, bundle_options, childrens, info_buyRequest, customOptions, false, false
                );
            });

            childrens.forEach(children => {
                children.product_options.info_buyRequest = info_buyRequest;
            });
            customOptions.bundle_identity = customOptions.bundle_identity.join('_');
            product.custom_options = customOptions;
            product.extension_attributes.bundle_product_options = state.bundleOptions;
            let data = {
                product: product,
                childrens: childrens,
                product_options: {
                    info_buyRequest: info_buyRequest,
                    bundle_options: bundle_options,
                    shipment_type: product.shipment_type ? product.shipment_type : 0,
                    product_calculations: +product.price_type,
                },
                qty: parseFloat(state.bundleQty)
            };

            let quote = cloneDeep(this.props.quote);
            quote.items = [];

            AddProductService.addProduct(quote, data);
            quote = QuoteService.collectTotals(quote);
            let item = quote.items.find(item => item.product.id === product.id);
            if(item) {
                price = QuoteItemService.getProductListDisplayPrice(item, quote);
            }

            this.setState({
                collectBundlePrice: false,
                bundlePrice: price,
                bundleOptionPrices: bundleOptionPrices,
                enableAddToCartButton: enableAddToCartButton
            });
        }
    }

    /**
     * Get option price
     *
     * @param option
     * @return {number}
     */
    getOptionPrice(option) {
        let price = 0;
        if (option.product_links && option.product_links.length) {
            let productLinks = [];
            if (this.isOptionSelectOne(option)) {
                productLinks.push(option.product_links.find(productLink => productLink.isChosen));
            } else {
                productLinks = option.product_links.filter(productLink => productLink.isChosen);
            }
            if (productLinks.length) {
                productLinks.map(productLink => {
                    if (productLink && productLink.product) {
                        let qty = productLink.qty ? parseFloat(productLink.qty) : 0;
                        let optionPrice = this.getProductPrice(productLink.product, qty);
                        price = NumberHelper.addNumber(price, NumberHelper.multipleNumber(optionPrice, qty));
                    }
                    return productLink;
                });
            }
        }
        return price;
    }

    /**
     * Get current bundle price
     *
     * @return {*}
     */
    getBundlePrice() {
        return CurrencyHelper.format(this.state.bundlePrice, null, null);
    }

    /**
     * Validate Bundle qty before add
     *
     * @return {boolean}
     */
    validateBundleQty() {
        let bundleQty = this.state.bundleQty;
        let bundleQtyIncrement = this.getQtyIncrement(this.props.product);
        if (!bundleQty) {
            this.showError(this.props.t('Bundle qty must be greater than or equal to 1'));
            return false;
        } else if (bundleQty % bundleQtyIncrement !== 0) {
            this.showError(this.props.t('Please enter multiple of {{qty}}', {qty: bundleQtyIncrement}));
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
        if (!this.validateBundleQty()) {
            return false;
        }
        let product = JSON.parse(JSON.stringify(this.props.product));
        let bundle_options = {};
        let childrens = [];
        let info_buyRequest = {
            product: this.props.product.id,
            bundle_option: {},
            bundle_option_qty: {},
            qty: this.state.bundleQty
        };
        let customOptions = {
            bundle_option_ids: [],
            bundle_selection_ids: [],
            bundle_identity: [product.id]
        };
        let validate = true;
        this.state.bundleOptions.map(option => {
            if (validate === false) {
                return false;
            }
            validate = this.validateBundleOption(option, bundle_options, childrens, info_buyRequest, customOptions);
            return option;
        });
        if (!validate) {
            return false;
        }
        if (!childrens || !childrens.length) {
            this.showError(this.props.t('Please select at least one option'));
            return false;
        }
        childrens.map(children => {
            children.product_options.info_buyRequest = info_buyRequest;
            return children;
        });
        customOptions.bundle_identity = customOptions.bundle_identity.join('_');
        product.custom_options = customOptions;
        product.extension_attributes.bundle_product_options = this.state.bundleOptions;
        this.props.actions.addProduct({
            product: product,
            childrens: childrens,
            product_options: {
                info_buyRequest: info_buyRequest,
                bundle_options: bundle_options,
                shipment_type: this.props.product.shipment_type ? this.props.product.shipment_type : 0,
                product_calculations: +product.price_type,
            },
            qty: parseFloat(this.state.bundleQty)
        });
        this.props.actions.closePopup();
    }

    /**
     * Validate bundle option
     *
     * @param option
     * @param bundleOptions
     * @param childrens
     * @param infoBuyRequest
     * @param customOptions
     * @param checkRequire
     * @param checkQty
     * @return {boolean}
     */
    validateBundleOption(
        option, bundleOptions, childrens, infoBuyRequest, customOptions, checkRequire = true, checkQty = true
    ) {
        let result = true;
        if (option.product_links && option.product_links.length) {
            let selectedProductLinks = option.product_links.filter(productLink => productLink.isChosen);
            if (checkRequire && (!selectedProductLinks || !selectedProductLinks.length)) {
                return this.checkOptionRequire(option);
            } else {
                selectedProductLinks.map(productLink => {
                    if (result === false) {
                        return false;
                    }
                    if (checkQty && ((productLink.qty && productLink.qty > 0) || option.required)) {
                        if (!this.validateOptionQty(productLink.product, productLink.qty || 0)) {
                            result = false;
                            return false;
                        }
                    }
                    this.prepareInfoBuyRequest(option, productLink, infoBuyRequest);
                    this.prepareBundleOptions(option, productLink, bundleOptions);
                    this.prepareChildrens(option, productLink, childrens);
                    this.prepareCustomOptions(option, productLink, customOptions);
                    return productLink
                });
            }
        } else {
            return this.checkOptionRequire(option);
        }
        return result;
    }

    /**
     * Check option is required
     *
     * @param option
     * @return {boolean}
     */
    checkOptionRequire(option) {
        if (option.required) {
            this.showError(this.props.t('Please choose all required option.'));
            return false;
        } else {
            return true;
        }
    }

    /**
     * Prepare info buy request
     *
     * @param option
     * @param productLink
     * @param infoBuyRequest
     */
    prepareInfoBuyRequest(option, productLink, infoBuyRequest) {
        if (this.isOptionSelectOne(option)) {
            infoBuyRequest.bundle_option[option.option_id] = productLink.id;
            infoBuyRequest.bundle_option_qty[option.option_id] = productLink.qty;
        } else {
            if (!infoBuyRequest.bundle_option[option.option_id]) {
                infoBuyRequest.bundle_option[option.option_id] = [];
            }
            infoBuyRequest.bundle_option[option.option_id].push(productLink.id)
        }
    }

    /**
     * Prepare bundle options
     *
     * @param option
     * @param productLink
     * @param bundleOptions
     */
    prepareBundleOptions(option, productLink, bundleOptions) {
        if (!bundleOptions[option.option_id]) {
            bundleOptions[option.option_id] = {
                option_id: option.option_id,
                label: option.title,
                value: []
            };
        }
        bundleOptions[option.option_id].value.push({
            title: productLink.product.name,
            qty: productLink.qty,
            price: productLink.product.price
        });
    }

    /**
     * Prepare bundle options
     *
     * @param option
     * @param productLink
     * @param childrens
     */
    prepareChildrens(option, productLink, childrens) {
        childrens.push({
            product: productLink.product,
            qty: productLink.qty,
            product_options: {
                bundle_selection_attributes: JSON.stringify({
                    price: productLink.product.price,
                    qty: productLink.qty,
                    option_label: option.title,
                    option_id: option.option_id
                })
            }
        });
    }

    /**
     * Prepare bundle options
     *
     * @param option
     * @param productLink
     * @param customOptions
     */
    prepareCustomOptions(option, productLink, customOptions) {
        if (!customOptions.bundle_option_ids[option.option_id]) {
            customOptions.bundle_option_ids.push(option.option_id);
        }
        customOptions.bundle_selection_ids.push(productLink.id);
        customOptions['selection_qty_' + productLink.id] = productLink.qty;
        customOptions['product_qty_' + productLink.product.id] = productLink.qty;
        customOptions.bundle_identity.push(productLink.id);
        customOptions.bundle_identity.push(productLink.qty);
    }

    /**
     * Render template
     *
     * @returns {*}
     */
    template() {
        return (
            <Fragment>
                <div className="modal-content" style={{
                    display: this.getProduct() && this.isBundle() ? "" : "none"
                }}>
                    <div className="modal-header">
                        <button type="button" className="cancel" data-dismiss="modal" aria-label="Close"
                                onClick={this.props.closePopup}>
                            {this.props.t('Cancel')}
                        </button>
                        <h4 className="modal-title">{this.props.product ? this.props.product.name : ''}</h4>
                    </div>
                    <div className="modal-body" ref={this.setModalBodyElement}>
                        <div className="product-bundle-wrapper">
                            {
                                this.state.bundleOptions.map(option => {
                                    return <BundleOption
                                        key={option.option_id}
                                        option={option}
                                        bundleOptionPrices={this.state.bundleOptionPrices}
                                        isOptionSelectOne={this.isOptionSelectOne(option)}
                                        plusQty={option => this.plusOptionQty(option)}
                                        minusQty={option => this.minusOptionQty(option)}
                                        blurQty={option => this.blurOptionQty(option)}
                                        onKeyDownQty={(event, option) => this.onKeyDownOptionQty(event, option)}
                                        changeQty={(option, event) => this.changeOptionQty(option, event)}
                                        changeOptions={
                                            (option, productLinkOption) => this.changeOptions(option, productLinkOption)
                                        }
                                        showNumpad={(event, option) => this.showNumpadOption(event, option)}
                                        currentQty={this.state.currentQtys[option.option_id]}
                                        decimal_symbol={this.state.decimal_symbol}
                                    />
                                })
                            }
                            <div className={(this.state.is_loading ? "loader-product" : "")}></div>
                        </div>
                        <div className={"product-price" + (this.state.is_loading ? " hidden" : "")}>
                            {this.getBundlePrice()}
                        </div>
                    </div>
                    <div className="modal-bottom">
                        <div className="product-field-qty">
                            <div className="box-field-qty">
                                <input ref={this.setBundleQtyElement}
                                       name="bundle_qty" id="bundle_qty" minLength="1" maxLength="12" title="Qty"
                                       className="form-control qty"
                                       defaultValue={this.state.bundleQty}
                                       onKeyDown={event => this.onKeyDownBundleQty(event)}
                                       onChange={(event) => this.changeBundleQty(event)}
                                       onBlur={() => this.blurBundleQty()}
                                       onClick={(event) => this.showNumpadBundle(event)}
                                />
                                <a className="btn-number qtyminus"
                                   data-field="bundle_qty"
                                   onClick={() => this.minusBundleQty()}
                                >-</a>
                                <a className="btn-number qtyplus"
                                   data-field="bundle_qty"
                                   onClick={() => this.plusBundleQty()}
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
                                        this.state.numpadProductLink && this.state.numpadProductLink.product &&
                                        this.isQtyDecimal(this.state.numpadProductLink.product) ?
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

class ProductBundleViewContainer extends CoreContainer {
    static className = 'ProductBundleViewContainer';

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

export default ContainerFactory.get(ProductBundleViewContainer).withRouter(
    ComponentFactory.get(ProductBundleViewComponent)
);

