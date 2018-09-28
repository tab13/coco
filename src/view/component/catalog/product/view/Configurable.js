import React, {Fragment} from 'react';
import {ProductAbstractViewComponent} from './AbstractView';
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import SmoothScrollbar from 'smooth-scrollbar';
import DropdownOption from "../options/Dropdown";
import InputTextOption from "../options/InputTextOption";
import TextAreaOption from "../options/TextAreaOption";
import RadioOption from "../options/RadioOption";
import CheckboxOption from "../options/CheckboxOption";
import DatePickerOption from "../options/DateTimePickerOption";
import CurrencyHelper from "../../../../../helper/CurrencyHelper";
import ProductService from "../../../../../service/catalog/ProductService";
import AddProductService from "../../../../../service/checkout/quote/AddProductService";
import {toast} from "react-toastify";
import QuoteAction from "../../../../action/checkout/QuoteAction";
import ProductAction from "../../../../action/ProductAction";
import SyncConstant from "../../../../constant/SyncConstant";
import NumberHelper from "../../../../../helper/NumberHelper";
import PermissionConstant from "../../../../constant/PermissionConstant";
import OptionConstant from "../../../../constant/catalog/OptionConstant";
import ProductTypeConstant from "../../../../constant/ProductTypeConstant";
import ModuleHelper from "../../../../../helper/ModuleHelper";

export class ProductConfigurableViewComponent extends ProductAbstractViewComponent {
    static className = 'ProductConfigurableViewComponent';

