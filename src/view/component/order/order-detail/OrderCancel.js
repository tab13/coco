import React, {Fragment} from 'react';
import {Modal} from "react-bootstrap";
import {CoreComponent} from "../../../../framework/component/index";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import {toast} from "react-toastify";
import $ from 'jquery';
import SmoothScrollbar from "smooth-scrollbar";
import Textarea from 'react-textarea-autosize';
import OrderAction from "../../../action/OrderAction";

class OrderCancel extends CoreComponent {
    static className = 'OrderCancel';

    setBlockContentElement = element => {
        this.block_content = element;
        if (!this.scrollbarOrderCancel && this.block_content) {
            this.scrollbarOrderCancel = SmoothScrollbar.init(this.block_content);
            this.heightPopup('.popup-edit-customer.popup-cancel-order .modal-dialog');
        }
    };

    /**
     * focus reason area
     */
    focusReasonArea() {
        document.getElementById("reason-area").focus();
    }

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            comment: ''
        };
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
     * action cancel order
     */
    actionCancelOrder() {
        this.props.actions.cancel(this.props.order, this.state.comment, true, true);
        let messageSuccess = this.props.t('This order has been canceled.');
        toast.success (
            messageSuccess,
            {
                position: toast.POSITION.BOTTOM_CENTER,
                className: 'wrapper-messages messages-success'
            }
        );
        this.props.closeCancelOrder();
    }


    /**
     * cancel take payment
     */
    cancelActionCancelOrder() {
        this.props.closeCancelOrder();
    }

    /**
     * Coment change
     * @param event
     */
    commentChange(event) {
        this.setState({
            comment: event.target.value
        });
    }

    /**
     * template to render
     * @returns {*}
     */
    template() {
        return (
            <Fragment>
                <Modal
                    bsSize={"lg"}
                    className={"popup-edit-customer popup-cancel-order"}
                    dialogClassName={"popup-create-customer in"}
                    show={this.props.showCancelOrder}
                >
                    <div className="modal-header">
                        <h4 className="modal-title">{this.props.t('Cancel Order')}</h4>
                    </div>
                    <div data-scrollbar ref={this.setBlockContentElement} className="modal-body">
                        <div className="text text-center">
                            {this.props.t('Are you sure you want to cancel this order?')}
                        </div>
                        <div className="add-comment-order" onClick={() => this.focusReasonArea()}>
                            <div className="box-text-area">
                                        <Textarea
                                            id='reason-area'
                                            className="form-control"
                                            maxRows={5}
                                            placeholder={this.props.t('Reason to cancel order (Optional)')}
                                            style={{resize: 'none'}}
                                            onChange={(event) => this.commentChange(event)}
                                        />
                            </div>
                        </div>
                        <div className="actions-bottom">
                            <a className="btn" onClick={() => this.cancelActionCancelOrder()}>{this.props.t('No')}</a>
                            <a className="btn" onClick={() => this.actionCancelOrder()}>{this.props.t('Yes')}</a>
                        </div>
                    </div>
                </Modal>
            </Fragment>
        );
    }
}

class OrderCancelContainer extends CoreContainer {
    static className = 'OrderCancelContainer';

    /**
     * Map state to props
     * @param state
     * @returns {{quote: *}}
     */
    static mapState(state) {
        return {
        };
    }

    /**
     * Map dispatch to props
     *
     * @param dispatch
     * @return {{actions: {selectPayment: function(*=, *=): *, switchPage: function(*=): *, resetState: function(): *, addPayment: function(*=): *}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                cancel: (order, comment, notify, visibleOnFront) => dispatch(OrderAction.cancel(order, comment, notify, visibleOnFront)),
            }
        }
    }
}

/**
 * @type {OrderCancel}
 */
export default ContainerFactory.get(OrderCancelContainer).withRouter(
    ComponentFactory.get(OrderCancel)
)