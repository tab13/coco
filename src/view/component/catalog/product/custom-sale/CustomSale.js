import React, {Fragment} from 'react';
import CoreComponent from '../../../../../framework/component/CoreComponent'
import ComponentFactory from "../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../../framework/container/CoreContainer";
import CustomSaleConstant from "../../../../constant/custom-sale/CustomSaleConstant";
import QuoteAction from "../../../../action/checkout/QuoteAction";
import CustomSaleInputComponent from "./field/CustomSaleInputComponent";
import CustomSaleSelectComponent from "./field/CustomSaleSelectComponent";
import CustomSaleTextareaComponent from "./field/CustomSaleTextareaComponent";
import CustomSaleNumberComponent from "./field/CustomSaleNumberComponent";
import CustomSaleQuantityComponent from "./field/CustomSaleQuantityComponent";
import Config from '../../../../../config/Config';
import SmoothScrollbar from "smooth-scrollbar/index";
import $ from "jquery";
import ProductTypeConstant from "../../../../constant/ProductTypeConstant";

class CustomSale extends CoreComponent {
    static className = 'CustomSale';
    setPopupCustomSaleElement = element => {
        this.popup_customSale = element;
        if (!this.scrollbar && this.popup_customSale) {
            this.scrollbar = SmoothScrollbar.init(this.popup_customSale);
            setTimeout(() => {
                this.heightPopup('#custom-sale-modal');
            }, 500);
        }
    };

    /**
     * Constructor
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            isOpenCustomSalePopup: false,
            isNew: false,
            customSaleField: {
                name: {
                    ref: "name"
                },
                price: {
                    ref: "price"
                },
                quantity: {
                    ref: "quantity"
                },
                tax: {
                    ref: "tax",
                    options: [],
                    key_value: "value",
                    key_title: "label",
                    defaultValue: ""
                },
                note:{
                    ref: "note"
                },
            },
            customProduct: {
                name: "Custom Product",
                price: 0.00,
                quantity: 1,
                tax_class_id: "",
                note: null
            }
        };
        this.heightPopup = this.heightPopup.bind(this);
    }

    /**
     *  This function will receive tax class in backend and setState with that tax class
     */
    componentWillMount() {
        let defalt_tax_class_custom_sale = Config.config.settings.find(
            child => child.path === "webpos/tax_configuration/custom_sale_default_tax_class"
        ).value;
        let tax_class_custom_sale = Config.config.product_tax_classes;
        this.setState({
            customSaleField: {
                name: {
                    ref: "name"
                },
                price: {
                    ref: "price"
                },
                quantity: {
                    ref: "quantity"
                },
                tax: {
                    ref: "tax",
                    options: tax_class_custom_sale,
                    key_value: "value",
                    key_title: "label",
                    defaultValue: defalt_tax_class_custom_sale
                },
                note:{
                    ref: "note"
                },
            },
            customProduct: {
                name: "Custom Product",
                price: 0.00,
                quantity: 1,
                tax_class_id: Number(defalt_tax_class_custom_sale),
                note: null
            }
        })
    }

    /**
     * Get height popup
     * @param elm
     */
    heightPopup(elm) {
        let height = $(window).height();
        $(elm).css('height', height + 'px');
    }

    /**
     * Destroy scroll popup
     */
    destroyPopup(){
        if (this.popup_customSale) {
            SmoothScrollbar.destroy(this.popup_customSale);
            this.scrollbar = null;
        }
    }

    /**
     *  Show popup custom sale
     */
    showPopupCustomSale(){
        this.setState({
            isOpenCustomSalePopup: true
        });
    }

    /**
     *  Hide popup custom sale
     */
    hidePopupCustomSale(){
        this.destroyPopup();
        this.setState({
            isOpenCustomSalePopup: false,
            isNew: true
        });
    }

