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
        let {isOpenStaffDiscountPopup} = this.props;
        if (!isOpenStaffDiscountPopup) {
            if (this.popup_staff_discount) {
                SmoothScrollbar.destroy(this.popup_staff_discount);
                this.scrollbar = null;
            }
        }
        return (
            <Fragment>
                <Modal
                    bsSize={"lg"}
                    className={"popup-edit-customer popup-staffdiscount"}
                    dialogClassName={"popup-create-customer in"}
                    show={isOpenStaffDiscountPopup}
                >
                    <div className="modal-header">
                        <button type="button" className="btn btn-default-staffdiscount-header">
                            {this.props.t('STAFF')}
                        </button>
                        <button type="button" className="btn btn-default-staffdiscount-header">
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
                                    <button type="button" className="btn btn-default-staffdiscount">
                                        5%
                                    </button>
                                    <button type="button" className="btn btn-default-staffdiscount">
                                        10%
                                    </button>
                                    <button type="button" className="btn btn-default-staffdiscount">
                                        15%
                                    </button>
                                    <button type="button" className="btn btn-default-staffdiscount">
                                        20%
                                    </button>
                                </td>
                            </tr>
                            <tr className="percentage-discount">
                                <td className="block-title">{this.props.t('Discount')} 0% - 10%</td>
                                <td className="block-content">
                                    <input/>
                                </td>
                            </tr>
                            <tr className="fix-discount">
                                <td className="block-title">{this.props.t('Discount')} $2,213 - $2,403</td>
                                <td className="block-content">
                                    <input/>
                                </td>
                            </tr>
                            <tr className="applied-discount">
                                <td className="block-title">{this.props.t('Discount Applied:')}</td>
                                <td className="block-content">$2,213</td>
                            </tr>
                            <tr className="total">
                                <td className="block-title">{this.props.t('Total:')}</td>
                                <td className="block-content">$14,436</td>
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
                        <button type="button" className="btn btn-default-staffdiscount">
                            {this.props.t('Confirm')}
                        </button>
                    </div>
                </Modal>
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
 * @type {StaffDiscountPopupContainer}
 */
const container = ContainerFactory.get(StaffDiscountPopupContainer);
export default container.getConnect(ComponentFactory.get(StaffDiscountPopupComponent));