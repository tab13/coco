import React, {Fragment} from 'react';
import CreateCreditmemoStepItemItemAbstractComponent from "../CreateCreditmemoStepItemItemAbstract";
import ComponentFactory from "../../../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../../../../framework/container/CoreContainer";

class CreateCreditmemoStepItemItemConfigurableComponent extends CreateCreditmemoStepItemItemAbstractComponent {
    static className = 'CreateCreditmemoStepItemItemConfigurableComponent';

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        let order_item = props.order_item;
        this.state = {
            creditmemo_item_param: order_item && props.creditmemo_items_param[order_item.item_id] ?
                props.creditmemo_items_param[order_item.item_id] :
                {},
        };
    }

    componentWillReceiveProps(nextProps) {
        let newCreditmemoItemParam = nextProps.creditmemo_items_param[nextProps.order_item.item_id];
        if (newCreditmemoItemParam && newCreditmemoItemParam.qty !== this.state.creditmemo_item_param.qty) {
            this.setState({creditmemo_item_param: newCreditmemoItemParam});
        }
    }

    /**
     * Get credit memo item param
     *
     * @return {*}
     */
    getCreditmemoItemParam() {
        return this.props.creditmemo_items_param[this.props.order_item.item_id];
    }

    /**
     * Get current refund qty
     *
     * @return {number}
     */
    getQty() {
        return this.getCreditmemoItemParam() ? this.getCreditmemoItemParam().qty : 0
    }

    /**
     * Get can return stock
     *
     * @return {boolean}
     */
    canReturnStock() {
        return this.getCreditmemoItemParam() ? this.getCreditmemoItemParam().can_return_stock : false
    }

    /**
     * Get current error message
     *
     * @return {*}
     */
    getErrorMessage() {
        return this.getCreditmemoItemParam() && this.getCreditmemoItemParam().error_message ?
            <div className="t-alert">
                <p>{this.getCreditmemoItemParam().error_message}</p>
            </div> :
            ""
    }

    /**
     * template to render
     * @returns {*}
     */
    template() {
        let additionalClassName = this.props.hide_border_top ? " t-bundle-product" : "";
        return (
            <Fragment>
                {this.state.creditmemo_item_param.qty_to_refund > 0 ? (
                    <tr>
                        <td className={"t-col" + additionalClassName}>&nbsp;</td>
                        <td className={"t-product" + additionalClassName}>
                            <p className="title">{this.props.order_item.name}</p>
                            <p className="sku">[{this.props.order_item.sku}]</p>
                            <p className="option">Black, XS, Leather</p>
                        </td>
                        <td className={"t-qty" + additionalClassName}>
                            <span>{this.state.creditmemo_item_param.qty_to_refund}</span>
                        </td>
                        <td className={"t-qtyrefund" + additionalClassName}>
                            <div className="product-field-qty">
                                <div className="box-field-qty">
                                <span className="form-control qty" data-container="body"
                                      data-toggle="popover" data-placement="left" data-content="">
                                    {this.getQty()}
                                </span>
                                    <a className="btn-number qtyminus disabled"
                                       data-field="qty"
                                       onClick={() => this.decreaseQty(this.getCreditmemoItemParam())}>-</a>
                                    <a className="btn-number qtyplus"
                                       data-field="qty"
                                       onClick={() => this.increaseQty(this.getCreditmemoItemParam())}>+</a>
                                </div>
                            </div>
                            {this.getErrorMessage()}
                        </td>
                        <td className={"t-return" + additionalClassName}>
                            <label className="label-checkbox">
                                <input type="checkbox" name="" disabled=""/>
                                <span>&nbsp;</span>
                            </label>
                            {
                                !this.canReturnStock() ?
                                    <p>{this.props.t('Item(s) can’t be returned to stock ')}</p>
                                    : ""
                            }

                        </td>
                        <td className={"t-price" + additionalClassName}>{this.state.creditmemo_item_param.price}</td>
                        <td className={"t-fpt" + additionalClassName}>{this.state.creditmemo_item_param.fpt}</td>
                        <td className={"t-tax" + additionalClassName}>{this.state.creditmemo_item_param.tax}</td>
                        <td className={"t-discount" + additionalClassName}>
                            {this.state.creditmemo_item_param.discount}
                        </td>
                        <td className={"t-rowtotal" + additionalClassName}>
                            <p><b>{this.state.creditmemo_item_param.total_amount}</b></p>
                            <div className="price hidden-desktop">
                                {this.props.t('Price: {{price}}', {price: this.state.creditmemo_item_param.price})}
                            </div>
                            <div className="fpt hidden-desktop">
                                {this.props.t('FPT: {{price}}', {price: this.state.creditmemo_item_param.fpt})}
                            </div>
                            <div className="tax hidden-desktop">
                                {this.props.t('Tax: {{price}}', {price: this.state.creditmemo_item_param.tax})}
                            </div>
                            <div className="discount hidden-desktop">
                                {
                                    this.props.t(
                                        'Discount: {{price}}',
                                        {price: this.state.creditmemo_item_param.total_amount}
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

class CreateCreditmemoStepItemItemConfigurableContainer extends CoreContainer {
    static className = 'CreateCreditmemoStepItemItemConfigurableContainer';

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
 * @type {CreateCreditmemoStepItemItemConfigurableContainer}
 */
export default ContainerFactory.get(CreateCreditmemoStepItemItemConfigurableContainer).withRouter(
    ComponentFactory.get(CreateCreditmemoStepItemItemConfigurableComponent)
)