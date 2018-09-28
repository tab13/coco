import React, {Fragment} from 'react';
import '../../../../style/css/Giftcard.css';
import Select from 'react-select';
import {CoreComponent} from "../../../../../framework/component/index";
import CoreContainer from "../../../../../framework/container/CoreContainer";
import CheckoutAction from "../../../../action/CheckoutAction";
import ComponentFactory from "../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import QuoteAction from "../../../../action/checkout/QuoteAction";
import GiftcardService from "../../../../../service/giftcard/GiftcardService";
import QuoteService from "../../../../../service/checkout/QuoteService";
import CurrencyHelper from "../../../../../helper/CurrencyHelper";
import SmoothScrollbar from "smooth-scrollbar";
import {isMobile} from 'react-device-detect';
import {toast} from "react-toastify";
import GiftcardHelper from "../../../../../helper/GiftcardHelper";

export class GiftcardFormComponent extends CoreComponent {
    static className = 'GiftcardFormComponent';

    setGiftcodeInputElement = element => this.giftcodeInputElement = element;

    setNumPadBackDropElement = element => this.numPadBackDropElement = element;
    setNumPadElement = element => this.numPadElement = element;
    setNumPadAmountElement = element => this.numPadAmountElement = element;

    acceptKeyboardKeys = ["00", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "delete", "backspace"];

    giftCodeInputValue = '';

    setBlockContentElement = element => {
        this.block_content = element;
        if (this.scrollbarOrderDetail) {
            SmoothScrollbar.destroy(this.scrollbarOrderDetail);
        }
        if (!this.scrollbarOrderDetail) {
            this.scrollbarOrderDetail = SmoothScrollbar.init(this.block_content);
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedGiftCode: null,
            listGiftCode: [],
            isApplingGiftCode: false,
            numpad_amount: 0,
            giftCode: ''
        };
        document.body.addEventListener('keyup', event => this.onKeyupKeyboard(event.key));
    }

    /**
     * Show error message
     *
     * @param errorMessage
     */
    showError(errorMessage) {
        toast.error(
            errorMessage,
            {
                className: 'wrapper-messages messages-warning',
                autoClose: 2000
            }
        );
    }

    /**
     * Get gift code label
     * @param giftcode
     * @return {string}
     */
    getGiftCodeLabel(giftcode) {
        let code = GiftcardHelper.getHiddenCode(giftcode.code);
        return code + ' (' + CurrencyHelper.format(GiftcardService.getBaseBalance(giftcode)) + ')';
    }

    /**
     * Get gift code applied amount
     *
     * @param giftcode
     * @return {*|string}
     */
    getGiftCodeAppliedAmount(giftcode) {
        let code = giftcode.code;
        let appliedCodes = this.props.quote.gift_voucher_gift_codes;
        if (appliedCodes) {
            appliedCodes = appliedCodes.split(',');
            let codeIndex = appliedCodes.indexOf(code);
            let codesDiscount = this.props.quote.codes_discount;
            codesDiscount = codesDiscount.split(',');
            return CurrencyHelper.format(codesDiscount[codeIndex], null, null);
        }
        return null;
    }

    getExistingCodes() {
        let quote = this.props.quote;
        let existingCodes = quote.gift_voucher_existing_codes;
        if (existingCodes && Array.isArray(existingCodes) && existingCodes.length) {
            let result = [];
            let appliedCodes = quote.gift_voucher_applied_codes;
            appliedCodes = appliedCodes && Array.isArray(appliedCodes) && appliedCodes.length ? appliedCodes : [];
            existingCodes.forEach(existingCode => {
                if (appliedCodes.findIndex(appliedCode => appliedCode.code === existingCode.code) < 0) {
                    result.push({code: existingCode.code, label: this.getGiftCodeLabel(existingCode)});
                }
            });
            return result;
        } else {
            return [];
        }
    }

    /**
     * handle change giftcode input value
     *
     * @param giftCodeInputValue
     */
    handleChangeGiftCodeInput(giftCodeInputValue) {
        this.giftCodeInputValue = giftCodeInputValue;
        this.setState({giftCode: giftCodeInputValue});
    }

    /**
     * handle key press giftcode input value
     *
     * @param key
     */
    handleKeyPressGiftcodeInput(key) {
        if (key === 'Enter') {
            this.giftCodeInputValue = this.giftCodeInputValue.trim();
            this.giftcodeInputElement.value = this.giftCodeInputValue;
            this.applyGiftCode(this.giftCodeInputValue);
            this.giftCodeInputValue = "";
        }
    }

    /**
     *  Reset State to default
     *
     * @return
     */
    resetState() {
        this.giftcodeInputElement.value = "";
        this.giftCodeInputValue = '';
        this.setState({giftCode: ''});
    }

