import deepmerge from "../../framework/Merge";
import LocalStorageHelper from '../../helper/LocalStorageHelper'
import LogoutPopupAction from "../../view/action/LogoutPopupAction"
import AppStore from '../../view/store/store';
import SignoutAction from "../../view/action/SignoutAction";
import QueryService from "../../service/QueryService";
import Config from "../../config/Config"

const isLocal = Boolean(
    window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    ) ||
    // 192.168.2.44 is considered localhost for IPv4. King's computer
    window.location.hostname.match(
        /^192(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    ) ||
    // Vincent computer
    window.location.hostname.indexOf('ngrok.io') > 0
);

export default class OmcAbstract {
    // base_url = "http://m2pwa.com/";
    // base_url = "https://omc20-dev.magestore.com/";
    // base_url = "https://omc20-test.magestore.com/";
    base_url = "http://127.0.0.1/magento225cocopwa/";
    store_code = "default";
    store_url = "rest/" + this.store_code;
    login_api = this.store_url + "/V1/webpos/staff/login";
    continue_login_api = this.store_url + "/V1/webpos/staff/continueLogin";
    assign_pos_api = this.store_url + "/V1/webpos/posassign";
    change_information_api = this.store_url + "/V1/webpos/staff/changepassword?";
    logout_api = this.store_url + "/V1/webpos/staff/logout";
    config_api = this.store_url + "/V1/webpos/config";
    logo_api = this.store_url + "/V1/webpos/website/information?";
    countries_api = this.store_url + "/V1/webpos/country/list?";
    get_deleted_product_api = this.store_url + "/V1/webpos/products/deleted";
    get_list_product_api = this.store_url + "/V1/webpos/products/sync";
    search_product_api = this.store_url + "/V1/webpos/products/search";
    get_list_payment_api = this.store_url + "/V1/webpos/payments";
    get_list_shipping_api = this.store_url + "/V1/webpos/shippings";
    place_order_api = this.store_url + "/V1/webpos/checkout/placeOrder";
    get_available_qty_api = this.store_url + "/V1/webpos/availableQty";
    get_external_stock_api = this.store_url + "/V1/webpos/getExternalStock";
    get_list_stock_api = this.store_url + "/V1/webpos/stocks/sync";
    get_color_swatch_api = this.store_url + "/V1/webpos/swatch";
    get_product_option = this.store_url + "/V1/webpos/options";
    get_list_customer_api = this.store_url + "/V1/webpos/customers/list";
    get_deleted_customer_api = this.store_url + "/V1/webpos/customers/deleted";
    get_customer_by_id_api = this.store_url + "/V1/webpos/customers";
    get_update_data_customer_api = this.store_url + "/V1/webpos/customers/updateLoyalty";
    get_list_location_api = this.store_url + "/V1/webpos/availableLocation";
    check_email_api = this.store_url + "/V1/customers/isEmailAvailable";
    search_barcode_product_api = this.store_url + "/V1/webpos/products/barcode";
    search_customer_api = this.store_url + "/V1/webpos/customers/search";
    save_customer_api = this.store_url + "/V1/webpos/customers";
    edit_customer_api = this.store_url + "/V1/webpos/customers/";
    submit_coupon_code = this.store_url + "/V1/webpos/checkout/checkPromotion";
    get_list_category_api = this.store_url + "/V1/webpos/categories";
    get_list_order_api = this.store_url + "/V1/webpos/orders/sync";
    search_order_api = this.store_url + "/V1/webpos/orders/search";
    order_take_payment_api = this.store_url + "/V1/webpos/order/takePayment";
    get_list_tax_rate_api = this.store_url + "/V1/webpos/taxRate/list";
    get_list_tax_rule_api = this.store_url + "/V1/webpos/taxRule/list";
    order_create_creditmemo_api = this.store_url + "/V1/webpos/creditmemos/create";
    get_token_stripe_payment = "https://api.stripe.com/v1/tokens";
    get_token_authorizenet_sandbox = "https://apitest.authorize.net/xml/v1/request.api";
    get_token_authorizenet_live = "https://api.authorize.net/xml/v1/request.api";
    authorizenet_finish_payment = this.store_url + "/V1/webpos/authorizenet/finishPayment";
    stripe_finish_payment = this.store_url + "/V1/webpos/stripe/finishPayment";
    hold_order_api = this.store_url + "/V1/webpos/order/hold";
    delete_order_api = this.store_url + "/V1/webpos/order/delete";
    get_deleted_order_api = this.store_url + "/V1/webpos/orders/deleted";
    send_email_order_api = this.store_url + "/V1/webpos/order/sendEmail";
    add_comment_order_api = this.store_url + "/V1/webpos/order/comment";
    cancel_order_api = this.store_url + "/V1/webpos/order/cancel";
    send_email_creditmemo_api = this.store_url + "/V1/webpos/creditmemos/sendEmail";
    creditmemo_create_customer = this.store_url + "/V1/webpos/creditmemos/createCustomer";
    get_list_order_status_api = this.store_url + "/V1/webpos/orders/statuses";
    get_list_session_api = this.store_url + "/V1/webpos/shifts/getlist";
    shift_save_api = this.store_url + "/V1/webpos/shifts/save";
    cash_transaction_save_api = this.store_url + "/V1/webpos/cash_transaction/save";
    get_out_of_permission_orders_api = this.store_url + "/V1/webpos/orders/out-of-permission";
    get_list_catalog_rule_product_price_api = this.store_url + "/V1/webpos/catalogrule/product_price/sync";
    get_catalog_rule_product_price_ids_api = this.store_url + "/V1/webpos/catalogrule/product_price/get_all_ids";
    apply_giftcode = this.store_url + "/V1/webpos/giftcard/apply";
    reload_giftcodes = this.store_url +"/V1/webpos/giftcard/get_giftcard_by_customer"

