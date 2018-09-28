import React, {Fragment} from 'react';
import {CoreComponent} from "../../../../../framework/component/index";
import CoreContainer from "../../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
/*import SearchBoxComponent from "./step-item/CreateCreditmemoStepItemSearchBox";*/
import ItemSimpleComponent from "./step-item/item/CreateCreditmemoStepItemItemSimple";
import ItemBundleComponent from "./step-item/item/CreateCreditmemoStepItemItemBundle";
import ItemGiftCardComponent from "./step-item/item/CreateCreditmemoStepItemItemGiftCard";
import OrderItemService from "../../../../../service/sales/order/OrderItemService";
import ProductTypeConstant from "../../../../constant/ProductTypeConstant";
import SmoothScrollbar from "smooth-scrollbar/index";
import CurrencyHelper from "../../../../../helper/CurrencyHelper";
import StockHelper from "../../../../../helper/StockHelper";
import TaxHelper from "../../../../../helper/TaxHelper";
import CreditmemoItemService from "../../../../../service/sales/order/creditmemo/CreditmemoItemService";

class CreateCreditmemoStepItemComponent extends CoreComponent {
    static className = 'CreateCreditmemoStepItemComponent';

    setBlockContentElement = element => {
        if (this.scrollbar) {
            SmoothScrollbar.destroy(this.scrollbar);
        }
        if (element) {
            this.blockContentElement = element;
            this.scrollbar = SmoothScrollbar.init(this.blockContentElement);
        }
    };

    setNumPadBackDropElement = element => this.numPadBackDropElement = element;
    setNumPadElement = element => this.numPadElement = element;
    setNumPadQtyElement = element => this.numPadQtyElement = element;

