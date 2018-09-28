import React, {Fragment} from 'react';
import {toast} from "react-toastify";
import SmoothScrollbar from "smooth-scrollbar/index";
import CoreComponent from "../../../../../framework/component/CoreComponent";
import CoreContainer from "../../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import CreditmemoItemService from "../../../../../helper/OrderHelper";
import ConfigHelper from "../../../../../helper/ConfigHelper";
import CreditmemoAction from "../../../../action/order/CreditmemoAction";
import CustomerService from "../../../../../service/customer/CustomerService";
import OrderAction from "../../../../action/OrderAction";
import {RewardPointHelper} from "../../../../../helper/RewardPointHelper";
import {isMobile} from "react-device-detect";

class CreateCreditmemoStepSuccessComponent extends CoreComponent {
    static className = 'CreateCreditmemoStepSuccessComponent';
    regexEmail  = ConfigHelper.regexEmail;
    inputSendEmail;
    inputCreateAccount;
    setStepSuccessElement = element => {
        this.step_success = element;
        if (!this.scrollbar && this.step_success) {
            this.scrollbar = SmoothScrollbar.init(this.step_success);
        }
    };

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        let {order} = props.creditmemo;
        let isCustomer = order.customer_email && order.customer_id && !order.customer_is_guest;
        this.state = {
            validateSendEmail: true,
            isEnableCreateAccount: false,
            validateCreateAccount: true,
            isMergeAccount: false,
            isLoadingCheckAccount: false,
            isFinishCreateAccount: false,
            isCustomer: isCustomer,
            defaultEmail: isCustomer ? order.customer_email : '',
            isEnableSendEmail : isCustomer,
            printBtnClassName: 'btn btn-cannel',
            creditmemo: props.creditmemo
        }
    }

    componentWillUnmount() {
        this.props.actions.clearCreditmemo();
    }

    /**
     * componentWillReceiveProps state merge customer to order
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        let {order_creditmemo_create_account, creditmemo} = nextProps;
        if (!creditmemo.order.customer_id &&
            creditmemo.order.increment_id === order_creditmemo_create_account.increment_id
        ) {
            this.mergeCustomerToOrder(creditmemo.order, order_creditmemo_create_account);
            this.setState({creditmemo: creditmemo});
        }
    }

    /**
     * merge customer to order
     * @param current_order
     * @param order_creditmemo_create_account
     * @returns {*}
     */
    mergeCustomerToOrder(current_order, order_creditmemo_create_account) {
        current_order.customer_id = order_creditmemo_create_account.customer_id;
        current_order.customer_firstname = order_creditmemo_create_account.customer_firstname;
        current_order.customer_lastname = order_creditmemo_create_account.customer_lastname;
        current_order.customer_email = order_creditmemo_create_account.customer_email;
        current_order.customer_is_guest = 0;
        current_order.customer_group_id = order_creditmemo_create_account.customer_group_id;
        return current_order;
    }

    /**
     * set input send email
     * @param input
     */
    setInputSendEmail(input) {
        this.inputSendEmail = input;
    }

    /**
     * set input create account
     * @param input
     */
    setInputCreateAccount(input) {
        this.inputCreateAccount = input;
    }

    /**
     * on change input send email
     */
    onChangeSendEmail() {
        this.setState({
            isEnableSendEmail: this.inputSendEmail.value.length,
            validateSendEmail: true
        });
    }

    /**
     * onclick send email
     */
    onClickSendEmail() {
        let email = this.inputSendEmail.value;
        if (!email) {
            return;
        }
        if (!this.regexEmail.test(email)) {
            this.setState({validateSendEmail: false});
            return;
        }
        let {order, creditmemo} = this.props;
        this.props.actions.sendEmailCreditmemo(order.increment_id, email, creditmemo.increment_id);
        toast.success (
            this.props.t('A refund notification email has been saved in queue to send.'),
            {
                position: toast.POSITION.BOTTOM_CENTER,
                className: 'wrapper-messages messages-success'
            }
        );
    }

    /**
     * on change input create account
     */
    onChangeCreateAccount() {
        this.setState({
            isEnableCreateAccount: this.inputCreateAccount.value.length,
            validateCreateAccount: true,
            isMergeAccount: false
        });
    }

    /**
     * onclick create account
     */
    onClickCreateAccount() {
        let email = this.inputCreateAccount.value;
        if (!email) {
            return;
        }
        if (!this.regexEmail.test(email)) {
            this.setState({validateCreateAccount: false});
            return;
        }
        let order = this.props.order;
        let {isMergeAccount} = this.state;
        if (isMergeAccount) {
            this.props.actions.creditmemoCreateCustomer(order, email, false);
            toast.success (
                this.props.t('The order and credit memo have been merged to this account successfully.'),
                {
                    position: toast.POSITION.BOTTOM_CENTER,
                    className: 'wrapper-messages messages-success'
                }
            );
            this.setState({isFinishCreateAccount: true});
        } else {
            this.checkEmailExist(order, email);
        }
    }

    /**
     * check email exist
     * @param order
     * @param email
     */
    checkEmailExist(order, email) {
        this.setState({isLoadingCheckAccount: true});
        CustomerService.checkEmail(email).then(result => {
            this.setState({isLoadingCheckAccount: false});
            if (!result) {
                this.setState({isMergeAccount: true});
                return;
            } else {
                this.props.actions.creditmemoCreateCustomer(order, email, true);
                toast.success (
                    this.props.t('A customer account has been created successfully.'),
                    {
                        position: toast.POSITION.BOTTOM_CENTER,
                        className: 'wrapper-messages messages-success'
                    }
                );
                this.setState({isFinishCreateAccount: true});
            }
        });
    }

    /**
     * return to order
     */
    returnToOrder() {
        this.props.cancelCreditmemo();
    }

    /**
     * handle click print
     */
    async handleClickPrint(creditmemo) {
        if (isMobile) {
            return;
        }
        const isEnableStoreCredit  = ConfigHelper.isEnableStoreCredit();
        const isEnabledRewardPoint = RewardPointHelper.isEnabledRewardPoint();
        const needLoadCustomer = !creditmemo.order.customer_is_guest && (isEnabledRewardPoint || isEnableStoreCredit);
        if (!needLoadCustomer) {
            this.props.actions.printCreditmemo(creditmemo, null, null);
        } else {
            try {
                this.setState({
                    printBtnClassName: 'btn btn-cannel loader'
                });
                let customer = await CustomerService.getById(creditmemo.order.customer_id);
                this.setState({
                    printBtnClassName: 'btn btn-cannel'
                });
                this.props.actions.printCreditmemo(
                    creditmemo,
                    isEnableStoreCredit ? customer.credit_balance : null,
                    isEnabledRewardPoint ? customer.point_balance : null
                )
            }
            catch (e) {
                this.props.actions.printCreditmemo(creditmemo, null, null);
            }
        }
    }

    template() {
        let {isEnableSendEmail, validateSendEmail,
            isEnableCreateAccount, validateCreateAccount,
            isMergeAccount, isLoadingCheckAccount,
            isFinishCreateAccount, isCustomer,
            defaultEmail, creditmemo} = this.state;
        let classSendEmail = isEnableSendEmail ? 'btn btn-default' : 'btn btn-default disabled';
        let classCreateAccount = isEnableCreateAccount ? 'btn btn-default' : 'btn btn-default disabled';
        classCreateAccount = isLoadingCheckAccount ? 'btn btn-default loader' : classCreateAccount;
        classCreateAccount = isFinishCreateAccount ? 'btn btn-default disabled' : classCreateAccount;
        let classDisableCreateAccount = !!(isLoadingCheckAccount || isFinishCreateAccount);
        let classValidateSendEmail = validateSendEmail ? 'hidden' : 'validation-text';
        let classValidateCreateAccount = validateCreateAccount ? 'hidden' : 'validation-text';
        let classMergeAccount = isMergeAccount ? 'validation-text' : 'hidden';
        return (
            <Fragment>
                <div className="block-content" data-scrollbar ref={this.setStepSuccessElement}>
                    <div className="block-refund-success">
                        <div className="icon"></div>
                        <p>{this.props.t('Order {{id}} has been refunded', {id: this.props.order.increment_id}) + " "}
                        <br/> {this.props.t('{{price}} successfully.',
                                {price: CreditmemoItemService.formatPrice(
                                        this.props.creditmemo.grand_total, this.props.creditmemo
                                    )
                                }
                              )}</p>
                        <div className="box-email">
                            <div className="form-group">
                                <label>{this.props.t('Send Email')}</label>
                                <div className="control">
                                    <input type="text"
                                           ref={this.setInputSendEmail.bind(this)}
                                           name=""
                                           defaultValue={defaultEmail}
                                           className="form-control"
                                           placeholder={
                                               this.props.t('Enter customer\'s email address, e.g. johndoe@domain.com.')
                                           }
                                           onChange={() => this.onChangeSendEmail()}/>
                                    <button className={classSendEmail}
                                            type="button"
                                            onClick={() => this.onClickSendEmail()}>
                                        {this.props.t('Send')}
                                    </button>
                                </div>
                                <div className={classValidateSendEmail}>
                                    {this.props.t('Please enter a valid email address. For example johndoe@domain.com.')}
                                </div>
                            </div>
                            <div className={isCustomer ? "hidden" :  "form-group"}>
                                <label>{this.props.t('Create Customer Account')}</label>
                                <div className="note">
                                    {this.props.t(
                                        'Order and credit memo will be added to this account after being created.'
                                       )
                                    }
                                </div>
                                <div className="control">
                                    <input type="text"
                                           ref={this.setInputCreateAccount.bind(this)}
                                           name=""
                                           className="form-control"
                                           placeholder={
                                               this.props.t('Enter customer\'s email address, e.g. johndoe@domain.com.')
                                           }
                                            onChange={() => this.onChangeCreateAccount()}/>
                                    <button className={classCreateAccount}
                                            type="button"
                                            disabled={classDisableCreateAccount}
                                            onClick={() => this.onClickCreateAccount()}>
                                        {isMergeAccount ? this.props.t('Merge') : this.props.t('Create')}
                                    </button>
                                    <div className={classValidateCreateAccount}>
                                        {this.props.t(
                                            'Please enter a valid email address. For example johndoe@domain.com.'
                                           )
                                        }
                                    </div>
                                    <div className={classMergeAccount}>
                                        {this.props.t(
                                            'There is already an account with this email address. You can merge all ' +
                                            'transactions related to this order to that account.'
                                           )
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="block-bottom">
                    <div className="actions-accept">
                        <button className="btn btn-cannel " type="button" onClick={() => this.returnToOrder()}>
                            {this.props.t('Return to Order')}
                        </button>
                        <button className={isMobile ? "hidden" : this.state.printBtnClassName} type="button"
                                onClick={() => this.handleClickPrint(creditmemo)}>Print Receipt</button>
                    </div>
                </div>
            </Fragment>
        )
    }
}