    /**
     * Apply gift code
     *
     * @param code
     * @return {GiftcardFormComponent}
     */
    applyGiftCode(code) {
        let quote = this.props.quote;
        if (!GiftcardHelper.canUseWithCoupon() && quote.coupon_code) {
            this.showError(this.props.t('A coupon code has been used. ' +
                'You cannot apply gift codes with the coupon to get discount.'));
            return this;
        }
        if (!window.navigator.onLine || window.pos.config.isOnline === false) {
            this.showError(this.props.t('You must connect to a Wi-Fi or cellular data network to redeem Gift Card'));
            return this;
        }
        if (this.state.isApplingGiftCode) {
            return this;
        }
        if (!code) {
            return this;
        }
        let existed_code = null;
        if (quote.gift_voucher_gift_codes) {
            existed_code = quote.gift_voucher_gift_codes.split(',');
        }
        this.setState({isApplingGiftCode: true});
        GiftcardService.applyGiftcode(quote, code, existed_code).then(response => {
            this.processResponse(response, code);
            this.setState({isApplingGiftCode: false});
        }).catch(error => {
            this.processError(error);
            this.setState({isApplingGiftCode: false});
        });
    }

    /**
     *
     * @param response
     * @param code
     */
    processResponse(response, code = null) {
        let quote = this.props.quote;
        let giftVoucherAppliedCodes = quote.gift_voucher_applied_codes;
        if (giftVoucherAppliedCodes && Array.isArray(giftVoucherAppliedCodes) && giftVoucherAppliedCodes.length) {
            if (response.applied_codes) {
                let appliedCodes = response.applied_codes.map(code => {
                    let existedCode = giftVoucherAppliedCodes.find(existedCode => existedCode.code === code.code);
                    if (existedCode) {
                        code.applied_amount = existedCode.applied_amount;
                    }
                    return code;
                });
                quote.gift_voucher_applied_codes = appliedCodes;
            }
        } else {
            quote.gift_voucher_applied_codes = response.applied_codes;
        }
        if (response.existing_codes) {
            quote.gift_voucher_existing_codes = response.existing_codes;
        }
        if (!response.error && code) {
            toast.success(
                this.props.t('Gift Card "{{giftcode}}" has been applied successfully.', {giftcode: code}),
                {
                    className: 'wrapper-messages messages-success',
                    autoClose: 2000
                }
            );
        }
        this.giftcodeInputElement.value = "";
        this.giftCodeInputValue = "";
        QuoteService.collectTotals(quote);
        this.props.actions.setQuote(quote);
        if (response.error) {
            this.showError(this.props.t(response.error));
        }
        this.setState({giftCode: ''});
    }

    processError(error) {
        if (!window.navigator.onLine || window.pos.config.isOnline === false) {
            this.showError(this.props.t('You must connect to a Wi-Fi or cellular data network to redeem Gift Card'));
            return this;
        }
    }

    /**
     * Remove gift code
     *
     * @param code
     */
    removeGiftCode(code) {
        let quote = this.props.quote;
        let giftVoucherAppliedCodes = quote.gift_voucher_applied_codes;
        giftVoucherAppliedCodes.forEach((appliedCode, index) => {
            if (appliedCode.code === code) {
                giftVoucherAppliedCodes.splice(index, 1);
            }
        });
        QuoteService.collectTotals(quote);
        this.props.actions.setQuote(quote);
    }

    /**
     * reload list gift codes
     */
    handleReloadGiftCode() {
        let quote = this.props.quote;
        let customer_id = quote.customer_id;
        this.setState({isApplingGiftCode: true});
        GiftcardService.reloadGiftCodes(customer_id).then(response => {
            this.processResponse(response);
            this.setState({isApplingGiftCode: false});
        }).catch(error => {
            this.setState({isApplingGiftCode: false});
            console.log(error);
        });
    }

    /**
     * componentWillUnMount
     */
    componentWillUnMount() {
        // SpendRewardPointComponent.usePoint = 0;
    }

    handleSelectGiftCode = (giftcode) => {
        if (giftcode) {
            if (giftcode.code) {
                this.applyGiftCode(giftcode.code);
            }
        }
    };

    /**
     * click numpad
     *
     * @param key
     */
    clickNumPad(key) {
        if (!this.acceptKeyboardKeys.includes(key.toString().toLowerCase())) {
            return false;
        }
        let numpadAmount = this.state.numpad_amount.toString().replace(".", "");
        if (["delete", "backspace"].includes(key.toString().toLowerCase())) {
            numpadAmount = numpadAmount.substr(0, numpadAmount.length - 1);
        } else {
            numpadAmount = numpadAmount + key.toString();
        }
        numpadAmount = this.putDecimalSymbol(numpadAmount);
        this.numPadAmountElement.value = CurrencyHelper.formatNumberStringToCurrencyString(numpadAmount);
        this.setState({numpad_amount: numpadAmount});
        // this.setGiftcodeAmount(numpadAmount);
    }

