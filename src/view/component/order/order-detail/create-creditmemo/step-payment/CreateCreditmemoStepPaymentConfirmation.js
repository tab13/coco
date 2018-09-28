import React, {Fragment} from 'react';
import {CoreComponent} from "../../../../../../framework/component/index";
import CoreContainer from "../../../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../../framework/factory/ContainerFactory";
import OrderHelper from "../../../../../../helper/OrderHelper";
import CreateCreditmemoConstant from "../../../../../constant/order/creditmemo/CreateCreditmemoConstant";

class CreateCreditmemoStepPaymentConfirmationComponent extends CoreComponent {
    static className = 'CreateCreditmemoStepPaymentConfirmationComponent';

    /**
     * Set comment text
     * @param event
     */
    setCommentText(event) {
        let value = event.target.value;
        let realValue = OrderHelper.stripHtmlTags(value);
        if (value !== realValue) {
            event.target.value = realValue;
        }
        this.props.setCommentText(realValue)
    }

    /**
     * template to render
     * @returns {*}
     */
    template() {
        let payment_confirm_step = this.props.payment_confirm_step,
            isConfirmationStep = payment_confirm_step === CreateCreditmemoConstant.PAYMENT_CONFIRM_STEP_CONFIRMATION;
        return (
            <Fragment>
                <div className={"modal fade in popup-messages" + (isConfirmationStep ? " popup-messages-refund" : "")}
                     style={{display: 'block'}}>
                    <div className={"modal-dialog " + (isConfirmationStep ? "modal-md" : "modal-sm")}>
                        <div className="modal-content">
                            {
                                isConfirmationStep ?
                                    <div className="modal-header">
                                        <h3 className="title">{this.props.t('Refund Confirmation')}</h3>
                                    </div> :
                                    null
                            }
                            {
                                isConfirmationStep ?
                                    <div className="modal-body">
                                        <p>{this.props.t('Are you sure you want to process this refund?')}</p>
                                        <textarea className="form-control refund-confirmation-text"
                                                  placeholder={this.props.t('Reason to refund (Optional)')}
                                                  defaultValue={this.props.comment_text}
                                                  onChange={event => this.setCommentText(event)}>
                                        </textarea>
                                    </div> :
                                    <div className="modal-body">
                                        <h3 className="title">{this.props.t('Refund Confirmation')}</h3>
                                        <p>
                                            {
                                                this.props.getRemaining() === this.props.creditmemo.grand_total ?
                                                    this.props.t(
                                                        'No payment allocation for the refund has been made yet. ' +
                                                        'Are you sure that you want to continue?'
                                                    ) :
                                                    this.props.t(
                                                        'You haven’t allocated {{amount}} to any refund payment ' +
                                                        'method yet. Are you sure that you want to continue?',
                                                        {
                                                            amount: OrderHelper.formatPrice(
                                                                this.props.getRemaining(),
                                                                this.props.order
                                                            )
                                                        }
                                                    )


                                            }
                                        </p>
                                    </div>
                            }
                            <div className="modal-footer actions-2column">
                                <div className="modal-footer actions-2column">
                                    <a className="close-modal"
                                       onClick={() => this.props.cancelPopup()}>{this.props.t("No")}</a>
                                    <a className="close-modal"
                                       onClick={() => this.props.nextStep()}>{this.props.t("Yes")}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop fade in popover-backdrop"/>
            </Fragment>
        );
    }
}

class CreateCreditmemoStepPaymentConfirmationContainer extends CoreContainer {
    static className = 'CreateCreditmemoStepPaymentConfirmationContainer';
}

/**
 * @type {CreateCreditmemoStepPaymentConfirmationContainer}
 */
export default ContainerFactory.get(CreateCreditmemoStepPaymentConfirmationContainer).withRouter(
    ComponentFactory.get(CreateCreditmemoStepPaymentConfirmationComponent)
)