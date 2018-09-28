import CoreService from "../CoreService";
import ShippingResourceModel from "../../resource-model/shipping/ShippingResourceModel";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import ResultService from "./rate/ResultService";
import FlatRateService from "./methods/FlatRateService";
import TableRateService from "./methods/TableRateService";
import FreeShippingService from "./methods/FreeShippingService";
import Config from "../../config/Config";

export class ShippingService extends CoreService {
    static className = 'ShippingService';
    resourceModel = ShippingResourceModel;

    allowShippingMethods = [
        FlatRateService,
        TableRateService,
        FreeShippingService
    ];

    /**
     * Call ShippingResourceModel save to indexedDb
     *
     * @param data
     * @returns {Promise|*|void}
     */
    saveToDb(data) {
        return this.getResourceModel().saveToDb(data);
    }

    /**
     * Call ShippingResourceModel get all
     *
     * @returns {Object|*|FormDataEntryValue[]|string[]}
     */
    getAll() {
        let shippingResourceModel = new ShippingResourceModel();
        return shippingResourceModel.getAll();
    }

    /**
     * Get Allow shipping methods
     *
     * @return {T[]}
     */
    getAllowShippingMethods() {
        let allShippingMethods = Config.shipping_methods || [];
        let allowShippingMethods = [];
        if (Config.config && Config.config.shipping && Config.config.shipping.shipping_methods) {
            allowShippingMethods = Config.config.shipping.shipping_methods.split(',');
        }
        return allShippingMethods.filter(shippingMethod => {
            return allowShippingMethods.find(allowShippingMethod => {
                return shippingMethod.code.substring(0, allowShippingMethod.length) === allowShippingMethod;
            });
        });
    }

    /**
     * Collect all shipping rates for address
     *
     * @param request
     * @param allShippingMethods
     * @param quote
     */
    collectRates(request, allShippingMethods = [], quote) {
        ResultService.reset();
        this.allowShippingMethods.forEach(shippingMethodService => {
            shippingMethodService.setMethod(allShippingMethods);
            if (shippingMethodService.isActive()) {
                this.collectMethodRates(shippingMethodService, request, quote);
            }
        });
        return ResultService;
    }

    /**
     * Collect method rates of shipping method service
     *
     * @param shippingMethodService
     * @param request
     * @param quote
     */
    collectMethodRates(shippingMethodService, request, quote) {
        let result = shippingMethodService.checkAvailableShipCountries(request);
        if (!result) {
            return false;
        }
        if (shippingMethodService.getConfigData('shipment_request_type')) {

        } else {
            result = shippingMethodService.collectRates(request, quote);
        }

        if (!result) {
            return this;
        }
        ResultService.append(result);
        return this;
    }
}

/** @type ShippingService */
let shippingService = ServiceFactory.get(ShippingService);

export default shippingService;
