import CoreService from "../../../../CoreService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import InvoiceItemService from "../InvoiceItemService";

export class InvoiceAbstractTotalService extends CoreService {
    static className = 'InvoiceAbstractTotalService';

    /**
     * Collect invoice total
     *
     * @param invoice
     * @return {InvoiceAbstractTotalService}
     */
    collect(invoice) {
        return this;
    }

    /**
     * Checking if the invoice is last
     *
     * @param invoice
     * @return {boolean}
     */
    isLast(invoice) {
        let result = true;
        if (invoice && invoice.items && invoice.items.length) {
            invoice.items.forEach(item => {
                if (!result) {
                    return false;
                }
                if (!InvoiceItemService.isLast(item, invoice)) {
                    result = false;
                }
            })
        }
        return result;
    }
}

/** @type InvoiceAbstractTotalService */
let invoiceAbstractTotalService = ServiceFactory.get(InvoiceAbstractTotalService);

export default invoiceAbstractTotalService;