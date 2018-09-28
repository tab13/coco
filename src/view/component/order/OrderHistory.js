import React, {Fragment} from "react";
import CoreComponent from '../../../framework/component/CoreComponent';
import ComponentFactory from '../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../framework/container/CoreContainer';
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import '../../style/css/Order.css';
import OrderList from "./OrderList";
import OrderDetail from "./OrderDetail";
import Scanner from "../checkout/scanner/Scanner";
import OrderTakePayment from "./order-detail/OrderTakePayment";
import OrderAddComment from "./order-detail/OrderAddComment";
import OrderSendEmail from "./order-detail/OrderSendEmail";
import OrderCancel from "./order-detail/OrderCancel";
import OrderCreateCreditmemo from "./order-detail/OrderCreateCreditmemo";
import Reorder from "../on-hold-order/hold-order-detail/Reorder";
import PermissionConstant from "../../constant/PermissionConstant";
import Permission from "../../../helper/Permission";

export class OrderHistory extends CoreComponent {
    static className = 'OrderHistory';
    static acl = PermissionConstant.PERMISSION_MANAGE_ORDER;

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            currentOrder: null,
            scanningBarcode: false,
            barcodeString: '',
            isLoading: true,
            showNoInternet: false,
            showTakePayment: false,
            showAddComment: false,
            showSendEmail: false,
            showCancelOrder: false,
            showCreditmemoOrder: false,
            isReorder: false,
        }
    }

    /**
     * component did update
     * redirect to checkout if user don't have permission manage order
     */
    componentDidUpdate() {
        if (!Permission.isAllowed(PermissionConstant.PERMISSION_MANAGE_ORDER)) {
            this.props.history.replace('/checkout');
        }
    }

    /**
     * open scanner
     */
    openScanner() {
        if (!this.state.scanningBarcode) {
            this.setState({
                scanningBarcode: true,
            });
        }
    }

    /**
     * set isLoading value
     * @param isLoading
     */
    setIsLoading(isLoading) {
        if (this.state.isLoading !== isLoading) {
            this.setState({
                isLoading: isLoading
            });
        }
    }

    /**
     * set showNoInternet value
     * @param showNoInternet
     */
    setShowNoInternet(showNoInternet) {
        if (this.state.showNoInternet !== showNoInternet) {
            this.setState({
                showNoInternet: showNoInternet,
                currentOrder: showNoInternet ? null : this.state.currentOrder
            });
        }
    }

    /**
     * close scanner
     */
    closeScanner() {
        if (this.state.scanningBarcode) {
            this.setState({
                scanningBarcode: false,
            });
        }
    }

    /**
     * clear barcode string
     */
    clearBarcodeString() {
        if (this.state.barcodeString) {
            this.setState({
                barcodeString: ""
            });
        }
    }

    /**
     * Search barcode
     * @param code
     */
    searchBarcode(code) {
        this.setState({
            barcodeString: code,
        });
    }

    /**
     * set current order
     * @param order
     */
    setCurrentOrder(order) {
        if (this.state.currentOrder !== order) {
            this.setState({
                currentOrder: order
            });
        }
    }

    /**
     * open take payment
     */
    openTakePayment() {
        if (!this.state.showTakePayment) {
            this.setState({
                showTakePayment: true
            });
        }
    }

    /**
     * close take payment
     */
    closeTakePayment() {
        if (this.state.showTakePayment) {
            this.setState({
                showTakePayment: false
            });
        }
    }

    /**
     * open add comment
     */
    openAddComment() {
        if (!this.state.showAddComment) {
            this.setState({
                showAddComment: true
            });
        }
    }


    /**
     * close take payment
     */
    closeAddComment() {
        if (this.state.showAddComment) {
            this.setState({
                showAddComment: false
            });
        }
    }

    /**
     * close send email
     */
    closeSendEmail() {
        if (this.state.showSendEmail) {
            this.setState({
                showSendEmail: false
            });
        }
    }

    /**
     * open send email
     */
    openSendEmail() {
        if (!this.state.showSendEmail) {
            this.setState({
                showSendEmail: true
            });
        }
    }

    /**
     * close cancel order
     */
    closeCancelOrder() {
        if (this.state.showCancelOrder) {
            this.setState({
                showCancelOrder: false
            });
        }
    }

    /**
     * open cancel order
     */
    openCancelOrder() {
        if (!this.state.showCancelOrder) {
            this.setState({
                showCancelOrder: true
            });
        }
    }

    /**
     * open creditmemo order
     */
    openCreditmemoOrder(open = true) {
        if ((!this.state.showCreditmemoOrder && open) || (this.state.showCreditmemoOrder && !open)) {
            this.setState({
                showCreditmemoOrder: open
            });
        }
    }

    /**
     * set isReorder value
     * @param isReorder
     */
    setIsReorder(isReorder) {
        if (this.state.isReorder !== isReorder) {
            this.setState({
                isReorder: isReorder
            });
        }
    }

    /**
     * template
     * @returns {*}
     */
    template() {
        return (
            <Fragment>
                <OrderList setCurrentOrder={this.setCurrentOrder.bind(this)}
                           currentOrder={this.state.currentOrder}
                           scanningBarcode={this.state.scanningBarcode}
                           barcodeString={this.state.barcodeString}
                           openScanner={() => this.openScanner()}
                           closeScanner={() => this.closeScanner()}
                           clearBarcodeString={() => this.clearBarcodeString()}
                           setIsLoading={(isLoading) => this.setIsLoading(isLoading)}
                           setShowNoInternet={(showNoInternet) => this.setShowNoInternet(showNoInternet)}/>
                {
                    this.state.scanningBarcode ?
                        <div className="wrapper-order-right">
                            <Scanner searchBarcode={(result) => this.searchBarcode(result)}
                                     closeScanner={() => this.closeScanner()}
                                     clearBarcodeString={() => this.clearBarcodeString()}/>
                        </div>
                        :
                        <OrderDetail order={this.state.currentOrder}
                                     isLoading={this.state.isLoading}
                                     showNoInternet={this.state.showNoInternet}
                                     openTakePayment={() => this.openTakePayment()}
                                     openAddComment={() => this.openAddComment()}
                                     openSendEmail={() => this.openSendEmail()}
                                     openCancelOrder={() => this.openCancelOrder()}
                                     openCreditmemoOrder={() => this.openCreditmemoOrder()}
                                     startReorder={() => this.setIsReorder(true)}/>
                }
                {
                    this.state.showTakePayment ?
                        <OrderTakePayment order={this.state.currentOrder}
                                          closeTakePayment={() => this.closeTakePayment()}/>
                        :
                        null
                }
                {
                    this.state.showAddComment ?
                        <OrderAddComment order={this.state.currentOrder}
                                         showAddCommentOrder={this.state.showAddComment}
                                         closeAddComment={() => this.closeAddComment()}/>
                        :
                        null
                }
                {
                    this.state.showSendEmail ?
                        <OrderSendEmail order={this.state.currentOrder}
                                        showSendEmailOrder={this.state.showSendEmail}
                                        closeSendEmail={() => this.closeSendEmail()}/>
                        :
                        null
                }
                {
                    this.state.showCancelOrder ?
                        <OrderCancel order={this.state.currentOrder}
                                     showCancelOrder={this.state.showCancelOrder}
                                     closeCancelOrder={() => this.closeCancelOrder()}/>
                        :
                        null
                }
                {
                    this.state.showCreditmemoOrder ?
                        <OrderCreateCreditmemo order={this.state.currentOrder}
                                               cancelCreditmemo={() => this.openCreditmemoOrder(false)}/>
                        :
                        null
                }
                {
                    this.state.isReorder ?
                        <Reorder order={this.state.currentOrder}
                                 applyCustomPrice={false}
                                 finishReorder={() => this.setIsReorder(false)}/>
                        :
                        null
                }
            </Fragment>
        );
    }
}

class OrderHistoryContainer extends CoreContainer {
    static className = 'OrderHistoryContainer';
}

export default ContainerFactory.get(OrderHistoryContainer).withRouter(
    ComponentFactory.get(OrderHistory)
);