    configOptions = [];
    customOptions = {};
    acceptKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', ',', 'Backspace', 'Delete'];

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            enableAddToCartButton: false
        };
    }

    setModalBodyElement = element => this.modal_body = element;
    setAddToCartButtonElement = element => this.add_button = element;
    setNumpad = element => this.numpad = element;


    /**
     * set state for component when view product
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.mode !== this.props.mode && nextProps.mode === SyncConstant.OFFLINE_MODE) {
            this.hideNumpad();
        }
        if (nextProps.product && nextProps.product && this.isConfigurable(nextProps.product)) {
            if (!this.props.product || !this.props.product.id || this.props.product.id !== nextProps.product.id) {
                this.setState({current_qty: ''});
                if ((nextProps.product.config_option && nextProps.product.config_option.length)) {
                    this.configOptions = JSON.parse(JSON.stringify(nextProps.product)).config_option;
                    this.configOptions = this.recollectConfigOptionByProductStatus(
                        this.configOptions, nextProps.product.children_products
                    );
                    this.validateConfigOptions(nextProps.product);
                } else {
                    this.getOptionsAndStockChildrens(nextProps.product);
                }
            }
        } else {
            this.configOptions = [];
            this.setState({valid_config_product_ids: [], valid_config_product_by_option_ids: []});
        }
    }

    /**
     * Component did update
     * This function use to caculate position of numpad
     */
    componentDidUpdate(prevProps) {
        this.setConfigOptions();
    }

    /**
     * Set config options in View component
     */
    setConfigOptions() {
        this.props.setConfigOptions(this.configOptions);
    }

    /**
     * recollect config options
     *
     * @param configOptions
     * @param childrenProducts
     * @returns {*}
     */
    recollectConfigOptionByProductStatus(configOptions, childrenProducts) {
        let products = [];
        childrenProducts.map(product => {
            if (product.status && product.status === 1) {
                return products.push(product.id);
            }
            return product;
        });
        configOptions.map(option => {
            option.options.map(itemOption => {
                itemOption.products.map((product, index) => {
                    if (!products.includes(product.id)) {
                        itemOption.products.splice(index, 1);
                    }
                    return product;
                });
                return itemOption;
            });
            return option;
        });
        return configOptions
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
     * Show numpad when click qty field
     */
    showNumpad(event) {
        this.calculateNumpadPosition(event);
        if (this.getValidConfigProductIds().length === 1 && this.state.valid_product) {
            this.setState({showNumPad: true});
            this.numpadModal.style.display = "block";
            this.onKeyupKeyboard = this.enableKeyupKeyboard;
        }
    }

    /**
     * Hide numpad when click anywhere except it-self
     */
    hideNumpad() {
        if (this.state.valid_product) {
            this.numpadModal.style.display = "none";
            this.onKeyupKeyboard = this.disableKeyupKeyboard;
            this.setState({showNumPad: false});
            let minQty = this.getMinimumValidQty(this.state.valid_product);
            if (isNaN(this.state.current_qty) || this.state.current_qty === '' ||
                this.state.current_qty < minQty) {
                this.setState({current_qty: String(minQty)});
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
     * Enable press keyboard event after show numpad
     *
     * @param key
     */
    enableKeyupKeyboard(key) {
        let currentQty = this.state.current_qty;
        if (this.acceptKeys.indexOf(key) !== -1) {
            if (key === 'Backspace' || key === 'Delete') {
                currentQty = currentQty.substring(0, currentQty.length - 1);
            } else if ((key === '.' || key === ',') && this.isQtyDecimal(this.state.valid_product)) {
                if (currentQty.indexOf('.') === -1) {
                    currentQty += '.';
                }
            } else {
                currentQty += key;
            }
            if (isNaN(currentQty)) {
                this.setState({current_qty: ''}, this.recollectPriceAfterChangeQty);
                /*let validateQty = this.validateQty(currentQty);
                if (validateQty) {
                    this.setState({current_qty: String(currentQty)});
                }*/
            } else {
                this.setState({current_qty: String(currentQty)}, this.recollectPriceAfterChangeQty);
            }
            // this.setState({current_qty: currentQty});
        }
    }

    /**
     * Disable press keyboard event after hide numpad
     *
     * @param key
     * @return {null}
     */
    disableKeyupKeyboard(key) {
        return key;
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
     * Minus add qty in popup
     */
    minusQty() {
        if (this.getValidConfigProductIds().length === 1 && this.state.valid_product) {
            let currentQty = parseFloat(this.state.current_qty);
            let addQtyIncrement = this.getProductStockService(this.state.valid_product)
                .getAddQtyIncrement(this.state.valid_product);
            currentQty = NumberHelper.minusNumber(currentQty, addQtyIncrement);
            if (currentQty < addQtyIncrement) {
                currentQty = addQtyIncrement;
            }
            this.validateQty(this.state.valid_product, currentQty);
            this.setState(
                {current_qty: String(currentQty)},
                this.recollectPriceAfterChangeQty
            );
        }
    }

    /**
     * Add more qty in popup
     */
    addQty() {
        if (this.getValidConfigProductIds().length === 1 && this.state.valid_product) {
            let stock = this.state.valid_product.stocks[0].qty;
            let currentQty = parseFloat(this.state.current_qty);
            let addQtyIncrement = this.getProductStockService(this.state.valid_product)
                .getAddQtyIncrement(this.state.valid_product);
            currentQty = NumberHelper.addNumber(currentQty, addQtyIncrement);
            if (currentQty > stock.qty) {
                currentQty = stock.qty;
            }
            let validateQty = this.validateQty(this.state.valid_product, currentQty);
            if (validateQty) {
                this.setState(
                    {current_qty: String(currentQty)},
                    this.recollectPriceAfterChangeQty
                );
            }
        }
    }

    /**
     * Recollect price after change qty in popup
     */
    recollectPriceAfterChangeQty() {
        let validProductIds = this.state.valid_config_product_ids;
        let isChosenAllOptions = this.isChosenAllOptions();
        let priceConfig = this.getPriceConfig(
            this.props.product,
            validProductIds.length === 1 && isChosenAllOptions ? validProductIds[0] : null,
            this.state.current_qty ? this.state.current_qty : 1
        );
        this.setState({price_config: priceConfig}, () => this.collectPrice(this.props.product));
    }

    /**
     * Get valid simple product ids with selected options
     *
     * @return {Array}
     */
    getValidConfigProductIds() {
        return this.state.valid_config_product_ids ? this.state.valid_config_product_ids : [];
    }

    /**
     * Get children simple product from product id
     *
     * @param productId
     * @param configProduct
     */
    getChildrenProduct(productId, configProduct) {
        return (this.props.product || configProduct).children_products.find(
            product => (product.id === productId && product.status)
        );
    }

    /**
     * Get stock and option for configurable product in online mode
     *
     * @param product
     */
    getOptionsAndStockChildrens(product) {
        this.setState({is_loading: true});
        let request = ProductService.getOptionsAndStockChildrens(product.id);
        request.then(response => {
            this.configOptions = JSON.parse(JSON.stringify(response)).config_option;
            this.configOptions = this.recollectConfigOptionByProductStatus(
                this.configOptions, product.children_products
            );
            if (response.config_option) {
                product.config_option = response.config_option;
            }
            if (product.children_products && product.children_products.length > 0 && response.stocks) {
                product.children_products.map(children => response.stocks[children.id] ?
                    children.stocks = response.stocks[children.id] :
                    null
                );
            }
            this.validateConfigOptions(product);
            this.setState({is_loading: false});
        });
    }


    /**
     * Event when click configurable options
     *
     * @param optionId
     * @param itemOptionId
     */
    clickConfigOption(optionId, itemOptionId) {
        this.configOptions.find(option => option.id === optionId)
            .options.map(itemOption => (itemOption.id === parseFloat(itemOptionId)) ?
            itemOption.isChosen = !itemOption.isChosen :
            itemOption.isChosen = false
        );

        this.validateConfigOptions(this.props.product);
    }


    /**
     * Validate option after click option
     *
     * @param configProduct
     */
    validateConfigOptions(configProduct) {
        let validProductIds = [];
        let validArrayProductsEachOption = {};
        this.configOptions.map(option => validArrayProductsEachOption[option.id] = []);
        this.configOptions.map((option, index) => {
            /** @type {Array} itemProducts Product ids of selected option */
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

        let isChosenAllOptions = this.isChosenAllOptions();
        let validProduct = isChosenAllOptions ? this.getValidProduct(validProductIds, configProduct) : null;

        let currentQty = '';

        if (validProduct) {
            currentQty = this.getMinimumValidQty(validProduct);
        }

        return this.setState({
            valid_config_product_ids: validProductIds,
            valid_config_product_by_option_ids: this.getValidProductByOptionIds(validArrayProductsEachOption),
            valid_product: validProduct,
            current_qty: String(currentQty),
            price_config: this.getPriceConfig(
                configProduct,
                validProductIds.length === 1 && isChosenAllOptions ? validProductIds[0] : null,
                currentQty
            ),
            config_stocks: this.getConfigStocks(configProduct, validProductIds)
        }, () => this.collectPrice(configProduct));
    }

    /**
     * get minimum qty
     *
     * @param validProduct
     * @returns {number}
     */
    getMinimumValidQty(validProduct) {
        let productStockService = this.getProductStockService(validProduct);
        let currentQty = productStockService.getAddQtyIncrement(validProduct);
        let items = AddProductService.getItemsByProductId(this.props.quote, validProduct.id);
        if (!items || !items.length) {
            let minSaleQty = productStockService.getMinSaleQty(validProduct);
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
     * Get price to show in popup
     *
     * @param configProduct
     * @param childrenProductId
     * @param childrentProductQty
     * @return {number}
     */
    getPriceConfig(configProduct, childrenProductId = null, childrentProductQty = 1) {
        let priceConfig = 0;
        if (childrenProductId !== null) {
            let product = configProduct.children_products.find(product => product.id === childrenProductId);
            if (product && product.id) {
                priceConfig = this.getProductPrice(product, childrentProductQty ? childrentProductQty : 1);
            } else {
                priceConfig = this.getProductPrice(configProduct, 1)
            }
        } else {
            priceConfig = this.getProductPrice(configProduct, 1)
        }
        return priceConfig;
    }

    /**
     * Get stock to show in popup
     *
     * @param configProduct
     * @param validIds
     * @return {*}
     */
    getConfigStocks(configProduct, validIds) {
        if (validIds.length === 1 && configProduct.children_products && configProduct.children_products.length > 0) {
            let product = configProduct.children_products.find(product => product.id === validIds[0]);
            if (product) {
                return product.stocks;
            }
        }
        return configProduct.stocks;
    }

    /**
     * Get valid product to add
     *
     * @param productIds
     * @param configProduct
     * @return {*}
     */
    getValidProduct(productIds, configProduct) {
        if ((this.props.product || configProduct) && productIds && productIds.length === 1) {
            return this.getChildrenProduct(productIds[0], configProduct);
        }
        return null;
    }

    /**
     * Get available qty from stock to show in popup
     *
     * @return {*}
     */
    getAvailableQty() {
        if (this.state.config_stocks && this.state.config_stocks.length > 0) {
            return this.state.config_stocks[0].qty;
        }
        return "N/A";
    }

    /**
     * Add product to cart
     *
     * @return {boolean}
     */
    addToCart() {
        if (!this.state.valid_product || !this.isChosenAllRequireOptions()) {
            toast.error(
                this.props.t('Please choose all option.'),
                {
                    className: 'wrapper-messages messages-warning'
                }
            );
            return false;
        }
        if (this.props.product.type_id === ProductTypeConstant.CONFIGURABLE) {
            let validateQty = this.validateQty(this.state.valid_product, this.state.current_qty);
            if (!validateQty) {
                return false;
            }

            let product = Object.assign({}, this.props.product);
            let infoBuyOptions = this.getInfoBuyOptions();

            product.custom_options.option_ids = Object.keys(infoBuyOptions).join(',');
            Object.keys(infoBuyOptions).forEach(optionId => {
                product.custom_options['option_' + optionId] = infoBuyOptions[optionId];
            });

            product.custom_option = {...product.custom_option, simple_product: this.state.valid_product};

            this.props.actions.addProduct({
                product: product,
                children_product: this.state.valid_product,
                product_options: this.getProductOptions(),
                qty: parseFloat(this.state.current_qty)
            });
            this.closePopup();
        }
    }

    /**
     * check if all required custom options were chosen
     * @returns {boolean}
     */
    isChosenAllRequireOptions() {
        let requireList = [];
        let isChosenAllRequireOptions = true;

        isChosenAllRequireOptions = this.isChosenAllOptions();
        if (this.props.product) {
            this.props.product.custom_options.map(option => {
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
        } else {
            isChosenAllRequireOptions = false;
        }

        return isChosenAllRequireOptions;
    }

    /**
     * Check all options can be choosen
     * @returns {boolean}
     */
    isChosenAllOptions() {
        let result = true;
        this.configOptions.forEach(option => {
            let choosenOption = option.options.find(itemOption => itemOption.isChosen === true);
            if (!choosenOption) {
                result = false;
            }
        });
        return result;
    }

    /**
     * Get product options before add to cart
     *
     * @return {{info_buyRequest: {product, super_attribute}, attributes_info: *, simple_name, simple_sku: string|string|*}}
     */
    getProductOptions() {
        let attributesInfo = this.getAttributeInfo();

        return {
            info_buyRequest: {
                product: this.props.product.id,
                super_attribute: this.getSuperAttribute(attributesInfo),
                options: this.getInfoBuyOptions(),
            },
            product_calculations: 1,
            shipment_type: 0,
            attributes_info: attributesInfo,
            simple_name: this.state.valid_product.name,
            simple_sku: this.state.valid_product.sku,
            options: this.getOptions()
        }
    }

    /**
     * get Options of info_buyRequest
     */
    getInfoBuyOptions() {
        let options = {};
        if (!this.customOptions) {
            return options;
        }
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
     * get options list in array
     * @returns {Array}
     */
    getOptions() {
        let options = [];
        if (!this.customOptions) {
            return options;
        }
        for (let key in this.customOptions) {
            options.push(this.customOptions[key]);
        }
        return options;
    }

    /**
     * Get attribute info of product options
     *
     * @return {any[]}
     */
    getAttributeInfo() {
        return this.configOptions.map(option => {
            let itemResult = {
                label: option.label,
                option_id: option.id,
            };
            let itemOption = option.options.find(itemOption => itemOption.isChosen === true);
            itemResult.option_value = itemOption.id;
            itemResult.value = itemOption.label;
            return itemResult;
        });
    }

    /**
     * get sper attributeu
     *
     * @param attributesInfo
     * @returns {{}}
     */
    getSuperAttribute(attributesInfo) {
        let result = {};
        attributesInfo.map(item => result[item.option_id] = item.option_value);
        return result;
    }

    /**
     * show external stock
     */
    showExternalStock() {
        if (!window.navigator.onLine) {
            toast.error(this.props.t("You must connect to a Wi-Fi or cellular data network to check external stock"),
                {
                    className: 'wrapper-messages messages-warning'
                }
            );
        } else {
            this.props.showExternalStock();
        }
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

        this.collectPrice(this.props.product);
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
     * @param product
     */
    collectPrice(product) {
        let price = this.state.price_config ? this.state.price_config : 0;
        let totalPrice = price;
        let customOptions = product.custom_options;
        for (let key in this.customOptions) {
            let optionValue = this.customOptions[key];
            let option = customOptions.find(item => item.option_id === optionValue.option_id);

            if (
                optionValue.option_type === OptionConstant.TYPE_CHECK_BOX
                || optionValue.option_type === OptionConstant.TYPE_MULTIPLE
            ) {
                let valueIds = optionValue.option_value.split(',');
                valueIds.forEach(id => { // eslint-disable-line
                    let value = option.values.find(item => String(item.option_type_id) === String(id));
                    totalPrice += this.getOptionPrice(value.price, value.price_type, price);
                });

            } else if (
                optionValue.option_type === OptionConstant.TYPE_RADIO
                || optionValue.option_type === OptionConstant.TYPE_DROP_DOWN
            ) {
                let value = option.values.find(item =>
                    String(item.option_type_id) === String(optionValue.option_value)
                );
                totalPrice += this.getOptionPrice(value.price, value.price_type, price);
            } else {
                totalPrice += this.getOptionPrice(option.price, option.price_type, price);
            }
        }

        this.setState({
            totalPrice: totalPrice,
            enableAddToCartButton: this.isChosenAllRequireOptions()
        });
    }

    /**
     * close popup
     */
    closePopup() {
        this.customOptions = {};
        this.configOptions = [];
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
        let checkExternalClassName = "value";
        let checkExternalFunction = () => false;
        if (this.state.valid_product &&
            this.isAllowed(PermissionConstant.PERMISSION_CHECK_EXTERNAL_STOCK) &&
            ModuleHelper.enableModuleInventory()) {
            checkExternalClassName = "value product-check-avail";
            checkExternalFunction = () => this.showExternalStock();
        }
        return (
            <Fragment>
                <div className="modal-content" style={{
                    display: this.getProduct() && this.isConfigurable() ? "" : "none",
                }}>
                    <div className="modal-header">
                        <button type="button" className="cancel" data-dismiss="modal" aria-label="Close"
                                onClick={() => this.closePopup()}>
                            {this.props.t('Cancel')}
                        </button>
                        <h4 className="modal-title">{this.props.product ? this.props.product.name : ''}</h4>
                    </div>
                    <div className="modal-body" ref={this.setModalBodyElement}>
                        <div className="product-options-wrapper">
                            {
                                this.configOptions.map((option, index) => {
                                    return <DropdownOption
                                        key={index}
                                        option={option}
                                        hasOneOption={this.configOptions.length === 1}
                                        clickConfigOption={this.clickConfigOption.bind(this)}
                                        valid_config_product_by_option_ids={
                                            this.state.valid_config_product_by_option_ids[option.id]
                                        }/>
                                })
                            }
                            {
                                this.props.product && (this.props.product.type_id === ProductTypeConstant.CONFIGURABLE) ?
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
                            <div className={(this.state.is_loading ? "loader-product" : "")}></div>
                        </div>
                        <div className="product-info-price">
                            <span className="label">{this.props.t('Price')}</span>
                            <span className="value">
                            {
                                CurrencyHelper.convertAndFormat(
                                    this.state.totalPrice ? this.state.totalPrice : 0, null, null
                                )
                            }
                        </span>
                        </div>
                        <div className="product-avail-qty">
                            <span className="label">{this.props.t('Avail Qty')}</span>
                            <span className={checkExternalClassName} onClick={checkExternalFunction}>
                            {this.state.valid_product ? this.getAvailableQty() : ""}
                        </span>
                        </div>
                    </div>
                    <div className="modal-bottom">
                        <div className="product-field-qty">
                            <div className={"box-field-qty " + (this.state.valid_product ? "" : "disabled")}>
                            <span className="form-control qty" onClick={(event) => this.showNumpad(event)}>
                                {
                                    this.state.current_qty ?
                                        this.state.current_qty.replace('.', this.state.decimal_symbol) :
                                        this.state.current_qty
                                }
                            </span>
                                <a className="btn-number qtyminus" data-field="qty"
                                   onClick={() => this.minusQty()}>-</a>
                                <a className="btn-number qtyplus" data-field="qty"
                                   onClick={() => this.addQty()}>+</a>
                            </div>
                        </div>
                        <button type="button" ref={this.setAddToCartButtonElement}
                                className={"addtocart btn-default " + (!this.state.enableAddToCartButton ? "disabled" : "")}
                                onClick={() => this.addToCart()}>
                            {this.props.t('Add to Cart')}
                        </button>
                    </div>
                    <div ref={this.setNumpad}
                         className="popover fade right in" role="tooltip" id="numpad-configure-product"
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
                                        (this.getValidConfigProductIds().length === 1 &&
                                            this.state.valid_product &&
                                            this.isQtyDecimal(this.state.valid_product)) ?
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

class ProductConfigurableViewContainer extends CoreContainer {
    static className = 'ProductConfigurableViewContainer';

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

export default ContainerFactory.get(ProductConfigurableViewContainer).withRouter(
    ComponentFactory.get(ProductConfigurableViewComponent)
);

