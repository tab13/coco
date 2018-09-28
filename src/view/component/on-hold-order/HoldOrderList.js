import React from "react";
import ComponentFactory from '../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../framework/container/CoreContainer';
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import SmoothScrollbar from "smooth-scrollbar";
import Config from "../../../config/Config";
import QueryService from "../../../service/QueryService";
import DateTimeHelper from "../../../helper/DateTimeHelper";
import AbstractGrid from "../../../framework/component/grid/AbstractGrid";
import HoldOrder from "./hold-order-list/HoldOrder";
import OrderConstant from "../../constant/OrderConstant";
import HoldOrderSearchForm from "./hold-order-list/HoldOrderSearchForm";
import moment from "moment/moment";
import OnHoldOrderAction from "../../action/OnHoldOrderAction";
import StatusConstant from "../../constant/order/StatusConstant";
import _ from "lodash";

export class HoldOrderList extends AbstractGrid {
    static className = 'HoldOrderList';

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
            if (!nextProps.currentOrder && this.state.items.length) {
                let newItems = this.state.items.filter(item => item !== this.props.currentOrder);
                this.setState({
                    items: newItems
                });
                this.props.setCurrentOrder(newItems[0]);
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
        queryService.setOrder('created_at', 'DESC').setPageSize(pageSize).setCurrentPage(currentPage);
        queryService.addQueryString(searchKey);
        queryService.addFieldToFilter('state', StatusConstant.STATE_HOLDED, 'eq');
        queryService.addSearchCriteriaParam('is_hold', 1);
        this.props.actions.searchOrder(queryService, searchKey);
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
     * blur search box
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
            let text = searchKey.trim();
            // this.clearBarcodeString();
            this.setState({
                searchKey: text,
                isSecondLoad: true,
            });
            this.clearItems();
            this.startLoading();
            this.loadOrder(text);
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
     * template
     * @returns {*}
     */
    template() {
        let displayList = this.getDisplayList();
        return (
            <div className={"wrapper-order-left "
                            + ((this.isSearching() || this.state.searchKey) ? 'search-focus' : '')}>
                <div className="block-title">{this.props.t("On-Hold Orders")}</div>
                <HoldOrderSearchForm clickSearchBox={(event) => this.clickSearchBox(event)}
                                     blurSearchBox={(event) => this.blurSearchBox(event)}
                                     changeSearchKey={(event) => this.changeSearchKey(event)}
                                     cancelSearching={() => this.cancelSearching()}
                                     searchKey={this.state.searchKey}
                                     scanningBarcode={this.props.scanningBarcode}
                                     barcodeString={this.props.barcodeString}
                                     openScanner={() => this.openScanner()}
                                     isSearching={() => this.isSearching()}/>
                <div className="block-order-list" data-scrollbar ref={this.setBlockOrderListElement}>
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
                                                       <HoldOrder key={order.increment_id} order={order}
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

class HoldOrderListContainer extends CoreContainer {
    static className = 'HoldOrderListContainer';

    /**
     * map state to component's props
     * @param state
     * @return {{mode: *, orders: *, search_criteria: *, total_count: *, search_key: *, request_mode: *}}
     */
    static mapState(state) {
        let {mode} = state.core.sync;
        let {
            orders, search_criteria, total_count, search_key, request_mode, updated_orders, deleted_order_ids
        } = state.core.onHoldOrder.holdOrderList;
        return {
            mode: mode,
            orders: orders,
            search_criteria: search_criteria,
            total_count: total_count,
            search_key: search_key,
            request_mode: request_mode,
            updated_orders: updated_orders,
            deleted_order_ids: deleted_order_ids,
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
                searchOrder: (queryService, searchKey) =>
                    dispatch(OnHoldOrderAction.searchOrder(queryService, searchKey)),
                resetSyncActionUpdateOrder: () => dispatch(OnHoldOrderAction.syncActionUpdateOnHoldOrderFinish()),
                resetSyncDeletedOrders: () => dispatch(OnHoldOrderAction.syncDeletedHoldOrderFinish())
            }
        }
    }
}

/**
 * @type {HoldOrderList}
 */
export default ContainerFactory.get(HoldOrderListContainer).withRouter(
    ComponentFactory.get(HoldOrderList)
);