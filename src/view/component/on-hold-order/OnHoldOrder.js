import React, {Fragment} from "react";
import CoreComponent from '../../../framework/component/CoreComponent';
import ComponentFactory from '../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../framework/container/CoreContainer';
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import '../../style/css/Order.css';
import Scanner from "../checkout/scanner/Scanner";
import HoldOrderList from "./HoldOrderList";
import HoldOrderDetail from "./HoldOrderDetail";
import Reorder from "./hold-order-detail/Reorder";

export class OnHoldOrder extends CoreComponent {
    static className = 'OnHoldOrder';

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
            showTakePayment: false,
            isReorder: false
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
        if(this.state.isLoading !== isLoading) {
            this.setState({
                isLoading: isLoading
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
     * delete current order
     */
    deleteCurrentOrder() {
        this.setState({
            currentOrder: null
        });
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
                <HoldOrderList setCurrentOrder={this.setCurrentOrder.bind(this)}
                               currentOrder={this.state.currentOrder}
                               scanningBarcode={this.state.scanningBarcode}
                               barcodeString={this.state.barcodeString}
                               openScanner={() => this.openScanner()}
                               closeScanner={() => this.closeScanner()}
                               clearBarcodeString={() => this.clearBarcodeString()}
                               setIsLoading={(isLoading) => this.setIsLoading(isLoading)}/>
                {
                    this.state.scanningBarcode ?
                        <div className="wrapper-order-right">
                            <Scanner searchBarcode={(result) => this.searchBarcode(result)}
                                     closeScanner={() => this.closeScanner()}
                                     clearBarcodeString={() => this.clearBarcodeString()}/>
                        </div>
                        :
                        <HoldOrderDetail order={this.state.currentOrder}
                                         isLoading={this.state.isLoading}
                                         deleteCurrentOrder={() => this.deleteCurrentOrder()}
                                         startReorder={() => this.setIsReorder(true)}/>
                }
                {
                    this.state.isReorder ?
                        <Reorder order={this.state.currentOrder}
                                 applyCustomPrice={true}
                                 finishReorder={() => this.setIsReorder(false)}/>
                        :
                        null
                }
            </Fragment>
        )
    }
}

class OnHoldOrderContainer extends CoreContainer {
    static className = 'OnHoldOrderContainer';

    static mapState(state) {
        return {};
    }

    static mapDispatch(dispatch) {
        return {
            actions: {

            }
        }
    }
}

/**
 * @type {OnHoldOrder}
 */
export default ContainerFactory.get(OnHoldOrderContainer).withRouter(
    ComponentFactory.get(OnHoldOrder)
);