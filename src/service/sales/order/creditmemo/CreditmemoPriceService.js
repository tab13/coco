import {AbstractOrderService} from "../../AbstractService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import CalculatorService from "../../../framework/math/CalculatorService";

export class CreditmemoPriceService extends AbstractOrderService {
    static className = 'CreditmemoPriceService';

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

/** @type CreditmemoPriceService */
let creditmemoPriceService = ServiceFactory.get(CreditmemoPriceService);

export default creditmemoPriceService;