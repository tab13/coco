import CoreService from "../../CoreService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";

export class ShippingRateResultService extends CoreService {
    static className = 'ShippingRateResultService';

    rates = [];

    /**
     * reset
     */
    reset() {
        this.rates = [];
    }

    /**
     * Get all rates
     *
     * @return {Array}
     */
    getAllRates() {
        return this.rates;
    }

    /**
     * Add result
     *
     * @param result
     * @return {ShippingRateResultService}
     */
    append(result) {
        if (Array.isArray(result)) {
            this.rates.push(...result);
            return this;
        }
        this.rates.push(result);
    }
}

/** @type ShippingRateResultService */
let shippingRateResultService = ServiceFactory.get(ShippingRateResultService);

export default shippingRateResultService;
