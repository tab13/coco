import React, {Fragment} from "react";
import {Modal} from "react-bootstrap";
import $ from 'jquery';
import SmoothScrollbar from "smooth-scrollbar";
import Config from "../../../../config/Config";
import CoreComponent from "../../../../framework/component/CoreComponent";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import ComponentFactory from '../../../../framework/factory/ComponentFactory';
import Denomination from "../denomination/Denomination";
import SessionHelper from "../../../../helper/SessionHelper";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import SessionAction from "../../../action/SessionAction";
import SessionConstant from "../../../constant/SessionConstant";

export class OpenSessionCashControlComponent extends CoreComponent {
    static className = 'OpenSessionCashControlComponent';
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
            denominations: SessionHelper.getDenominations()
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
     * onclick open session
     */
    onClickOpenSession() {
        this.props.actions.openSession(this.getSubtotalAllDenomination());
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
        let staff_name = Config.staff_name;
        let pos_name = Config.pos_name;
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
                            <h4 className="modal-title">{t('Open Session')}</h4>
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
                                <span className="title">{t('Opening Balance')}</span>
                                <span className="price">
                                    {CurrencyHelper.convertAndFormat(this.getSubtotalAllDenomination())}
                                </span>
                            </div>
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

class OpenSessionCashControlComponentContainer extends CoreContainer {
    static className = 'OpenSessionCashControlComponentContainer';

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

export default ContainerFactory.get(OpenSessionCashControlComponentContainer).withRouter(
    ComponentFactory.get(OpenSessionCashControlComponent)
);