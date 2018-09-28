import React from "react";
import ComponentFactory from '../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../framework/container/CoreContainer';
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import SmoothScrollbar from "smooth-scrollbar";
import OrderAction from "../../action/OrderAction";
import Config from "../../../config/Config";
import QueryService from "../../../service/QueryService";
import DateTimeHelper from "../../../helper/DateTimeHelper";
import AbstractGrid from "../../../framework/component/grid/AbstractGrid";
import Order from "./order-list/Order";
import OrderConstant from "../../constant/OrderConstant";
import OrderSearchForm from "./order-list/OrderSearchForm";
import ConfigHelper from "../../../helper/ConfigHelper";
import moment from "moment/moment";
import StatusConstant from "../../constant/order/StatusConstant";
import _ from 'lodash';

export class OrderList extends AbstractGrid {
    static className = 'OrderList';

    setBlockOrderListElement = element => this.order_list = element;

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            searchKey: '',
            searchAllTime: false
        }
    }

    /**
     * Component will mount
     */
    componentWillMount() {
        /* Set default state mode for component from Config */
        if (Config.mode) {
            this.setState({mode: Config.mode});
        }
        if (Config.session) {
            /* Load order first time before render order list */
            this.loadOrder('', OrderConstant.PAGE_SIZE, 1);
            this.startLoading();
        }
    }

    /**
     * This function after mapStateToProps then push more items to component or change load order mode
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (!this.isModeChange(nextProps)) {
            if (nextProps.scanningBarcode && nextProps.barcodeString !== this.props.barcodeString) {
                this.changeSearchKey(nextProps.barcodeString);
                return;
            }
            if (nextProps.scanningBarcode && nextProps.barcodeString && nextProps.orders.length === 0) {
                this.closeScanner();
            }
            if ((nextProps.search_key === this.state.searchKey)
                && nextProps.searchAllTime === this.state.searchAllTime
                && this.state.mode === nextProps.mode && nextProps.request_mode === this.state.mode
                && nextProps.orders !== this.props.orders) {
                if (parseFloat(nextProps.search_criteria.current_page) === 1) {
                    this.addItems(nextProps.orders);
                    if (nextProps.orders.length < nextProps.total_count) {
                        this.loadOrder(nextProps.search_key, OrderConstant.PAGE_SIZE, 2);
                    }
                    this.selectOrder(nextProps.orders[0]);
                    this.closeScanner();
                } else {
                    let currentOrderIds = this.state.items.map(item => item.increment_id);
                    let orders = nextProps.orders.filter(item => !currentOrderIds.includes(item.increment_id));
                    this.pushItems(orders);
                }
                this.stopLoading();
            }
            if (nextProps.updated_orders && nextProps.updated_orders.length && this.state.items.length) {
                this.updateListAfterSyncOrder(nextProps.updated_orders);
            }
            if (nextProps.deleted_order_ids && nextProps.deleted_order_ids.length && this.state.items.length) {
                this.updateListAfterSyncDeletedOrders(nextProps.deleted_order_ids);
            }
        }
    }

    /**
     * Init smooth scrollbar
     */
    componentDidMount() {
        if (!this.scrollbarOrderList && this.order_list) {
            this.scrollbarOrderList = SmoothScrollbar.init(this.order_list);
            this.scrollbarOrderList.addListener(event => {
                if (event.limit.y <= (event.offset.y + 100)) {
                    this.lazyload(event);
                }
                return true;
            });
        }
    }

    /**
     * update list order after sync order
     * @param orders
     */
    updateListAfterSyncOrder(orders = []) {
        if (orders && orders.length) {
            let items = this.state.items;
            let selectOrder = null;
            let lastOrderCreatedDate;
            items.map((item, index) => {
                let order = orders.find(x => item.increment_id === x.increment_id);
                if (order) {
                    items[index] = order;
                }
                if (this.props.currentOrder && item.increment_id === this.props.currentOrder.increment_id) {
                    selectOrder = order;
                }
                return item;
            });

            lastOrderCreatedDate = items[items.length-1].created_at;
            let newOrder = orders.filter(item => {
                let order = items.find(x => x.increment_id === item.increment_id);
                return (
                    !order
                    && item.created_at > lastOrderCreatedDate
                    && item.search_string.indexOf(this.state.searchKey) >= 0
                );
            });
            items.splice(0,0, ...newOrder);
            items = _.unionBy(items, 'increment_id');
            items = _.orderBy(items, 'created_at', 'desc');
            this.addItems(items);
            setTimeout(() => selectOrder && this.selectOrder(selectOrder), 20);
            this.props.actions.resetSyncActionUpdateOrder();
        }
    }

    /**
     * update list order after sync order
     * @param ids
     */
    updateListAfterSyncDeletedOrders(ids = []) {
        if (ids && ids.length) {
            let items = this.state.items;
            let isDeleteCurrentOrder = false;
            ids.map(id => {
                let index = items.findIndex(item => item.increment_id === id);
                if (index >= 0) {
                    items.splice(index, 1);
                }
                if (this.props.currentOrder && id === this.props.currentOrder.increment_id) {
                    isDeleteCurrentOrder = true;
                }
                return id;
            });
            this.addItems(items);

            if (isDeleteCurrentOrder) {
                setTimeout(() => this.selectOrder(items[0]), 20);
            }
            this.props.actions.resetSyncDeletedOrders();
        }
    }


    /**
     * start loading
     */
    startLoading() {
        super.startLoading();
        this.props.setIsLoading(true);
    }

    /**
     * stop loading
     */
    stopLoading() {
        super.stopLoading();
        this.props.setIsLoading(false);
    }

    /**
     * Check can load more orders
     *
     * @return {boolean}
     */
    canLoad() {
        if (this.props.search_criteria !== undefined) {
            return !this.isLoading() && (this.state.items.length < this.props.total_count);
        }
        return false;
    }

    /**
     * load more orders when user scroll to last of order list
     * @param event
     */
    lazyload(event) {
        if (this.canLoad() === true) {
            this.startLoading();
            this.loadOrder(
                this.state.searchKey,
                OrderConstant.PAGE_SIZE,
                this.props.search_criteria.current_page + 1
            );
        }
    }

    /**
     * Check mode is changed and reload order list
     *
     * @param nextProps
     * @return {boolean}
     */
    isModeChange(nextProps) {
        if (nextProps.mode && (nextProps.mode !== this.state.mode)) {
            this.setState({mode: nextProps.mode});
            this.startLoading();
            this.clearItems();
            this.loadOrder(this.state.searchKey, OrderConstant.PAGE_SIZE, 1);
            return true;
        }
        return false;
    }

    /**
     * Load order by props action.searchOrder which was mapped in
     * @param searchKey
     * @param pageSize
     * @param currentPage
     */
    loadOrder(searchKey = '', pageSize = OrderConstant.PAGE_SIZE, currentPage = 1) {
        let queryService = QueryService.reset();
        if (!this.state.searchAllTime) {
            queryService.addSearchCriteriaParam('is_limit', 1);
        }
        queryService.setOrder('created_at', 'DESC').setPageSize(pageSize).setCurrentPage(currentPage);
        queryService.addFieldToFilter('state', StatusConstant.STATE_HOLDED, 'neq');
        queryService.addSearchCriteriaParam('is_hold', 0);
        queryService.addQueryString(searchKey);
        this.props.actions.searchOrder(queryService, searchKey, this.state.searchAllTime);
    }

    /**
     * get display list
     * @returns {Array}
     */
    getDisplayList() {
        let groupDays = [];
        let displayList = [];
        this.state.items.map(item => {
            let date = moment(DateTimeHelper.convertDatabaseDateTimeToLocalDate(item.created_at)).format('L');
            let index = groupDays.indexOf(date);
            if (index === -1) {
                groupDays.push(date);
                displayList[groupDays.length - 1] = {
                    date: date,
                    orderItems: []
                };
                displayList[groupDays.length - 1].orderItems.push(item);
            } else {
                displayList[index].orderItems.push(item);
            }
            return null;
        });
        return displayList;
    }

    /**
     * handle select order
     * @param order
     */
    selectOrder(order) {
        this.props.setCurrentOrder(order);
    }

    /**
     * Focus search order input
     *
     * @param event
     */
    clickSearchBox(event) {
        if (!this.isSearching()) {
            this.startSearching();
        }
    }

    /**
     * Blur order search box
     * @param event
     */
    blurSearchBox(event) {
        if (!this.state.searchKey) {
            this.stopSearching();
        }
    }

    /**
     * Change search key of list
     *
     * @param {string} searchKey
     */
    changeSearchKey(searchKey) {
        if (searchKey !== this.state.searchKey) {
            if (this.state.searchAllTime && !window.navigator.onLine) {
                this.props.setShowNoInternet(true);
                this.clearItems();
            } else {
                let text = searchKey.trim();
                // this.clearBarcodeString();
                this.setState({
                    searchKey: text,
                    isSecondLoad: true,
                });
                this.props.setShowNoInternet(false);
                this.clearItems();
                this.startLoading();
                this.loadOrder(text);
            }
        }
    }

    /**
     * Cancel searching list
     */
    cancelSearching() {
        this.setState({
            searchKey: '',
            isSecondLoad: true,
        });
        this.clearBarcodeString();
        this.closeScanner();
        this.stopSearching();
        this.clearItems();
        this.startLoading();
        this.loadOrder();
    }


    /**
     * handle click search all time radio button
     * @param event
     */
    handleSearchAllTimeRadio(event) {
        this.setState({
            searchAllTime: !!Number(event.target.value)
        }, () => this.changeSearchKey(this.state.searchKey + ' '));
    }

    /**
     * open scanner
     */
    openScanner() {
        this.props.openScanner();
    }

    /**
     * close scanner
     */
    closeScanner() {
        this.props.closeScanner();
    }

    /**
     * clear barcode string
     */
    clearBarcodeString() {
        this.props.clearBarcodeString();
    }

    /**
     * get radio time label
     * @return {*}
     */
    getRadioTimeLabel() {
        let configOrderSince = ConfigHelper.getConfig(OrderConstant.XML_PATH_CONFIG_SYNC_ORDER_SINCE);
        let labelTime = '';

        switch (configOrderSince) {
            case OrderConstant.ORDER_SINCE_24H:
                labelTime += 'Last 24 hours';
                break;
            case OrderConstant.ORDER_SINCE_7_DAYS:
                labelTime += 'Last 7 days';
                break;
            case OrderConstant.ORDER_SINCE_MONTH:
                labelTime += 'Current month';
                break;
            case OrderConstant.ORDER_SINCE_YTD:
                labelTime += 'YTD';
                break;
            case OrderConstant.ORDER_SINCE_2_YTD:
                labelTime += '2YTD';
                break;
            default:
                break;
        }
        return this.props.t(labelTime);
    }

    /**
     * template
     * @returns {*}
     */
    template() {
        let displayList = this.getDisplayList();
        return (
            <div className={"wrapper-order-left "
                                + ((this.isSearching() || this.state.searchKey) ? 'search-focus' : '')}>
                <div className="block-title">{this.props.t("Orders")}</div>
                <OrderSearchForm clickSearchBox={(event) => this.clickSearchBox(event)}
                                 blurSearchBox={(event) => this.blurSearchBox(event)}
                                 changeSearchKey={(event) => this.changeSearchKey(event)}
                                 cancelSearching={() => this.cancelSearching()}
                                 searchKey={this.state.searchKey}
                                 scanningBarcode={this.props.scanningBarcode}
                                 barcodeString={this.props.barcodeString}
                                 openScanner={() => this.openScanner()}
                                 isSearching={() => this.isSearching()}/>
                {
                    this.isSearching() && this.state.searchKey ?
                        <div className="search-alltime">
                            <label>
                                <input type="radio" name="optionsRadios" value="0"
                                       checked={!this.state.searchAllTime}
                                       onChange={this.handleSearchAllTimeRadio.bind(this)}/>
                                <span>{this.getRadioTimeLabel()}</span>
                            </label>
                            <label>
                                <input type="radio" name="optionsRadios" value="1"
                                       checked={this.state.searchAllTime}
                                       onChange={this.handleSearchAllTimeRadio.bind(this)}/>
                                <span>{this.props.t('All time')}</span>
                            </label>
                        </div>
                        :
                        null
                }
                <div className="block-order-list" ref={this.setBlockOrderListElement}>
                    <div>
                        {
                            displayList.map(item => {
                               return (
                                   <div className="items" key={item.date}>
                                       <div className="item-title">{item.date}</div>
                                       <ul className="item-list">
                                           {
                                               item.orderItems.map((order) => {
                                                   return (
                                                       <Order key={order.increment_id} order={order}
                                                              selectOrder={this.selectOrder.bind(this)}
                                                              isActive={(this.props.currentOrder && order.increment_id
                                                                    === this.props.currentOrder.increment_id)}/>
                                                   )
                                               })
                                           }
                                       </ul>
                                   </div>
                               );
                            })
                        }
                    </div>
                    <div className="loader-product"
                         style={{display: (this.isLoading() ? 'block' : 'none')}}>
                    </div>
                </div>
            </div>
        )
    }
}

