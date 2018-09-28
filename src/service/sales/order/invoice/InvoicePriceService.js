import {AbstractOrderService} from "../../AbstractService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import CalculatorService from "../../../framework/math/CalculatorService";

export class InvoicePriceService extends AbstractOrderService {
    static className = 'InvoicePriceService';

    _calculators = [];

    /**
     * Reset calculators
     */
    resetCalculators() {
        this._calculators = [];
    }

    /**
     * Round price considering delta
     *
     * @param price
     * @param type
     * @param negative
     * @return {*}
     */
    roundPrice(price, type = 'regular', negative = false) {
        if (price) {
            if (!this._calculators[type]) {
                this._calculators[type] = ServiceFactory.create(CalculatorService);
            }
            price = this._calculators[type].deltaRound(price, negative);
        }
        return price;
    }
}

/** @type InvoicePriceService */
let invoicePriceService = ServiceFactory.get(InvoicePriceService);

export default invoicePriceService;