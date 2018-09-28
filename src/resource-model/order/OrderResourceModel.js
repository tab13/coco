import AbstractResourceModel from "../AbstractResourceModel";
import DateTimeHelper from "../../helper/DateTimeHelper";
import QueryService from "../../service/QueryService";
import ConfigHelper from "../../helper/ConfigHelper";
import OrderConstant from "../../view/constant/OrderConstant";
import SyncConstant from "../../view/constant/SyncConstant";
import ActionLogService from "../../service/sync/ActionLogService";
import StatusConstant from "../../view/constant/order/StatusConstant";
import SessionConstant from "../../view/constant/SessionConstant";
import Appstore from "../../view/store/store";
import CreditmemoAction from "../../view/action/order/CreditmemoAction";

export default class OrderResourceModel extends AbstractResourceModel {
    static className = 'OrderResourceModel';

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName: 'Order'};
    }

    /**
     * save order to indexDb after place order
     * @param order
     */
    placeOrder(order) {
        return this.saveToDb([order]).then(() => {
            this.reindexTable();
            return order;
        });
    }

    /**
     * get out date orders
     * @return {Promise<{ids: Array}>}
     */
    async getOutDateOrders() {
        let queryService = QueryService.reset();
        let date = new Date();
        let configOrderSince = ConfigHelper.getConfig(OrderConstant.XML_PATH_CONFIG_SYNC_ORDER_SINCE);

        switch (configOrderSince) {
            case SessionConstant.SESSION_SINCE_24H:
                date.setDate(date.getDate() - 1);
                break;
            case SessionConstant.SESSION_SINCE_7_DAYS:
                date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 6);
                break;
            case SessionConstant.SESSION_SINCE_MONTH:
                date = new Date(date.getFullYear(), date.getMonth(), 1);
                break;
            case SessionConstant.SESSION_SINCE_YTD:
                date = new Date(date.getFullYear(), 0, 1);
                break;
            case SessionConstant.SESSION_SINCE_2_YTD:
                date = new Date(date.getFullYear() - 1, 0, 1);
                break;
            default:
                date.setDate(date.getDate() - 1);
        }

        date = DateTimeHelper.getDatabaseDateTime(date.getTime());
        queryService.addQueryString('');
        queryService.addFieldToFilter('created_at', date, 'lt');
        queryService.addFieldToFilter('state', StatusConstant.STATE_HOLDED, 'neq');
        let result;
        let response = {ids: []};
        result = await this.getResourceOffline().getList(queryService);
        result.items.map(order => response.ids.push(order.increment_id));
        return response;
    }

    /**
     * take payment
     * @param order
     * @return {Promise<T>}
     */
    takePayment(order) {
        return this.saveToDb([order]).then(() => {
            return order;
        });
    }

    /**
     * refund
     *
     * @param creditmemo
     * @return {Promise<*>}
     */
    async refund(creditmemo) {
        Appstore.dispatch(CreditmemoAction.creditmemoCreateActionLogBefore(creditmemo));
        let url = this.getResourceOnline().getPathCreateCreditmemo();
        await ActionLogService.createDataActionLog(
            SyncConstant.REQUEST_CREATE_CREDITMEMO_ORDER,
            url,
            SyncConstant.METHOD_POST,
            {
                creditmemo: creditmemo
            }
        );
        return creditmemo;
    }

    /**
     *
     * @param request
     * @return {*|{type: string, quote: *}}
     */
    directPayment(request) {
        let resourceOnline = this.getResourceOnline();
        /**
         *
         * @type {OmcOrder} resourceOnline
         */
        return resourceOnline.directPayment(request);
    }

    /**
     * get list order statuses
     * @return {Promise<any>}
     */
    getListOrderStatuses() {
        return this.getResourceOnline().getListOrderStatuses();
    }

    /**
     * get order by increment_id offline
     * @param increment_id
     * @returns {Promise.<any>|*}
     */
    getOrderByIncrementIdOffline(increment_id) {
        return this.getResourceOffline().getById(increment_id);
    }

    /**
     * get order by increment ids
     * @param ids
     * @returns {*|Promise}
     */
    getOrderByIncrementIds(ids) {
        return this.getResourceOffline().getOrderByIncrementIds(ids);
    }

    /**
     * get out of permission orders
     * @param queryService
     * @return {*|Promise<any>}
     */
    getOutOfPermissionOrders(queryService = {}) {
        return this.getResourceOnline().getOutOfPermissionOrders(queryService);
    }

    /**
     *
     * @param orderIncrement
     * @return {*|Promise<any>}
     */
    loadOrderByIncrement(orderIncrement) {
        let resourceOnline = this.getResourceOnline();
        /**
         *
         * @type {OmcOrder} resourceOnline
         */
        return resourceOnline.loadOrderByIncrement(orderIncrement);
    }
}