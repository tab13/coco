import CoreContainer from "../../../framework/container/CoreContainer";
import ComponentFactory from "../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import PrintComponent from "./PrintComponent";
import PrintAction from "../../action/PrintAction";

class PrintContainer extends CoreContainer {
    static className = 'PrintContainer';

    /**
     *  map state to props of component
     *
     * @param {Object} state
     * @return {{reportData, orderData, order, report, isReprint, creditBalance, pointBalance, quote, creditmemo}}
     */
    static mapState(state) {
        const {reportData, orderData, order, report, isReprint, creditBalance, pointBalance, quote, creditmemo} = state.core.print;
        return {
            reportData,
            orderData,
            order,
            report,
            isReprint,
            creditBalance,
            quote,
            creditmemo,
            pointBalance,
        }
    }

    /**
     * Map actions
     *
     * @param dispatch
     * @returns {{finishPrint: function(): *}}
     */
    static mapDispatch(dispatch) {
        return {
            finishPrint: () => dispatch(PrintAction.finishPrint())
        }
    }
}

const container = ContainerFactory.get(PrintContainer);
export default container.withRouter(ComponentFactory.get(PrintComponent))



