import React, {Fragment} from 'react';
import {CoreComponent} from "../../../../framework/component/index";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import {Modal} from "react-bootstrap";

import OnHoldOrderService from "../../../../service/sales/OnHoldOrderService";
import StatusConstant from "../../../constant/order/StatusConstant";

class Reorder extends CoreComponent {
    static className = 'Reorder';

    products = [];

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            showConfirmPopup: false
        }
    }

    /**
     * component will mount
     */
    componentWillMount() {
        this.handleReorder();
    }

    /**
     * handle reorder
     */
    async handleReorder() {
        let {order} = this.props;
        this.products = await OnHoldOrderService.checkProducts(order);
        if (OnHoldOrderService.isCheckoutAble(this.products)) {
            await this.reorder();
        } else {
            this.showConfirmPopup();
        }
    }

    /**
     * checkout order
     */
    async reorder() {
        this.props.finishReorder();
        await OnHoldOrderService.reorder(this.props.order, this.products, this.props.history, this.props.applyCustomPrice);
    }

    /**
     * show confirm popup
     */
    showConfirmPopup() {
        this.setState({
            showConfirmPopup: true
        });
    }

    /**
     * close confirm popup
     */
    closeConfirmPopup() {
        this.setState({
            showConfirmPopup: false,
        });
        this.props.finishReorder();
    }


    /**
     * template to render
     * @returns {*}
     */
    template() {
        let {order} = this.props;
        return (
            <Fragment>
                <div>
                    <Modal
                        className={"popup-messages"}
                        dialogClassName={"modal-md"}
                        show={this.state.showConfirmPopup} onHide={() => this.closeConfirmPopup()}>
                        <Modal.Body>
                            <h3 className="title">{this.props.t('Confirmation')}</h3>
                            <p className={"text-left"}>
                                {this.props.t("Some product(s) could not be added to cart :")}
                            </p>
                            {
                                this.products.map(item => {
                                    if (!item.canAdd) {
                                        return <p key={item.itemData.sku}
                                                  className={"text-left"}>- {item.itemData.name}</p>
                                    }
                                    return null;
                                })
                            }
                            <p className={"text-left"}>
                                {
                                    order && order.state === StatusConstant.STATE_HOLDED ?
                                        this.props.t("Are you sure want to check out this on-hold order ?")
                                        :
                                        this.props.t("Are you sure want to re-order ?")
                                }
                            </p>
                        </Modal.Body>
                        <Modal.Footer className={"modal-footer actions-2column"}>
                            <a onClick={() => this.closeConfirmPopup()}>{this.props.t('No')}</a>
                            <a onClick={() => this.reorder()}>{this.props.t('Yes')}</a>
                        </Modal.Footer>
                    </Modal>
                </div>
            </Fragment>
        );
    }
}

class ReorderContainer extends CoreContainer {
    static className = 'ReorderContainer';

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
     * @param dispatch
     * @return {{actions: {}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {}
        }
    }
}

/**
 * @type {Reorder}
 */
export default ContainerFactory.get(ReorderContainer).withRouter(
    ComponentFactory.get(Reorder)
)