import React, {Fragment} from 'react';
import {Modal} from "react-bootstrap";
import CoreComponent from "../../../../framework/component/CoreComponent";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import '../../../style/css/StaffDiscount.css';
import $ from "jquery";
import StaffDiscountConstant from "../../../constant/StaffDiscountConstant";

export class StaffManagerPinCodePopupComponent extends CoreComponent{
    static className = 'StaffManagerPinCodePopupComponent';
    setPopupStaffManagerPinCodeElement = element => {
        this.heightPopup('.popup-staffpincode .modal-dialog');
    };

    constructor(props) {
        super(props);
        this.state = {
            isOpenStaffManagerPinCodePopup: false
        }
    }

    componentWillMount() {

    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            isOpenStaffManagerPinCodePopup: nextProps.isOpenStaffManagerPinCodePopup
        });
    }

    /**
     * Show or hide popups
     *
     * @param {string} type
     */
    showPopup(type) {
        this.setState({
            isOpenStaffManagerPinCodePopup: type === StaffDiscountConstant.POPUP_TYPE_STAFF_MANAGER_PINCODE,
            isOpenStaffDiscountPopup: type === StaffDiscountConstant.POPUP_TYPE_STAFF_DISCOUNT
        });
    }

    /**
     * cancel popup
     */
    cancelPopup(type) {
        this.props.showPopup(type);
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
                                <input type="password"/>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-default-staffdiscount">
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
        return {};
    }

    static mapDispatch(dispatch) {
        return {}
    }
}

/**
 *
 * @type {StaffManagerPinCodePopupContainer}
 */
const container = ContainerFactory.get(StaffManagerPinCodePopupContainer);
export default container.getConnect(ComponentFactory.get(StaffManagerPinCodePopupComponent));