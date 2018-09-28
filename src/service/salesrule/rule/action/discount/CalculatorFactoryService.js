import CoreService from "../../../../CoreService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import SalesRuleToPercentService from "./ToPercentService";
import SalesRuleByPercentService from "./ByPercentService";
import SalesRuleToFixedService from "./ToFixedService";
import SalesRuleByFixedService from "./ByFixedService";
import SalesRuleCartFixedService from "./CartFixedService";
import SalesRuleBuyXGetYService from "./BuyXGetYService";
import SimpleActionConstant from "../../../../../view/constant/salesrule/SimpleActionConstant";


export class SalesRuleCalculatorFactoryService extends CoreService {
    static className = 'SalesRuleCalculatorFactoryService';

    calculatorServices = {
        [SimpleActionConstant.TO_PERCENT_ACTION]: SalesRuleToPercentService,
        [SimpleActionConstant.BY_PERCENT_ACTION]: SalesRuleByPercentService,
        [SimpleActionConstant.TO_FIXED_ACTION]: SalesRuleToFixedService,
        [SimpleActionConstant.BY_FIXED_ACTION]: SalesRuleByFixedService,
        [SimpleActionConstant.CART_FIXED_ACTION]: SalesRuleCartFixedService,
        [SimpleActionConstant.BUY_X_GET_Y_ACTION]: SalesRuleBuyXGetYService
    };

    /**
     *
     * @param type
     * @return {*}
     */
    create(type) {
        if(this.calculatorServices[type]) {
            return this.calculatorServices[type];
        }
    }
}


/** @type SalesRuleCalculatorFactoryService */
let salesRuleCalculatorFactoryService = ServiceFactory.get(SalesRuleCalculatorFactoryService);

export default salesRuleCalculatorFactoryService;