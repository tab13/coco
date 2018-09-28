import React, {Fragment} from 'react';
import CreateCreditmemoStepItemItemAbstractComponent from "../CreateCreditmemoStepItemItemAbstract";
import ComponentFactory from "../../../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../../../../framework/container/CoreContainer";
import CurrencyHelper from "../../../../../../../helper/CurrencyHelper";
import OrderItemService from "../../../../../../../service/sales/order/OrderItemService";
import NumberHelper from "../../../../../../../helper/NumberHelper";
import TaxHelper from "../../../../../../../helper/TaxHelper";
import ProductTypeConstant from "../../../../../../constant/ProductTypeConstant";

class CreateCreditmemoStepItemItemGiftCardComponent extends CreateCreditmemoStepItemItemAbstractComponent {
    static className = 'CreateCreditmemoStepItemItemGiftCardComponent';

    setQtyBoxElement = element => this.qtyBoxElement = element;
    setReturnStockCheckboxElement = element => this.returnStockCheckboxElement = element;
    setReturnStockMessageElement = element => this.returnStockMessageElement = element;

    lastQty = 0;
    lastBackToStock;
    highlightTimeout;

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        let order_item          = props.order_item;
        let decimalSymbol       = CurrencyHelper.getCurrencyFormat(this.props.order.order_currency_code).decimal_symbol;
        let creditmemoItemParam = order_item && props.creditmemo_items_param[order_item.item_id] ?
            props.creditmemo_items_param[order_item.item_id] :
            {};
        let orderItem           = creditmemoItemParam.order_item;
        this.state              = {
            creditmemo_item_param: creditmemoItemParam,
            item_option          : this.getItemOption(order_item),
            decimal_symbol       : (decimalSymbol ? decimalSymbol : "."),
            can_show_fpt         : creditmemoItemParam.qty_to_refund > 0 && orderItem.weee_tax_applied_row_amount > 0
        };
        this.setReturnStockMessageElementValue(creditmemoItemParam);
    }

    /**
     * Component will receive props
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        let newCreditmemoItemParam = nextProps.creditmemo_items_param[nextProps.order_item.item_id];
        if (newCreditmemoItemParam && newCreditmemoItemParam.qty !== this.state.creditmemo_item_param.qty) {
            let orderItem = nextProps.order_item;
            this.setState({
                creditmemo_item_param: newCreditmemoItemParam,
                can_show_fpt         : newCreditmemoItemParam.qty_to_refund > 0
                && orderItem.weee_tax_applied_row_amount > 0
            });
        }
        if (newCreditmemoItemParam && typeof newCreditmemoItemParam.qty !== 'undefined' &&
            newCreditmemoItemParam.qty !== this.lastQty &&
            this.qtyBoxElement) {
            this.highlightQtyBox(newCreditmemoItemParam);
            this.setReturnStockMessageElementValue(newCreditmemoItemParam);
        } else if (newCreditmemoItemParam &&
            newCreditmemoItemParam.back_to_stock !== this.lastBackToStock) {
            this.setReturnStockMessageElementValue(newCreditmemoItemParam);
        }
    }

    /**
     * Highlight qty box
     *
     * @param newCreditmemoItemParam
     */
    highlightQtyBox(newCreditmemoItemParam) {
        this.lastQty = newCreditmemoItemParam.qty;
        if (this.qtyBoxElement) {
            this.qtyBoxElement.classList.add('active');
        }
        if (this.highlightTimeout) {
            clearTimeout(this.highlightTimeout);
        }
        this.highlightTimeout = setTimeout(() => {
            if (this.qtyBoxElement) {
                this.qtyBoxElement.classList.remove('active');
            }
        }, 500);
    }

    /**
     * Set return stock checkbox value
     * @param newCreditmemoItemParam
     */
    setReturnStockMessageElementValue(newCreditmemoItemParam) {
        this.lastBackToStock = newCreditmemoItemParam.back_to_stock;
        if (newCreditmemoItemParam.can_return_stock) {
            if (
                newCreditmemoItemParam.qty <= newCreditmemoItemParam.non_shipped_qty_to_return
                && ![ProductTypeConstant.GIFT_CARD].includes(newCreditmemoItemParam.order_item.product_type)
            ) {
                if (this.returnStockMessageElement) {
                    this.returnStockMessageElement.innerHTML =
                        newCreditmemoItemParam.qty > 0 && newCreditmemoItemParam.back_to_stock ?
                            this.props.t('Cannot return non-shipped item(s) to stock.') :
                            "";
                }
            } else {
                if (this.returnStockMessageElement) {
                    let html = "";
                    if (newCreditmemoItemParam.back_to_stock) {
                        let qty = NumberHelper.minusNumber(
                            newCreditmemoItemParam.qty, newCreditmemoItemParam.non_shipped_qty_to_return
                        );
                        if (
                            [ProductTypeConstant.GIFT_CARD].includes(newCreditmemoItemParam.order_item.product_type)
                        ) {
                            qty = newCreditmemoItemParam.qty;
                        }
                        qty  = this.state.creditmemo_item_param.is_qty_decimal ?
                            CurrencyHelper.formatNumberStringToCurrencyString(
                                qty, this.props.order.order_currency_code
                            ) :
                            qty;
                        html = this.props.t('Qty to return: {{qty}}', {qty: qty});
                    }
                    this.returnStockMessageElement.innerHTML = html;
                }
            }
        }
    }

    /**
     * Get item option
     *
     * @param orderItem
     * @return {*}
     */
    getItemOption(orderItem) {
        let {order, t} = this.props;

        let productOptions = (orderItem.product_options && !Array.isArray(orderItem.product_options)) ?
            JSON.parse(orderItem.product_options) : null;

        if (!productOptions) {
            return null;
        }

        let options = [OrderItemService.getGiftCardOption(productOptions, order, t)];

        if (!options || !options.length) {
            return null;
        }
        return <p className="option">{options.join(', ')}</p>;
    }

    /**
     * Get qty to refund
     *
     * @return {string}
     */
    getQtyToRefund() {
        let qty = (this.state.creditmemo_item_param.qty_to_refund || 0).toString();
        return this.state.creditmemo_item_param.is_qty_decimal ?
            CurrencyHelper.formatNumberStringToCurrencyString(qty, this.props.order.order_currency_code) :
            qty;
    }

    /**
     * get current refund qty
     *
     * @return {string}
     */
    getQty() {
        let qty = (this.state.creditmemo_item_param.qty || 0).toString();
        return this.state.creditmemo_item_param.is_qty_decimal ?
            CurrencyHelper.formatNumberStringToCurrencyString(qty, this.props.order.order_currency_code) :
            qty;
    }

    /**
     * Get can return stock
     *
     * @return {boolean}
     */
    canReturnStock() {
        let creditmemoItemParam = this.state.creditmemo_item_param;
        if (!creditmemoItemParam) {
            return false;
        }
        if (!creditmemoItemParam.can_return_stock) {
            return false;
        }
        if (creditmemoItemParam.qty === 0) {
            return false;
        }
        return creditmemoItemParam.qty > creditmemoItemParam.non_shipped_qty_to_return;

    }

    /**
     * Get current error message
     *
     * @return {*}
     */
    getErrorMessage() {
        return this.state.creditmemo_item_param.error_message ?
            <div className="t-alert">
                <p>{this.state.creditmemo_item_param.error_message}</p>
            </div> :
            ""
    }

    /**
     * Check can decrease item qty
     *
     * @return {boolean}
     */
    canDecreaseQty() {
        return this.state.creditmemo_item_param.qty <= 0;
    }

    /**
     * Check can increase item qty
     *
     * @return {boolean}
     */
    canIncreaseQty() {
        return this.state.creditmemo_item_param.qty >= this.state.creditmemo_item_param.qty_to_refund;
    }

    componentDidMount() {
        this.setReturnStockMessageElementValue(this.state.creditmemo_item_param);
    }

    /**
     * template to render
     * @returns {*}
     */
    template() {
        let priceInclTax        = TaxHelper.orderDisplayPriceIncludeTax();
        let additionalClassName = this.props.hide_border_top ? " t-bundle-product" : "";
        return (
            <Fragment>
                {this.state.creditmemo_item_param.qty_to_refund > 0 ? (
                    <tr className={"item-" + this.state.creditmemo_item_param.order_item.item_id}>
                        <td className={"t-col" + additionalClassName}>&nbsp;</td>
                        <td className={"t-product" + additionalClassName}>
                            <p className="title"
                               dangerouslySetInnerHTML={{__html: this.props.order_item.name}}/>
                            <p className="sku">[{this.props.order_item.sku}]</p>
                            {this.state.item_option}
                        </td>
                        <td className={"t-qty" + additionalClassName}>
                            <span>{this.getQtyToRefund()}</span>
                        </td>
                        <td className={"t-qtyrefund" + additionalClassName}>
                            <div className="product-field-qty">
                                <div className="box-field-qty" ref={this.setQtyBoxElement}>
                                <span className="form-control qty"
                                      onClick={(event) => this.props.showNumPad(
                                          event, this.state.creditmemo_item_param
                                      )}>
                                    {this.getQty()}
                                </span>
                                    <a className={"btn-number qtyminus" + (this.canDecreaseQty() ? " disabled" : "")}
                                       data-field="qty"
                                       onClick={() => this.decreaseQty(this.state.creditmemo_item_param)}>-</a>
                                    <a className={"btn-number qtyplus" + (this.canIncreaseQty() ? " disabled" : "")}
                                       data-field="qty"
                                       onClick={() => this.increaseQty(this.state.creditmemo_item_param)}>+</a>
                                </div>
                            </div>
                            {this.getErrorMessage()}
                        </td>
                        {
                            this.props.can_show_return_stock_column ?
                                <td className={"t-return" + additionalClassName}>
                                    <label className="label-checkbox">
                                        <input ref={this.setReturnStockCheckboxElement}
                                               type="checkbox"
                                               disabled={!this.canReturnStock()}
                                               defaultChecked={this.state.creditmemo_item_param.back_to_stock}
                                               onClick={(event) => this.changeBackToStock(
                                                   this.state.creditmemo_item_param, event.target.checked)
                                               }/>
                                        <span>&nbsp;</span>
                                    </label>
                                    <div className="t-alert">
                                        <p ref={this.setReturnStockMessageElement}/>
                                    </div>
                                    {
                                        !this.state.creditmemo_item_param ||
                                        !this.state.creditmemo_item_param.can_return_stock ?
                                            <div className="t-alert">
                                                <p>{this.props.t('Item(s) can’t be returned to stock ')}</p>
                                            </div>
                                            : ""
                                    }
                                </td> :
                                null
                        }
                        <td className={"t-price" + additionalClassName}>{this.state.creditmemo_item_param.price}</td>
                        {
                            this.props.can_show_fpt_column ?
                                <td className={"t-fpt" + additionalClassName}>
                                    {this.state.creditmemo_item_param.fpt}
                                </td> :
                                null
                        }
                        <td className={"t-tax" + additionalClassName}>{this.state.creditmemo_item_param.tax}</td>
                        <td className={"t-discount" + additionalClassName}>
                            {this.state.creditmemo_item_param.discount}
                        </td>
                        <td className={"t-rowtotal" + additionalClassName}>
                            <p><b>{this.state.creditmemo_item_param.total_amount}</b></p>
                            <div className="price hidden-desktop">
                                {
                                    this.props.t(
                                        priceInclTax ? 'Price incl. Tax: {{price}}' : 'Price: {{price}}',
                                        {price: this.state.creditmemo_item_param.price}
                                    )
                                }
                            </div>
                            {
                                this.state.can_show_fpt ?
                                    <div className="fpt hidden-desktop">
                                        {this.props.t('FPT: {{price}}', {price: this.state.creditmemo_item_param.fpt})}
                                    </div> :
                                    null
                            }
                            <div className="tax hidden-desktop">
                                {this.props.t('Tax: {{price}}', {price: this.state.creditmemo_item_param.tax})}
                            </div>
                            <div className="discount hidden-desktop">
                                {
                                    this.props.t(
                                        'Discount: {{price}}',
                                        {price: this.state.creditmemo_item_param.discount}
                                    )
                                }
                            </div>
                        </td>
                        <td className="t-col">&nbsp;</td>
                    </tr>
                ) : null
                }
            </Fragment>
        )
    }
}

class CreateCreditmemoStepItemItemGiftCardContainer extends CoreContainer {
    static className = 'CreateCreditmemoStepItemItemGiftCardContainer';
}

/**
 * @type {CreateCreditmemoStepItemItemGiftCardContainer}
 */
export default ContainerFactory.get(CreateCreditmemoStepItemItemGiftCardContainer).withRouter(
    ComponentFactory.get(CreateCreditmemoStepItemItemGiftCardComponent)
)