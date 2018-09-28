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
        return this.deltaRound(amount, rate, direction, type, round);
    }
}

/** @type RowBaseCalculatorService */
let rowBaseCalculatorService = ServiceFactory.get(RowBaseCalculatorService);

export default rowBaseCalculatorService;