    get_list_api = '';
    search_api = '';
    get_deleted_api = '';
    get_by_id_api = '';
    get_update_data_api = '';

    /**
     * get base url
     * @returns {string}
     */
    getBaseUrl() {
        // if (isLocal) {
            return this.base_url;
        // } else {
        //     return this.getUrlFromBrowser();
        // }
    }


    /**
     * get url from browser link
     */
    getUrlFromBrowser() {
        let url = window.location.href;
        url = url.split(Config.basename)[0];
        return url;
    }

    /**
     *
     * get request
     *
     * @param url string
     * @param opts mixed
     *
     * @return {Promise<any>}
     *
     * */
    get(url, opts = {}) {
        let self = this;
        return new Promise((resolve, reject) => {
            fetch(url,
                deepmerge.all([
                    {
                        method: "GET",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': LocalStorageHelper.getSession()
                        },
                        mode: 'cors'
                    },
                    opts
                ])
            ).then(response => response.json()
                .then(function(data) {
                    data = self.prepareResponse(data);
                    if (response.ok) {
                        // API Get list (product, customer...): append Date to sync data
                        if (Object.prototype.hasOwnProperty.call(data, 'total_count')
                            && data.hasOwnProperty('search_criteria')
                            && data.hasOwnProperty('items')
                        ) {
                            if (data.hasOwnProperty('cached_at')) {
                                data.cached_at = Date.parse(data.cached_at + 'Z');
                            } else if (response.headers.get('Date')) {
                                data.cached_at = Date.parse(response.headers.get('Date'));
                            }
                        }
                        return resolve(data);
                    } else {
                        self.checkForceSignOut(data);
                        return reject(data);
                    }
                })
            ).catch(error => error.message);
        });
    }

    /**
     * pos request
     *
     * @param url
     * @param params
     *
     * @returns {Promise<any>}
     */
    post(url, params) {
        let self = this;
        return new Promise((resolve, reject) => {
            fetch(url,
                {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': LocalStorageHelper.getSession()
                    },
                    mode: 'cors',
                    body: JSON.stringify(params)
                })
                .then(response => response.json()
                    .then(function(data) {
                        data = self.prepareResponse(data);
                        if (response.ok) {
                            return resolve(data);
                        } else {
                            self.checkForceSignOut(data);
                            return reject(data);
                        }
                    })
                ).catch(error => reject(''))
        })
    }

    /**
     * put request
     * @param url
     * @param params
     * @returns {Promise}
     */
    put(url, params) {
        let self = this;
        return new Promise((resolve, reject) => {
            fetch(url,
                {
                    method: "PUT",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': LocalStorageHelper.getSession()
                    },
                    mode: 'cors',
                    body: JSON.stringify(params)
                })
                .then(response => response.json()
                    .then(function(data) {
                        if (response.ok) {
                            return resolve(data);
                        } else {
                            self.checkForceSignOut(data);
                            return reject(data);
                        }
                    })
                ).catch(error => reject(''))
        })
    }

    /**
     * delete request
     * @param url
     * @param params
     * @returns {Promise}
     */
    delete(url, params) {
        let self = this;
        return new Promise((resolve, reject) => {
            fetch(url,
                {
                    method: "DELETE",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': LocalStorageHelper.getSession()
                    },
                    mode: 'cors',
                    body: JSON.stringify(params)
                })
                .then(response => response.json()
                    .then(function(data) {
                        if (response.ok) {
                            return resolve(data);
                        } else {
                            self.checkForceSignOut(data);
                            return reject(data);
                        }
                    })
                ).catch(error => reject(''))
        })
    }

    /**
     * Get order params array
     *
     * @param index
     * @param order
     */
    getOrderParamArray(index, order) {
        return [
            'searchCriteria[sortOrders][' + index + '][field]=' + order.field,
            'searchCriteria[sortOrders][' + index + '][direction]=' + order.direction
        ];
    }

    /**
     * Get search creria filter param array from filter object
     *
     * @param {number} filterGroup
     * @param {number} filtersIndex
     * @param {object} filter
     */
    getFilterParamArray(filterGroup, filtersIndex, filter) {
        return [
            'searchCriteria[filter_groups][' + filterGroup + '][filters][' + filtersIndex + '][field]=' + filter.field,
            'searchCriteria[filter_groups][' + filterGroup + '][filters][' + filtersIndex + '][value]=' +
            (filter.condition === 'like' ? '%' + filter.value + '%' : filter.value),
            'searchCriteria[filter_groups][' + filterGroup + '][filters][' + filtersIndex + '][condition_type]='
            + filter.condition
        ];
    }

    /**
     * Get query param for get list api
     *
     * @param queryService
     */
    getQueryParams(query = {}) {
        let queryParams = [],
            filterGroup = 0;
        if (query.orderParams.length > 0) {
            query.orderParams.map((item, index) => queryParams.push(...this.getOrderParamArray(index, item)))
        }
        if (query.queryString !== null) {
            queryParams.push('searchCriteria[queryString]=' + query.queryString);
        }

        if (query.filterParams.length > 0) {
            query.filterParams.map((item, index) => {
                queryParams.push(...this.getFilterParamArray(filterGroup, index, item));
                filterGroup++;
                return queryParams;
            });
        }
        if (query.orFilterParams.length > 0) {
            query.orFilterParams.map((orFilter) => {
                orFilter.map((item, index) =>
                    queryParams.push(...this.getFilterParamArray(filterGroup, index, item)));
                filterGroup++;
                return queryParams;
            });
        }

        if (query.pageSize) {
            queryParams.push(...[
                'searchCriteria[pageSize]=' + query.pageSize,
                'searchCriteria[currentPage]=' + query.currentPage
            ]);
        }
        if (query.params.length > 0) {
            query.params.map(param => queryParams.push(param.key + '=' + param.value));
        }
        return queryParams;
    }

    /**
     * Get list via api
     *
     * @param {object} queryService
     * @return {Promise<any>}
     */
    getList(queryService = {}) {
        let query = Object.assign({}, queryService);
        let queryParams = this.getQueryParams(query);
        return this.get(this.getBaseUrl() +
            (query.queryString !== null ? this.search_api : this.get_list_api)
            + '?' + encodeURI(queryParams.join('&')));
    }

    /**
     * Get deleted items via api
     *
     * @param {object} queryService
     * @return {Promise<any>}
     */
    getDeleted(queryService = {}) {
        let queryParams = this.getQueryParams(Object.assign({}, queryService));
        return this.get(this.getBaseUrl()
            + this.get_deleted_api
            + '?' + encodeURI(queryParams.join('&')));
    }

    /**
     * Check force sign out when request get error code
     *
     * @param data
     */
    checkForceSignOut(data) {
        if (data.code === 901 &&
            LocalStorageHelper.get(LocalStorageHelper.POS_ID)) {
            let queryService = QueryService.reset();
            queryService.setPageSize(500).setCurrentPage(1);
            AppStore.dispatch(SignoutAction.getNewLocations(queryService));
        }else if (data.code === 900 &&
            LocalStorageHelper.get(LocalStorageHelper.SESSION)) {
            AppStore.dispatch(LogoutPopupAction.forceSignOut());
            AppStore.dispatch(LogoutPopupAction.finishLogoutRequesting(data));
        }
    }

    /**
     * Prepare reponse - multi platform
     *
     * @param data
     */
    prepareResponse(data) {
        return data;
    }

    /**
     * get data by id
     * @param id
     * @return {Promise<any>}
     */
    getById(id) {
        return this.get(this.getBaseUrl() + this.get_by_id_api +'/'+id);
    }

    /**
     * Get update data via api
     *
     * @param {object} queryService
     * @return {Promise<any>}
     */
    getUpdateData(queryService = {}) {
        let queryParams = this.getQueryParams(Object.assign({}, queryService));
        return this.get(this.getBaseUrl()
            + this.get_update_data_api
            + '?' + encodeURI(queryParams.join('&')));
    }

}

