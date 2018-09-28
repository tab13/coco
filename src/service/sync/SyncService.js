import SyncResourceModel from "../../resource-model/sync/SyncResourceModel";
import ProductService from "../../service/catalog/ProductService";
import LocalStorageHelper from "../../helper/LocalStorageHelper";
import Config from "../../config/Config";
import SyncConstant from "../../view/constant/SyncConstant";
import CoreService from "../CoreService";
import ConfigService from "../config/ConfigService";
import ActionLogResourceModel from "../../resource-model/sync/ActionLogResourceModel";
import QueryService from "../QueryService";
import StockService from "../../service/catalog/StockService";
import PaymentService from "../payment/PaymentService";
import ShippingService from "../shipping/ShippingService";
import ColorSwatchService from "../config/ColorSwatchService";
import CategoryService from "../catalog/CategoryService";
import ServiceFactory from "../../framework/factory/ServiceFactory"
import CustomerService from "../../service/customer/CustomerService";
import TaxService from "../tax/TaxService";
import OrderService from "../sales/OrderService";
import SessionService from "../session/SessionService";
import CatalogRuleProductPriceService from "../catalog/rule/CatalogRuleProductPriceService";

class SyncService extends CoreService {
    static className = 'SyncService';
    resourceModel = SyncResourceModel;

    /**
     * Call SyncResourceModel get all
     *
     * @returns {Object|*|FormDataEntryValue[]|string[]}
     */
    getAll() {
        return this.getResourceModel().getAll();
    }

    /**
     * Call SyncResourceModel save to indexedDb
     *
     * @param data
     * @returns {Promise|*|void}
     */
    saveToDb(data) {
        return this.getResourceModel().saveToDb(data);
    }

    /**
     * Call SyncResourceModel set default data
     */
    setDefaultData() {
        this.getResourceModel().setDefaultData();
    }

    /**
     * Check has sync pending
     * @returns {boolean}
     */
    async hasSyncPending() {
        let actionLogResource = new ActionLogResourceModel();
        let results = await actionLogResource.getAllDataActionLog();
        return results.length > 0;
    }

    /**
     * Call ConfigResourceModel request get config
     * @returns {*}
     */
    getConfig() {
        let queryService = QueryService.reset();
        queryService.setPageSize(200).setCurrentPage(1);
        return ConfigService.getResourceModel().getDataOnline(queryService);
    }

    /**
     * Call ColorSwatchResourceModel request get color swatch
     * @returns {*}
     */
    getColorSwatch() {
        let queryService = QueryService.reset();
        queryService.setPageSize(200).setCurrentPage(1);
        return ColorSwatchService.getResourceModel().getDataOnline(queryService);
    }

    /**
     * Call PaymentResourceModel request get payments
     * @returns {*}
     */
    getPayment() {
        let queryService = QueryService.reset();
        return PaymentService.getResourceModel().getDataOnline(queryService);
    }

    /**
     * Call ShippingResourceModel request get payments
     * @returns {*}
     */
    getShipping() {
        let queryService = QueryService.reset();
        return ShippingService.getResourceModel().getDataOnline(queryService);
    }

    /**
     * Call CategoryResourceModel request get payments
     * @returns {*}
     */
    getCategory() {
        let queryService = QueryService.reset();
        queryService.setPageSize(300).setCurrentPage(1);
        return CategoryService.getResourceModel().getDataOnline(queryService);
    }

    /**
     * Call TaxResourceModel request get tax rate list
     * @returns {*}
     */
    getTaxRate() {
        let queryService = QueryService.reset();
        queryService.setPageSize(300).setCurrentPage(1);
        return TaxService.getResourceModel().getDataOnline(queryService);
    }

    /**
     * Call TaxResourceModel request get tax rule list
     * @returns {*}
     */
    getTaxRule() {
        let queryService = QueryService.reset();
        queryService.setPageSize(300).setCurrentPage(1);
        return TaxService.getRuleResourceModel().getDataOnline(queryService);
    }

    /**
     * Get Data
     * @param type
     * @param queryService
     * @returns {Promise<any>}
     */
    getData(type, queryService) {
        let resource;
        if (type === SyncConstant.TYPE_PRODUCT) {
            resource = ProductService;
        } else if (type === SyncConstant.TYPE_STOCK) {
            resource = StockService;
        } else if (type === SyncConstant.TYPE_CUSTOMER) {
            resource = CustomerService;
        } else if (type === SyncConstant.TYPE_ORDER) {
            resource = OrderService;
        } else if (type === SyncConstant.TYPE_SESSION) {
            resource = SessionService;
        } else if (type === SyncConstant.TYPE_CATALOG_RULE_PRODUCT_PRICE) {
            resource = CatalogRuleProductPriceService;
        }
        return resource.getDataOnline(queryService);
    }

    /**
     * Get deleted
     * @param type
     * @param queryService
     * @returns {Promise<any>}
     */
    getDeleted(type, queryService) {
        let resource;
        if (type === SyncConstant.TYPE_PRODUCT) {
            resource = ProductService;
        } else if (type === SyncConstant.TYPE_STOCK) {
            resource = StockService;
        } else if (type === SyncConstant.TYPE_CUSTOMER) {
            resource = CustomerService;
        } else if (type === SyncConstant.TYPE_ORDER) {
            resource = OrderService;
        }
        return resource.getDeleted(queryService);
    }

    /**
     * Save mode to local storage
     * @param mode
     */
    saveMode(mode) {
        //Set mode to local storage
        LocalStorageHelper.set(LocalStorageHelper.MODE, mode);
        // Change mode in config
        Config.mode = mode;
    }

    /**
     * get Mode from local storage
     * @returns {*|string}
     */
    getMode() {
        return LocalStorageHelper.get(LocalStorageHelper.MODE);
    }

    /**
     * save need sync to localStorage
     * @param flg
     */
    saveNeedSync(flg){
        LocalStorageHelper.set(LocalStorageHelper.NEED_SYNC, flg);
    }

    /**
     * get need sync from localStorage
     * @returns {*|string}
     */
    getNeedSync(){
        return LocalStorageHelper.get(LocalStorageHelper.NEED_SYNC);
    }

    /**
     * save need sync to localStorage
     * @param flg
     */
    saveNeedSyncSession(flg){
        LocalStorageHelper.set(LocalStorageHelper.NEED_SYNC_SESSION, flg);
    }

    /**
     * get need sync from localStorage
     * @returns {*|string}
     */
    getNeedSyncSession(){
        return LocalStorageHelper.get(LocalStorageHelper.NEED_SYNC_SESSION);
    }

    /**
     * Clear Data of sync Table in indexedDb
     * @returns {*}
     */
    clear() {
        return this.getResourceModel().clear();
    }

    /**
     * Reset items's data of sync table in indexedDb
     * @param items
     * @returns {*}
     */
    resetData(items) {
        return this.getResourceModel().resetData(items);
    }
}
/**
 * @type {SyncService}
 */
let syncService = ServiceFactory.get(SyncService);

export default syncService;