class CreateCreditmemoStepSuccessContainer extends CoreContainer {
    static className = 'CreateCreditmemoStepSuccessContainer';

    /**
     * Map state to props
     * @param state
     * @returns {{quote: *}}
     */
    static mapState(state) {
        let {order_creditmemo_create_account} = state.core.order.creditmemo;
        return {order_creditmemo_create_account: order_creditmemo_create_account};
    }

    /**
     * map to dispatch
     * @param dispatch
     * @returns {{actions: {
     * sendEmailCreditmemo: (function(*=, *=): *),
     * creditmemoCreateCustomer: (function(*=, *=, *=): *)}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                sendEmailCreditmemo: (increment_id, email, creditmemo_increment_id) => dispatch(
                    CreditmemoAction.sendEmailCreditmemo(increment_id, email, creditmemo_increment_id)
                ),
                creditmemoCreateCustomer: (order, email, isNewAccount) => dispatch(
                    CreditmemoAction.creditmemoCreateCustomer(order, email, isNewAccount)
                ),
                printCreditmemo: (creditmemo, credit_balance, point_balance) => dispatch(
                    OrderAction.printCreditmemo(creditmemo, credit_balance, point_balance)
                ),
                clearCreditmemo: () => dispatch(CreditmemoAction.clearCreditmemo())
            }
        }
    }
}

/**
 * @type {CreateCreditmemoStepSuccessContainer}
 */
export default ContainerFactory.get(CreateCreditmemoStepSuccessContainer).withRouter(
    ComponentFactory.get(CreateCreditmemoStepSuccessComponent)
)