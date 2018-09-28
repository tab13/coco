import {QuoteTotalGiftcardAbstractService} from "./QuoteTotalGiftcardAbstractService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import TaxHelper from "../../../../helper/TaxHelper";

export class QuoteTotalGiftcardAfterTaxService extends QuoteTotalGiftcardAbstractService {
    static className = 'QuoteTotalGiftcardAfterTaxService';

    code = "giftvoucheraftertax";

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
        let isApplyGiftAfterTax = !TaxHelper.applyTaxAfterDiscount();
        if(!isApplyGiftAfterTax) {
            return this;
        }
        this.calculateDiscount(quote, address, total, isApplyGiftAfterTax);
    }
}

let quoteTotalGiftcardAfterTaxService = ServiceFactory.get(QuoteTotalGiftcardAfterTaxService);

export default quoteTotalGiftcardAfterTaxService;