class OrderListContainer extends CoreContainer {
    static className = 'OrderListContainer';

    /**
     * map state to component's props
     * @param state
     * @return {{mode: *, orders: *, search_criteria: *, total_count: *, search_key: *, request_mode: *}}
     */
    static mapState(state) {
        let {mode} = state.core.sync;
        let {
            orders, search_criteria, total_count, search_key,
            searchAllTime, request_mode, updated_orders, deleted_order_ids
        } = state.core.order.orderList;
        return {
            mode: mode,
            orders: orders,
            search_criteria: search_criteria,
            total_count: total_count,
            search_key: search_key,
            searchAllTime: searchAllTime,
            request_mode: request_mode,
            updated_orders: updated_orders,
            deleted_order_ids: deleted_order_ids
        };
    }

    /**
     * map actions to component's props
     * @param dispatch
     * @return {{actions: {searchOrder: function(*=, *=, *=): *, resetSyncActionUpdateOrder: function(): *}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                searchOrder: (queryService, searchKey, searchAllTime) =>
                    dispatch(OrderAction.searchOrder(queryService, searchKey, searchAllTime)),
                resetSyncActionUpdateOrder: () => dispatch(OrderAction.syncActionUpdateDataFinish()),
                resetSyncDeletedOrders: () => dispatch(OrderAction.syncDeletedOrderFinish())
            }
        }
    }
}

export default ContainerFactory.get(OrderListContainer).withRouter(
    ComponentFactory.get(OrderList)
);