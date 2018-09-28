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

export class TakeMoneyOutComponent extends CoreComponent {
    static className = 'TakeMoneyOutComponent';
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
            amountTake: 0,
            enableBtnTakeOut: false
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
     * onclick take money out
     */
    onClickTakeMoneyOut() {
        if (!this.state.enableBtnTakeOut) {
            return;
        }
        this.props.actions.takeMoneyOut(this.state.amountTake, this.input.value);
        this.props.setPopupTransaction(SessionConstant.CLOSE_ALL_POPUP);
    }

    /**
     * on change money
     * @param val
     */
    onChangeMoney(val) {
        let value = Number(val);
        this.setState({
            amountTake: value,
            enableBtnTakeOut: value > 0 && this.input.value.length
        });
    }

    /**
     * on change text note
     */
    onChangeTextNote() {
        this.setState({
            enableBtnTakeOut: this.state.amountTake > 0 && this.input.value.length
        });
    }

    template() {
        let {t} = this.props;
        let {amountTake, enableBtnTakeOut} = this.state;
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
                            <h4 className="modal-title">{t('Take Money Out')}</h4>
                        </div>
                        <div data-scrollbar ref={this.setBlockContentElement} className="modal-body">
                            <p className="color-gray text-center">
                                {t('Fill in this form if you take money from the cash-drawer')}
                            </p>
                            <NumPad.CustomNumber
                                onChange={(val) => this.onChangeMoney(val)}
                                position="centerRight"
                                sync={true}
                                arrow="right"
                                value={amountTake}>
                                <div className="opening-balance"
                                     data-container="body"
                                     data-toggle="popover"
                                     data-placement="right"
                                     data-content="">
                                    <span className="title">{t('Amount')}</span>
                                    <span className="price">{CurrencyHelper.format(amountTake)}</span>
                                </div>
                            </NumPad.CustomNumber>
                            <div className="form-textarea _sm" >
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
                            <button className={enableBtnTakeOut ? "btn btn-default" : "btn btn-default disabled"}
                                    onClick={() => this.onClickTakeMoneyOut()}>{t('Take Out')}</button>
                        </div>
                    </div>
                </Modal>
            </Fragment>
        )
    }
}

class TakeMoneyOutComponentContainer extends CoreContainer {
    static className = 'TakeMoneyOutComponentContainer';

    /**
     * map to dispatch
     * @param dispatch
     * @returns {{actions: {takeMoneyOut: (function(*=): *)}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                takeMoneyOut: (amount, note) => dispatch(SessionAction.takeMoneyOut(amount, note))
            }
        }
    }
}

export default ContainerFactory.get(TakeMoneyOutComponentContainer).withRouter(
    ComponentFactory.get(TakeMoneyOutComponent)
);