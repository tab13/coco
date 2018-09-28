import CoreService from "../../../CoreService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import NumberHelper from "../../../../helper/NumberHelper";
import StockManagementService from "../../../catalog/StockManagementService";

export class ReturnProcessorService extends CoreService {
    static className = 'ReturnProcessorService';

    execute(creditmemo, order, returnToStockItems = [], isAutoReturn = false) {
        let itemsToUpdate = {};

        if (creditmemo && creditmemo.items && creditmemo.items.length) {
            creditmemo.items.forEach(item => {
                let productId = item.product_id;
                let orderItem = item.order_item;
                let parentItemId = orderItem.parent_item_id;
                let qty = item.qty;
                if (isAutoReturn || this.canReturnItem(item, qty, parentItemId, returnToStockItems)) {
                    if (itemsToUpdate[productId]) {
                        itemsToUpdate[productId] = NumberHelper.addNumber(itemsToUpdate[productId], qty);
                    } else {
                        itemsToUpdate[productId] = qty;
                    }
                }
            })
        }
        if (!Object.keys(itemsToUpdate).length) {
            return this;
        }
        StockManagementService.backItemQty(itemsToUpdate);
    }

    /**
     * @param item
     * @param qty
     * @param parentItemId
     * @param returnToStockItems
     * @return {boolean | *}
     */
    canReturnItem(item, qty, parentItemId, returnToStockItems = []) {
        return (returnToStockItems.includes(item.order_item_id) || returnToStockItems.includes(parentItemId)) && qty;
    }
}

/**
 *
 * @type {ReturnProcessorService}
 */
let returnProcessorService = ServiceFactory.get(ReturnProcessorService);

export default returnProcessorService;