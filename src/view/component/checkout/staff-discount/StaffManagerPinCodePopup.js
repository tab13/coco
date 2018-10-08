import React, {Fragment} from 'react';
import {Modal} from "react-bootstrap";
import CoreComponent from "../../../../framework/component/CoreComponent";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import '../../../style/css/StaffDiscount.css';
import $ from "jquery";
import StaffDiscountConstant from "../../../constant/StaffDiscountConstant";
import StaffDiscountAction from "../../../action/staff-discount/StaffDiscountAction";
import i18n from "../../../../config/i18n";

export class StaffManagerPinCodePopupComponent extends CoreComponent{
    static className = 'StaffManagerPinCodePopupComponent';
    setPopupStaffManagerPinCodeElement = element => {
        this.heightPopup('.popup-staffpincode .modal-dialog');
    };

    constructor(props) {
        super(props);
        this.state = {
            isOpenStaffManagerPinCodePopup: false,
            errorPinCodeMessage: ''
        }
    }

    componentWillMount() {
    }

    componentWillUpdate() {
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            isOpenStaffManagerPinCodePopup: nextProps.isOpenStaffManagerPinCodePopup
        });
        if (this.state.isOpenStaffManagerPinCodePopup) {
            if (!nextProps.connection) {

            } else {
                if (nextProps.staffDiscount !== undefined) {
                    if (!nextProps.staffDiscount.is_manager) {
                        if (this.refs.errorPinCodeMessage !== undefined) {
                            this.setState({
                                errorPinCodeMessage: i18n.translator.translate(nextProps.staffDiscount.message)
                            });
                        }
                    } else {
                        this.setState({
                            errorPinCodeMessage: '',
                        });
                        this.cancelPopup(StaffDiscountConstant.POPUP_TYPE_STAFF_MANAGER_DISCOUNT)
                    }
                }
            }
        } else {
            this.setState({
                errorPinCodeMessage: ''
            });
        }
    }

    /**
     * Show or hide popups
     *
     * @param {string} type
     */
    // showPopup(type) {
    //     this.setState({
    //         isOpenStaffManagerPinCodePopup: type === StaffDiscountConstant.POPUP_TYPE_STAFF_MANAGER_PINCODE,
    //         isOpenStaffDiscountPopup: type === StaffDiscountConstant.POPUP_TYPE_STAFF_DISCOUNT
    //     });
    // }

    /**
     * cancel popup
     */
    cancelPopup(type) {
        this.props.showPopup(type);
    }

    checkPincode() {
        if (this.refs.pincode.value) {
            this.props.clickConfirmManagerPinCode(this.refs.pincode.value);
        } else {
            this.setState({
                errorPinCodeMessage: ''
            });
        }
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
        return (
                <Modal
                    bsSize={"lg"}
                    className={"popup-edit-customer popup-staffpincode"}
                    dialogClassName={"popup-create-customer in"}
                    show={this.state.isOpenStaffManagerPinCodePopup}
                >
                    <div className="modal-header">
                        <button type="button" className="btn btn-default-staffpincode-header aaaaa"
                                onClick={() => {
                                    this.cancelPopup(StaffDiscountConstant.POPUP_TYPE_STAFF_DISCOUNT)
                                }}
                        >
                        </button>
                    </div>
                    <div data-scrollbar ref={this.setPopupStaffManagerPinCodeElement} className="modal-body">
                        <div className="manager-pincode">
                            <div className="block-title">{this.props.t('Manager PIN Code')}</div>
                            <div className="block-content">
                                <input ref="pincode" type="password"/>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <div ref="errorPinCodeMessage" className="manager-pincode-error-message">{this.props.t(this.state.errorPinCodeMessage)}</div>
                        <button type="button" className="btn btn-default-staffdiscount"
                                onClick={() => this.checkPincode()}
                        >
                            {this.props.t('Confirm')}
                        </button>
                    </div>
                </Modal>
        )
    }
}

export class StaffManagerPinCodePopupContainer extends CoreContainer{
    static className = 'StaffManagerPinCodePopupContainer';

    static mapState(state) {
        const {staffDiscount} = state.core;
        let connection = state.core.internet.connection;
        return {
            staffDiscount,
            connection: connection
        };
    }

    static mapDispatch(dispatch) {
        return {
            clickConfirmManagerPinCode: (pincode) => dispatch(StaffDiscountAction.clickConfirmManagerPinCode(pincode))
        }
    }
}

/**
 *
 * @type {StaffManagerPinCodePopupContainer}
 */
const container = ContainerFactory.get(StaffManagerPinCodePopupContainer);
export default container.getConnect(ComponentFactory.get(StaffManagerPinCodePopupComponent));