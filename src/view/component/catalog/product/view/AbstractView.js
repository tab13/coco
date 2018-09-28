import CoreComponent from '../../../../../framework/component/CoreComponent';
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import {toast} from "react-toastify";
import Config from "../../../../../config/Config";
import StockService from "../../../../../service/catalog/StockService";
import AddProductService from "../../../../../service/checkout/quote/AddProductService";
import i18n from "../../../../../config/i18n";
import PriceService from "../../../../../service/catalog/product/PriceService";
import NumberHelper from "../../../../../helper/NumberHelper";
import ProductTypeConstant from "../../../../constant/ProductTypeConstant";
import QuoteItemService from "../../../../../service/checkout/quote/ItemService";
import QuoteService from "../../../../../service/checkout/QuoteService";
import cloneDeep from "lodash/cloneDeep";
import {GiftCardProductHelper} from "../../../../../helper/GiftCardProductHelper";

export class ProductAbstractViewComponent extends CoreComponent {
    static className = 'ProductAbstractViewComponent';

    calculateNumpadPosition(event) {
        if (this.modal_body) {
            if (this.modal_body.offsetWidth > 0) {
                if (this.state.numpad_left !==
                    (this.modal_body.offsetWidth + this.modal_body.getBoundingClientRect().left - 20)) {
                    this.setState({
                        numpad_left: this.modal_body.offsetWidth + this.modal_body.getBoundingClientRect().left - 20
                    });
                }
            }
        }
        this.setState({numpad_top: event.target.getBoundingClientRect().top - 110});
    }

    /**
     * get current product
     */
    getProduct() {
        return this.props.product;
    }

    /**
     * Get children product ids
     *
     * @param product
     * @return {Array}
     */
    getChildrenProductIds(product) {
        if (!product.children_products || !product.children_products.length) {
            return [];
        }
        return product.children_products.map(child => child.id);
    }

    /**
     * Get current product type
     *
     * @param product
     * @return {*}
     */
    getProductType(product = null) {
        if (!product) {
            return this.props.product.type_id;
        }
        return product.type_id;
    }

    /**
     * Check product is simple
     *
     * @param product
     * @return {boolean}
     */
    isSimple(product = null) {
        return this.getProductType(product) === ProductTypeConstant.SIMPLE;
    }

    /**
     * Check product is virtual
     *
     * @param product
     * @return {boolean}
     */
    isVirtual(product = null) {
        return this.getProductType(product) === ProductTypeConstant.VIRTUAL;
    }

    /**
     * Check product is bundle
     *
     * @param product
     * @return {boolean}
     */
    isBundle(product = null) {
        return this.getProductType(product) === ProductTypeConstant.BUNDLE;
    }

    /**
     * Check product is grouped
     *
     * @param product
     * @return {boolean}
     */
    isGrouped(product = null) {
        return this.getProductType(product) === ProductTypeConstant.GROUPED;
    }

    /**
     * Check product is configurable
     *
     * @param product
     * @return {boolean}
     */
    isConfigurable(product = null) {
        return this.getProductType(product) === ProductTypeConstant.CONFIGURABLE;
    }

    /**
     * Check product is gift card
     *
     * @param product
     * @return {boolean}
     */
    isGiftCard(product = null) {
        return this.getProductType(product) === ProductTypeConstant.GIFT_CARD;
    }

    /**
     *
     * @param product
     * @return {boolean}
     */
    isGiftCardTypeFixed(product = null) {
        return this.isGiftCard(product) && GiftCardProductHelper.isTypeFixedValue(this.getProduct());
    }

    /**
     * check offline mode
     * @returns {boolean}
     */
    isOfflineMode() {
        return Config.mode === 'offline';
    }

    /**
     * Check valid product is qty decimal
     *
     * @param product
     * @return {*|boolean}
     */
    isQtyDecimal(product) {
        return StockService.getProductStockService(product).isQtyDecimal(product);
    }

    /**
     * Get product stock service of product
     *
     * @param product
     * @return {*}
     */
    getProductStockService(product) {
        return StockService.getProductStockService(product);
    }

    /**
     * Get price service
     *
     * @param product
     * @return {AbstractPriceService}
     */
    getPriceService(product) {
        return PriceService.getPriceService(product);
    }

    /**
     * check enable qty increment for product
     *
     * @param product
     * @return {*|number}
     */
    isEnableQtyIncrements(product) {
        return this.getProductStockService(product).isEnableQtyIncrements(product);
    }

    /**
     * Get Qty Increment of product
     *
     * @param product
     * @return {*|number}
     */
    getQtyIncrement(product) {
        return this.getProductStockService(product).getQtyIncrement(product);
    }

    /**
     * Get min sale qty of product
     *
     * @param product
     * @return {*|number}
     */
    getMinSaleQty(product) {
        return this.getProductStockService(product).getMinSaleQty(product);
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
        let validateQty = AddProductService.getAddProductService(product).validateQty(product, qty, totalQtys);
        if (validateQty.success === false) {
            this.showError(i18n.translator.translate(validateQty.message));
            return false;
        }
        return true;
    }

    /**
     * Get product price
     *
     * @param product
     * @param {number} qty
     * @return {*|string}
     */
    getProductPrice(product, qty = 1) {
        let quote = cloneDeep(this.props.quote);
        quote.items = [{...QuoteItemService.createItem(product, parseFloat(qty))}];
        QuoteService.collectTotals(quote);
        let item = quote.items.find(item => item.product.id === product.id);
        return QuoteItemService.getProductListDisplayPrice(item, quote);
    }

    /**
     * Show error message
     *
     * @param message
     */
    showError(message) {
        toast.error(
            message,
            {
                className: 'wrapper-messages messages-warning'
            }
        );
    }

    /**
     * check if product has custom options
     * @returns {boolean}
     */
    hasCustomOptions(product = null) {
        return product ? !!product.custom_options.length : !!this.props.product.custom_options.length;
    }
}

class ProductAbstractViewContainer extends CoreContainer {
    static className = 'ProductAbstractViewContainer';

    /**
     * This maps the state to the property of the component
     *
     * @param state
     * @returns {{product}}
     */
    static mapState(state) {
        let {quote} = state.core.checkout;
        let product = state.core.product.viewProduct.product;
        return {quote, product};
    }

    /**
     * This maps the dispatch to the property of the component
     *
     * @param dispatch
     * @returns {{}}
     */
    static mapDispatch(dispatch) {
        return {}
    }
}

export default ContainerFactory.get(ProductAbstractViewContainer).withRouter(
    ComponentFactory.get(ProductAbstractViewComponent)
);

