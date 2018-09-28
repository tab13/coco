import React, {Fragment} from "react";
import CoreComponent from '../../../framework/component/CoreComponent';
import ComponentFactory from '../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../framework/container/CoreContainer';
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import DropdownOption from "../catalog/product/options/Dropdown";
import SmoothScrollbar from 'smooth-scrollbar';
import StockLocation from "./StockLocation";
import StockAction from "../../action/StockAction";
import PermissionConstant from "../../constant/PermissionConstant";
import ModuleHelper from "../../../helper/ModuleHelper";

export class ExternalStock extends CoreComponent {
    static className = 'ExternalStock';

    setModalOptionElement = element => this.modal_option = element;
    setModalLocationElement = element => this.modal_location = element;
    setSearchBoxElement = element => this.search_box = element;

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            product_id: null,
            locations: [],
            isLoading: false,
            configOptions: [],
            valid_config_product_by_option_ids: [],
            displayLocations: [],
            search_box_value: ''
        }
    }

    /**
     * This function after mapStateToProps then push more items to component or change load stock mode
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        let locations = nextProps.stock_locations;
        let product = nextProps.product;
        let productId,  validProductIds;
        this.search_box.value = '';
        this.setState({
            configOptions: nextProps.configOptions
        });
        this.setState({isLoading: false});
        if(locations && locations.length > 0) {
            this.setState({
                locations: locations,
                displayLocations: locations
            });
        }
        if (product) {
            if (product.type_id === 'configurable') {
                validProductIds = this.validateConfigOptions(product, nextProps.configOptions);
                if (validProductIds.length === 1) {
                    productId = validProductIds[0];
                }
            } else {
                productId = product.id;
            }
            if (productId && productId !== this.state.product_id) {
                this.getStockByProduct(productId);
                this.setState({
                    isLoading: true,
                    product_id: productId
                });
            }
        }
    }

    /**
     * get stock by product
     * @param productId
     */
    getStockByProduct(productId) {
        if(this.isAllowed(PermissionConstant.PERMISSION_CHECK_EXTERNAL_STOCK) &&
           ModuleHelper.enableModuleInventory()) {
            this.props.actions.getExternalStock(productId);
        }
    }

    /**
     * handle click config option
     * @param optionId
     * @param itemOptionId
     */
    clickConfigOption(optionId, itemOptionId) {
        let configOptions = this.state.configOptions;
        let validProductIds;
        configOptions.find(option => option.id === optionId)
            .options.map(itemOption => (itemOption.id === parseFloat(itemOptionId)) ?
            itemOption.isChosen = true :
            itemOption.isChosen = false
        );
        this.setState({
            configOptions: configOptions
        });

        validProductIds = this.validateConfigOptions(this.props.product, configOptions);
        if (validProductIds.length === 1) {
            this.getStockByProduct(validProductIds[0]);
            this.setState({
                isLoading: true,
                product_id: validProductIds[0]
            });
        }
    }

    /**
     * Init smooth scrollbar for modal body
     */
    componentDidMount() {
        if (!this.scrollbarOption && this.modal_option) {
            this.scrollbarOption = SmoothScrollbar.init(this.modal_option);
        }
        if (!this.scrollbarLocation && this.modal_location) {
            this.scrollbarLocation = SmoothScrollbar.init(this.modal_location);
        }
    }

    /**
     * Validate option
     * @param configProduct
     * @param configOptions
     * @returns {Array}
     */
    validateConfigOptions(configProduct, configOptions) {
        let validProductIds = [];
        let validArrayProductsEachOption = {};
        configOptions.map(option => validArrayProductsEachOption[option.id] = []);
        configOptions.map((option, index) => {
            let itemProducts = [];
            let isChosen = false;
            option.options.map(itemOption => {
                if (isChosen === true) {
                    return itemProducts;
                }
                if (itemOption.isChosen) {
                    isChosen = true;
                    itemProducts = itemOption.products.map(product => product.id);
                } else {
                    itemProducts.push(...itemOption.products.map(product => product.id));
                }
                return itemProducts;
            });

            Object.keys(validArrayProductsEachOption).map(id => {
                return String(id) !== String(option.id) && validArrayProductsEachOption[id].push(itemProducts);
            });
            if (index === 0) {
                return validProductIds.push(...itemProducts);
            }
            return validProductIds = validProductIds.filter(product => itemProducts.includes(product));
        });

        this.setState({
            valid_config_product_by_option_ids: this.getValidProductByOptionIds(validArrayProductsEachOption),
        });

        return validProductIds;
    }

    /**
     * Get valid product for each option
     *
     * @param validArrayProductsEachOption
     * @return {{}}
     */
    getValidProductByOptionIds(validArrayProductsEachOption) {
        let result = {};
        Object.keys(validArrayProductsEachOption).map(id => {
            result[id] = [];
            return validArrayProductsEachOption[id].map((item, index) => {
                if (index === 0) {
                    return result[id] = item;
                } else {
                    return result[id].filter(productId => item.includes(productId));
                }
            });
        });
        return result;
    }

    /**
     * handle change search key
     */
    changeSearchKey() {
        let searchKey = this.search_box.value;
        let displayLocations;
        searchKey = searchKey.toLowerCase();
        displayLocations = this.state.locations.filter(location => {
            return location.name.toLowerCase().indexOf(searchKey) > -1
                    || location.address.toLowerCase().indexOf(searchKey) > -1;
        });
        this.setState({
            search_box_value: searchKey,
            displayLocations: displayLocations
        });
    }

    /**
     * clear search box
     */
    clearSearchBox() {
        this.search_box.value = '';
        this.setState({
            search_box_value: '',
            displayLocations: this.state.locations
        });
    }

    /**
     * cancel external stock
     */
    cancelExternalStock() {
        this.props.cancelExternalStock();
        this.setState({
            product_id: null,
            locations: [],
            isLoading: false,
            configOptions: [],
            displayLocations: [],
            search_box_value: ''
        });
    }

    /**
     * template
     * @returns {*}
     */
    template() {
        let {isLoading, displayLocations} = this.state;
        let { product, productConfig, canBack} = this.props;
        let product_name = product ? product.name : "";
        let show_config = productConfig ? "check-options" : "check-options hidden";
        return (
            <Fragment>
                <div className="modal-header">
                    <a className={canBack ? "back-product" : "hidden"} onClick={() => {this.props.backExternalStockPopup()}}>
                    </a>
                    <button type="button"
                            className={canBack ? "hidden" : "cancel"}
                            data-dismiss="modal"
                            aria-label="Close"
                            onClick={() => {this.cancelExternalStock()}}>Cancel</button>
                    <h4 className="modal-title" >{ product_name }</h4>
                </div>
                <div className="modal-body" >
                    <div className={show_config} ref={this.setModalOptionElement}>
                        <div className="product-options-wrapper" >
                            {
                                productConfig ? this.state.configOptions.map((option, index) => {
                                    return <DropdownOption
                                        key={index}
                                        option={option}
                                        hasOneOption={this.state.configOptions.length === 1}
                                        clickConfigOption={this.clickConfigOption.bind(this)}
                                        valid_config_product_by_option_ids={
                                            this.state.valid_config_product_by_option_ids[option.id]
                                        }/>
                                }) : null
                            }
                        </div>
                    </div>

                    <div className="box-search">
                        <button className="btn-search" type="button"><span>search</span></button>
                        <input className="input-search form-control"
                               type="text"
                               placeholder="Search locations"
                               ref={this.setSearchBoxElement}
                               onChange={this.changeSearchKey.bind(this)}/>
                        {
                            this.state.search_box_value ?
                                <button className="btn-remove"
                                        type="button"
                                        onClick={() => this.clearSearchBox()}>
                                    <span>remove</span>
                                </button>
                                :
                                null
                        }

                    </div>

                    <div className="loader-product-items"
                         style={{display: isLoading ? 'block' : 'none'}}>
                        <div className={'loader-product'}></div>
                    </div>
                    <div data-scrollbar ref={this.setModalLocationElement} className="list-search">
                        <ul>
                            {
                                isLoading ? null :
                                    (
                                        displayLocations.length > 0 ?
                                            displayLocations.map(location => {
                                                return (<StockLocation key={Math.random()}
                                                                       stock_location={location} />)
                                            })
                                            :
                                            <li>
                                                <div className="noresultsearch">
                                                    { this.props.t('We couldn\'t find any records.') }
                                                </div>
                                            </li>
                                    )
                            }
                        </ul>
                    </div>

                </div>
            </Fragment>
        )
    }
}

class ExternalStockContainer extends CoreContainer {
    static className = 'ExternalStockContainer';

    static mapState(state) {
        let {stock_locations} = state.core.stock;
        return {stock_locations};
    }

    static mapDispatch(dispatch) {
        return {
            actions: {
                getExternalStock: product_id => dispatch(StockAction.getExternalStock(product_id))
            }
        }
    }
}

export default ContainerFactory.get(ExternalStockContainer).withRouter(
    ComponentFactory.get(ExternalStock)
);