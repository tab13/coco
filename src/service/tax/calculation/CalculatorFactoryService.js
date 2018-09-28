import CoreService from "../../CoreService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import UnitBaseService from "./UnitBaseCalculatorService";
import RowBaseService from "./RowBaseCalculatorService";
import TotalBaseService from "./TotalBaseCalculatorService";

export class TaxCalculatorFactoryService extends CoreService {
    static className = 'TaxCalculatorFactoryService';

    /**
     * Identifier constant for unit based calculation
     */
    CALC_UNIT_BASE = 'UNIT_BASE_CALCULATION';

    /**
     * Identifier constant for row based calculation
     */
    CALC_ROW_BASE = 'ROW_BASE_CALCULATION';

    /**
     * Identifier constant for total based calculation
     */
    CALC_TOTAL_BASE = 'TOTAL_BASE_CALCULATION';

    /**
     * Create calculate tax class
     *
     * @param {string} type
     * @param {object} billingAddress
     * @param {object} shippingAddress
     * @param {number} customerTaxClassId
     * @param {object} customer
     * @return {*}
     */
    create(type, billingAddress = null, shippingAddress = null, customerTaxClassId = null, customer = null) {
        let calculateClass = null;
        switch (type) {
            case this.CALC_UNIT_BASE:
                calculateClass = UnitBaseService;
                break;
            case this.CALC_ROW_BASE:
                calculateClass = RowBaseService;
                break;
            case this.CALC_TOTAL_BASE:
                calculateClass = TotalBaseService;
                break;
            default:
                throw new Error('Unknown calculation type: ' + type);
        }
        calculateClass.reset();
        calculateClass.setBillingAddress(billingAddress);
        calculateClass.setShippingAddress(shippingAddress);
        calculateClass.setCustomerTaxClassId(customerTaxClassId);
        calculateClass.setCustomer(customer);
        return calculateClass;
    }
}

/** @type TaxCalculatorFactoryService */
let taxCalculatorFactoryService = ServiceFactory.get(TaxCalculatorFactoryService);

export default taxCalculatorFactoryService;