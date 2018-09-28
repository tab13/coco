import React, {Fragment} from "react";
import {Modal} from "react-bootstrap";
import SmoothScrollbar from "smooth-scrollbar";
import $ from 'jquery';
import Config from "../../../../config/Config";
import CoreComponent from "../../../../framework/component/CoreComponent";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import ComponentFactory from '../../../../framework/factory/ComponentFactory';
import SessionHelper from "../../../../helper/SessionHelper";
import SessionConstant from "../../../constant/SessionConstant";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import SessionAction from "../../../action/SessionAction";
import Denomination from "../denomination/Denomination";
import SessionService from "../../../../service/session/SessionService";

export class CloseSessionCashControlComponent extends CoreComponent {
    static className = 'CloseSessionCashControlComponent';
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
        let denominations;
        if (Config.close_session && Config.close_session.denominations) {
            denominations = Config.close_session.denominations
        } else {
            denominations = SessionHelper.getDenominations();
        }
        this.state = {
            denominations: denominations
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
     * update denomination
     * @param denomination
     */
    updateDenomination(denomination) {
        this.state.denominations.forEach(item => {
            if (item.denomination_id === denomination.denomination_id) {
                item.denomination_number = denomination.denomination_number;
                item.denomination_subtotal = denomination.denomination_subtotal;
            }
        });
        this.setState({denominations: this.state.denominations});
    }

    /**
     * get subtotal all denomination
     * @returns {number}
     */
    getSubtotalAllDenomination() {
        let subtotal = 0;
        this.state.denominations.map(denomination =>
            subtotal += denomination.denomination_subtotal ? denomination.denomination_subtotal : 0);
        return subtotal;
    }

    /**
     * onclick set close session
     */
    onClickCloseSession() {
        let {currentSession, setCurrentSession} = this.props;
        let shift_currency_code = currentSession.shift_currency_code;
        let real_closing_balance = this.getSubtotalAllDenomination();
        let base_real_closing_balance = CurrencyHelper.convertToBase(real_closing_balance, shift_currency_code);
        currentSession.closed_amount = real_closing_balance;
        currentSession.base_closed_amount = base_real_closing_balance;
        setCurrentSession(currentSession);
        this.props.actions.setCloseSession(real_closing_balance, this.state.denominations);
        SessionService.saveCurrentSession(currentSession);
        this.props.setCurrentPopup(SessionConstant.CLOSE_ALL_POPUP);
    }

    /**
     * onclick cancel
     */
    onClickCancel() {
        this.props.setCurrentPopup(SessionConstant.CLOSE_ALL_POPUP);
    }

    template() {
        let {t} = this.props;
        let {denominations} = this.state;
        let shift_currency_code = Config.current_session.shift_currency_code;
        let closing_balance = this.getSubtotalAllDenomination();
        let staff_name = Config.current_session.staff_name ? Config.current_session.staff_name : Config.staff_name;
        let pos_name = Config.current_session.pos_name ? Config.current_session.pos_name : Config.pos_name;
        return (
            <Fragment>
                <Modal
                    bsSize={"lg"}
                    className={"fade in popup-session"}
                    dialogClassName={"modal-fixheight"}
                    show={true}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button"
                                    className="cancel"
                                    data-dismiss="modal"
                                    aria-label="Close"
                                    onClick={() => this.onClickCancel()}>
                                {t('Cancel')}
                            </button>
                            <h4 className="modal-title">{t('Set Closing Balance')}</h4>
                        </div>

                        <div className="session-title">
                            <div className="detail">
                                <div className="pull-left">
                                    <b>{t('Staff')}</b>  <span>{staff_name}</span>
                                </div>
                                <div className="pull-right">
                                    <b>{t('POS')}</b>  <span>{pos_name}</span>
                                </div>
                            </div>
                            <div className="box"></div>
                        </div>
                        <div data-scrollbar ref={this.setBlockContentElement} className="session-content">
                            <ul>
                                <li>
                                    <div className="title"><b>{t('Coin/Bill Value')}</b></div>
                                    <div className="number"><b>{t('Number of Coins/Bills')}</b></div>
                                    <div className="price"><b>{t('Subtotal')}</b></div>
                                </li>
                                {
                                    denominations.map(denomination => {
                                        return (
                                            <Denomination key={denomination.denomination_id}
                                                          denomination={denomination}
                                                          updateDenomination={this.updateDenomination.bind(this)}/>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                        <div className="session-bottom">
                            <div className="box">
                                <span className="title">{t('Closing Balance')}</span>
                                <span className="price">
                                    {CurrencyHelper.format(closing_balance, shift_currency_code)}
                                </span>
                            </div>
                        </div>

                        <div className="modal-footer ">
                            <button className="btn btn-default"
                                    onClick={() => this.onClickCloseSession()}>
                                {t('Confirm')}
                            </button>
                        </div>
                    </div>
                </Modal>
            </Fragment>
        )
    }
}

class CloseSessionCashControlComponentContainer extends CoreContainer {
    static className = 'CloseSessionCashControlComponentContainer';

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

export default ContainerFactory.get(CloseSessionCashControlComponentContainer).withRouter(
    ComponentFactory.get(CloseSessionCashControlComponent)
);