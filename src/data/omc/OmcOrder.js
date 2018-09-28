import OmcAbstract from "./OmcAbstract";

export default class OmcOrder extends OmcAbstract {
    static className = 'OmcOrder';

    get_list_api = this.get_list_order_api;
    search_api = this.search_order_api;
    get_deleted_api = this.get_deleted_order_api;
    load_order_by_increment_api = this.store_url + "/V1/webpos/load-order-by-increment-id/";

    /**
     * get path api place order
     * @return {string}
     */
    getPathPlaceOrder() {
        return this.place_order_api;
    }

    /**
     * get path take payment
     * return string
     */
    getPathTakePayment() {
        return this.order_take_payment_api;
    }

    /**
     * Get Path create creditmemo
     */
    getPathCreateCreditmemo() {
        return this.order_create_creditmemo_api;
    }

    /**
     * get path api hold order
     * @return {string}
     */
    getPathHoldOrder() {
        return this.hold_order_api;
    }

    /**
     * get path api delete order
     * @return {string}
     */
    getPathDeleteOrder() {
        return this.delete_order_api;
    }

	/**
     * get path api send email
     * @return {string}
     */
    getPathSendEmailOrder() {
        return this.send_email_order_api;
    }

    /**
     * get path api add comment
     * @return {string}
     */
    getPathAddComentOrder() {
        return this.add_comment_order_api;
    }

    /**
     * get path api cancel order
     * @return {string}
     */
    getPathCancelOrder() {
        return this.cancel_order_api;
    }

    /**
     * get path api send email credit memo
     * @return {string}
     */
    getPathSendEmailCreditmemo() {
        return this.send_email_creditmemo_api;
    }

    /**
     * get path api credit memo create customer
     * @return {string}
     */
    getPathCreditmemoCreateCustomer() {
        return this.creditmemo_create_customer;
    }

    /**
     * get path api load order
     * @return {string}
     */
    getPathLoadOrder() {
        return this.getBaseUrl() + this.load_order_by_increment_api;
    }

    /**
     * get list order statuses
     * @return {Promise<any>}
     */
    getListOrderStatuses() {
        return this.get(this.getBaseUrl() + this.get_list_order_status_api);
    }

    /**
     * get out of permission orders
     * @param queryService
     * @return {Promise<any>}
     */
    getOutOfPermissionOrders(queryService = {}) {
        let queryParams = this.getQueryParams(Object.assign({}, queryService));
        return this.get(this.getBaseUrl()
            + this.get_out_of_permission_orders_api
            + '?' + encodeURI(queryParams.join('&')));
    }

    /**
     * reload order
     * @param orderIncrement
     * @return {Promise<any>}
     */
    loadOrderByIncrement(orderIncrement) {
        return this.get(this.getPathLoadOrder()
            + '?increment_id=' + orderIncrement);
    }
}
