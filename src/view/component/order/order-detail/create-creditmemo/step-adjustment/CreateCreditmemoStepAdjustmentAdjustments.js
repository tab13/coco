import React, {Fragment} from 'react';
import {CoreComponent} from "../../../../../../framework/component/index";
import CoreContainer from "../../../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../../framework/factory/ContainerFactory";
import OrderHelper from "../../../../../../helper/OrderHelper";
import CurrencyHelper from "../../../../../../helper/CurrencyHelper";
import CreateCreditmemoConstant from "../../../../../constant/order/creditmemo/CreateCreditmemoConstant";
import TaxHelper from "../../../../../../helper/TaxHelper";

class CreateCreditmemoStepAdjustmentAdjustmentsComponent extends CoreComponent {
    static className = 'CreateCreditmemoStepAdjustmentAdjustmentsComponent';

    setNumPadBackDropElement = element => this.numPadBackDropElement = element;
    setNumPadElement = element => this.numPadElement = element;
    setNumPadAmountElement = element => this.numPadAmountElement = element;
    setNumPadTypeElement = element => this.numPadTypeElement = element;

    acceptKeyboardKeys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ",", ".", "delete", "backspace"];

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        let currency = CurrencyHelper.getCurrency(props.order.order_currency_code);
        let decimalSymbol = CurrencyHelper.getCurrencyFormat(props.order.order_currency_code).decimal_symbol;
        let currencySymbol = currency ? currency.currency_symbol : CurrencyHelper.getCurrency().currency_symbol;
        this.state = {
            adjustments: this.prepareAdjustments(props),
            show_numpad: false,
            numpad_amount: "0",
            numpad_adjustment_key: "",
            is_numpad_show_percent: false,
            decimal_symbol: (decimalSymbol ? decimalSymbol : ""),
            currency_symbol: currencySymbol,
            errors: {}
        };
        document.body.addEventListener('keyup', event => this.onKeyupKeyboard(event.key));
    }

    /**
     * Prepare adjustments
     * @param props
     * @return {Array}
     */
    prepareAdjustments(props) {
        let shippingInclTax = TaxHelper.orderDisplayShippingAmountIncludeTax();
        let result = [];
        if (props.max_allowed_shipping_refund && props.max_allowed_shipping_refund > 0) {
            result.push({
                key: CreateCreditmemoConstant.ADJUSTMENT_SHIPPING_KEY,
                label: this.props.t(
                    'Refund Shipping ' + (shippingInclTax ? '(Incl. Tax) ' : '') + '({{amount}} Remaining)',
                    {amount: OrderHelper.formatPrice(props.max_allowed_shipping_refund, this.props.order)}
                )
            });
        }
        result.push({
            key: CreateCreditmemoConstant.ADJUSTMENT_POSITIVE_KEY,
            label: this.props.t('Adjustment Refund')
        });
        result.push({
            key: CreateCreditmemoConstant.ADJUSTMENT_NEGATIVE_KEY,
            label: this.props.t('Adjustment Fee')
        });
        return result;
    }

    /**
     * Show number pad
     *
     * @param event
     * @param adjustmentKey
     */
    showNumPad(event, adjustmentKey) {
        event.target.blur();
        this.calculateNumpadPosition(event, adjustmentKey);
        document.body.appendChild(this.numPadElement);
        document.body.appendChild(this.numPadBackDropElement);
        let adjustmentValue = this.props.adjustments && this.props.adjustments[adjustmentKey] ?
            (this.props.adjustments[adjustmentKey] || 0) :
            (this.props.creditmemo[adjustmentKey] || 0);
        this.setNumPadAmountElementValue(adjustmentValue);
        this.setNumpadTypeElementValue(adjustmentValue);
        this.onKeyupKeyboard = this.clickNumPad;
        this.setState({
            show_numpad: true,
            numpad_adjustment_key: adjustmentKey,
            numpad_amount: adjustmentValue,
            is_numpad_show_percent: this.isNumpadShowPercent(adjustmentKey)
        });
    }

    /**
     * Calculate numpad possition
     *
     * @param event
     * @param adjustmentKey
     */
    calculateNumpadPosition(event, adjustmentKey) {
        let isShowPercent = this.isNumpadShowPercent(adjustmentKey);
        let left = event.target.getBoundingClientRect().left - 295,
            top = event.target.getBoundingClientRect().top - (isShowPercent ? 122 : 102);
        this.setState({numpad_left: left});
        this.setState({numpad_top: top});
    }

    /**
     * Check numpad show percent or not
     *
     * @param adjustmenentKey
     * @return {boolean}
     */
    isNumpadShowPercent(adjustmenentKey) {
        if (adjustmenentKey === CreateCreditmemoConstant.ADJUSTMENT_SHIPPING_KEY) {
            return false;
        }
        return true;
    }

    /**
     * Hide number pad
     */
    hideNumpad() {
        document.body.removeChild(this.numPadElement);
        document.body.removeChild(this.numPadBackDropElement);
        this.onKeyupKeyboard = this.disableKeyupKeyboard;
        let numpad_adjustment_key = this.state.numpad_adjustment_key;
        let amount = this.state.numpad_amount;
        if (!amount.toString().includes('%')) {
            amount = CurrencyHelper.roundToFloat(amount, CurrencyHelper.DEFAULT_STORE_PRECISION).toString();
        }
        this.props.changeAdjustment(
            {[numpad_adjustment_key]: amount},
            () => this.validateAdjustmentAmount()
        );
        this.setState({show_numpad: false});
    }

    /**
     * Validate adjustment amount after hide numpad
     *
     * @return {boolean}
     */
    validateAdjustmentAmount() {
        let currentGrandTotal = this.props.creditmemo.grand_total;
        let creditmemo = this.props.getCreditmemo();
        if (creditmemo.errors) {
            let hasError = Object.keys(creditmemo.errors).find(key => creditmemo.errors[key]);
            if (hasError) {
                this.setState({errors: creditmemo.errors});
                let numpad_adjustment_key = this.state.numpad_adjustment_key;
                if (numpad_adjustment_key === CreateCreditmemoConstant.ADJUSTMENT_SHIPPING_KEY) {
                    this.props.changeAdjustment(
                        {[numpad_adjustment_key]: this.props.max_allowed_shipping_refund},
                        () => this.props.setCreditmemo()
                    );
                }
                return false;
            } else {
                if (creditmemo.grand_total !== currentGrandTotal) {

                }
                this.setState({errors: {}});
                this.props.setCreditmemo();
            }
        }
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
        let numpad_amount = this.state.numpad_amount.toString();
        let isPercent = numpad_amount.includes('%');
        numpad_amount = numpad_amount.replace('%', "");
        key = key.toString();
        if (["delete", "backspace"].includes(key.toLowerCase())) {
            numpad_amount = numpad_amount.substr(0, numpad_amount.length - 1);
        } else if ([",", "."].includes(key)) {
            if (numpad_amount.includes(".")) {
                return false;
            } else if (key !== this.state.decimal_symbol) {
                return false;
            } else {
                numpad_amount = numpad_amount + ".";
            }
        } else {
            numpad_amount = numpad_amount + key;
        }
        numpad_amount = this.validateNumpadAmount(numpad_amount);
        this.setNumPadAmountElementValue(numpad_amount);
        if (isPercent) {
            numpad_amount += "%";
        }
        this.setState({numpad_amount});
    }

    /**
     * Validate numpad amount
     *
     * @param numpad_amount
     * @return {*}
     */
    validateNumpadAmount(numpad_amount) {
        numpad_amount = numpad_amount.replace(/^(?!0$)0+/, '');
        if (numpad_amount === ".") {
            numpad_amount = "0.";
        } else if (+numpad_amount > 0 && +numpad_amount < 1) {
            numpad_amount = "0" + numpad_amount;
        } else if (numpad_amount === "") {
            numpad_amount = "0";
        }
        return numpad_amount;
    }

    /**
     * Set qty for numpad
     * @param numpad_amount
     */
    setNumPadAmountElementValue(numpad_amount) {
        numpad_amount = numpad_amount.toString().replace(".", this.state.decimal_symbol);
        numpad_amount = numpad_amount.replace('%', "");
        this.numPadAmountElement.value = numpad_amount;
    }

    /**
     * Set numpad type is % or not by default
     *
     * @param numpad_amount
     */
    setNumpadTypeElementValue(numpad_amount) {
        if (this.numPadTypeElement) {
            this.numPadTypeElement.checked = numpad_amount.toString().includes('%');
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
     * Disable press keyboard event after hide numpad
     *
     * @param key
     * @return {null}
     */
    disableKeyupKeyboard(key) {
        return key;
    }

    /**
     * Change type currency or percent
     *
     * @param event
     */
    changeNumpadType(event) {
        let numpad_amount = (this.state.numpad_amount || "0").toString();
        if (event.target.checked) {
            if (!numpad_amount.includes('%'))
                numpad_amount += '%';
        } else {
            numpad_amount = numpad_amount.replace("%", "");
        }
        this.setState({numpad_amount})
    }

    /**
     * Get adjustment amount
     *
     * @return {*|number}
     */
    getAdjustmentAmount(adjustmentKey) {
        let adjustmentAmount = this.props.adjustments && this.props.adjustments[adjustmentKey] ?
            (this.props.adjustments[adjustmentKey] || 0) :
            (this.props.creditmemo[adjustmentKey] || 0);
        let precision = null;
        adjustmentAmount = adjustmentAmount.toString();
        if (adjustmentAmount.toString().includes("%")) {
            adjustmentAmount = adjustmentAmount.toString().replace("%", "");
            let priceArray = adjustmentAmount.split(".");
            precision = priceArray[1] ? priceArray[1].length : 0;
        }
        return CurrencyHelper.formatNumberStringToCurrencyString(
            adjustmentAmount, this.props.order.order_currency_code, precision
        );
    }

    /**
     * Get adjustment type
     *
     * @param adjustmentKey
     * @return {string}
     */
    getAdjustmentType(adjustmentKey) {
        let adjustmentAmount = this.props.adjustments && this.props.adjustments[adjustmentKey] ?
            (this.props.adjustments[adjustmentKey] || 0) :
            (this.props.creditmemo[adjustmentKey] || 0);
        return adjustmentAmount.toString().includes("%") ? "%" : this.state.currency_symbol;
    }

    /**
     * template to render
     * @returns {*}
     */
    template() {
        return (
            <Fragment>
                <div className="box">
                    <div className="box-title">{this.props.t('Refund Adjustments')}</div>
                    <div className="box-content">
                        {
                            this.state.adjustments.map(adjustment => {
                                return <div className="form-group" key={adjustment.key}>
                                    <label>{adjustment.label}</label>
                                    <div className="control"
                                         onClick={event =>
                                             this.showNumPad(event, adjustment.key)
                                         }>
                                        <span className="form-control">
                                            {this.getAdjustmentAmount(adjustment.key)}
                                        </span>
                                        <span className="label">{this.getAdjustmentType(adjustment.key)}</span>
                                    </div>
                                    <div className="cas">{this.state.errors && this.state.errors[adjustment.key]}</div>
                                </div>
                            })
                        }
                    </div>
                </div>
                <div ref={this.setNumPadElement}
                     className="popover refund-payment-popover fade left in"
                     style={{
                         display: this.state.show_numpad ? "block" : "none",
                         top: this.state.numpad_top + 'px',
                         left: this.state.numpad_left + 'px',
                     }}>
                    <div className="arrow" style={{top: "35%"}}/>
                    <div className="popover-content">
                        <div className="popup-calculator popup-calculator2">
                            <div className="product-field-qty">
                                <div className="box-field-qty">
                                    <input ref={this.setNumPadAmountElement}
                                           name="qty-catalog" id="qty-catalog"
                                           className="form-control qty"
                                           defaultValue="0"/>
                                </div>
                            </div>
                            <div className={"check-price" + (!this.state.is_numpad_show_percent ? " hidden" : "")}>
                                <label>
                                    <input ref={this.setNumPadTypeElement}
                                           type="checkbox"
                                           onChange={event => this.changeNumpadType(event)}/>
                                    <span/>
                                    <span className="price">{this.state.currency_symbol}</span>
                                    <span className="percent">%</span>
                                </label>
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
                                <li onClick={() => this.clickNumPad(this.state.decimal_symbol)}>
                                    <a>{this.state.decimal_symbol}</a>
                                </li>
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
            </Fragment>
        );
    }
}

class CreateCreditmemoStepAdjustmentAdjustmentsContainer extends CoreContainer {
    static className = 'CreateCreditmemoStepAdjustmentAdjustmentsContainer';

}

/**
 * @type {CreateCreditmemoStepAdjustmentAdjustmentsContainer}
 */
export default ContainerFactory.get(CreateCreditmemoStepAdjustmentAdjustmentsContainer).withRouter(
    ComponentFactory.get(CreateCreditmemoStepAdjustmentAdjustmentsComponent)
)