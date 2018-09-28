import {InvoiceAbstractTotalService} from "./AbstractTotalService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import NumberHelper from "../../../../../helper/NumberHelper";
import OrderItemService from "../../OrderItemService";

export class InvoiceCostService extends InvoiceAbstractTotalService {
    static className = 'InvoiceCostService';

    /**
     * Collect invoice cost
     *
     * @param invoice
     * @return {InvoiceCostService}
     */
    collect(invoice) {
        let baseInvoiceTotalCost = 0;
        if (invoice.items && invoice.items.length) {
            invoice.items.forEach(item => {
                if (!OrderItemService.getHasChildren(item, invoice.order)) {
                    baseInvoiceTotalCost = NumberHelper.addNumber(
                        baseInvoiceTotalCost, NumberHelper.multipleNumber(item.base_cost, item.qty)
                    );
                }
            });
        }
        invoice.base_cost = baseInvoiceTotalCost;
        return this;
    }
}

/** @type InvoiceCostService */
let invoiceCostService = ServiceFactory.get(InvoiceCostService);

export default invoiceCostService;