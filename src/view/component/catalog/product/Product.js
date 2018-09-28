import React from "react";
import CoreComponent from "../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import ProductImage from "../../../style/images/product_placeholder.png";
import StockService from "../../../../service/catalog/StockService";
import {isMobile} from 'react-device-detect';
import {toast} from "react-toastify";
import PermissionConstant from "../../../constant/PermissionConstant";
import ProductTypeConstant from "../../../constant/ProductTypeConstant";
import QuoteService from "../../../../service/checkout/QuoteService";
import QuoteItemService from "../../../../service/checkout/quote/ItemService";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import ProductService from "../../../../service/catalog/ProductService";
import cloneDeep from "lodash/cloneDeep";
import BundlePriceService from "../../../../service/catalog/product/price/BundlePriceService";
import ModuleHelper from "../../../../helper/ModuleHelper";
import {GiftCardProductHelper} from "../../../../helper/GiftCardProductHelper";

export class ProductComponent extends CoreComponent {
    static className = 'ProductComponent';

    elements = {};

    setProductNameEl = element => this.elements['product_name'] = element;
    setNameEl = element => this.elements['name'] = element;
    setProductPriceEl = element => this.elements['product_price'] = element;
    setPriceEl = element => this.elements['price'] = element;
    setProductAvailEl = element => this.elements['product_avail'] = element;
    setAvailEl = element => this.elements['avail'] = element;

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            product_name: props.product.name,
            priceFrontSize: null,
            availFrontSize: null,
        };
        this.handleProductLongPress = this.handleProductLongPress.bind(this);
        this.handleProductLongPressRelease = this.handleProductLongPressRelease.bind(this);
    }

    /**
     * Get product price
     *
     * @param product
     * @param qty
     * @return {*}
     */
    getProductPrice(product, qty = 1) {
        let quote = QuoteService.getProductListQuote();
        quote.items = [{...QuoteItemService.createItem(product, qty)}];
        QuoteService.collectTotals(quote);
        let item = quote.items.find(item => item.product.id === product.id);
        return QuoteItemService.getProductListDisplayPrice(item, quote);
    }

    /**
     * Component will mount
     *
     * @return {ProductComponent}
     */
    componentWillMount() {
        let product = JSON.parse(JSON.stringify(this.props.product));
        if (this.isGrouped()) {
            this.setState({price: ''});
            return this;
        }

        if (this.isConfigurable()) {
            this.setState({price: CurrencyHelper.format(this.getConfigurablePrice(product), null, null)});
            return this;
        }

        let price = this.getProductPrice(product);

        if (this.isBundle() && product.extension_attributes && product.extension_attributes.bundle_product_options) {
            let bundleOptions = product.extension_attributes.bundle_product_options;
            if (bundleOptions.length) {
                bundleOptions.forEach(option =>
                    price += this.getDisplayPriceBundleOption(product, option, product.children_products)
                );
            }
        }
        this.setState({price: CurrencyHelper.format(price, null, null)});
    }

    /**
     * @param bundleProduct
     * @param option
     * @param childrenProducts
     * @returns {number}
     */
    getDisplayPriceBundleOption(bundleProduct, option, childrenProducts) {
        let priceOptions = [];
        if (option.required) {
            if (option.product_links && option.product_links.length) {
                option.product_links.map(productLink => {
                    let findProduct = childrenProducts.find(childrenProduct => childrenProduct.sku === productLink.sku);
                    findProduct = cloneDeep(findProduct);
                    findProduct.price = BundlePriceService.getSelectionPrice(bundleProduct, productLink, findProduct);
                    if(bundleProduct.price_type === BundlePriceService.PRICE_TYPE_FIXED) {
                        delete findProduct.special_price;
                        delete findProduct.tier_prices;
                    }
                    if (findProduct && findProduct.status === 1) {
                        let price = this.getProductPrice(findProduct);
                        priceOptions.push(price);
                    }
                    return productLink;
                });
            }
        }
        if (priceOptions.length) {
            return Math.min(...priceOptions);
        }
        return 0;
    }

    /**
     * get configurable product's price
     * @param configProduct
     * @return {number}
     */
    getConfigurablePrice(configProduct) {
        let price = 0;
        if (configProduct && configProduct.children_products && configProduct.children_products.length) {
            let childPrices = [];
            configProduct.children_products.forEach(childrenProduct => {
                childPrices.push(this.getProductPrice(childrenProduct));
            });
            price = Math.min(...childPrices);
        }
        return price;
    }

    /**
     * Check bundle product
     *
     * @returns {boolean}
     */
    isBundle() {
        return this.props.product.type_id === 'bundle';
    }

    /**
     * Check grouped product
     *
     * @returns {boolean}
     */
    isGrouped() {
        return this.props.product.type_id === ProductTypeConstant.GROUPED;
    }

    /**
     * Check config product
     * @return {boolean}
     */
    isConfigurable() {
        return this.props.product.type_id === ProductTypeConstant.CONFIGURABLE;
    }

    /**
     * Check product is salable
     *
     * @return {boolean}
     */
    isAvailable() {
        return ProductService.isSalable(this.props.product);
    }

    /**
     * Get product image to show in product listing
     *
     * @return {string}
     */
    getProductImage() {
        return this.props.product.image || ProductImage;
    }

    /**
     * Get product name to show in product listing
     *
     * @return {string}
     */
    getProductName() {
        return this.props.product.name;
    }

    /**
     * Return available qty of product
     *
     * @returns {string}
     */
    getQty() {
        let product = this.props.product;

        if (![ProductTypeConstant.SIMPLE, ProductTypeConstant.GIFT_CARD, ProductTypeConstant.VIRTUAL].includes(this.props.product.type_id)) {
            return "";
        }

        if (!this.props.product.stocks ||  !this.props.product.stocks.length) {
            return "";
        }

        let productStockService = StockService.getProductStockService(this.props.product);
        if (!productStockService.isManageStock(this.props.product)) {
            return "";
        }

        let qty = 0;
        if (product.stocks && product.stocks.length) {
            qty = product.stocks[0].qty
        }
        return 'Avail: ' + qty;
    }

    /**
     * Add prduct
     *
     * @param product
     */
    addProduct(product) {
        this.props.addProduct(product);
    }

    /**
     * Split product attribute label to fix with product listing
     *
     * @param {string} attr
     */
    splitProductLabel(attr) {
        let widthParentEl = this.elements['product_' + attr].offsetWidth;
        let widthElement = this.elements[attr].offsetWidth;
        let productLabel = this.state['product_' + attr];
        while (widthParentEl - 1 < widthElement) {
            productLabel = productLabel.split(' ');
            productLabel.pop();
            productLabel = productLabel.join(' ');
            this.elements[attr].innerText = productLabel;
            widthParentEl = this.elements['product_' + attr].offsetWidth;
            widthElement = this.elements[attr].offsetWidth;
        }
        this.setState({['product_' + attr]: productLabel})
    }

    /**
     * Split product name label
     */
    splitProductName() {
        this.splitProductLabel('name');
    }

    /**
     * Change font size of product attribute label
     *
     * @param attr
     */
    changeFontSize(attr) {
        let widthParentEl = this.elements['product_' + attr].offsetWidth;
        let widthElement = this.elements[attr].offsetWidth;
        let fontSize = 0;
        if (this.state[attr + 'FrontSize']) {
            fontSize = this.state[attr + 'FrontSize'];
        } else {
            fontSize = window.getComputedStyle(this.elements[attr]).getPropertyValue('font-size');
            if (fontSize) {
                fontSize = fontSize.replace('px', '');
            }
        }
        while (widthParentEl + 1 < widthElement && fontSize > 1) {
            if (fontSize) {
                if (widthParentEl + 1 < widthElement && fontSize > 1) {
                    --fontSize;
                }
            }
            this.elements[attr].style.fontSize = fontSize + 'px';
            widthParentEl = this.elements['product_' + attr].offsetWidth;
            widthElement = this.elements[attr].offsetWidth;
        }
        this.setState({[attr + 'FrontSize']: fontSize});
    }

    /**
     * Change font size of price label
     */
    changePriceFontSize() {
        this.changeFontSize('price');
    }

    /**
     * Change font size of available qty label
     */
    changeAvailFontSize() {
        this.changeFontSize('avail');
    }

    /**
     * show external stock
     * @param product
     */
    showExternalStock(product) {
        if (!window.navigator.onLine) {
            toast.error(this.props.t("You must connect to a Wi-Fi or cellular data network to check external stock"),
                {
                    className: 'wrapper-messages messages-warning'
                }
            );
        } else {
            this.props.showExternalStock(product)
        }
    }

    /**
     * handle long press on product
     */
    handleProductLongPress() {
        if (!this.isAllowed(PermissionConstant.PERMISSION_CHECK_EXTERNAL_STOCK) ||
            !ModuleHelper.enableModuleInventory()) {
            return false;
        }
        if (isMobile) {
            this.productPressTimer = setTimeout(() => {
                this.showExternalStock(this.props.product)
            }, 1000);
        }
    }

    /**
     * handle long press release on product
     */
    handleProductLongPressRelease() {
        if (isMobile)
            clearTimeout(this.productPressTimer);
    }

    template() {
        let { product } = this.props;
        let isDisplayAvailableQty =
                [ProductTypeConstant.SIMPLE, ProductTypeConstant.GIFT_CARD, ProductTypeConstant.VIRTUAL]
                    .includes(this.props.product.type_id);
        let isShowExternalStock = !isMobile && isDisplayAvailableQty;
        let isAvailable = this.isAvailable();
        let isGiftCardTypeDynamic = GiftCardProductHelper.productIsGiftCard(product)
            && !GiftCardProductHelper.giftCardHasFixedPrice(product);
        return (
            <li className={'product-item ' + (isAvailable ? '' : 'stock-unavailable')}>
                <div className="product-item-info"
                     onClick={() => (isAvailable ? this.addProduct(this.props.product) : null)}
                     onTouchStart={this.handleProductLongPress}
                     onTouchEnd={this.handleProductLongPressRelease}
                     onMouseDown={this.handleProductLongPress}
                     onMouseUp={this.handleProductLongPressRelease}>
                    <div className="product-item-photo">
                        <img className="lazyload" src='' data-src={this.getProductImage()}
                             alt="product"/>
                    </div>
                    <h3 ref={this.setProductNameEl} className="product-item-name">
                        <span ref={this.setNameEl}
                              dangerouslySetInnerHTML={{__html: this.state.product_name}}/>
                    </h3>
                    <div className="product-item-price">
                        <span className="price" ref={this.setProductPriceEl}>
                            <span ref={this.setPriceEl}
                                  style={{fontSize: this.state.priceFrontSize ? this.state.priceFrontSize : ''}}>
                                {
                                    this.isBundle() || isGiftCardTypeDynamic ?
                                        this.props.t('From') + ': ' + this.state.price :
                                        (this.isGrouped() ? '' : this.state.price)
                                }
                            </span>
                        </span>
                        <span className="avail" ref={this.setProductAvailEl}>
                            <span ref={this.setAvailEl}
                                  style={{
                                      fontSize: this.state.availFrontSize ? this.state.availFrontSize : '',
                                      whiteSpace: 'pre'
                                  }}>
                            {this.getQty()}
                            </span>
                        </span>
                    </div>
                    <div className={isAvailable ? "hidden" :
                        (isDisplayAvailableQty ? "product-item-stock" : "hidden")}/>
                </div>
                {this.isAllowed(PermissionConstant.PERMISSION_CHECK_EXTERNAL_STOCK) &&
                 ModuleHelper.enableModuleInventory() ?
                    <div className={isShowExternalStock ? "product-check-avail" : "hidden"}
                         data-toggle="modal"
                         onClick={() => this.showExternalStock(this.props.product)}/>
                    :
                    ''
                }
            </li>
        );
    }

    /**
     * This function is called one time after component rendered
     */
    componentDidMount() {
        this.splitProductName();
        this.changePriceFontSize();
        this.changeAvailFontSize();
    }
}

class ProductContainer extends CoreContainer {
    static className = 'ProductContainer';
}

export default ContainerFactory.get(ProductContainer).withRouter(ComponentFactory.get(ProductComponent));

