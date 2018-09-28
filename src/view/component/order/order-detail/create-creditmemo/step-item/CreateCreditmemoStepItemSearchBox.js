import React from 'react';
import {CoreComponent} from "../../../../../../framework/component/index";
import CoreContainer from "../../../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../../framework/factory/ContainerFactory";
import SmoothScrollbar from "smooth-scrollbar/index";
import SearchConstant from "../../../../../constant/SearchConstant";
import NumberHelper from "../../../../../../helper/NumberHelper";
import OrderItemService from "../../../../../../service/sales/order/OrderItemService";
import ProductTypeConstant from "../../../../../constant/ProductTypeConstant";

class CreateCreditmemoStepItemSearchBoxComponent extends CoreComponent {
    static className = 'CreateCreditmemoStepItemSearchBoxComponent';

    lastChangeKey;
    is_scan_barcode = false;

    setInputSearchElement = element => this.searchInputElement = element;
    setSearchSuggestFormElement = element => {
        if (this.scrollbar) {
            SmoothScrollbar.destroy(this.scrollbar);
        }
        if (element) {
            this.searchSuggestFormElement = element;
            this.scrollbar = SmoothScrollbar.init(this.searchSuggestFormElement);
        }
    };

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            active_search_box: false,
            is_searching: false,
            search_key: "",
            is_scan_barcode: false,
            searched_items: []
        }
    }

    /**
     * Get order item options
     *
     * @param creditmemo_item_param
     * @return {*}
     */
    getItemOptions(creditmemo_item_param) {
        let orderItem = creditmemo_item_param.order_item;
        let options = [];
        if (orderItem.product_type === ProductTypeConstant.BUNDLE) {
            let childrens = OrderItemService.getChildrenItems(orderItem, this.props.order);
            options = childrens.map(children => {
                return children.qty_ordered + " x " + children.name;
            });
        } else {
            options = OrderItemService.getOrderItemOptionLabelsAsArray(orderItem, this.props.order);
        }
        if (!options || !options.length) {
            return null;
        }
        return options.join(', ');
    }

    /**
     * Active search box
     * @param isActive
     */
    activeSearchBox(isActive = true) {
        let timeout = isActive ? 0 : 100;
        if (this.timeoutActiveSearchbox) {
            clearTimeout(this.timeoutActiveSearchbox);
        }
        this.timeoutActiveSearchbox = setTimeout(() => this.setState({active_search_box: isActive}), timeout);
    }

    /**
     * Prepare before change search key
     *
     * @param event
     */
    beforeChangeSearchKey(event) {
        let now = Date.now();
        let diffTime = this.lastChangeKey ? (now - this.lastChangeKey.timeStamp) : -1;
        this.lastChangeKey = {
            key: event.key,
            timeStamp: now
        };
        let is_scan_barcode = false;
        if (
            diffTime > 0 &&
            diffTime < SearchConstant.MAX_DIFF_TIME_WITH_SCAN_BARCODE &&
            this.lastChangeKey.key === SearchConstant.ENTER_KEY
        ) {
            is_scan_barcode = true;
        }
        this.is_scan_barcode = is_scan_barcode;
        this.setState({search_key: event.target.value});
        if (event.target.value) {
            this.setState({is_searching: true});
            this.searchItem(event.target.value);
        } else {

        }
    }

    /**
     * Remove search key
     */
    removeSearchKey() {
        if (this.searchInputElement) {
            this.searchInputElement.value = "";
        }
        this.setState({search_key: ""});
    }

    /**
     *
     * @param search_key
     */
    searchItem(search_key) {
        let searched_items = [];
        Object.keys(this.props.creditmemo_items_param).forEach(orderItemId => {
            let creditmemo_item_param = this.props.creditmemo_items_param[orderItemId];
            let orderItem = creditmemo_item_param.order_item;
            let isValid = this.itemIsValidSearchKey(orderItem, search_key);
            if (isValid) {
                let searched_item = this.getSearchedItem(searched_items, orderItem);
                if (searched_item.creditmemo_items_param_will_increasing.length) {
                    searched_items.push(searched_item);
                }
            }

            /*let creditmemo_item_param = this.props.creditmemo_items_param[orderItemId];
            if (!creditmemo_item_param.qty_to_refund) {
                return false;
            } else {
                let name = creditmemo_item_param.order_item.name ? creditmemo_item_param.order_item.name : "";
                let sku = creditmemo_item_param.order_item.sku ? creditmemo_item_param.order_item.sku : "";
                let searchString = creditmemo_item_param.order_item.search_string ?
                    creditmemo_item_param.order_item.search_string : "";
                let isSearched = [name.toLowerCase(), sku.toLowerCase(), searchString.toLowerCase()].find(text =>
                    text.includes(search_key.toLowerCase())
                );
                if (isSearched) {
                    searched_items.push(creditmemo_item_param);
                }
            }*/
        });
        console.log(searched_items);
        /*if (this.is_scan_barcode && searched_items.length === 1) {
            this.increaseQty(searched_items[0]);
        } else {
            this.setState({searched_items});
        }*/
    }

    /**
     * Check order item is valid search key
     *
     * @param orderItem
     * @param search_key
     * @return {boolean}
     */
    itemIsValidSearchKey(orderItem, search_key) {
        let name = orderItem.name ? orderItem.name : "";
        let sku = orderItem.sku ? orderItem.sku : "";
        let searchString = orderItem.search_string ? orderItem.search_string : "";
        let isSearched = [name.toLowerCase(), sku.toLowerCase(), searchString.toLowerCase()].find(text =>
            text.includes(search_key.toLowerCase())
        );
        return !!isSearched;
    }

    getSearchedItem(searched_items, orderItem) {
        let result = {
                order_item: orderItem,
                creditmemo_items_param_will_increasing: []
            },
            order = this.props.order,
            creditmemo_items_param = this.props.creditmemo_items_param || {};
        if (!orderItem.parent_item_id) {
            if (orderItem.product_type !== ProductTypeConstant.BUNDLE ||
                !OrderItemService.isChildrenCalculated(orderItem, order)) {
                if (OrderItemService.getQtyToRefund(orderItem, order) && creditmemo_items_param[orderItem.item_id]) {
                    result.creditmemo_items_param_will_increasing.push(creditmemo_items_param[orderItem.item_id]);
                }
                return result;
            }
            if (OrderItemService.isChildrenCalculated(orderItem, order)) {
                let childrens = OrderItemService.getChildrenItems(orderItem, order);
                if (childrens && childrens.length) {
                    childrens.forEach(child => {
                        if (OrderItemService.getQtyToRefund(child, order) && creditmemo_items_param[child.item_id]) {
                            result.creditmemo_items_param_will_increasing.push(creditmemo_items_param[child.item_id]);
                        }
                    })
                }
            }
            return result;
        } else {
            let parentItem = OrderItemService.getParentItem(orderItem, order);
            if (parentItem.product_type === ProductTypeConstant.BUNDLE) {
                if (OrderItemService.getQtyToRefund(orderItem, order) && creditmemo_items_param[orderItem.item_id]) {
                    result.creditmemo_items_param_will_increasing.push(creditmemo_items_param[orderItem.item_id]);
                } else {
                    if (OrderItemService.getQtyToRefund(parentItem, order)
                        && creditmemo_items_param[parentItem.item_id]) {
                        result.creditmemo_items_param_will_increasing.push(creditmemo_items_param[parentItem.item_id]);
                    }
                }
            } else {
                if (OrderItemService.getQtyToRefund(parentItem, order) && creditmemo_items_param[parentItem.item_id]) {
                    result.creditmemo_items_param_will_increasing.push(creditmemo_items_param[parentItem.item_id]);
                }
            }
        }
        return result;
    }

    /**
     * Add item
     *
     * @param creditmemo_item_param
     */
    increaseQty(creditmemo_item_param) {
        let qty = NumberHelper.addNumber(creditmemo_item_param.qty, 1);
        this.props.increaseQty(creditmemo_item_param, {qty: qty}, true);
        this.setState({search_key: "", searched_items: [], is_searching: false})
        this.searchInputElement.value = "";
        this.searchInputElement.focus();
    }

    /**
     * template to render
     * @returns {*}
     */
    template() {
        return (
            <div className="box-search">
                <button className="btn-search" type="button"><span>search</span></button>
                <input className={"input-search form-control" + (this.state.active_search_box ? " active" : "")}
                       ref={this.setInputSearchElement}
                       placeholder={this.state.active_search_box ? "" : this.props.t("Scan barcode of returning items")}
                       type="text"
                       onFocus={() => this.activeSearchBox(true)}
                       onBlur={() => this.activeSearchBox(false)}
                       onKeyUp={(event) => this.beforeChangeSearchKey(event)}/>
                <button className={"btn-remove" + (this.state.search_key ? " active" : "")}
                        type="button"
                        onClick={() => this.removeSearchKey()}>
                    <span>remove</span>
                </button>
                {
                    this.state.search_key && this.state.active_search_box ?
                        <div className="search-suggest" ref={this.setSearchSuggestFormElement}>
                            <div
                                className={"suggest-count" + (this.state.searched_items.length === 1 ? " hidden" : "")}>
                                {
                                    this.state.searched_items.length ?
                                        this.props.t(
                                            "{{total}} products are found.", {total: this.state.searched_items.length}
                                        ) :
                                        this.props.t("Item is not found in this order!")
                                }
                            </div>
                            <ul className="suggest-items">
                               {/* {
                                    this.state.searched_items.map(item => {
                                        return <li key={item.order_item.item_id}
                                                   className="suggest-item"
                                                   onClick={() => this.increaseQty(item)}>
                                            <strong className="title">
                                                {"[" + item.order_item.sku + "] " + item.order_item.name}
                                            </strong>
                                            <span className="subtitle">
                                                {this.getItemOptions(item)}&nbsp;
                                            </span>
                                        </li>
                                    })
                                }*/}
                            </ul>
                        </div> :
                        null
                }
            </div>
        );
    }
}

class CreateCreditmemoStepItemSearchBoxContainer extends CoreContainer {
    static className = 'CreateCreditmemoStepItemSearchBoxContainer';
}

/**
 * @type {CreateCreditmemoStepItemSearchBoxContainer}
 */
export default ContainerFactory.get(CreateCreditmemoStepItemSearchBoxContainer).withRouter(
    ComponentFactory.get(CreateCreditmemoStepItemSearchBoxComponent)
)