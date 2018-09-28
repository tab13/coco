import React, {Fragment} from 'react';
import NumPad from '../../lib/react-numpad';
import isNumber from 'lodash/isNumber';
import CoreComponent from "../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import CoreContainer from "../../../../framework/container/CoreContainer";
import QuoteAction from "../../../action/checkout/QuoteAction";
import {bindActionCreators} from "redux";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import QuoteItemService from "../../../../service/checkout/quote/ItemService";
import LoadingImage from "../../../style/images/loading.gif";
import ProductImage from "../../../style/images/product_placeholder.png";
import ProductList from "../../catalog/ProductList";
import StockService from "../../../../service/catalog/StockService";
import $ from "jquery";
import {isMobile} from "react-device-detect";
import Swiper from 'swiper/dist/js/swiper';
import ProductTypeConstant from "../../../constant/ProductTypeConstant";
import {GiftCardProduct} from "../../catalog/product/view/GiftCardProduct";
import EditPrice from './items/EditPrice';
import BundlePriceService from "../../../../service/catalog/product/price/BundlePriceService";
import Permission from "../../../../helper/Permission";
import PermissionConstant from "../../../constant/PermissionConstant";

export class CartItemComponent extends CoreComponent {
    static className = 'CartItemComponent';

    /**
     *
     */
    constructor(props) {
        super(props);
        const { item } = props;
        this.state = {
            item,
            decimalSymbol: CurrencyHelper.getDecimalSymbol()
        }
    }

    /**
     * Init swipe cart item
     */
    componentDidMount() {
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
    }

    /**
     * get option detail like as custom, bundle, configurable option
     * @param item
     * @return {*}
     */
    displayOption(item) {
        if (
            item.product_type === ProductTypeConstant.SIMPLE
            || item.product_type === ProductTypeConstant.VIRTUAL
        ) {
            return this.displayCustomOption(item);
        }
        if (item.product_type === ProductTypeConstant.CONFIGURABLE) {
            let result = [];
            result.push(this.displayConfigurableOption(item));
            result.push(this.displayCustomOption(item));

            return result;
        }

        if (item.product_type === ProductTypeConstant.BUNDLE) {
            return this.displayBundleOption(item);
        }

        if (item.product_type === ProductTypeConstant.GIFT_CARD) {
            return this.displayGiftCardOption(item);
        }

        return '';
    }

    /**
     * display gift card options
     * @param item
     * @return {Array}
     */
    displayGiftCardOption(item) {
        let result = [];
        let options = item.product_options && item.product_options.info_buyRequest
            ? item.product_options.info_buyRequest
            : [];
        GiftCardProduct.cartItemDisplayFields.forEach(fieldName => {

            if (!options[fieldName]) {
                return;
            }

            let keyLabel = GiftCardProduct.cartItemDisplayMapFieldLabel[fieldName];
            let displayValue = options[fieldName];

            if (isNumber(displayValue)) displayValue = CurrencyHelper.format(displayValue);

            return result.push(
                <span className="bundle-item-option item-option" key={fieldName}>
                    { keyLabel ? `${keyLabel} :` : '' } {displayValue}
                </span>
            )
        });


        return result;
    }

    /**
     * display custom options
     * @param item
     * @return {Array}
     */
    displayCustomOption(item) {
        let result = [];
        let customOptions = item.product_options && item.product_options.options ?
            item.product_options.options : [];
        customOptions.map(option => {
            return result.push(
                <span className="bundle-item-option item-option" key={option.option_id}>
                    {option.value}
                </span>
            )
        });
        return result;
    }

    /**
     * Display option of configurable item
     *
     * @param item
     * @return {*}
     */
    displayConfigurableOption(item) {
        if (!item['product_options']) return '';
        const {attributes_info} = item['product_options'];
        if (!attributes_info) return '';
        const options = attributes_info.map(attribute_info => {
            return `${attribute_info.label}: ${attribute_info.value}`;
        });
        return <span className="item-option" key={Math.random()}>{options.join('; ')}</span>;
    }

    /**
     * Display option of bundle item
     *
     * @param item
     * @return {Array}
     */
    displayBundleOption(item) {
        let result = [];
        let bundleOptions = item.product_options && item.product_options.bundle_options ?
            item.product_options.bundle_options : [];
        let index = 0;
        Object.keys(bundleOptions).map(key => {
            if (bundleOptions[key].value && bundleOptions[key].value.length) {
                result.push(bundleOptions[key].value.map(value => {
                    return <span className="bundle-item-option item-option" key={index++}>
                            {value.qty + ' x ' + value.title}
                        </span>;
                }));
            }
            return key;
        });
        return result;
    }

    /**
     * Can use custom price on item or not?
     * @param item
     * @returns {boolean}
     */
    canUseCustomPrice(item){
        let canUseCustomPrice = Permission.isAllowed(PermissionConstant.PERMISSION_CUSTOM_PRICE_ON_ITEM);
        if (canUseCustomPrice) {
            if (item.product_type === ProductTypeConstant.BUNDLE) {
                let product = item.product;
                canUseCustomPrice = product && (product.price_type === BundlePriceService.PRICE_TYPE_FIXED);
            }
        }
        return  canUseCustomPrice;
    }

