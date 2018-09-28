import {InvoiceAbstractTotalService} from "./AbstractTotalService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";

export class InvoiceGrandTotalService extends InvoiceAbstractTotalService {
    static className = 'InvoiceGrandTotalService';

    /**
     * Collect invoice grand total
     *
     * @param invoice
     * @return {InvoiceGrandTotalService}
     */
    collect(invoice) {
        return this;
    }
}

/** @type InvoiceGrandTotalService */
let invoiceGrandTotalService = ServiceFactory.get(InvoiceGrandTotalService);

export default invoiceGrandTotalService;