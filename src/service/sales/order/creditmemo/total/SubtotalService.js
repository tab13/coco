import {CreditmemoAbstractTotalService} from "./AbstractTotalService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import NumberHelper from "../../../../../helper/NumberHelper";
import OrderItemService from "../../OrderItemService";
import CreditmemoItemService from "../CreditmemoItemService";

export class CreditmemoSubtotalService extends CreditmemoAbstractTotalService {
    static className = 'CreditmemoSubtotalService';

    /**
     * Collect credit memo subtotal
     *
     * @param creditmemo
     * @return {CreditmemoSubtotalService}
     */
    collect(creditmemo) {
        let subTotal = 0,
            baseSubtotal = 0,
            subtotalInclTax = 0,
            baseSubtotalInclTax = 0;
        creditmemo.items.forEach(item => {
            if (OrderItemService.isDummy(item.order_item, creditmemo.order)) {
                return false;
            }

            CreditmemoItemService.calcRowTotal(item, creditmemo);

            subTotal = NumberHelper.addNumber(subTotal, item.row_total);
            baseSubtotal = NumberHelper.addNumber(baseSubtotal, item.base_row_total);
            subtotalInclTax = NumberHelper.addNumber(subtotalInclTax, item.row_total_incl_tax);
            baseSubtotalInclTax = NumberHelper.addNumber(baseSubtotalInclTax, item.base_row_total_incl_tax);
        });
        creditmemo.subtotal = subTotal;
        creditmemo.base_subtotal = baseSubtotal;
        creditmemo.subtotal_incl_tax = subtotalInclTax;
        creditmemo.base_subtotal_incl_tax = baseSubtotalInclTax;
        creditmemo.grand_total = NumberHelper.addNumber(creditmemo.grand_total, subTotal);
        creditmemo.base_grand_total = NumberHelper.addNumber(creditmemo.base_grand_total, baseSubtotal);
        return this;
    }
}

/** @type CreditmemoSubtotalService */
let creditmemoSubtotalService = ServiceFactory.get(CreditmemoSubtotalService);

export default creditmemoSubtotalService;