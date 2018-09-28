import CoreService from "../../CoreService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import NumberHelper from "../../../helper/NumberHelper";

export class AbstractShippingMethodService extends CoreService {
    static className = 'AbstractShippingMethodService';
    static methodCode = "";

    _numBoxes = 1;

    HANDLING_TYPE_PERCENT = 'P';

    HANDLING_TYPE_FIXED = 'F';

    HANDLING_ACTION_PERPACKAGE = 'P';

    HANDLING_ACTION_PERORDER = 'O';

    /**
     * Set shipping method
     *
     * @param allShippingMethod
     */
    setMethod(allShippingMethod = []) {
        this.shipping_method = allShippingMethod.find(shippingMethod =>
            shippingMethod.code === this.constructor.methodCode
        );
    }

    /**
     * Get config data
     *
     * @param field
     * @return {*}
     */
    getConfigData(field) {
        return this.shipping_method[field];
    }

    /**
     * Check shipping method is active
     * @return {*}
     */
    isActive() {
        return this.shipping_method;
    }

    /**
     *
     * @param request
     * @return {*}
     */
    checkAvailableShipCountries(request) {
        let speCountriesAllow = this.getConfigData('specific_countries_allow');
        if (speCountriesAllow && (speCountriesAllow === 1 || speCountriesAllow === "1")) {
            let availableCountries = [];
            if (this.getConfigData('specific_country')) {
                availableCountries = this.getConfigData('specific_country').split(',');
            }
            if (availableCountries && availableCountries.includes(request.dest_country_id)) {
                return this;
            } else {
                return false;
            }
        }
        return this;
    }

    /**
     * Get the handling fee for the shipping + cost
     * @param cost
     * @return {*}
     */
    getFinalPriceWithHandlingFee(cost) {
        let handlingFee = this.getConfigData('handling_fee');
        let handlingType = this.getConfigData('handling_type');
        if (!handlingType) {
            handlingType = this.HANDLING_TYPE_FIXED;
        }
        let handlingAction = this.getConfigData('handling_action');
        if (!handlingAction) {
            handlingAction = this.HANDLING_ACTION_PERORDER;
        }

        return handlingAction === this.HANDLING_ACTION_PERPACKAGE ? this._getPerpackagePrice(
            cost,
            handlingType,
            handlingFee
        ) : this._getPerorderPrice(
            cost,
            handlingType,
            handlingFee
        );
    }

    /**
     * Get final price for shipping method with handling fee per package
     *
     * @param cost
     * @param handlingType
     * @param handlingFee
     * @return {number}
     * @private
     */
    _getPerpackagePrice(cost, handlingType, handlingFee) {
        if (handlingType === this.HANDLING_TYPE_PERCENT) {
            return (cost + cost * handlingFee / 100) * this._numBoxes;
        }

        return (cost + handlingFee) * this._numBoxes;
    }

    /**
     * Get final price for shipping method with handling fee per order
     *
     * @param cost
     * @param handlingType
     * @param handlingFee
     * @return {*}
     * @private
     */
    _getPerorderPrice(cost, handlingType, handlingFee) {
        if (handlingType === this.HANDLING_TYPE_PERCENT) {
            return NumberHelper.addNumber(
                NumberHelper.multipleNumber(cost, this._numBoxes),
                NumberHelper.multipleNumber(cost, this._numBoxes, handlingFee) / 100
            );
        }

        return cost * this._numBoxes + handlingFee;
    }
}

/** @type AbstractShippingMethodService */
let abstractShippingMethodService = ServiceFactory.get(AbstractShippingMethodService);

export default abstractShippingMethodService;
