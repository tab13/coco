import {CoreComponent} from "../../../../../../framework/component/index";
import NumberHelper from "../../../../../../helper/NumberHelper";

export default class CreateCreditmemoStepItemItemAbstractComponent extends CoreComponent {

    /**
     * Decrease qty
     *
     * @param creditmemoItemParam
     */
    decreaseQty(creditmemoItemParam) {
        let qty = NumberHelper.minusNumber(creditmemoItemParam.qty, 1);
        this.props.updateCreditmemoItemParam(creditmemoItemParam, {qty: qty}, true);
    }

    /**
     * Increase qty
     *
     * @param creditmemoItemParam
     */
    increaseQty(creditmemoItemParam) {
        let qty = NumberHelper.addNumber(creditmemoItemParam.qty, 1);
        this.props.updateCreditmemoItemParam(creditmemoItemParam, {qty: qty}, true);
    }

    /**
     * Change back to stock of item
     *
     * @param creditmemoItemParam
     * @param isBackToStock
     */
    changeBackToStock(creditmemoItemParam, isBackToStock = true) {
        this.props.updateCreditmemoItemParam(creditmemoItemParam, {back_to_stock: isBackToStock});
    }
}