    /**
     *  Add custom sale product to cart
     */
    addCustomProduct() {
        let now = new Date().getTime();
        let id = -now;
        let dataFake = {
            category_ids: "",
            config_option: [],
            custom_options: [],
            description: "",
            enable_qty_increments: null,
            is_options: null,
            is_qty_decimal: 0,
            options: 0,
            tier_prices: [],
            json_config: null,
            sku: CustomSaleConstant.SKU,
            type_id: ProductTypeConstant.SIMPLE,
            id: Config.config[CustomSaleConstant.PRODUCT_ID_PATH] || id,
            is_salable: 1,
            is_virtual: false,
            maximum_qty: 100000000000000000,
            minimum_qty: 1,
            qty_increment: 0,
            qty_increments: null,
            status: 1,
            stocks: [
                {
                    backorders: 0,
                    enable_qty_increments: 0,
                    is_in_stock: true,
                    is_qty_decimal: false,
                    manage_stock: true,
                    max_sale_qty: 100000000000000000,
                    min_qty: 0,
                    min_sale_qty: 1,
                    qty_increments: "0.0000",
                    qty: 100000000000000000,
                    product_id: Config.config[CustomSaleConstant.PRODUCT_ID_PATH] || id,
                    sku: CustomSaleConstant.SKU,
                    updated_time: null,
                    use_config_backorders: true,
                    use_config_enable_qty_inc: 1,
                    use_config_manage_stock: true,
                    use_config_max_sale_qty: true,
                    use_config_min_qty: true,
                    use_config_min_sale_qty: true,
                    use_config_qty_increments: 1,
                }
            ]
        };
        let product = Object.assign({},this.state.customProduct , dataFake );
        if (this.state.customProduct.name === "") {
            product.name = "Custom Product";
        }
        let note = this.state.customProduct.note;
        let productOptions = {
            tax_class_id: product.tax_class_id
        };
        if (note) {
            productOptions.options = [
                {
                    label: "Note",
                    option_id: null,
                    option_value: null,
                    option_type: null,
                    value: note,
                    print_value: note,
                }
            ];
        }
        this.props.actions.addCustomProduct({
            product: product,
            qty: product.quantity,
            product_options: productOptions
        });
        this.hidePopupCustomSale();
        this.setState({
            isNew: true
        });
    }

    /**
     * Add input to custom product
     *
     * @param code
     * @param value
     */
    inputFieldOnChange(code, value) {
        if(code === "price" || code === "quantity"){
            value = parseFloat(value.replace(/,/g,''));
        }
        this.state.customProduct[code] = value;
        this.setState({
            isNew: false
        });
    }

    /**
     * Add selected input to custom product
     *
     * @param code
     * @param value
     */
    onSelect(code, value) {
        if (code === "tax_class_id") {
            this.state.customProduct[code] = Number(value);
        } else {
            this.state.customProduct[code] = value;
        }
    }