    /**
     * Put decimal amount
     *
     * @param amount
     * @return {string}
     */
    putDecimalSymbol(amount) {
        amount = amount.toString();
        amount = "00000" + amount;
        let currencyFormat = CurrencyHelper.getCurrencyFormat();
        let intPrice = amount,
            decimalPrice = "";
        if (currencyFormat.precision > 0) {
            intPrice = amount.substr(0, amount.length - currencyFormat.precision);
            decimalPrice = amount.substr(-currencyFormat.precision);
        }
        intPrice = intPrice.replace(/^0+/, '');
        if (!intPrice) {
            intPrice = "0";
        }
        return intPrice + "." + decimalPrice;
    }

    /**
     * Set giftcard amount
     *
     * @param amount
     */
    setGiftcodeAmount(amount) {
        let giftcode = this.state.numpad_giftcode;
        let quote = this.props.quote;
        let appliedCodes = quote.gift_voucher_applied_codes;
        if (appliedCodes && Array.isArray(appliedCodes) && appliedCodes.length) {
            let findedCode = appliedCodes.find(appliedCode => appliedCode.code === giftcode.code);
            if (findedCode && findedCode.code) {
                findedCode.applied_amount = amount;
            }
        }
        QuoteService.collectTotals(quote);
        this.props.actions.setQuote(quote);
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
     * Show number pad
     *
     * @param event
     * @param giftcode
     */
    showNumPad(event, giftcode) {
        this.calculateNumpadPosition(event);
        document.body.appendChild(this.numPadElement);
        document.body.appendChild(this.numPadBackDropElement);
        this.numPadAmountElement.value = CurrencyHelper.formatNumberStringToCurrencyString(0);
        this.onKeyupKeyboard = this.clickNumPad;
        this.setState({
            show_numpad: true,
            numpad_giftcode: giftcode,
            numpad_amount: 0
        });
    }

    /**
     * Hide number pad
     */
    hideNumpad() {
        document.body.removeChild(this.numPadElement);
        document.body.removeChild(this.numPadBackDropElement);
        this.onKeyupKeyboard = this.disableKeyupKeyboard;
        this.setGiftcodeAmount(this.state.numpad_amount);
        this.setState({show_numpad: false});
    }

    /**
     * Calculate numpad possition
     *
     * @param event
     */
    calculateNumpadPosition(event) {
        this.setState({numpad_left: event.target.getBoundingClientRect().left - 295});
        this.setState({numpad_top: event.target.getBoundingClientRect().top - 165});
    }

    /**
     *
     *
     * @param appliedCodes
     * @returns {*|arg is Array<any>|boolean}
     */
    showGiftCodesApplied(appliedCodes) {
        return appliedCodes && Array.isArray(appliedCodes) && appliedCodes.length > 0;
    }

    /**
     * Generate list gift codes applied
     *
     * @param appliedCodes
     * @returns {*}
     */
    generateListCodesApplied(appliedCodes) {
        let {t} = this.props;
        let showList = appliedCodes && Array.isArray(appliedCodes) && appliedCodes.length > 0;
        return (
            <div className="block-applied-code">
                {
                    showList ?
                        <div className="notice-number-giftcode-applied">
                            {
                                appliedCodes.length === 1 ?
                                    <span>
                                        {t('A gift code was appllied')}
                                    </span> :
                                    <span>
                                        {t('{{number}} gift codes were appllied', {number: appliedCodes.length})}
                                    </span>
                            }
                        </div> :
                        <div className="no-gift-code-applied text-center">{t('No gift code was applied!')}</div>
                }
                <div className={"block-applied-code-box " + (showList ? 'show-list' : null)}
                     ref={this.setBlockContentElement}>
                    <div>
                        {
                            showList ?
                                appliedCodes.map((code) => {
                                    return (
                                        <div className="payment-full-amount gift-code-applied" key={code.code}>
                                            <div className="info" onClick={event => this.showNumPad(event, code)}>
                                                <div className="price gift-code">
                                                    <div className="box">
                                                    <span className="label">
                                                        <span className="code">
                                                            {GiftcardHelper.getHiddenCode(code.code)}
                                                        </span>
                                                        <span className="amount">
                                                            {
                                                                ' (' +
                                                                CurrencyHelper.format(
                                                                    GiftcardService.getBaseBalance(code), null, null
                                                                )
                                                                + ')'
                                                            }
                                                        </span>
                                                    </span>
                                                        <span
                                                            className="value">{this.getGiftCodeAppliedAmount(code)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="remove-code"
                                                  onClick={() => this.removeGiftCode(code.code)}> </span>
                                        </div>
                                    )
                                }) : null
                        }
                    </div>
                </div>
            </div>
        )

    }

    /**
     * template to render
     * @returns {*}
     */
    template() {
        let {t, actions, quote} = this.props;
        let appliedCodes = quote.gift_voucher_applied_codes;
        let existingCodes = this.getExistingCodes();
        let classNameButtonApply = !this.state.giftCode ?
            "btn btn-default btn-accept disabled" : "btn btn-default btn-accept";
        let classBtnRemoveInput = this.state.giftCode ? "btn-remove" : "hidden";
        return (
            <Fragment>
                <div className="wrapper-payment wrapper-giftcard-form active">
                    <div className="block-title">
                        <strong className="title">{t('Gift Card')}</strong>
                    </div>
                    <div className="block-content">
                        <div className="payment-logo giftcard-logo"> </div>
                        <div className="payment-full-amount gift-code-boder">
                            <div className="gift-code-scan-box">
                                <input className="payment-full-amount gift-code-scan"
                                       ref={this.setGiftcodeInputElement}
                                       type='text'
                                       autoFocus={!isMobile}
                                       placeholder="Enter or Scan Gift Code here"
                                       onChange={event => this.handleChangeGiftCodeInput(event.target.value)}
                                       onKeyPress={(event) => this.handleKeyPressGiftcodeInput(event.key)}
                                />
                                <button className={classBtnRemoveInput} type="button"
                                        onClick={() => this.resetState()}>
                                </button>
                                <button
                                    className={classNameButtonApply}
                                    type="button"
                                    disabled={!this.state.giftCode}
                                    onClick={() => this.handleKeyPressGiftcodeInput('Enter')}>
                                    {t('Apply')}
                                </button>
                            </div>
                        </div>

                        {
                            quote.customer_id ?
                                <div className="select-box-giftcode">
                                    <div className="form-group gift-code-select">
                                        <Select
                                            placeholder={t("Please select your gift code")}
                                            onChange={this.handleSelectGiftCode}
                                            options={existingCodes}
                                            clearable={false}
                                            searchable={false}
                                            noResultsText={''}/>
                                    </div>
                                    <span className="reload-code" onClick={() => this.handleReloadGiftCode()}> </span>
                                </div> : <div className="select-no-box-giftcode"></div>

                        }

                        <div className="loader-couponcode"
                             style={{display: (this.state.isApplingGiftCode ? 'block' : 'none')}}>
                            <div className="loader-product"/>
                        </div>


                        <div className="block-bottom giftcard-bottom">

                            {
                                this.generateListCodesApplied(appliedCodes)
                            }

                        </div>
                    </div>
                    <div className="block-bottom">
                        <div className="actions-accept">
                            <button
                                className="btn btn-default btn-cannel"
                                type="button"
                                onClick={() => actions.checkoutToSelectPayments(quote)}>
                                {t('Continue')}
                            </button>
                        </div>
                    </div>

                    <div ref={this.setNumPadElement}
                         className="popover fade left in"
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
                                        <input ref={this.setNumPadAmountElement}
                                               name="qty-catalog" id="qty-catalog"
                                               className="form-control qty"
                                               defaultValue={CurrencyHelper.formatCurrencyStringToNumberString(
                                                   this.state.numpad_amount
                                               )}/>
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
                                    <li onClick={() => this.clickNumPad("00")}><a>00</a></li>
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

class GiftcardFormContainer extends CoreContainer {
    static className = 'GiftcardFormContainer';

    /**
     * Map state to props
     * @param state
     * @returns {{quote: *}}
     */
    static mapState(state) {
        let {quote} = state.core.checkout;
        return {
            quote
        };
    }

    /**
     * Map dispatch to props
     /**
     *
     * @param dispatch
     * @return {{actions: {checkoutToSelectPayments: function(*=): *}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                checkoutToSelectPayments: (quote, initPayments) => dispatch(
                    CheckoutAction.checkoutToSelectPayments(quote, initPayments)
                ),
                setQuote: (quote) => dispatch(
                    QuoteAction.setQuote(quote)
                ),
            }
        }
    }
}

/**
 *
 * @type {GiftcardFormContainer}
 */
const container = ContainerFactory.get(GiftcardFormContainer);
export default container.withRouter(
    ComponentFactory.get(GiftcardFormComponent)
)