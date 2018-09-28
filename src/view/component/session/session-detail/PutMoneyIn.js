import React, {Fragment} from "react";
import {Modal} from "react-bootstrap";
import $ from 'jquery';
import SmoothScrollbar from "smooth-scrollbar";
import Textarea from "react-textarea-autosize";
import NumPad from '../../lib/react-numpad';
import CoreComponent from "../../../../framework/component/CoreComponent";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import ComponentFactory from '../../../../framework/factory/ComponentFactory';
import SessionConstant from "../../../constant/SessionConstant";
import SessionAction from "../../../action/SessionAction";
import CurrencyHelper from "../../../../helper/CurrencyHelper";

export class PutMoneyInComponent extends CoreComponent {
    static className = 'PutMoneyInComponent';
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
        this.state = {
            amountPut: 0,
            enableBtnPutIn: false
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
     * onclick cancel
     */
    onClickCancel() {
        this.props.setPopupTransaction(SessionConstant.CLOSE_ALL_POPUP);
    }

    /**
     * onclick put money in
     */
    onClickPutMoneyIn() {
        if (!this.state.enableBtnPutIn || !this.input.value.length) {
            return;
        }
        this.props.actions.putMoneyIn(this.state.amountPut, this.input.value);
        this.props.setPopupTransaction(SessionConstant.CLOSE_ALL_POPUP);
    }

    /**
     * on change money
     * @param val
     */
    onChangeMoney(val) {
        let value = Number(val);
        this.setState({
            amountPut: value,
            enableBtnPutIn: value > 0 && this.input.value.length
        });
    }

    /**
     * on change text note
     */
    onChangeTextNote() {
        this.setState({
            enableBtnPutIn: this.state.amountPut > 0 && this.input.value.length
        });
    }

    template() {
        let {t} = this.props;
        let {amountPut, enableBtnPutIn} = this.state;
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
                                    onClick={() => this.onClickCancel()}>
                                {t('Cancel')}
                            </button>
                            <h4 className="modal-title">{t('Put Money In')}</h4>
                        </div>
                        <div data-scrollbar ref={this.setBlockContentElement} className="modal-body">
                            <p className="color-gray text-center">
                                {t('Fill in this form if you put money in the cash-drawer')}
                            </p>
                            <NumPad.CustomNumber
                                onChange={(val) => this.onChangeMoney(val)}
                                position="centerRight"
                                sync={true}
                                arrow="right"
                                value={amountPut}>
                                <div className="opening-balance"
                                     data-container="body"
                                     data-toggle="popover"
                                     data-placement="right"
                                     data-content="">
                                    <span className="title">{t('Amount')}</span>
                                    <span className="price">{CurrencyHelper.format(amountPut)}</span>
                                </div>
                            </NumPad.CustomNumber>
                            <div className="form-textarea _sm">
                                <Textarea
                                    placeholder={t('Reason (required)')}
                                    className="form-control"
                                    maxRows={2}
                                    minRows={2}
                                    onChange={this.onChangeTextNote.bind(this)}
                                    inputRef={this.setInput.bind(this)}
                                    style={style}
                                />
                            </div>
                        </div>
                        <div className="modal-footer ">
                            <button className={enableBtnPutIn ? "btn btn-default" : "btn btn-default disabled"}
                                    onClick={() => this.onClickPutMoneyIn()}>{t('Put In')}</button>
                        </div>
                    </div>
                </Modal>
            </Fragment>
        )
    }
}

class PutMoneyInComponentContainer extends CoreContainer {
    static className = 'PutMoneyInComponentContainer';

    /**
     * map to dispatch
     * @param dispatch
     * @returns {{actions: {putMoneyIn: (function(*=): *)}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                putMoneyIn: (amount, note) => dispatch(SessionAction.putMoneyIn(amount, note))
            }
        }
    }
}

export default ContainerFactory.get(PutMoneyInComponentContainer).withRouter(
    ComponentFactory.get(PutMoneyInComponent)
);