import {QuoteTotalGiftcardAbstractService} from "./QuoteTotalGiftcardAbstractService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import TaxHelper from "../../../../helper/TaxHelper";

export class QuoteTotalGiftcardService extends QuoteTotalGiftcardAbstractService {
    static className = 'QuoteTotalGiftcardService';

    code = "giftcard";

    /**
     * Collect grand total for address
     *
     * @param {object} quote
     * @param {object} address
     * @param {object} total
     * @return {QuoteTotalGrandTotalService}
     */
    collect(quote, address, total) {
        super.collect(quote, address, total);
        let applyTaxAfterDiscount = TaxHelper.applyTaxAfterDiscount();
        if(!applyTaxAfterDiscount) {
            return this;
        }
        this.calculateDiscount(quote, address, total)
    }
}

let quoteTotalGiftcardService = ServiceFactory.get(QuoteTotalGiftcardService);

export default quoteTotalGiftcardService;