import React, {Fragment} from 'react';
import '../../style/css/CatalogSearch.css';
import '../../style/css/Catalog.css';
import AbstractGrid from '../../../framework/component/grid/AbstractGrid'
import ProductAction from "../../action/ProductAction";
import Config from "../../../config/Config";
import ComponentFactory from "../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../framework/container/CoreContainer";
import CategoryList from './CategoryList';
import CustomSale from './product/custom-sale/CustomSale';
import SearchForm from './SearchForm';
import Product from './product/Product';
import ProductView from './product/View';
import SmoothScrollbar from 'smooth-scrollbar';
import QueryService from '../../../service/QueryService';
import Scanner from "../checkout/scanner/Scanner";
import {isMobile} from 'react-device-detect';
import StockService from "../../../service/catalog/StockService";
import QuoteAction from "../../action/checkout/QuoteAction";
import ProductService from "../../../service/catalog/ProductService";
import ProductListService from "../../../service/catalog/product/ProductListService";
import SyncConstant from "../../constant/SyncConstant";
import ProductTypeConstant from "../../constant/ProductTypeConstant";
import CustomSaleConstant from "../../constant/custom-sale/CustomSaleConstant";
import {GiftCardProductHelper} from "../../../helper/GiftCardProductHelper";
import GiftCardProductConstant from "../../constant/catalog/GiftCardProductConstant";

export class ProductList extends AbstractGrid {
    static className = 'ProductList';
    product_list = null;
    searchBox = null;
    addProductTimeOut = null;

    constructor(props) {
        super(props);
        this.state = {
            items: [],
            currentTextSearch: '',
            isSecondLoad: true,
            scanningBarcode: false,
            searchKey: '',
            barcodeString: '',
            category_id: null
        }
    }

    setProductListElement = element => this.product_list = element;

    /**
     * Component will mount
     */
    componentWillMount() {
        /* Set default state mode for component from Config */
        if (Config.mode) {
            this.setState({mode: Config.mode});
        }
        if (Config.session) {
            /* Load product first time before render product list */
            this.loadProduct();
            this.startLoading();
        }
    }

