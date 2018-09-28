import React, {Fragment} from "react";
import ComponentFactory from '../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import AbstractGrid from "../../../../framework/component/grid/AbstractGrid";
import Bambora from "./payments/Bambora";
import Tyro from "./payments/Tyro";
import PaymentConstant from "../../../constant/settings/PaymentConstant";
import SmoothScrollbar from "smooth-scrollbar/index";
import BamboraPaymentService from "../../../../service/payment/type/BamboraPaymentService";
import TyroPaymentService from "../../../../service/payment/type/TyroPaymentService";

export class PaymentDetail extends AbstractGrid {
    static className                  = 'PaymentDetail';
           setBlockPaymentListElement = element => this.payment_list = element;

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            openChild   : false,
            currentChild: ""
        }
    }

    items = [
        /* {
         "id": "Paypal",
         "title": PaymentConstant.GET_PAYMENT_PAYPAL,
         "name" : "Paypal",
         "component": "",
         },*/
        {
            "id"       : "Bambora",
            "title"    : PaymentConstant.GET_PAYMENT_BAMBORA,
            "name"     : "Bambora",
            "component": Bambora,
            "visible"  : BamboraPaymentService.isEnable()
        },
        {
            "id"       : "Tyro",
            "title"    : PaymentConstant.GET_PAYMENT_TYRO,
            "name"     : "Tyro",
            "component": Tyro,
            "visible"  : TyroPaymentService.isEnable()
        },
    ];

    /**
     * open child detail of payment setting
     * @param childName
     */
    openChild(childName) {
        this.setState({
            openChild   : true,
            currentChild: childName
        });
    }

    /**
     * close child back
     */
    closeChild() {
        this.setState({
            openChild   : false,
            currentChild: ""
        });
    }

    /**
     * Init smooth scrollbar
     */
    componentDidMount() {
        if (!this.scrollbar && this.payment_list) {
            this.scrollbar = SmoothScrollbar.init(this.payment_list)
        }
    }

    /**
     * Destroy smooth scrollbar when unmount component
     */
    componentWillUnmount() {
        SmoothScrollbar.destroy(this.payment_list);
        this.scrollbar = null;
    }

    /**
     * Destroy smooth scrollbar and create scroll bar
     */
    componentDidUpdate() {
        SmoothScrollbar.destroy(this.payment_list);
        this.scrollbar = null;
        if (!this.scrollbar && this.payment_list) {
            this.scrollbar = SmoothScrollbar.init(this.payment_list)
        }
    }

    /**
     * template
     * @returns {*}
     */
    template() {
        let parents = (
            <div className="settings-right">
                <div className="block-title">
                    <strong className="title"></strong>
                </div>
                <div className="block-content" ref={this.setBlockPaymentListElement}>
                    <ul className="list-lv0">
                        {
                            this.items.map(item => {
                                return (
                                    item.visible === false ?
                                        "" :
                                        <li key={item.id}
                                            onClick={() => this.openChild(item.title)}>
                                            <a>{item.name}</a>
                                        </li>
                                )
                            })
                        }
                    </ul>
                </div>
            </div>
        );
        return (
            <Fragment>
                {this.state.openChild ? "" : parents}
                {
                    this.items.map(item => {
                        let Element = item.component;
                        return (this.state.currentChild === item.title) &&
                            (Element !== "") &&
                            <Element key={item.id} closeChild={() => this.closeChild()}/>
                    })
                }

            </Fragment>
        )
    }
}

class PaymentDetailContainer extends CoreContainer {
    static className = 'PaymentDetailContainer';

    /**
     * map state to component's props
     * @param state
     * @return {{}}
     */
    static mapState(state) {
        return {};
    }

    /**
     * map actions to component's props
     * @param dispatch
     * @return {{actions: }}
     */
    static mapDispatch(dispatch) {
        return {}
    }
}

/**
 * @type {Setting}
 */
export default ContainerFactory.get(PaymentDetailContainer).withRouter(
    ComponentFactory.get(PaymentDetail)
);