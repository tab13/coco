import React, {Fragment} from 'react';
import CoreComponent from "../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../framework/container/CoreContainer";
import '../../../style/css/StaffDiscount.css';
import SmoothScrollbar from "smooth-scrollbar/index";
import {Modal} from "react-bootstrap";
import QuoteAction from "../../../action/checkout/QuoteAction";
import $ from "jquery";
import StaffDiscountService from "../../../../service/staff-discount/StaffDiscountService";
import StaffDiscountConstant from "../../../constant/StaffDiscountConstant";
import StaffManagerPinCodePopupComponent from "./StaffManagerPinCodePopup";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
// import StaffDiscountGlobal from "../../../../service/staff-discount/StaffDiscountGlobal";
import StaffManagerDiscountPopupComponent from "./StaffManagerDiscountPopup";
// import QuoteService from "../../../../service/checkout/QuoteService";

export class StaffDiscountPopupComponent extends CoreComponent {
    static className = 'StaffDiscountPopupComponent';
    setPopupStaffDiscountElement = element => {
        this.popup_staff_discount = element;
        if (!this.scrollbar && this.popup_staff_discount) {
            this.scrollbar = SmoothScrollbar.init(this.popup_staff_discount);
            this.heightPopup('.popup-staffdiscount .modal-dialog');
        }
    };

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            isOpenStaffManagerPinCodePopup: false,
            isOpenStaffDiscountPopup: false,
            isOpenStaffManagerDiscountPopup: false,
            staff_discount: 0,
            max_min_staff_discount: {},
            discount_apply: 0,
            total_amount: 0,
            staff_discount_amount: 0,
        }
    }

    /**
     * componentWillMount
     */
    componentWillMount() {
    }

    /**
     * This function after mapStateToProps then
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {

        this.setState({
            isOpenStaffDiscountPopup: nextProps.isOpenStaffDiscountPopup
        });

        let staff_discount_applied = nextProps.quote.staff_discount.staff_discount_applied;
        let total_amount = StaffDiscountService.getTotalAmountWhenApplyDiscount(nextProps.quote, staff_discount_applied);

        let staff_discount_amount = StaffDiscountService.getStaffDiscountAmountApply(nextProps.quote, staff_discount_applied);

        let total_amount_to_get_discount = 0;
        total_amount_to_get_discount = StaffDiscountService.getTotalAmountToGetDiscount(nextProps.quote);


        let staff_discount = parseFloat(StaffDiscountService.getMaxStaffDiscountByAmount(total_amount_to_get_discount));

        let max_min_staff_discount = StaffDiscountService.discountRangeForStaffDiscount(nextProps.quote, staff_discount);

        this.setState({
            staff_discount: staff_discount,
            max_min_staff_discount: max_min_staff_discount,
            discount_apply: staff_discount_amount,
            total_amount: total_amount,
            staff_discount_amount: staff_discount_amount
        })
    }

    /**
     * Show or hide popups
     *
     * @param {string} type
     */
    showPopup(type) {
        this.setState({
            isOpenStaffManagerPinCodePopup: type === StaffDiscountConstant.POPUP_TYPE_STAFF_MANAGER_PINCODE,
            isOpenStaffDiscountPopup: type === StaffDiscountConstant.POPUP_TYPE_STAFF_DISCOUNT,
            isOpenStaffManagerDiscountPopup: type === StaffDiscountConstant.POPUP_TYPE_STAFF_MANAGER_DISCOUNT
        });
        if (type === undefined) {
            this.props.showPopup();
        }
    }

    /**
     * cancel popup
     */
    cancelPopup() {
        this.props.showPopup();
    }

    confirmPopup() {
        // event.preventDefault();
        let staff_discount = this.refs.staff_discount_percent.value;
        // StaffDiscountGlobal.staff_discount_applied = staff_discount;
        // StaffDiscountGlobal.manager_discount_applied = 0;
        let self = this;
        let {quote} = this.props;
        let items = quote.items;
        items.map(function (item) {
            let new_price = StaffDiscountService.getItemPriceAfterDiscount(item, staff_discount);
            if (new_price !== false) {
                self.props.actions.updateCustomPriceCartItem(item, new_price, 'Apply staff discount ' + staff_discount + '%' );
            }
        });
        quote.staff_discount.staff_discount_applied = staff_discount;
        quote.staff_discount.manager_discount_applied = 0;
        this.props.actions.setQuote(quote);
        this.props.showPopup();
    }

    /**
     * get height popup
     * @param elm
     */
    heightPopup(elm) {
        var height = $(window).height();
        $(elm).css('height', height + 'px');
    }

    /**
     * set input
     * @param input
     */
    setInput(input) {
        this.input = input;
    }

    /**
     * Onchange Input
     */
    onChangeStaffDiscountPercent(event) {
        event.preventDefault();
        let staff_discount = event.target.value;
        if (isNaN(event.target.value) || !event.target.value) {
            staff_discount = 0;
        } else {
            if (parseFloat(event.target.value) < 0) {
                staff_discount = 0;
            }
            if (parseFloat(event.target.value) > parseFloat(this.state.staff_discount)) {
                staff_discount = parseFloat(this.state.staff_discount);
            }
        }

        this.refs.staff_discount_percent.value = staff_discount;
        let {quote} = this.props;
        let staff_discount_amount = StaffDiscountService.getStaffDiscountAmountApply(quote, staff_discount);
        let total_amount = StaffDiscountService.getTotalAmountWhenApplyDiscount(quote, staff_discount);
        this.refs.staff_discount_amount.value = staff_discount_amount;
        this.setState({
            discount_apply:  staff_discount_amount,
            total_amount: total_amount
        });
    }


    /**
     * Onchange Input
     */
    onChangeStaftDiscountAmount(event) {
        event.preventDefault();
        let {quote} = this.props;
        let staff_discount_amount = event.target.value;
        if (isNaN(event.target.value) || !event.target.value) {
            staff_discount_amount = this.state.max_min_staff_discount.min_discount;
        } else {
            if (parseFloat(event.target.value) < this.state.max_min_staff_discount.min_discount) {
                staff_discount_amount = this.state.max_min_staff_discount.min_discount;
            }
            if (parseFloat(event.target.value) > parseFloat(this.state.max_min_staff_discount.max_discount)) {
                staff_discount_amount = parseFloat(this.state.max_min_staff_discount.max_discount);
            }
        }

        this.refs.staff_discount_amount.value = staff_discount_amount;
        let staff_discount_percent = StaffDiscountService.getStaffDiscountPercentApply(quote, staff_discount_amount);
        let total_amount = StaffDiscountService.getTotalAmountWhenApplyDiscount(quote, staff_discount_percent);
        this.setState({
            discount_apply:  staff_discount_amount,
            total_amount: total_amount
        });

        if (staff_discount_percent < 0) {
            staff_discount_percent = 0;
        }
        if (staff_discount_percent > this.state.staff_discount) {
            staff_discount_percent = this.state.staff_discount;
        }
        this.refs.staff_discount_percent.value = staff_discount_percent;
    }

    selectPercent(value) {
        this.refs.staff_discount_percent.value = value;
        let {quote} = this.props;
        let staff_discount_amount = StaffDiscountService.getStaffDiscountAmountApply(quote, value);
        let total_amount = StaffDiscountService.getTotalAmountWhenApplyDiscount(quote, value);
        this.refs.staff_discount_amount.value = staff_discount_amount;
        this.setState({
            discount_apply:  staff_discount_amount,
            total_amount: total_amount
        });
    }

    template() {
        let {quote} = this.props;
        if (!this.state.isOpenStaffDiscountPopup) {
            if (this.popup_staff_discount) {
                SmoothScrollbar.destroy(this.popup_staff_discount);
                this.scrollbar = null;
            }
        }
        let staff_discount = this.state.staff_discount;

        return (
            <Fragment>
                <Modal
                    bsSize={"lg"}
                    className={"popup-edit-customer popup-staffdiscount"}
                    dialogClassName={"popup-create-customer in"}
                    show={this.state.isOpenStaffDiscountPopup}
                >
                    <div className="modal-header">
                        <button type="button" className="btn btn-default-staffdiscount-header">
                            {this.props.t('STAFF')}
                        </button>
                        <button type="button" className="btn btn-default-staffdiscount-header"
                                onClick={
                                    () => {
                                        this.showPopup(StaffDiscountConstant.POPUP_TYPE_STAFF_MANAGER_PINCODE);
                                    }
                                }
                        >
                            {this.props.t('MANAGER')}
                        </button>
                    </div>
                    <div data-scrollbar ref={this.setPopupStaffDiscountElement} className="modal-body">
                        <table className="ui celled table">
                            <tbody>
                            <tr className="select-discount">
                                <td className="block-title">
                                    {this.props.t('Select Discount:')}
                                </td>
                                <td className="block-content">
                                    <button type="button" className="btn btn-default-staffdiscount"
                                            onClick={() => {
                                                this.selectPercent(0)
                                            }}
                                    >
                                        0%
                                    </button>
                                    {
                                        staff_discount >= 5 ?
                                            <button type="button" className="btn btn-default-staffdiscount"
                                                    onClick={() => {
                                                        this.selectPercent(5)
                                                    }}
                                            >
                                                5%
                                            </button>
                                            : ''
                                    }
                                    {
                                        staff_discount >= 10 ?
                                            <button type="button" className="btn btn-default-staffdiscount"
                                                    onClick={() => {
                                                        this.selectPercent(10)
                                                    }}
                                            >
                                                10%
                                            </button>
                                            : ''
                                    }
                                </td>
                            </tr>
                            <tr className="percentage-discount">
                                <td className="block-title">{this.props.t('Discount')} 0% - {staff_discount}%</td>
                                <td className="block-content">
                                    <input
                                        id='staff_discount_percent'
                                        type="text"
                                        defaultValue={quote.staff_discount.staff_discount_applied}
                                        ref="staff_discount_percent"
                                        onChange={(event) => this.onChangeStaffDiscountPercent(event)}
                                    />
                                </td>
                            </tr>
                            <tr className="fix-discount">
                                <td className="block-title">{this.props.t('Discount')} {CurrencyHelper.format(this.state.max_min_staff_discount.min_discount) + ' - ' + CurrencyHelper.format(this.state.max_min_staff_discount.max_discount)}</td>
                                <td className="block-content">
                                    <input
                                        id='staff_discount_amount'
                                        type="text"
                                        defaultValue={this.state.staff_discount_amount}
                                        // value={this.state.max_min_staff_discount.min_discount}
                                        ref="staff_discount_amount"
                                        onChange={(event) => this.onChangeStaftDiscountAmount(event)}
                                    />
                                </td>
                            </tr>
                            <tr className="applied-discount">
                                <td className="block-title">
                                    {this.props.t('Discount Applied:')}
                                </td>
                                <td className="block-content">
                                    {CurrencyHelper.format(this.state.discount_apply)}
                                </td>
                            </tr>
                            <tr className="total">
                                <td className="block-title">{this.props.t('Total:')}</td>
                                <td className="block-content">
                                    {CurrencyHelper.format(this.state.total_amount)}
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-default-staffdiscount"
                                onClick={() => {
                                    this.cancelPopup()
                                }}
                        >
                            {this.props.t('Cancel')}
                        </button>
                        <button type="button" className="btn btn-default-staffdiscount"
                                onClick={() => {
                                    this.confirmPopup()
                                }}
                        >
                            {this.props.t('Confirm')}
                        </button>
                    </div>
                </Modal>
                {
                    <StaffManagerPinCodePopupComponent isOpenStaffManagerPinCodePopup={this.state.isOpenStaffManagerPinCodePopup}
                                                       quote={quote}
                                                       showPopup={(type) => this.showPopup(type)}
                    />
                }
                {
                    <StaffManagerDiscountPopupComponent isOpenStaffManagerDiscountPopup={this.state.isOpenStaffManagerDiscountPopup}
                                                        quote={quote}
                                                        showPopup={(type) => this.showPopup(type)}
                    />
                }
            </Fragment>
        )
    }
}

export class StaffDiscountPopupContainer extends CoreContainer {
    static className = 'StaffDiscountPopupContainer';

    /**
     *
     * @param state
     * @return {{quote: *}}
     */
    static mapState(state) {
        let {quote} = state.core.checkout;
        console.log(state.core.checkout);
        return {quote: quote};
    }

    static mapDispatch(dispatch) {
        return {
            actions: {
                setQuote: (quote) => dispatch(QuoteAction.setQuote(quote)),
                updateCustomPriceCartItem: (item, customPrice, reason) => dispatch(QuoteAction.updateCustomPriceCartItem(item, customPrice, reason))
            }
        }
    }
}

/**
 *
 * @type {StaffDiscountPopupContainer}
 */
const container = ContainerFactory.get(StaffDiscountPopupContainer);
export default container.getConnect(ComponentFactory.get(StaffDiscountPopupComponent));