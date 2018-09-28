import * as _ from 'lodash';
import React, {Fragment} from 'react';
import {CoreComponent} from "../../../../../../framework/component/index";
import CoreContainer from "../../../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../../framework/factory/ContainerFactory";
import CurrencyHelper from "../../../../../../helper/CurrencyHelper";
import CreateCreditmemoConstant from "../../../../../constant/order/creditmemo/CreateCreditmemoConstant";
import {RewardPointHelper} from "../../../../../../helper/RewardPointHelper";
import RewardPointService from "../../../../../../service/reward-point/RewardPointService";

class CreateCreditmemoStepAdjustPointAdjustmentsComponent extends CoreComponent {
    static className = 'CreateCreditmemoStepAdjustPointAdjustmentsComponent';

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
        const {order, creditmemo, adjustments} = props;
        let currency                           =
                  CurrencyHelper.getCurrency(order.order_currency_code);
        let decimalSymbol                      =
                  CurrencyHelper.getCurrencyFormat(order.order_currency_code).decimal_symbol;
        let currencySymbol                     =
                  currency ? currency.currency_symbol : CurrencyHelper.getCurrency().currency_symbol;

        let {maxReturnSpend, maxAdjustmentEarned} =
                RewardPointService.getMaxReturnSpendAndMaxAdjustmentEarned(creditmemo, order);

        this.state = {
            adjustments           : this.prepareAdjustments(props),
            show_numpad           : false,
            numpad_amount         : "0",
            numpad_adjustment_key : "",
            is_numpad_show_percent: false,
            decimal_symbol        : (decimalSymbol ? decimalSymbol : ""),
            currency_symbol       : currencySymbol,
            errors                : {},
            maxAdjustmentEarned,
            maxReturnSpend,
        };

        adjustments[CreateCreditmemoConstant.ADJUSTMENT_EARNED_KEY] = maxAdjustmentEarned;
        adjustments[CreateCreditmemoConstant.RETURN_SPENT_KEY]      = maxReturnSpend;

        document.body.addEventListener('keyup', event => this.onKeyupKeyboard(event.key));
    }

    /**
     * Prepare adjustments
     * @param props
     * @return {Array}
     */
    prepareAdjustments(props) {
        const {order, t}        = props;
        const pointName         = RewardPointHelper.getPointName();
        const pluralOfPointName = RewardPointHelper.getPluralOfPointName();

        let result = [];

        order.rewardpoints_earn && result.push({
            key  : CreateCreditmemoConstant.ADJUSTMENT_EARNED_KEY,
            label: t('Adjust Earned {{pointLabel}}', {
                pointLabel: order.rewardpoints_earn > 1 ? pluralOfPointName : pointName
            })
        });
        order.rewardpoints_spent && result.push({
            key  : CreateCreditmemoConstant.RETURN_SPENT_KEY,
            label: t('Return Spent {{pointLabel}}', {
                pointLabel: order.rewardpoints_spent > 1 ? pluralOfPointName : pointName
            })
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
        this.calculateNumpadPosition(event);
        document.body.appendChild(this.numPadElement);
        document.body.appendChild(this.numPadBackDropElement);
        let adjustmentValue = this.props.adjustments ?
            this.props.adjustments[adjustmentKey] :
            (this.props.creditmemo[adjustmentKey] || 0);
        this.setNumPadAmountElementValue(adjustmentValue);
        this.setNumpadTypeElementValue(adjustmentValue);
        this.onKeyupKeyboard = this.clickNumPad;
        this.setState({
            show_numpad           : true,
            numpad_adjustment_key : adjustmentKey,
            numpad_amount         : adjustmentValue,
            is_numpad_show_percent: false
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
        this.onKeyupKeyboard      = this.disableKeyupKeyboard;
        let numpad_adjustment_key = this.state.numpad_adjustment_key;
        this.props.changeAdjustment(
            {[numpad_adjustment_key]: this.state.numpad_amount},
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
        let creditmemo = this.props.getCreditmemo();
        if (creditmemo.errors) {
            if (Object.keys(creditmemo.errors).find(key => creditmemo.errors[key])) {
                this.setState({errors: creditmemo.errors});
                return false;
            } else {
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
        let isPercent     = numpad_amount.includes('%');
        numpad_amount     = numpad_amount.replace('%', "");
        key               = key.toString();
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

        const {numpad_adjustment_key} = this.state;

        if (
            (numpad_adjustment_key === CreateCreditmemoConstant.RETURN_SPENT_KEY)
            && _.toNumber(numpad_amount) > this.state.maxReturnSpend
        ) {
            numpad_amount = this.state.maxReturnSpend;
        }

        if (
            (numpad_adjustment_key === CreateCreditmemoConstant.ADJUSTMENT_EARNED_KEY)
            && _.toNumber(numpad_amount) > this.state.maxAdjustmentEarned
        ) {
            numpad_amount = this.state.maxAdjustmentEarned;
        }

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
        numpad_amount                  = numpad_amount.toString().replace(".", this.state.decimal_symbol);
        numpad_amount                  = numpad_amount.replace('%', "");
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
        return this.props.adjustments ?
            this.props.adjustments[adjustmentKey] :
            (this.props.creditmemo[adjustmentKey] || 0)
    }


    /**
     * template to render
     * @returns {*}
     */
    template() {
        const {order, t}        = this.props;
        const pointName         = RewardPointHelper.getPointName();
        const pluralOfPointName = RewardPointHelper.getPluralOfPointName();

        let result = [];
        result.push({
            key  : CreateCreditmemoConstant.ADJUSTMENT_EARNED_KEY,
            label: this.props.t('Adjust Earned {{pointLabel}}', {
                pointLabel: order.rewardpoints_earn > 1 ? pluralOfPointName : pointName
            })
        });
        result.push({
            key  : CreateCreditmemoConstant.RETURN_SPENT_KEY,
            label: this.props.t('Return Spent {{pointLabel}}', {
                pointLabel: order.rewardpoints_spent > 1 ? pluralOfPointName : pointName
            })
        });

        return (
            <Fragment>
                <div className="box">
                    <div className="box-title">{this.props.t('{{pointName}} Adjustments', {pointName})}</div>
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
                                            {this.getAdjustmentAmount(adjustment.key).toString()}
                                        </span>
                                        <span className="label">{
                                            t('{{pointLabel}}', {
                                                pointLabel: this.getAdjustmentAmount(adjustment.key) > 1
                                                    ? pluralOfPointName
                                                    : pointName
                                            })
                                        }</span>
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
                         top    : this.state.numpad_top + 'px',
                         left   : this.state.numpad_left + 'px',
                     }}>
                    <div className="arrow" style={{top: "50%"}}/>
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
                                <li ><a> </a></li>
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

class CreateCreditmemoStepAdjustPointAdjustmentsContainer extends CoreContainer {
    static className = 'CreateCreditmemoStepAdjustPointAdjustmentsContainer';

}

/**
 * @type {CreateCreditmemoStepAdjustPointAdjustmentsContainer}
 */
export default ContainerFactory.get(CreateCreditmemoStepAdjustPointAdjustmentsContainer).withRouter(
    ComponentFactory.get(CreateCreditmemoStepAdjustPointAdjustmentsComponent)
)