import React, {Fragment} from "react";
import {Modal} from "react-bootstrap";
import $ from 'jquery';
import Config from "../../../../config/Config";
import SmoothScrollbar from "smooth-scrollbar";
import NumPad from '../../lib/react-numpad';
import CoreComponent from "../../../../framework/component/CoreComponent";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import ComponentFactory from '../../../../framework/factory/ComponentFactory';
import SessionConstant from "../../../constant/SessionConstant";
import SessionAction from "../../../action/SessionAction";
import CurrencyHelper from "../../../../helper/CurrencyHelper";

export class OpenSessionComponent extends CoreComponent {
    static className = 'OpenSessionComponent';
    setBlockContentElement = element => {
        this.block_content = element;
        if (!this.scrollbarOrderDetail) {
            this.scrollbarOrderDetail = SmoothScrollbar.init(this.block_content);
            this.heightPopup('.popup-session .modal-dialog');
        }
    };

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            openAmount: 0
        }
    }

    /**
     * get height popup
     * @param elm
     */
    heightPopup(elm) {
        var height = $( window ).height();
        $(elm).css('height', height + 'px');
    }

    /**
     * onclick cancel
     */
    onClickCancel() {
        this.props.setCurrentPopup(SessionConstant.CLOSE_ALL_POPUP);
    }

    /**
     * on change amount
     * @param val
     */
    onChangeAmount(val) {
        this.setState({openAmount: Number(val)});
    }

    /**
     * onclick open session
     */
    onClickOpenSession() {
        this.props.actions.openSession(this.state.openAmount);
        this.props.setCurrentPopup(SessionConstant.CLOSE_ALL_POPUP);
    }

    template() {
        let {t} = this.props;
        let {openAmount} = this.state;
        let staff_name = Config.staff_name;
        let pos_name = Config.pos_name;
        return (
            <Fragment>
                <Modal
                    bsSize={"lg"}
                    className={"fade in popup-session"}
                    dialogClassName={"modal-fixheight"}
                    show={true}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button"
                                    className="cancel"
                                    data-dismiss="modal"
                                    aria-label="Close"
                                    onClick={() => this.onClickCancel()}>
                                {t('Cancel')}
                            </button>
                            <h4 className="modal-title" >{t('Open Session')}</h4>
                        </div>
                        <div data-scrollbar ref={this.setBlockContentElement} className="modal-body">

                            <div className="opening-balance-title">
                                <div className="pull-left">
                                    <b>{t('Staff')}</b>  <span>{staff_name}</span>
                                </div>
                                <div className="pull-right">
                                    <b>{t('POS')}</b>  <span>{pos_name}</span>
                                </div>
                            </div>
                            <NumPad.CustomNumber
                                onChange={(val) => this.onChangeAmount(val)}
                                position="centerRight"
                                sync={true}
                                arrow="right"
                                value={openAmount}>
                                <div className="opening-balance"
                                     data-container="body"
                                     data-toggle="popover"
                                     data-placement="right"
                                     data-content="">
                                    <span className="title">{t('Opening Balance')}</span>
                                    <span className="price">{CurrencyHelper.format(openAmount)}</span>
                                </div>
                            </NumPad.CustomNumber>
                        </div>
                        <div className="modal-footer ">
                            <button className="btn btn-default"
                                    onClick={() => this.onClickOpenSession()}>
                                {t('Open Session')}
                            </button>
                        </div>
                    </div>
                </Modal>
            </Fragment>
        )
    }
}

class OpenSessionComponentContainer extends CoreContainer {
    static className = 'OpenSessionComponentContainer';

    /**
     * map to dispatch
     * @param dispatch
     * @returns {{actions: {openSession: (function(*=): *)}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                openSession: (opening_amount) => dispatch(SessionAction.openSession(opening_amount))
            }
        }
    }
}

export default ContainerFactory.get(OpenSessionComponentContainer).withRouter(
    ComponentFactory.get(OpenSessionComponent)
);