    /**
     * This function after mapStateToProps then push more items to component or change load product mode
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (!this.state.mode && this.props.mode) {
            this.setState({mode: nextProps.mode});
        }
        if (!this.isModeChange(nextProps)) {
            if (nextProps.products.length === 0) {
                this.setState({
                    scanningBarcode: false
                });
            }
            if (
                (nextProps.search_key === this.state.searchKey || nextProps.search_key === this.state.barcodeString)
                && this.state.mode === nextProps.mode && nextProps.request_mode === this.state.mode) {
                if (parseFloat(nextProps.search_criteria.current_page) === 1) {
                    this.addItems(nextProps.products, this.lazyload());
                    /*this.stopLoading();*/
                    this.startLoading();
                    this.loadProduct(
                        this.state.searchKey,
                        nextProps.search_criteria.page_size,
                        nextProps.search_criteria.current_page + 1
                    );
                } else {
                    let currentProductIds = this.state.items.map(item => item.id);
                    let products = nextProps.products.filter(item => !currentProductIds.includes(item.id));
                    this.pushItems(products);
                    this.stopLoading();
                }
            }
            if (nextProps.products.length === 1 && this.state.barcodeString &&
                nextProps.search_criteria && parseFloat(nextProps.search_criteria.current_page) === 1) {
                this.addProduct(nextProps.products[0]);
            }
            if (nextProps.updated_products && nextProps.updated_products.length && this.state.items.length) {
                this.updateListAfterSyncProduct(nextProps.updated_products);
            }
            if (nextProps.updated_stocks && nextProps.updated_stocks.length && this.state.items.length) {
                this.updateListAfterSyncStock(nextProps.updated_stocks);
            }
            if (
                nextProps.updated_catalogrule_prices
                && nextProps.updated_catalogrule_prices.length
                && this.state.items.length
            ) {
                this.updateListAfterSyncCatalogRulePrice(nextProps.updated_catalogrule_prices);
            }
            if (
                nextProps.deleted_catalogrule_prices
                && nextProps.deleted_catalogrule_prices.length
                && this.state.items.length
            ) {
                this.updateListAfterSyncDeletedCatalogRulePrice(nextProps.deleted_catalogrule_prices);
            }
        }
    }

    /**
     * Check mode is changed and reload product list
     *
     * @param nextProps
     * @return {boolean}
     */
    isModeChange(nextProps) {
        if (nextProps.mode && this.state.mode && (nextProps.mode !== this.state.mode)) {
            this.setState({mode: nextProps.mode, isSecondLoad: true});
            this.startLoading();
            this.clearItems();
            this.loadProduct(this.state.searchKey);
            return true;
        }
        return false;
    }

    /**
     * Update list after sync product
     *
     * @param products
     */
    updateListAfterSyncProduct(products = []) {
        if (products && products.length) {
            let items = ProductListService.prepareItemsToUpdateListAfterSyncProduct(products, this.state.items);
            if (items !== false) {
                this.addItems(items);
            }
            this.props.actions.resetSyncActionUpdateProduct();
        }
    }

    /**
     * Update list after sync product
     *
     * @param stocks
     */
    updateListAfterSyncStock(stocks = []) {
        if (stocks && stocks.length) {
            let items = ProductListService.prepareItemsToUpdateListAfterSyncStock(stocks, this.state.items);
            if (items !== false) {
                this.addItems(items);
            }
            this.props.actions.resetSyncActionUpdateStock();
        }
    }

    /**
     * Update list after sync catalog rule price
     * @param catalogrule_prices
     */
    updateListAfterSyncCatalogRulePrice(catalogrule_prices = []) {
        if (catalogrule_prices && catalogrule_prices.length) {
            let items = ProductListService.prepareItemsToUpdateListAfterSyncCatalogRulePrice(
                catalogrule_prices, this.state.items
            );
            if (items !== false) {
                this.addItems(items);
            }
            this.props.actions.resetSyncActionUpdateCatalogRulePrice();
        }
    }

    /**
     * Update list after sync deleted catalog rule price
     * @param ids
     */
    updateListAfterSyncDeletedCatalogRulePrice(ids = []) {
        if (ids && ids.length) {
            let items = ProductListService.prepareItemsToUpdateListAfterSyncDeletedCatalogRulePrice(
                ids, this.state.items
            );
            if (items !== false) {
                this.addItems(items);
            }
            this.props.actions.resetSyncActionDeletedCatalogRulePrice();
        }
    }

    /**
     * Change category
     *
     * @param categoryId
     * @return {ProductList}
     */
    changeCategory(categoryId) {
        this.stopSearching();
        this.clearItems();
        this.startLoading();
        this.setState({
            category_id: categoryId,
            searchKey: '',
            barcodeString: '',
            currentTextSearch: '',
            isSecondLoad: true,
            scanningBarcode: false
        }, () => {
            this.loadProduct();
        });
        return this;
    }

    /**
     * Load more products if first page is not enough height to show scrollbar
     */
    /*componentDidUpdate() {
        if (this.scrollbar && this.scrollbar.size.content.height > 200 && this.scrollbar.limit.y === 0 &&
            this.state.isSecondLoad && this.canLoad()) {
            this.setState({isSecondLoad: false});
            this.loadProduct(
                this.state.searchKey,
                this.props.search_criteria.page_size ? this.props.search_criteria.page_size : null,
                this.props.search_criteria.current_page ? (this.props.search_criteria.current_page + 1) : null
            );
        }
    }*/

    /**
     * Init smooth scrollbar for product list
     */
    componentDidMount() {
        if (!this.scrollbar) {
            this.scrollbar = SmoothScrollbar.init(this.product_list);
            this.scrollbar.addListener(event => {
                if ((event.limit.y <= event.offset.y + 200)) {
                    this.lazyload(event);
                }
                return true;
            });
        }
    }

    /**
     * Check product list items is empty and is not loading products
     *
     * @return {boolean}
     */
    isEmptyItem() {
        return this.state.items.length <= 0 && !this.isLoading();
    }

    /**
     * Load product by props action.searchProduct which was mapped in
     *
     * @param {string} searchKey
     * @param {int} pageSize
     * @param {int} currentPage
     * @function {mapDispatchToProps}
     */
    loadProduct(searchKey = '', pageSize = 16, currentPage = 1) {
        let queryService = QueryService.reset();
        queryService.setOrder('name').setPageSize(pageSize).setCurrentPage(currentPage);
        queryService.addQueryString(searchKey);
        if (this.state.category_id) {
            if (Config.mode === SyncConstant.OFFLINE_MODE) {
                queryService.addFieldToFilter('category_ids', "'" + this.state.category_id + "'", 'like');
            } else {
                // add filter category in online mode
                queryService.addFieldToFilter('category_id', this.state.category_id, 'eq');
            }
        }
        this.props.actions.searchProduct(queryService, searchKey);
    }

    /**
     * Load more products when you scroll product list
     *
     * @param {event} event
     */
    lazyload(event) {
        if (this.canLoad() === true) {
            this.startLoading();
            this.loadProduct(
                this.state.searchKey,
                this.props.search_criteria.page_size,
                this.props.search_criteria.current_page + 1
            );
        }
    }

    /**
     * Check can load more products
     *
     * @return {boolean}
     */
    canLoad() {
        if (this.props.search_criteria !== undefined) {
            return !this.isLoading() && (this.state.items.length < this.props.total_count);
        }
        return false;
    }

    /**
     * Focus search product input
     *
     * @param event
     */
    clickSearchBox(event) {
        if (!this.isSearching()) {
            this.startSearching();
        }
    }

    /**
     * Blur search product input
     *
     * @param event
     */
    blurSearchBox(event) {
        this.setState({currentTextSearch: event.target.value});
        if (!this.state.searchKey) {
            this.stopSearching();
            event.target.value = '';
        }
    }

    /**
     * Cancel searching list
     *
     * @param event
     */
    cancelSearching(event) {
        this.setState({
            searchKey: '',
            barcodeString: '',
            currentTextSearch: event.target.value,
            isSecondLoad: true,
            scanningBarcode: false
        });
        this.stopSearching();
        this.clearItems();
        this.startLoading();
        this.loadProduct();
    }

    /**
     * Change search key of list
     *
     * @param {string} searchKey
     */
    changeSearchKey(searchKey) {
        if (searchKey !== this.state.searchKey) {
            this.clearBarcodeString();
            this.setState({
                searchKey: searchKey,
                isSecondLoad: true,
                category_id: null
            });
            this.clearItems();
            this.startLoading();
            this.loadProduct(searchKey);
        }
    }

    /**
     * Add product to cart
     *
     * @param product
     * @return {boolean}
     */
    addProduct(product) {
        if (product && product.id) {
            this.searchBox.blur();
            if (this.addProductTimeOut) {
                clearTimeout(this.addProductTimeOut);
            }
            this.addProductTimeOut = setTimeout(() => {
                if (!ProductService.isSalable(product)) {
                    this.closeScanner();
                    return false;
                }
                if (GiftCardProductHelper.isTypeFixedValue(product)) {
                    let info_buyRequest = {
                        [GiftCardProductConstant.GIFT_CARD_AMOUNT]: GiftCardProductHelper.getFixedValue(product),
                        product: product.id,
                        ...GiftCardProductHelper.getDefaultTemplateOption(product),
                    };

                    return this.props.actions.addProduct({
                        product: product,
                        product_options: {info_buyRequest},
                        qty: StockService.getProductStockService(product).getAddQtyIncrement(product)
                    })
                }

                if (
                    [ProductTypeConstant.SIMPLE, ProductTypeConstant.VIRTUAL].includes(product.type_id)
                    &&
                    !product.custom_options.length
                ) {
                    return this.props.actions.addProduct({
                        product: product,
                        qty: StockService.getProductStockService(product).getAddQtyIncrement(product)
                    })
                }

                this.props.actions.viewProduct(product)
            }, 100);
        }
    }

    /**
     * Handle click scan barcode button
     */
    handleClickScanButton() {
        this.setState({
            scanningBarcode: true
        });
        if (!this.isSearching()) {
            this.startSearching();
        }
    }

    /**
     * Search barcode
     * @param code
     */
    searchBarcode(code) {
        // this.addItems();
        this.setState({
            barcodeString: code,
            searchKey: code,
            category_id: null
        });
        this.props.actions.searchByBarcode(code);
    }

    /**
     * clear barcode string
     */
    clearBarcodeString() {
        this.setState({
            barcodeString: ""
        });
    }

    /**
     * Close scanner
     */
    closeScanner() {
        this.setState({
            scanningBarcode: false
        });
    }

    /**
     * show external stock
     * @param product
     */
    showExternalStock(product) {
        this.props.actions.viewProduct(product, true, false);
    }

    /**
     * set search box ref
     *
     * @param searchBox
     */
    setSearchBoxRef(searchBox) {
        this.searchBox = searchBox;
    }

    /**
     * Get product key when render product list
     *
     * @param product
     * @return {*}
     */
    getProductKey(product) {
        return product.id + product.updated_at + (product.updated_stock ? product.updated_stock : 0)
    }

    template() {

        let canShowCustomSaleButton = Config.config[CustomSaleConstant.PRODUCT_ID_PATH] && !this.state.scanningBarcode;

        return (
            <Fragment>
                <div className="wrapper-header">
                    <div className="header-right">
                        <CategoryList changeCategory={(id) => this.changeCategory(id)}
                                      searchKey={this.state.searchKey}
                                      category_id={this.state.category_id}
                        />
                        <SearchForm clickSearchBox={(event) => this.clickSearchBox(event)}
                                    blurSearchBox={(event) => this.blurSearchBox(event)}
                                    changeSearchKey={(event) => this.changeSearchKey(event)}
                                    cancelSearching={(event) => this.cancelSearching(event)}
                                    isSearching={() => this.isSearching()}
                                    isLoading={() => this.isLoading()}
                                    searchKey={this.state.searchKey}
                                    scanningBarcode={this.state.scanningBarcode}
                                    barcodeString={this.state.barcodeString}
                                    searchBarcode={code => this.searchBarcode(code)}
                                    categoryId={this.state.category_id}
                                    setSearchBoxRef={(searchBox) => this.setSearchBoxRef(searchBox)}
                        />
                        {
                            isMobile ?
                                <div className="catalog-barcode" onClick={() => this.handleClickScanButton()}/>
                                :
                                null
                        }
                    </div>
                </div>
                <div className={"wrapper-content " + (this.state.scanningBarcode ? 'show-scan-barcode' : '')}>
                    {
                        this.state.scanningBarcode ?
                            <Scanner searchBarcode={(result) => this.searchBarcode(result)}
                                     closeScanner={() => this.closeScanner()}
                                     clearBarcodeString={() => this.clearBarcodeString()}
                            />
                            :
                            null
                    }
                    <div className="catalog-list" ref={this.setProductListElement}>
                        <div className="search-no-result" style={{display: (this.isEmptyItem() ? '' : 'none')}}>
                            {this.props.t('We couldn\'t find any records.')}
                        </div>
                        <ul className="product-items" style={{display: (this.isEmptyItem() ? 'none' : '')}}>
                            {
                                this.state.items.map((product) => {
                                    return <Product key={this.getProductKey(product)}
                                                    product={product}
                                                    addProduct={(product) => this.addProduct(product)}
                                                    showExternalStock={(product) => this.showExternalStock(product)}/>;
                                })
                            }
                        </ul>
                        {
                            <div className="product-items loader-product"
                                 style={{display: (this.isLoading() ? 'block' : 'none')}}>
                            </div>
                        }
                    </div>
                </div>
                {
                    canShowCustomSaleButton ? <CustomSale/> : null
                }
                <ProductView/>
            </Fragment>
        );
    }
}

