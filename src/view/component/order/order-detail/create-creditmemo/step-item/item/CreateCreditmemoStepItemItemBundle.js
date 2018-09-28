import React, {Fragment} from 'react';
import CreateCreditmemoStepItemItemAbstractComponent from "../CreateCreditmemoStepItemItemAbstract";
import ComponentFactory from "../../../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../../../../framework/container/CoreContainer";
import OrderItemService from "../../../../../../../service/sales/order/OrderItemService";
import ItemSimpleComponent from "./CreateCreditmemoStepItemItemSimple";

class CreateCreditmemoStepItemItemBundleComponent extends CreateCreditmemoStepItemItemAbstractComponent {
    static className = 'CreateCreditmemoStepItemItemBundleComponent';

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        let orderItem = props.order_item;
        let order = props.order;
        this.state = {
            is_children_calculated: OrderItemService.isChildrenCalculated(orderItem, order),
            order_child_items: OrderItemService.getChildrenItems(orderItem, order)
        }
    }

    /**
     * template to render
     * @returns {*}
     */
    template() {
        let colSpan = 9;
        if (!this.props.can_show_return_stock_column && !this.props.can_show_fpt_column) {
            colSpan = 7;
        } else if (!this.props.can_show_return_stock_column || !this.props.can_show_fpt_column) {
            colSpan = 8;
        }
        return (
            <Fragment>
                {
                    this.state.is_children_calculated ?
                        <tr>
                            <td className="t-col">&nbsp;</td>
                            <td className="t-product" colSpan={colSpan}>
                                <p className="title">{this.props.order_item.name}</p>
                                <p className="sku">[{this.props.order_item.sku}]</p>
                            </td>
                            <td className="t-col">&nbsp;</td>
                        </tr> :
                        (
                            <ItemSimpleComponent order={this.props.order}
                                                 order_item={this.props.order_item}
                                                 creditmemo={this.props.creditmemo}
                                                 creditmemo_items_param={this.props.creditmemo_items_param}
                                                 can_show_return_stock_column={this.props.can_show_return_stock_column}
                                                 can_show_fpt_column={this.props.can_show_fpt_column}
                                                 updateCreditmemoItemParam={this.props.updateCreditmemoItemParam}
                                                 showNumPad={this.props.showNumPad}/>

                        )
                }
                {
                    this.state.is_children_calculated ?
                        this.state.order_child_items.map(item => {
                            return <ItemSimpleComponent key={item.item_id}
                                                        hide_border_top={true}
                                                        order={this.props.order}
                                                        order_item={item}
                                                        creditmemo={this.props.creditmemo}
                                                        creditmemo_items_param={this.props.creditmemo_items_param}
                                                        can_show_return_stock_column={this.props.can_show_return_stock_column}
                                                        can_show_fpt_column={this.props.can_show_fpt_column}
                                                        updateCreditmemoItemParam={this.props.updateCreditmemoItemParam}
                                                        showNumPad={this.props.showNumPad}/>
                        }) :
                        <tr>
                            <td className="t-col">&nbsp;</td>
                            <td className="t-product t-bundle-product" colSpan="5">
                                {
                                    this.state.order_child_items.map(item => {
                                        return <p key={item.item_id} className="title"
                                                  dangerouslySetInnerHTML={
                                                      {
                                                          __html: item.qty_ordered.toString().concat(
                                                              " x ", item.name, " ", "[", item.sku, "]"
                                                          )
                                                      }
                                                  }
                                        />
                                    })
                                }
                            </td>
                            <td className="t-col">&nbsp;</td>
                        </tr>
                }
            </Fragment>
        )
    }
}

class CreateCreditmemoStepItemItemBundleContainer extends CoreContainer {
    static className = 'CreateCreditmemoStepItemItemBundleContainer';

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
 * @type {CreateCreditmemoStepItemItemBundleContainer}
 */
export default ContainerFactory.get(CreateCreditmemoStepItemItemBundleContainer).withRouter(
    ComponentFactory.get(CreateCreditmemoStepItemItemBundleComponent)
)