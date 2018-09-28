import React, {Fragment} from 'react';
import {Modal} from "react-bootstrap";
import {toast} from "react-toastify";
import {CoreComponent} from "../../../../framework/component/index";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import OrderAction from "../../../action/OrderAction";
import ConfigHelper from "../../../../helper/ConfigHelper";
import $ from 'jquery';
import SmoothScrollbar from "smooth-scrollbar";

class OrderSendEmail extends CoreComponent {
    static className = 'OrderSendEmail';
    regexEmail  = ConfigHelper.regexEmail;

    setBlockContentElement = element => {
        this.block_content = element;
        if (!this.scrollbarOrderSendEmail && this.block_content) {
            this.scrollbarOrderSendEmail = SmoothScrollbar.init(this.block_content);
            this.heightPopup('.popup-edit-customer.popup-send-email .modal-dialog');
        }
    };

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        let order = this.props.order;
        if (order.customer_email && !order.customer_is_guest) {
            this.state = {
                email: order.customer_email,
                btnSendClassName: 'btn',
                validTextClassName: 'hidden'
            };
        } else {
            this.state = {
                email: "",
                btnSendClassName: "btn disabled",
                validTextClassName: 'hidden'
            }
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
     * send email
     */
    sendEmail() {
        if (this.state.email) {
            if (this.regexEmail.test(this.state.email)) {
                this.props.actions.sendEmail(this.props.order.increment_id, this.state.email);
                this.cancelSendEmail();
                toast.success (
                    this.props.t('The email sending request has been saved in queue and will be sent shortly.'),
                    {
                        position: toast.POSITION.BOTTOM_CENTER,
                        className: 'wrapper-messages messages-success'
                    }
                );

            } else {
                this.setState({
                    validTextClassName: ''
                })
            }
        }
    }


    /**
     * cancel take payment
     */
    cancelSendEmail() {
        this.props.closeSendEmail();
    }

    emailChange(event) {
        let className = 'btn';
        if (!event.target.value) {
            className = 'btn disabled';
        }
        this.setState({
            email: event.target.value,
            btnSendClassName: className,
            validTextClassName: 'hidden'
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
                    className={"popup-edit-customer popup-send-email"}
                    dialogClassName={"popup-create-customer in"}
                    show={this.props.showSendEmailOrder}
                >
                    <div className="modal-header">
                        <button type="button" className="cancel" data-dismiss="modal" aria-label="Close"
                                onClick={() => this.cancelSendEmail()}>Cancel</button>
                        <h4 className="modal-title">{this.props.t('Send Email')}</h4>
                    </div>
                    <div ref={this.setBlockContentElement} className="modal-body" data-scrollbar>
                        <div className="send-email">
                            <label>{this.props.t('Recipient’s email address')}</label>
                            <div className="control">
                                <input type="email" name="" className="form-control"
                                       placeholder="" onChange={(event) => this.emailChange(event)}
                                       value={this.state.email} />
                                <button className={this.state.btnSendClassName}
                                        onClick={() => this.sendEmail()}>{this.props.t('Send')}</button>
                            </div>
                            <span className={this.state.validTextClassName}>
                                        {this.props.t('Please enter a valid email address')}
                                    </span>
                        </div>
                    </div>
                </Modal>
            </Fragment>
        );
    }
}

class OrderSendEmailContainer extends CoreContainer {
    static className = 'OrderSendEmailContainer';

    /**
     * Map dispatch to props
     *
     * @param dispatch
     * @return {{actions: {selectPayment: function(*=, *=): *, switchPage: function(*=): *, resetState: function(): *, addPayment: function(*=): *}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                sendEmail: (increment_id, email) => dispatch(OrderAction.sendEmail(increment_id, email)),
            }
        }
    }
}

/**
 * @type {OrderSendEmail}
 */
export default ContainerFactory.get(OrderSendEmailContainer).withRouter(
    ComponentFactory.get(OrderSendEmail)
)