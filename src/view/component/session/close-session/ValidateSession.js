import React, {Fragment} from "react";
import {Modal} from "react-bootstrap";
import $ from 'jquery';
import Config from "../../../../config/Config";
import SmoothScrollbar from "smooth-scrollbar";
import Textarea from "react-textarea-autosize";
import CoreComponent from "../../../../framework/component/CoreComponent";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import ComponentFactory from '../../../../framework/factory/ComponentFactory';
import SessionService from "../../../../service/session/SessionService";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import SessionAction from "../../../action/SessionAction";
import SessionConstant from "../../../constant/SessionConstant";

export class ValidateSessionComponent extends CoreComponent {
    static className = 'ValidateSessionComponent';
    input;
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
        let closeSession = Config.close_session;
        let currentSession = Config.current_session;
        if (closeSession) {
            currentSession.closed_amount = closeSession.closed_amount;
            currentSession.base_closed_amount = closeSession.base_closed_amount;
            SessionService.saveCurrentSession(currentSession);
        }
        this.state = {
            currentSession: currentSession,
            enableBtnConfirm: false
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
     * set input
     * @param input
     */
    setInput(input) {
        this.input = input;
    }

    /**
     * onclick close session
     */
    onClickConfirm() {
        if (!this.state.enableBtnConfirm) {
            return;
        }
        let {currentSession} = this.state;
        let note = this.input.value;
        currentSession.closed_note = note;
        this.props.setCurrentSession(currentSession);
        this.props.actions.closeSession(currentSession, note);
        this.props.setCurrentPopup(SessionConstant.CLOSE_ALL_POPUP);
    }

    /**
     * onclick cancel
     */
    onClickCancel() {
        this.props.setCurrentPopup(SessionConstant.CLOSE_ALL_POPUP);
    }

    /**
     * on change text note
     */
    onChangeTextNote() {
        this.setState({
            enableBtnConfirm: this.input.value.length
        });
    }

    template() {
        let {t} = this.props;
        let {currentSession, enableBtnConfirm} = this.state;
        let shift_currency_code = currentSession.shift_currency_code;
        let theoretical_closing_balance = SessionService.getTheoreticalAmount(currentSession);
        let real_closing_balance = currentSession.closed_amount;
        let different_amount = real_closing_balance - theoretical_closing_balance;
        let title_different = "";
        if (different_amount > 0) {
            title_different = "Overage";
        } else {
            title_different = "Shortage";
        }
        let style = {
            resize: "none",
            overflow: "hidden",
        };
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
                                    onClick={() => this.onClickCancel()}>{t('Cancel')}</button>
                            <h4 className="modal-title" >{t('Close Session')}</h4>
                        </div>
                        <div data-scrollbar ref={this.setBlockContentElement} className="modal-body">
                            <p className="color-gray">
                                {t('Theoretical balance is not the same as real balance. Please enter reason for loss/profit ' +
                                    'if you want to continue closing session.')}
                            </p>
                            <ul className="balance">
                                <li>
                                    <span className="title">{t('Theoretical Closing Balance')}</span>
                                    <span className="value">
                                        {CurrencyHelper.format(theoretical_closing_balance, shift_currency_code)}
                                    </span>
                                </li>
                                <li>
                                    <span className="title">{t('Real Closing Balance')}</span>
                                    <span className="value">
                                        {CurrencyHelper.format(real_closing_balance, shift_currency_code)}
                                    </span>
                                </li>
                                <li>
                                    <span className="title">{t(title_different)}</span>
                                    <span className="value">
                                        {CurrencyHelper.format(Math.abs(different_amount), shift_currency_code)}
                                    </span>
                                </li>
                            </ul>

                            <div className="form-textarea">
                                <Textarea
                                    placeholder={t('Enter reason for loss/profit (required)')}
                                    className="form-control"
                                    maxRows={3}
                                    minRows={3}
                                    onChange={this.onChangeTextNote.bind(this)}
                                    inputRef={this.setInput.bind(this)}
                                    style={style}
                                />
                            </div>
                        </div>
                        <div className="modal-footer ">
                            <button className={enableBtnConfirm ? "btn btn-default" : "btn btn-default disabled"}
                                    onClick={() => this.onClickConfirm()}>{t('Confirm')}</button>
                        </div>
                    </div>
                </Modal>
            </Fragment>
        )
    }
}

class ValidateSessionComponentContainer extends CoreContainer {
    static className = 'ValidateSessionComponentContainer';

    /**
     * map to dispatch
     * @param dispatch
     * @returns {{actions: {closeSession: (function(*=): *)}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                closeSession: (session, note) => dispatch(SessionAction.closeSession(session, note))
            }
        }
    }
}

export default ContainerFactory.get(ValidateSessionComponentContainer).withRouter(
    ComponentFactory.get(ValidateSessionComponent)
);