    /**
     *  get cart item content
     * @param item
     * @param product
     * @param {boolean} isDisableEdit
     * @return {*}
     */
    getContent(item, product, isDisableEdit) {
        let className = product.id < 0 ? "item-info item-customesale" : "item-info";
        if (isDisableEdit) {
            className += ' on-payment-screen'
        }
        const {qtyIncrement, isQtyDecimal} = StockService.getStockInfo(product);
        return (
            <li className={'item ' + item.item_id}>
                <div className="swiper-container">
                    <div className="swiper-wrapper">
                        <div className="swiper-slide">
                            <div className={className}>
                                {
                                    !isDisableEdit ?
                                    <NumPad.Popover key={item.item_id+"_qty"}
                                                    onChange={(newQty) => {
                                                        if(newQty * 1 !== item.qty) {
                                                            this.props.actions.updateQtyCartItem(item, newQty * 1)
                                                        }
                                                    }}
                                                    position="centerRight"
                                                    arrow="right"
                                                    value={item.qty}
                                                    qtyIncrement={qtyIncrement * 1}
                                                    isDecimal={isQtyDecimal}
                                                    decimalSeparator={this.state.decimalSymbol}
                                                    min={0}
                                                    useParentCoords={true}
                                    >
                                        <div className="item-image">
                                            <div className="image">
                                                <img
                                                    className="lazyload" src={LoadingImage}
                                                    data-src={product.image || ProductImage}
                                                    alt="product"/>
                                                <div
                                                    className={item.qty !== 1 ? 'qty' : 'hidden'}
                                                >
                                                    {item.qty}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="item-detail">
                                            <span className="item-name" dangerouslySetInnerHTML={{__html: item.name}}/>
                                            {this.displayOption(item)}
                                        </div>
                                    </NumPad.Popover>
                                :
                                    <Fragment>
                                         <div className="item-image">
                                                <div className="image">
                                                    <img
                                                        className="lazyload" src={LoadingImage}
                                                        data-src={product.image || ProductImage}
                                                        alt="product"/>
                                                    <div
                                                        className={item.qty !== 1 ? 'qty' : 'hidden'}
                                                    >
                                                        {item.qty}
                                                    </div>
                                                </div>
                                            </div>
                                        <div className="item-detail">
                                            <span className="item-name" dangerouslySetInnerHTML={{__html: item.name}}/>
                                            {this.displayOption(item)}
                                        </div>
                                    </Fragment>
                                }
                                {
                                    (!isDisableEdit && this.canUseCustomPrice(item))?

                                        <EditPrice key={item.item_id+'_custom_price'}
                                                   onChange={(data) => {
                                                        this.props.actions.updateCustomPriceCartItem(item, data.customPrice, data.reason);
                                                   }}
                                                   customPrice={this.state.item?this.state.item.custom_price:0}
                                                   reason={this.state.item?this.state.item.os_pos_custom_price_reason:''}
                                                   position="centerRight"
                                                   arrow="right"
                                                   useParentCoords={true}
                                                   height={387}
                                        >

                                                <div className="item-price">
                                                    <div className="price">{QuoteItemService.getDisplayPrice(item, this.props.quote)}</div>
                                                    {QuoteItemService.showOriginalPrice(item, this.props.quote) &&
                                                    <div className="original"> {QuoteItemService.getDisplayOriginalPrice(item, this.props.quote)}</div>
                                                    }
                                                </div>
                                        </EditPrice>
                                        :
                                        <div className="item-price cannot-use-custom-price">
                                            <div className="price">{QuoteItemService.getDisplayPrice(item, this.props.quote)}</div>
                                            {QuoteItemService.showOriginalPrice(item, this.props.quote) &&
                                            <div className="original"> {QuoteItemService.getDisplayOriginalPrice(item, this.props.quote)}</div>
                                            }
                                        </div>
                                }
                            </div>
                        </div>
                        {
                            !isDisableEdit ?
                                <div className="swiper-slide item-actions"
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         this.props.actions.removeCartItem(item)
                                     }}
                                >

                                    <a className="action-remove"
                                       onClick={event => {
                                           event.stopPropagation();
                                           this.props.actions.removeCartItem(item)
                                       }
                                       }>
                                        <span>remove</span>
                                    </a>

                                </div> : ''
                        }
                    </div>
                </div>
            </li>
        )
    }


    /**
     *  render template
     * @return {*}
     */
    template() {
        const {quote, item, isDisableEdit} = this.props;
        let childItem = false;

        if (item.product_type === ProductTypeConstant.CONFIGURABLE) {
            childItem = QuoteItemService.getChildrenItems(quote, item)[0];
        }

        const realProduct = childItem ? childItem.product : item.product;

        return this.getContent(item, realProduct, isDisableEdit);
    }
}

/**
 *
 * @type {CartItemComponent}
 */
const component = ComponentFactory.get(CartItemComponent);

class CartItemContainer extends CoreContainer {
    static className = 'CartItemContainer';

    /**
     *
     * @param state
     * @return {{isDisableEdit: boolean}}
     */
    static mapState(state) {
        const {index, quote} = state.core.checkout;
        const checkoutCurrentPage = index.currentPage;
        return {
            quote,
            isDisableEdit: checkoutCurrentPage !== ProductList.className
        }
    }

    /**
     *
     * @param dispatch
     * @return {{actions: {setQuote, addProduct, addProductSuccess, addProductFail, removeCartItem, removeCartItemSuccess, removeCartItemFail, updateQtyCartItem, updateQtyCartItemSuccess, updateQtyCartItemFail, setPayments}|ActionCreator<any>|ActionCreatorsMapObject}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: bindActionCreators({...QuoteAction}, dispatch)
        }
    }
}

/**
 *
 * @type {CartItemContainer}
 */
const container = ContainerFactory.get(CartItemContainer);

export default container.getConnect(component);