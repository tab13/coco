import React, {Fragment} from "react";
import {Modal} from "react-bootstrap";
import $ from 'jquery';
import SmoothScrollbar from "smooth-scrollbar";
import Config from "../../../../config/Config";
import NumPad from '../../lib/react-numpad';
import CoreComponent from "../../../../framework/component/CoreComponent";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import ComponentFactory from '../../../../framework/factory/ComponentFactory';
import SessionConstant from "../../../constant/SessionConstant";
import SessionService from "../../../../service/session/SessionService";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import SessionAction from "../../../action/SessionAction";

export class CloseSessionComponent extends CoreComponent {
    static className = 'CloseSessionComponent';
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
        let closeAmount = Config.close_session ? Config.close_session.closed_amount : 0;
        this.state = {
            closeAmount: closeAmount
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
        this.setState({closeAmount: Number(val)});
    }

    /**
     * onclick confirm set close session
     */
    onClickConfirm() {
        let {currentSession, setCurrentSession} = this.props;
        let shift_currency_code = currentSession.shift_currency_code;
        let real_closing_balance = this.state.closeAmount;
        let base_real_closing_balance = CurrencyHelper.convertToBase(real_closing_balance, shift_currency_code);
        currentSession.closed_amount = real_closing_balance;
        currentSession.base_closed_amount = base_real_closing_balance;
        setCurrentSession(currentSession);
        this.props.actions.setCloseSession(real_closing_balance, this.state.denominations);
        SessionService.saveCurrentSession(currentSession);
        this.props.setCurrentPopup(SessionConstant.CLOSE_ALL_POPUP);
    }

    template() {
        let {t} = this.props;
        let {closeAmount} = this.state;
        let staff_name = Config.current_session.staff_name ? Config.current_session.staff_name : Config.staff_name;
        let pos_name = Config.current_session.pos_name ? Config.current_session.pos_name : Config.pos_name;
        let shift_currency_code = Config.current_session.shift_currency_code;
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
                            <h4 className="modal-title" >{t('Set Closing Balance')}</h4>
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
                                value={closeAmount}>
                                <div className="opening-balance"
                                     data-container="body"
                                     data-toggle="popover"
                                     data-placement="right"
                                     data-content="">
                                    <span className="title">{t('Closing Balance')}</span>
                                    <span className="price">
                                        {CurrencyHelper.format(closeAmount, shift_currency_code)}
                                    </span>
                                </div>
                            </NumPad.CustomNumber>
                        </div>
                        <div className="modal-footer ">
                            <button className="btn btn-default"
                                    onClick={() => this.onClickConfirm()}>
                                {t('Confirm')}
                            </button>
                        </div>
                    </div>
                </Modal>
            </Fragment>
        )
    }
}

class CloseSessionComponentContainer extends CoreContainer {
    static className = 'CloseSessionComponentContainer';

    /**
     * map to dispatch
     * @param dispatch
     * @returns {{actions: {closeSession: (function(*=): *)}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                setCloseSession: (closing_amount, denominations) =>
                    dispatch(SessionAction.setCloseSession(closing_amount, denominations)),
                closeSession: (session, note) => dispatch(SessionAction.closeSession(session, note))
            }
        }
    }
}

export default ContainerFactory.get(CloseSessionComponentContainer).withRouter(
    ComponentFactory.get(CloseSessionComponent)
);