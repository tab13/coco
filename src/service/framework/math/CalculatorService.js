import CoreService from "../../CoreService";
import NumberHelper from "../../../helper/NumberHelper";
import CurrencyHelper from "../../../helper/CurrencyHelper";

export default class MathCalculatorService extends CoreService {
    static className = 'MathCalculatorService';

    _delta = 0;

    /**
     * Round price considering delta
     *
     * @param price
     * @param negative
     * @return {*}
     */
    deltaRound(price, negative = false) {
        let roundedPrice = price;
        if (roundedPrice) {
            if (negative) {
                this._delta = -this._delta;
            }
            price = NumberHelper.addNumber(price, this._delta);
            roundedPrice = CurrencyHelper.roundToFloat(price);
            this._delta = NumberHelper.minusNumber(price, roundedPrice);
            if (negative) {
                this._delta = -this._delta;
            }
        }
        return roundedPrice;
    }
}