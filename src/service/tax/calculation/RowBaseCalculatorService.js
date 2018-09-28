import {AbstractAggregateCalculatorService} from "./AbstractAggregateCalculatorService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";

export class RowBaseCalculatorService extends AbstractAggregateCalculatorService {
    static className = 'RowBaseCalculatorService';

    /**
     * {@inheritdoc}
     */
    roundAmount(
        amount,
        rate = null,
        direction = null,
        type = this.KEY_REGULAR_DELTA_ROUNDING,
        round = true,
        item = null
    ) {
        if (item.associated_item_code) {
            // Use delta rounding of the product's instead of the weee's
            type = type + item.associated_item_code;
        } else {
            type = type + item.code;
        }

        return this.deltaRound(amount, rate, direction, type, round);
    }

}

/** @type RowBaseCalculatorService */
let rowBaseCalculatorService = ServiceFactory.get(RowBaseCalculatorService);

export default rowBaseCalculatorService;