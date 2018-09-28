import React, {Fragment} from 'react';
import {CoreComponent} from "../../../../../framework/component/index";
import CoreContainer from "../../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import AdjustmentsComponent from "./step-adjustment/CreateCreditmemoStepAdjustmentAdjustments";
import AdjustPointComponent from "./step-adjustment/CreateCreditmemoStepAdjustPointAdjustments";
import TotalsComponent from "./step-adjustment/CreateCreditmemoStepAdjustmentTotals";
import SmoothScrollbar from "smooth-scrollbar/index";
import CreditmemoService from "../../../../../service/sales/order/CreditmemoService";

class CreateCreditmemoStepAdjustmentComponent extends CoreComponent {
    static className = 'CreateCreditmemoStepAdjustmentComponent';

    setBlockContentElement = element => {
        if (this.scrollbar) {
            SmoothScrollbar.destroy(this.scrollbar);
        }
        if (element) {
            this.blockContentElement = element;
            this.scrollbar = SmoothScrollbar.init(this.blockContentElement);
        }
    };

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {};
        this.props.setCreditmemo();
    }

    nextStep() {
        let creditmemo = this.props.creditmemo;
        CreditmemoService.validate(creditmemo);
        if(creditmemo.isValidated) {
            this.props.changeStep()
        } else {
            this.props.resetAdjustments(this.props.setCreditmemo)
        }
    }

    /**
     * template to render
     * @returns {*}
     */
    template() {
        const {order} = this.props;
        return (
            <Fragment>
                <div className="block-content" ref={this.setBlockContentElement}>
                    <div className="block-refund-adjustments">
                        <AdjustmentsComponent order={this.props.order}
                                              creditmemo={this.props.creditmemo}
                                              adjustments={this.props.adjustments}
                                              max_allowed_shipping_refund={this.props.max_allowed_shipping_refund}
                                              changeAdjustment={this.props.changeAdjustment}
                                              setCreditmemo={this.props.setCreditmemo}
                                              getCreditmemo={this.props.getCreditmemo}
                        />
                    </div>
                    {
                        (order.rewardpoints_spent || order.rewardpoints_earn )
                            ? <div className="block-refund-point">
                                <AdjustPointComponent order={this.props.order}
                                                      creditmemo={this.props.creditmemo}
                                                      adjustments={this.props.adjustments}
                                                      changeAdjustment={this.props.changeAdjustment}
                                                      setCreditmemo={this.props.setCreditmemo}
                                                      getCreditmemo={this.props.getCreditmemo}
                                />
                            </div>
                            : ''
                    }
                    <div className="block-refund-totals">
                        <TotalsComponent order={this.props.order}
                                         creditmemo={this.props.creditmemo}
                                         max_allowed_shipping_refund={this.props.max_allowed_shipping_refund}
                        />
                    </div>
                </div>


                <div className="block-bottom">
                    <div className="actions-accept">
                        <button className="btn btn-cannel" type="button"
                                onClick={() => this.props.changeStep(false)}>
                            {this.props.t('Back')}
                        </button>
                        <button className="btn btn-default " type="button"
                                onClick={() => this.nextStep()}>
                            {this.props.t('Next')}
                        </button>
                    </div>
                </div>
            </Fragment>
        );
    }
}

class CreateCreditmemoStepAdjustmentContainer extends CoreContainer {
    static className = 'CreateCreditmemoStepAdjustmentContainer';

    /**
     * Map state to props
     * @param state
     * @returns {{quote: *}}
     */
    static mapState(state) {
        return {};
    }

    /**
     * Map dispatch to props
     *
     * @param dispatch
     * @return {{actions: {selectPayment: function(*=, *=): *, switchPage: function(*=): *, resetState: function(): *, addPayment: function(*=): *}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {}
        }
    }
}

/**
 * @type {CreateCreditmemoStepAdjustmentContainer}
 */
export default ContainerFactory.get(CreateCreditmemoStepAdjustmentContainer).withRouter(
    ComponentFactory.get(CreateCreditmemoStepAdjustmentComponent)
)