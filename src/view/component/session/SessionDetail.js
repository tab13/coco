import React from "react";
import SmoothScrollbar from "smooth-scrollbar";
import {Panel} from "react-bootstrap";
import moment from 'moment';
import Config from "../../../config/Config";
import _ from 'lodash';
import CoreComponent from "../../../framework/component/CoreComponent";
import CoreContainer from "../../../framework/container/CoreContainer";
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import ComponentFactory from '../../../framework/factory/ComponentFactory';
import SessionConstant from "../../constant/SessionConstant";
import SessionHelper from "../../../helper/SessionHelper";
import ActivitiesHistoryItem from "./activities-history/ActivitiesHistoryItem";
import CurrencyHelper from "../../../helper/CurrencyHelper";
import SessionService from "../../../service/session/SessionService";
import PutMoneyIn from "./session-detail/PutMoneyIn";
import TakeMoneyOut from "./session-detail/TakeMoneyOut";
import PermissionConstant from "../../constant/PermissionConstant";
import DateTimeHelper from "../../../helper/DateTimeHelper";
import OrderAction from "../../action/OrderAction";
import SessionAction from "../../action/SessionAction";
import {isMobile} from "react-device-detect";

export class SessionDetailComponent extends CoreComponent {
    static className = 'SessionDetailComponent';
    setBlockContentElement = element => {
        this.block_content = element;
        if (!this.scrollbarSessionDetail && this.block_content) {
            this.scrollbarSessionDetail = SmoothScrollbar.init(this.block_content);
        }
    };

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            isCurrentPopup: SessionConstant.CLOSE_ALL_POPUP
        }
    }

    /**
     * set popup transaction
     * @param popup
     */
    setPopupTransaction(popup) {
        this.setState({isCurrentPopup: popup});
    }

    /**
     * show popup put money in
     */
    OnClickPutMoneyIn() {
        this.setPopupTransaction(SessionConstant.POPUP_PUT_MONEY_IN);
    }

    /**
     * show popup take money out
     */
    OnClickTakeMoneyOut() {
        this.setPopupTransaction(SessionConstant.POPUP_TAKE_MONEY_OUT);
    }

    /**
     * show popup close session
     */
    OnClickEditClosingBalance() {
        this.props.setCurrentPopup(
            SessionHelper.isEnableCashControl() ?
                SessionConstant.POPUP_CLOSE_SESSION_CASH_CONTROL : SessionConstant.POPUP_CLOSE_SESSION
        );
    }

    /**
     * onclick close session
     */
    onClickCloseSession() {
        let {setCurrentPopup, currentSession} = this.props;
        let theoretical_closing_balance = SessionService.getTheoreticalAmount(currentSession);
        let real_closing_balance = currentSession.closed_amount;
        let different_amount = real_closing_balance - theoretical_closing_balance;
        if (SessionService.isSetClosingBalance(currentSession)) {
            different_amount !== 0 ?
                setCurrentPopup(SessionConstant.POPUP_VALIDATE_SESSION) :
                this.props.actions.closeSession(currentSession, "")
        } else {
            SessionHelper.isEnableCashControl() ?
                setCurrentPopup(SessionConstant.POPUP_CLOSE_SESSION_CASH_CONTROL) :
                setCurrentPopup(SessionConstant.POPUP_CLOSE_SESSION);
        }
    }

    /**
     *
     */
    onClickPrintReport() {
        this.props.actions.printReport(this.props.currentSession);
    }

    template() {
        let {isCurrentPopup} = this.state;
        let {t} = this.props;
        let session = this.props.currentSession;
        if (!session) {
            if (this.block_content) {
                SmoothScrollbar.destroy(this.block_content);
            }
            return (
                <div className="session-right">
                    <div className="block-title">
                    </div>
                    <div className="page-notfound">
                        {
                            t('Create a session to start selling.')
                        }
                    </div>
                </div>
            );
        }
        let isSetClosingBalance = SessionService.isSetClosingBalance(session);
        let shift_currency_code = session.shift_currency_code;
        let isCloseSession = session.status === SessionConstant.SESSION_CLOSE;
        let cash_transaction = session.cash_transaction ? session.cash_transaction : [];
        // sort desc cash transaction
        cash_transaction = _.orderBy(cash_transaction, 'updated_at', 'desc');
        let opening_amount = CurrencyHelper.format(session.opening_amount, shift_currency_code);
        // get cash in from cash transaction
        let cash_in = cash_transaction.filter(item => item.type === SessionConstant.CASH_TRANSACTION_ADD);
        let classCashIn = cash_in && cash_in.length ? "item item-collapse" : "item";
        let total_amount_cash_in = "+" + CurrencyHelper.format(
            SessionService.totalAmountCashTransaction(cash_in), shift_currency_code);
        // get cash out from cash transaction
        let cash_out = cash_transaction.filter(item => item.type !== SessionConstant.CASH_TRANSACTION_ADD);
        let classCashOut = cash_out && cash_out.length ? "item item-collapse" : "item";
        let total_amount_cash_out = "-" + CurrencyHelper.format(
            SessionService.totalAmountCashTransaction(cash_out), shift_currency_code);
        let theoretical_closing_balance = SessionService.getTheoreticalAmount(session);
        let real_closing_balance = 0;
        if (isCloseSession) {
            real_closing_balance = session.closed_amount;
        } else {
            real_closing_balance = isSetClosingBalance ? Config.current_session.closed_amount : 0;
        }
        let different_amount = real_closing_balance - theoretical_closing_balance;
        let differentAmountShow = "";
        if (different_amount === 0) {
            differentAmountShow = CurrencyHelper.format(Math.abs(different_amount), shift_currency_code);
        } else if (different_amount > 0) {
            differentAmountShow = '+' + CurrencyHelper.format(Math.abs(different_amount), shift_currency_code);
        } else {
            differentAmountShow = '-' + CurrencyHelper.format(Math.abs(different_amount), shift_currency_code);
        }
        let closed_note = session.closed_note ? session.closed_note : "";
        let opened_at = moment(DateTimeHelper.convertDatabaseDateTimeToLocalDate(session.opened_at)).format('LLL');
        let closed_at = session.closed_at ?
            moment(DateTimeHelper.convertDatabaseDateTimeToLocalDate(session.closed_at)).format('LLL') : "";
        return (
            <div className="session-right">
                <div className="block-title">
                    <strong className="title">{SessionService.getDisplayDate(session.opened_at)}</strong>
                </div>
                <div data-scrollbar ref={this.setBlockContentElement} className="block-content">
                    <div className="session-content-top">
                        <div className="detail">
                            <div className="pull-left">
                                <p><b>{t('Staff')}</b><span>{session.staff_name}</span></p>
                                <p><b>{t('POS')}</b><span>{session.pos_name}</span></p>
                            </div>
                            <div className="pull-right text-right">
                                <p><b>{t('Opened')}</b><span>{opened_at}</span></p>
                                <p className={isCloseSession ? "" : "hidden"}>
                                    <b>{t('Closed')}</b>
                                    <span>{closed_at}</span>
                                </p>
                            </div>
                        </div>
                        <div className={isCloseSession ? "hidden" : "actions"}>
                            <button className={!this.isAllowed(PermissionConstant.PERMISSION_MAKE_ADJUSTMENT) ?
                                                    "hidden" : "btn btn-second"}
                                    onClick={() => this.OnClickPutMoneyIn()}>
                                {t('Put Money In')}
                            </button>
                            <button className={!this.isAllowed(PermissionConstant.PERMISSION_MAKE_ADJUSTMENT) ?
                                                    "hidden" : "btn btn-second"}
                                    onClick={() => this.OnClickTakeMoneyOut()}>
                                {t('Take Money Out')}
                            </button>
                            <button className={isSetClosingBalance ? "btn btn-second" : "hidden"}
                                    onClick={() => this.OnClickEditClosingBalance()}>
                                {t('Edit Closing Balance')}
                            </button>
                        </div>
                    </div>
                    <ul className="session-content-list">
                        <li className="item">
                            <div className="item-title">
                                <span className="title">{t('Opening Balance')}</span>
                                <span className="value">{opening_amount}</span>
                            </div>
                        </li>
                        <li className={classCashIn}>
                            <Panel eventKey="1" key={Math.random()}>
                                <Panel.Title className={"item-title"} toggle>
                                    <span className="title">{t('Cash in')}</span>
                                    <span className="value">{total_amount_cash_in}</span>
                                </Panel.Title>
                                <Panel.Body collapsible className={"item-content"}>
                                    {
                                        cash_in.map(transaction => {
                                            return (
                                                <ActivitiesHistoryItem key={transaction.transaction_increment_id}
                                                                       transaction={transaction}/>
                                            )
                                        })
                                    }
                                </Panel.Body>
                            </Panel>
                        </li>
                        <li className={classCashOut}>
                            <Panel eventKey="2" key={Math.random()}>
                                <Panel.Title className={"item-title"} toggle>
                                    <span className="title">{t('Cash out')}</span>
                                    <span className="value">{total_amount_cash_out}</span>
                                </Panel.Title>
                                <Panel.Body collapsible className={"item-content"}>
                                    {
                                        cash_out.map(transaction => {
                                            return (
                                                <ActivitiesHistoryItem key={transaction.transaction_increment_id}
                                                                       transaction={transaction}/>
                                            )
                                        })
                                    }
                                </Panel.Body>
                            </Panel>
                        </li>
                        <li className="item">
                            <div className="item-title">
                                <span className="title">{t('Theoretical Closing Balance')}</span>
                                <span className="value">
                                    {CurrencyHelper.format(theoretical_closing_balance, shift_currency_code)}
                                </span>
                            </div>
                        </li>
                        <li className={isSetClosingBalance || isCloseSession ? "item" : "hidden"}>
                            <div className="item-title">
                                <span className="title">{t('Real Closing Balance')}</span>
                                <span className="value">{CurrencyHelper.format(real_closing_balance, shift_currency_code)}</span>
                            </div>
                        </li>
                        <li className={isSetClosingBalance ? "item" : (isCloseSession && !closed_note ? "item" : "item hidden")}>
                            <div className="item-title">
                                <span className="title">{t('Difference')}</span>
                                <span className="value">
                                    {differentAmountShow}
                                </span>
                            </div>
                        </li>
                        <li className={!isSetClosingBalance && isCloseSession && closed_note ? "item item-collapse" : "hidden"}>
                            <Panel eventKey="3" key={Math.random()}>
                                <Panel.Title className={"item-title"} toggle>
                                    <span className="title">{t('Difference')}</span>
                                    <span className="value">
                                        {differentAmountShow}
                                    </span>
                                </Panel.Title>
                                <Panel.Body collapsible className={"item-content"}>
                                    <div className="subitem">
                                        <span className="datetime pull-left">{closed_note}</span>
                                    </div>
                                </Panel.Body>
                            </Panel>
                        </li>
                    </ul>
                </div>
                <div>
                    {
                        isCurrentPopup === SessionConstant.POPUP_PUT_MONEY_IN ?
                        <PutMoneyIn setPopupTransaction={(popup) => this.setPopupTransaction(popup)}/> : null
                    }
                    {
                        isCurrentPopup === SessionConstant.POPUP_TAKE_MONEY_OUT ?
                        <TakeMoneyOut setPopupTransaction={(popup) => this.setPopupTransaction(popup)}/> : null
                    }
                </div>
                <div className="block-bottom">
                    <button className={(isCloseSession || isMobile) ? "hidden" : "btn btn-default btn-cannel"}
                            onClick={() => this.onClickPrintReport()}>
                        {t('X-Report')}
                    </button>
                    <button className={isCloseSession ? "hidden" : "btn btn-default"}
                            onClick={() => this.onClickCloseSession()}>
                        {isSetClosingBalance ? t('Validate') : t('Close Session')}
                    </button>
                    <button className={(isCloseSession && !isMobile) ? "btn btn-default btn-cannel" : "hidden"}
                            onClick={() => this.onClickPrintReport()}>
                        {t('Z-Report')}
                    </button>
                </div>
            </div>
        )
    }
}

class SessionDetailComponentContainer extends CoreContainer {
    static className = 'SessionDetailComponentContainer';

    static mapDispatch(dispatch) {
        return {
            actions: {
                closeSession: (session, note) => dispatch(SessionAction.closeSession(session, note)),
                printReport: (currentSession) =>
                    dispatch(OrderAction.printReport(currentSession))
            }
        }
    }

}

export default ContainerFactory.get(SessionDetailComponentContainer).withRouter(
    ComponentFactory.get(SessionDetailComponent)
);