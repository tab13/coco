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

export class StaffManagerDiscountPopupComponent extends CoreComponent {
    static className = 'StaffManagerDiscountPopupComponent';
    setPopupStaffManagerDiscountElement = element => {
        this.popup_staff_manager_discount = element;
        if (!this.scrollbar && this.popup_staff_manager_discount) {
            this.scrollbar = SmoothScrollbar.init(this.popup_staff_manager_discount);
            this.heightPopup('.popup-staffmanagerdiscount .modal-dialog');
        }
    };

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            isOpenStaffManagerDiscountPopup: false
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
            isOpenStaffManagerDiscountPopup: nextProps.isOpenStaffManagerDiscountPopup
        });
    }

    /**
     * Show or hide popups
     *
     * @param {string} type
     */
    showPopup(type) {
        this.setState({
        });
    }

    /**
     * cancel popup
     */
    cancelPopup() {
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

    template() {
        let {quote} = this.props;
        if (!this.state.isOpenStaffManagerPinCodePopup) {
            if (this.popup_staff_manager_discount) {
                SmoothScrollbar.destroy(this.popup_staff_manager_discount);
                this.scrollbar = null;
            }
        }
        return (
            <Fragment>
                <Modal
                    bsSize={"lg"}
                    className={"popup-edit-customer popup-staffmanagerdiscount"}
                    dialogClassName={"popup-create-customer in"}
                    show={this.state.isOpenStaffManagerDiscountPopup}
                >
                    <div className="modal-header">
                        <div className="block-title">
                            {this.props.t('MANAGER')}
                        </div>
                    </div>
                    <div data-scrollbar ref={this.setPopupStaffManagerDiscountElement} className="modal-body">
                        <table className="ui celled table">
                            <tbody>
                            <tr className="percentage-discount">
                                <td className="block-title">{this.props.t('Discount')} 0% - 5%</td>
                                <td className="block-content">
                                    <input
                                        type="text"
                                    />
                                </td>
                            </tr>
                            <tr className="fix-discount">
                                <td className="block-title">{this.props.t('Discount')} {CurrencyHelper.format(2213)} - {CurrencyHelper.format(2403)}</td>
                                <td className="block-content">
                                    <input
                                        type="text"
                                    />
                                </td>
                            </tr>
                            <tr className="applied-discount">
                                <td className="block-title">
                                    {this.props.t('Discount Applied:')}
                                </td>
                                <td className="block-content">
                                    {CurrencyHelper.format(2213)}
                                </td>
                            </tr>
                            <tr className="total">
                                <td className="block-title">{this.props.t('Total:')}</td>
                                <td className="block-content">
                                    {CurrencyHelper.format(14436)}
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-default-staffmanagerdiscount"
                                onClick={() => {
                                    this.cancelPopup()
                                }}
                        >
                            {this.props.t('Cancel')}
                        </button>
                        <button type="button" className="btn btn-default-staffmanagerdiscount">
                            {this.props.t('Confirm')}
                        </button>
                    </div>
                </Modal>
            </Fragment>
        )
    }
}

export class StaffManagerDiscountPopupContainer extends CoreContainer {
    static className = 'StaffManagerDiscountPopupContainer';

    /**
     *
     * @param state
     * @return {{quote: *}}
     */
    static mapState(state) {
        let {quote} = state.core.checkout;
        return {quote: quote};
    }

    static mapDispatch(dispatch) {
        return {
            actions: {
                setQuote: (quote) => dispatch(QuoteAction.setQuote(quote))
            }
        }
    }
}

/**
 *
 * @type {StaffManagerDiscountPopupContainer}
 */
const container = ContainerFactory.get(StaffManagerDiscountPopupContainer);
export default container.getConnect(ComponentFactory.get(StaffManagerDiscountPopupComponent));