class ProductListContainer extends CoreContainer {
    static className = 'ProductListContainer';

    // This maps the state to the property of the component
    static mapState(state) {
        let {mode} = state.core.sync;
        let {
            products, search_criteria, total_count, search_key,
            updated_products, updated_stocks, request_mode, updated_catalogrule_prices,
            deleted_catalogrule_prices
        } = state.core.product.productList;
        return {
            mode, products, search_criteria, total_count, search_key,
            updated_products, updated_stocks, request_mode, updated_catalogrule_prices,
            deleted_catalogrule_prices
        };
    }

    // This maps the dispatch to the property of the component
    static mapDispatch(dispatch) {
        return {
            actions: {
                searchProduct: (queryService, searchKey) =>
                    dispatch(ProductAction.searchProduct(queryService, searchKey)),
                viewProduct: (product, isShowExternalStock, canBack) =>
                    dispatch(ProductAction.viewProduct(product, isShowExternalStock, canBack)),
                addProduct: data => dispatch(QuoteAction.addProduct(data)),
                searchByBarcode: code => dispatch(ProductAction.searchByBarcode(code)),
                resetSyncActionUpdateProduct: () => dispatch(ProductAction.syncActionUpdateProductDataFinish()),
                resetSyncActionUpdateStock: () => dispatch(ProductAction.syncActionUpdateStockDataFinish()),
                resetSyncActionUpdateCatalogRulePrice: () =>
                    dispatch(ProductAction.syncActionUpdateCatalogRulePriceDataFinish()),
                resetSyncActionDeletedCatalogRulePrice: () =>
                    dispatch(ProductAction.syncActionDeletedCatalogRulePriceDataFinish()),
            }
        }
    }
}

export default ContainerFactory.get(ProductListContainer).withRouter(
    ComponentFactory.get(ProductList)
)