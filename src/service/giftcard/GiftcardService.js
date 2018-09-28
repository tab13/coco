import {SubmitCouponCodeService} from "../checkout/quote/SubmitCouponCodeService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import GiftcardResourceModel from "../../resource-model/giftcard/GiftcardResourceModel";
import CurrencyHelper from "../../helper/CurrencyHelper";

class GiftcardService extends SubmitCouponCodeService {
    static className = 'GiftcardService';
    resourceModel = GiftcardResourceModel;

    /**
     * Apply gift code
     *
     * @param quote
     * @param giftcode
     * @param existed_codes
     * @return {*|promise|rules}
     */
    applyGiftcode(quote, giftcode = null, existed_codes = []) {
        let params = {
            quote: this.prepareQuoteParams(quote),
            giftcode: giftcode,
            existed_codes: existed_codes,
        };
        return this.getResourceModel().applyGiftcode(params);
    }

    /**
     * Reload list gift codes
     *
     * @param customer_id
     * @returns {*|promise|rules}
     */
    reloadGiftCodes(customer_id){
        return this.getResourceModel().reloadGiftCodes(customer_id);
    }

    /**
     * Get giftcode balance by base currency
     *
     * @param giftcode
     * @return {*|number}
     */
    getBaseBalance(giftcode) {
        return CurrencyHelper.convertToBase(giftcode.balance, giftcode.currency);
    }
}

/**
 * @type {GiftcardService}
 */
let giftcardService = ServiceFactory.get(GiftcardService);

export default giftcardService;