    acceptKeyboardKeys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ",", ".", "delete", "backspace"];

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        let decimalSymbol = CurrencyHelper.getCurrencyFormat(props.order.order_currency_code).decimal_symbol;
        let creditmemo_items_param = props.creditmemo_items_param;
        this.state = {
            can_show_return_stock_column: this.canShowReturnStockColumn(creditmemo_items_param),
            can_show_fpt_column: this.canShowFPTColumn(props),
            show_numpad: false,
            numpad_creditmemo_item_param: null,
            numpad_qty: "0",
            decimal_symbol: (decimalSymbol ? decimalSymbol : "."),
            is_numpad_qty_decimal: false
        };
        this.props.setCreditmemo();
        document.body.addEventListener('keyup', event => this.onKeyupKeyboard(event.key));
    }

    /**
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        let creditmemo_items_param = nextProps.creditmemo_items_param;
        this.setState({
            can_show_return_stock_column: this.canShowReturnStockColumn(creditmemo_items_param),
            can_show_fpt_column: this.canShowFPTColumn(nextProps),
        });
    }

    /**
     * Check order can return stock
     *
     * @param creditmemo_items_param
     * @return {boolean}
     */
    canShowReturnStockColumn(creditmemo_items_param) {
        if (!StockHelper.canSubtractQty()) {
            return false;
        }
        if (creditmemo_items_param) {
            return !!Object.keys(creditmemo_items_param).find(item_id => {
                let creditmemo_item_param = creditmemo_items_param[item_id];
                return creditmemo_item_param.qty_to_refund > 0 && creditmemo_item_param.can_return_stock;
            });
        }
        return false;
    }

    /**
     * Check can show fpt column
     *
     * @param props
     * @returns {boolean}
     */
    canShowFPTColumn(props) {
        let creditmemo_items_param = props.creditmemo_items_param;
        let order = props.order;
        if (creditmemo_items_param && order) {
            return !!Object.keys(creditmemo_items_param).find(item_id => {
                let creditmemo_item_param = creditmemo_items_param[item_id];
                let orderItem = creditmemo_item_param.order_item;
                if (!creditmemo_item_param.order_item.parent_item_id) {
                    return creditmemo_item_param.qty_to_refund > 0 &&
                        orderItem.weee_tax_applied_row_amount > 0;
                } else {
                    if (OrderItemService.isDummy(orderItem, order)) {
                        return false;
                    }
                    return creditmemo_item_param.qty_to_refund > 0 && orderItem.weee_tax_applied_row_amount > 0;
                }

            });
        }
    }

    /**
     * get item component
     *
     * @param orderItem
     * @return {*}
     */
    getItemComponent(orderItem) {
        let props = {
            key: orderItem.item_id,
            order: this.props.order,
            order_item: orderItem,
            creditmemo: this.props.creditmemo,
            creditmemo_items_param: this.props.creditmemo_items_param,
            updateCreditmemoItemParam: this.props.updateCreditmemoItemParam,
            can_show_return_stock_column: this.state.can_show_return_stock_column,
            can_show_fpt_column: this.state.can_show_fpt_column,
            showNumPad: (event, creditmemo_item_param) => this.showNumPad(event, creditmemo_item_param)
        };
        if (orderItem.product_type === ProductTypeConstant.BUNDLE) {
            return <ItemBundleComponent {...props}/>;
        }

        if (orderItem.product_type === ProductTypeConstant.GIFT_CARD) {
            return <ItemGiftCardComponent {...props}/>;
        }

        return <ItemSimpleComponent {...props}/>;
    }

    /**
     * Click use max qty checkbox
     *
     * @param event
     */
    useMaxQty(event) {
        this.props.useMaxQty(event.target.checked);
    }

    /**
     * Check can next step
     *
     * @return {boolean}
     */
    canNextStep() {
        return true;
        /*return this.props.items_total.qty > 0;*/
    }

    /**
     * Show number pad
     *
     * @param event
     * @param creditmemo_item_param
     */
    showNumPad(event, creditmemo_item_param) {
        this.calculateNumpadPosition(event);
        document.body.appendChild(this.numPadElement);
        document.body.appendChild(this.numPadBackDropElement);
        let numpad_qty = "0",
            is_numpad_qty_decimal = creditmemo_item_param.is_qty_decimal;
        this.setNumPadQtyElementValue(numpad_qty);
        this.onKeyupKeyboard = this.clickNumPad;
        this.setState({
            show_numpad: true,
            numpad_creditmemo_item_param: creditmemo_item_param,
            numpad_qty,
            is_numpad_qty_decimal
        });
    }

    /**
     * Calculate numpad possition
     *
     * @param event
     */
    calculateNumpadPosition(event) {
        this.setState({numpad_left: event.target.getBoundingClientRect().left - 295});
        this.setState({numpad_top: event.target.getBoundingClientRect().top - 155});
    }

    /**
     * Hide number pad
     */
    hideNumpad() {
        document.body.removeChild(this.numPadElement);
        document.body.removeChild(this.numPadBackDropElement);
        this.onKeyupKeyboard = this.disableKeyupKeyboard;
        this.setQtyAmount(this.state.numpad_qty);
        this.setState({show_numpad: false});
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
     * @return {null}
     */
    disableKeyupKeyboard(key) {
        return key;
    }

    /**
     * click numpad
     *
     * @param key
     */
    clickNumPad(key) {
        if (!this.acceptKeyboardKeys.includes(key.toString().toLowerCase())) {
            return false;
        }
        let numpad_qty = this.state.numpad_qty.toString();
        key = key.toString();
        if (["delete", "backspace"].includes(key.toLowerCase())) {
            numpad_qty = numpad_qty.substr(0, numpad_qty.length - 1);
        } else if ([",", "."].includes(key)) {
            if (numpad_qty.includes(".") || !this.state.numpad_creditmemo_item_param.is_qty_decimal) {
                return false;
            } else if (key !== this.state.decimal_symbol) {
                return false;
            } else {
                numpad_qty = numpad_qty + ".";
            }
        } else {
            numpad_qty = numpad_qty + key;
        }
        numpad_qty = this.validateNumpadQty(numpad_qty);
        this.setNumPadQtyElementValue(numpad_qty);
        this.setState({numpad_qty});
    }

    /**
     * Validate numpad qty
     *
     * @param numpad_qty
     * @return {*}
     */
    validateNumpadQty(numpad_qty) {
        numpad_qty = numpad_qty.replace(/^(?!0$)0+/, '');
        if (numpad_qty === ".") {
            numpad_qty = "0.";
        } else if (numpad_qty === "" || numpad_qty === "0") {
            numpad_qty = "0";
        } else if (+numpad_qty >= 0 && +numpad_qty < 1) {
            numpad_qty = "0" + numpad_qty;
        }
        return numpad_qty;
    }

    /**
     * Set qty for numpad
     * @param numpad_qty
     */
    setNumPadQtyElementValue(numpad_qty) {
        numpad_qty = numpad_qty.toString().replace(".", this.state.decimal_symbol);
        this.numPadQtyElement.value = numpad_qty;
    }

    /**
     *
     * @param numpad_qty
     */
    setQtyAmount(numpad_qty) {
        let creditmemo_item_param = this.state.numpad_creditmemo_item_param;
        numpad_qty = CurrencyHelper.roundToFloat(numpad_qty, 2);
        this.props.updateCreditmemoItemParam(creditmemo_item_param, {qty: numpad_qty}, true);
    }

    /**
     * Add item
     *
     * @param creditmemo_item_param
     * @param data
     * @param updateCreditmemo
     */
    increaseQty(creditmemo_item_param, data = {}, updateCreditmemo = false) {
        if (this.scrollbar && this.scrollbar.containerEl) {
            let elements = this.scrollbar.containerEl
                .getElementsByClassName('item-' + creditmemo_item_param.order_item.item_id);
            if (elements && elements.length) {
                this.scrollbar.scrollTo(0, elements[0].offsetTop - 10);
            }
        }
        this.props.updateCreditmemoItemParam(creditmemo_item_param, data, updateCreditmemo);
    }


    /**
     *
     * @return {*}
     */
    getTotalQtyToRefund() {
        let qty = (this.props.items_total.qty_to_refund || 0).toString();
        if (this.isQtyDecimal()) {
            return CurrencyHelper.formatNumberStringToCurrencyString(qty, this.props.order.order_currency_code);
        }
        return qty.replace(".", this.state.decimal_symbol);
    }

    /**
     *
     * @return {*}
     */
    getTotalQty() {
        let qty = (this.props.items_total.qty || 0).toString();
        if (this.isQtyDecimal()) {
            return CurrencyHelper.formatNumberStringToCurrencyString(qty, this.props.order.order_currency_code);
        }
        return qty.replace(".", this.state.decimal_symbol);
    }

    /**
     * Is qty decimal
     *
     * @return {boolean}
     */
    isQtyDecimal() {
        let creditmemo_items_param = this.props.creditmemo_items_param;
        let isQtyDecimal = false;
        if (creditmemo_items_param) {
            isQtyDecimal = Object.keys(creditmemo_items_param).find(order_item_id => {
                let item = creditmemo_items_param[order_item_id];
                return item.qty_to_refund > 0 && item.is_qty_decimal;
            });
        }
        return isQtyDecimal;
    }

    /**
     * template to render
     * @returns {*}
     */
    template() {
        let priceInclTax = TaxHelper.orderDisplayPriceIncludeTax(),
            subtotalInclTax = TaxHelper.orderDisplaySubtotalIncludeTax();
        return (
            <Fragment>
                <div className="block-search">
                    <div className="box-check">
                        <label className="label-checkbox">
                            <span>{this.props.t('Use Max Qty to Refund')}</span>
                            <input type="checkbox"
                                   defaultChecked={this.props.is_using_max_qty}
                                   onChange={(event) => this.useMaxQty(event)}/>
                            <span>&nbsp;</span>
                        </label>
                    </div>
                    {/*<SearchBoxComponent order={this.props.order}
                                        creditmemo={this.props.creditmemo}
                                        creditmemo_items_param={this.props.creditmemo_items_param}
                                        increaseQty={(creditmemo_item_param, data, updateCreditmemo) =>
                                            this.increaseQty(creditmemo_item_param, data, updateCreditmemo)}/>*/}
                </div>
                <div className="block-content"
                     ref={this.setBlockContentElement}>
                    <table className="table table-order">
                        <thead>
                        <tr>
                            <th className="t-col">&nbsp;</th>
                            <th className="t-product">{this.props.t('Product')}</th>
                            <th className="t-qty">{this.props.t('Qty Left')}</th>
                            <th className="t-qtyrefund">{this.props.t('Qty to Refund')}</th>
                            {
                                this.state.can_show_return_stock_column ?
                                    <th className="t-return">{this.props.t('Return to Stock')}</th> :
                                    null
                            }
                            <th className="t-price">
                                {this.props.t(priceInclTax ? 'Price incl. Tax' : 'Price')}
                            </th>
                            {
                                this.state.can_show_fpt_column ?
                                    <th className="t-fpt">{this.props.t('FPT')}</th> :
                                    null
                            }
                            <th className="t-tax">{this.props.t('Tax')}</th>
                            <th className="t-discount">{this.props.t('Discount')}</th>
                            <th className="t-rowtotal">{this.props.t('Row Total')}</th>
                            <th className="t-col">&nbsp;</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            this.props.order.items.map(item => {
                                return OrderItemService.canCreditmemo(item, this.props.order) ?
                                    this.getItemComponent(item) :
                                    null
                            })
                        }
                        </tbody>
                        <tfoot>
                        <tr>
                            <td className="t-col">&nbsp;</td>
                            <td className="t-product">
                                <p><b>{this.props.t('Total')}</b></p>
                            </td>
                            <td className="t-qty">
                                <b>{this.getTotalQtyToRefund()}</b>
                            </td>
                            <td className="t-qtyrefund">
                                <b>{this.getTotalQty()}</b>
                            </td>
                            {
                                this.state.can_show_return_stock_column ?
                                    <td className="t-return"/> :
                                    null
                            }
                            <td className="t-price">{/*{this.props.items_total.price}*/}</td>

                            {
                                this.state.can_show_fpt_column ?
                                    <td className="t-fpt">{this.props.items_total.fpt}</td> :
                                    null
                            }
                            <td className="t-tax">{this.props.items_total.tax}</td>
                            <td className="t-discount">{this.props.items_total.discount}</td>
                            <td className="t-rowtotal">
                                <div className="hidden-mobile"><p>{this.props.items_total.total_amount}</p></div>
                                <div className="subtotal hidden-desktop">
                                    <b>
                                        {
                                            this.props.t(
                                                subtotalInclTax ?
                                                    "Subtotal incl. Tax: {{price}}" :
                                                    "Subtotal: {{price}}",
                                                {
                                                    price: CreditmemoItemService.formatPrice(
                                                        subtotalInclTax ?
                                                            this.props.creditmemo.subtotal_incl_tax :
                                                            this.props.creditmemo.subtotal,
                                                        this.props.creditmemo
                                                    )
                                                }
                                            )
                                        }
                                    </b>
                                </div>
                                {
                                    this.state.can_show_fpt_column ?
                                        <div className="fpt hidden-desktop">
                                            {
                                                this.props.t(
                                                    "Total FPT: {{price}}", {price: this.props.items_total.fpt}
                                                )
                                            }
                                        </div> :
                                        null
                                }
                                <div className="tax hidden-desktop">
                                    {
                                        this.props.t(
                                            "Total Tax: {{price}}", {price: this.props.items_total.tax}
                                        )
                                    }
                                </div>
                                <div className="discount hidden-desktop">
                                    {
                                        this.props.t(
                                            "Total Discount: {{price}}", {price: this.props.items_total.discount}
                                        )
                                    }
                                </div>
                            </td>
                            <td className="t-col">&nbsp;</td>
                        </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="block-bottom">
                    <div className="actions-accept">
                        <button className={"btn btn-default" + (this.canNextStep() ? "" : " disabled")}
                                type="button"
                                onClick={() => this.canNextStep() ? this.props.changeStep() : false}>
                            {this.props.t('Next')}
                        </button>
                    </div>
                    <div ref={this.setNumPadElement}
                         className="popover refund-payment-popover fade left in"
                         style={{
                             display: this.state.show_numpad ? "block" : "none",
                             top: this.state.numpad_top + 'px',
                             left: this.state.numpad_left + 'px',
                         }}>
                        <div className="arrow" style={{top: "50%"}}/>
                        <div className="popover-content">
                            <div className="popup-calculator popup-calculator2">
                                <div className="product-field-qty">
                                    <div className="box-field-qty">
                                        <input ref={this.setNumPadQtyElement}
                                               name="qty-catalog" id="qty-catalog"
                                               className="form-control qty"
                                               defaultValue={this.state.numpad_qty}/>
                                    </div>
                                </div>
                                <ul className="list-number">
                                    <li onClick={() => this.clickNumPad(7)}><a>7</a></li>
                                    <li onClick={() => this.clickNumPad(8)}><a>8</a></li>
                                    <li onClick={() => this.clickNumPad(9)}><a>9</a></li>
                                    <li onClick={() => this.clickNumPad(4)}><a>4</a></li>
                                    <li onClick={() => this.clickNumPad(5)}><a>5</a></li>
                                    <li onClick={() => this.clickNumPad(6)}><a>6</a></li>
                                    <li onClick={() => this.clickNumPad(1)}><a>1</a></li>
                                    <li onClick={() => this.clickNumPad(2)}><a>2</a></li>
                                    <li onClick={() => this.clickNumPad(3)}><a>3</a></li>
                                    {
                                        this.state.is_numpad_qty_decimal ?
                                            <li onClick={() => this.clickNumPad(this.state.decimal_symbol)}>
                                                <a>{this.props.t(this.state.decimal_symbol)}</a>
                                            </li> :
                                            <li>&nbsp;</li>
                                    }
                                    <li onClick={() => this.clickNumPad(0)}><a>0</a></li>
                                    <li className="clear-number" onClick={() => this.clickNumPad("delete")}>
                                        <a><span>remove</span></a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div ref={this.setNumPadBackDropElement}
                         className="modal-backdrop fade in popover-backdrop"
                         onClick={() => this.hideNumpad()}
                         style={{display: this.state.show_numpad ? "block" : "none"}}/>
                </div>
            </Fragment>
        );
    }
}

class CreateCreditmemoStepItemContainer extends CoreContainer {
    static className = 'CreateCreditmemoStepItemContainer';

    /**
     * Map state to props
     * @param state
     * @returns {{quote: *}}
     */
    static mapState(state) {
        return {};
    }

    /**
     * Map dispatch to props
     *
     * @param dispatch
     * @return {{actions: {selectPayment: function(*=, *=): *, switchPage: function(*=): *, resetState: function(): *, addPayment: function(*=): *}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {}
        }
    }
}

/**
 * @type {CreateCreditmemoStepItemContainer}
 */
export default ContainerFactory.get(CreateCreditmemoStepItemContainer).withRouter(
    ComponentFactory.get(CreateCreditmemoStepItemComponent)
)