    /**
     * Render template
     * @return {*}
     */
    template() {
        let modalClass = 'modal popup-edit-customer';
        let fadeClass = 'popup-catalog modal-backdrop fade';
        if (this.state.isOpenCustomSalePopup){
            modalClass += ' in';
            fadeClass += ' in';
        }

        return (
            <Fragment>
                <button
                    className="btn-customesale"
                    type="button"
                    data-toggle="modal"
                    data-target="#popup-custom-sale"
                    onClick={() => this.showPopupCustomSale()}
                ><span>{this.props.t('Custom Sale')}</span></button>
                <div className={modalClass} data-backdrop="static" id="popup-custom-sale" tabIndex="-1" role="dialog" >
                    <div className="modal-dialog popup-create-customer in" id="custom-sale-modal" role="document">
                        <div className="modal-content " >
                            <div className="modal-header">
                                <button type="button" className="cancel" data-dismiss="modal" aria-label="Close" onClick={() => this.hidePopupCustomSale()}>{this.props.t('Cancel')}</button>
                                <h4 className="modal-title" >{this.props.t('Custom Sale')}</h4>
                                <button type="submit" className="save" onClick={this.addCustomProduct.bind(this)}>{this.props.t('Add to Cart')}</button>
                            </div>
                            <div  data-scrollbar ref={this.setPopupCustomSaleElement} className="modal-body">
                                <div className="box-group">
                                    <div className="row form-group">
                                        <CustomSaleInputComponent
                                            Code="name"
                                            Type={CustomSaleConstant.TYPE_FIELD_INPUT}
                                            Label={this.props.t("Name")}
                                            ref={(node) => {
                                                this.state.customSaleField.name.ref = node
                                            }}
                                            isNew={this.state.isNew}
                                            Placeholder="Custom Product"
                                            DefaultValue=""
                                            OneRow={true}
                                            MaxLength={255}
                                            inputFieldOnChange={this.inputFieldOnChange.bind(this)}
                                        />
                                    </div>
                                    <div className="row form-group">
                                        <CustomSaleNumberComponent
                                            Code="price"
                                            Type={CustomSaleConstant.TYPE_FIELD_INPUT}
                                            Label={this.props.t("Price")}
                                            ref={(node) => {
                                                this.state.customSaleField.price.ref = node
                                            }}
                                            isNew={this.state.isNew}
                                            Placeholder=""
                                            DefaultValue="0.00"
                                            OneRow={false}
                                            MaxLength={255}
                                            inputFieldOnChange={this.inputFieldOnChange.bind(this)}
                                        />
                                        <CustomSaleQuantityComponent
                                            Code="quantity"
                                            Type={CustomSaleConstant.TYPE_FIELD_INPUT}
                                            Label={this.props.t("Quantity")}
                                            ref={(node) => {
                                                this.state.customSaleField.quantity.ref = node
                                            }}
                                            isNew={this.state.isNew}
                                            Placeholder=""
                                            DefaultValue="1"
                                            OneRow={false}
                                            MaxLength={255}
                                            inputFieldOnChange={this.inputFieldOnChange.bind(this)}
                                        />
                                    </div>
                                    <div className="row form-group">
                                        <CustomSaleSelectComponent
                                            Code="tax_class_id"
                                            Type={CustomSaleConstant.TYPE_FIELD_SELECT}
                                            Label={this.props.t("Tax")}
                                            ref={(node) => {
                                                this.state.customSaleField.tax.ref = node
                                            }}
                                            isNew={this.state.isNew}
                                            DefaultValue={this.state.customSaleField.tax.defaultValue}
                                            Options={this.state.customSaleField.tax.options}
                                            KeyValue={this.state.customSaleField.tax.key_value}
                                            KeyTitle={this.state.customSaleField.tax.key_title}
                                            OneRow={true}
                                            onSelect={this.onSelect.bind(this)}
                                        />
                                    </div>
                                    <div className="textarea-cus">
                                        <div className="row form-group">
                                            <CustomSaleTextareaComponent
                                                Code="note"
                                                Type={CustomSaleConstant.TYPE_FIELD_TEXTAREA}
                                                Label={this.props.t("Note")}
                                                ref={(node) => {
                                                    this.state.customSaleField.note.ref = node
                                                }}
                                                isNew={this.state.isNew}
                                                OneRow={true}
                                                maxLength={255}
                                                inputFieldOnChange={this.inputFieldOnChange.bind(this)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={fadeClass}/>
            </Fragment>
        );
    }
}

class CustomSaleContainer extends CoreContainer {
    static className = 'CustomSaleContainer';

    // This maps the dispatch to the property of the component
    static mapDispatch(dispatch) {
        return {
            actions: {
                addCustomProduct: data => dispatch(QuoteAction.addProduct(data)),
            }
        }
    }
}

export default ContainerFactory.get(CustomSaleContainer).withRouter(
    ComponentFactory.get(CustomSale)
)
