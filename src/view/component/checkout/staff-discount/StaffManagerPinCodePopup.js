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
        this.heightPopup('.popup-staffdiscount .modal-dialog');
    };

    constructor(props) {
        super(props);
    }

    componentWillMount() {

    }

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
        let {isOpenStaffManagerPinCodePopup} = this.props;
        return (
            <Fragment>
                <Modal
                    bsSize={"lg"}
                    className={"popup-edit-customer popup-staffdiscount"}
                    dialogClassName={"popup-create-customer in"}
                    show={isOpenStaffManagerPinCodePopup}
                >
                    <div className="modal-header">
                        <button type="button" className="btn btn-default-staffdiscount-header aaaaa"
                                onClick={() => {
                                    this.cancelPopup()
                                }}
                        >
                            {this.props.t('Exit')}
                        </button>
                    </div>
                    <div data-scrollbar ref={this.setPopupStaffManagerPinCodeElement} className="modal-body">
                        <div className="manager-pincode">
                            <td className="block-title">{this.props.t('Manager PIN Code')}</td>
                            <td className="block-content">
                                <input type="password"/>
                            </td>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-default-staffdiscount">
                            {this.props.t('Confirm')}
                        </button>
                    </div>
                </Modal>
            </Fragment>
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