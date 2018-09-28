import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";

export class AbstractOrderService extends CoreService {
    static className = 'AbstractOrderService';

    /**
     * Get order item from product id
     *
     * @param order
     * @param productId
     */
    getItemsByProductId(order, productId) {
        return order.items.filter(item => item.product_id === productId);
    }

    /**
     * Get children items from order item parent id
     *
     * @param parentItem
     * @param order
     * @return {mixed[]|boolean}
     */
    getChildrenItems(parentItem, order) {
        if (parentItem.type_id === 'simple') {
            return false;
        }
        return order.items.filter(item => +item.parent_item_id === +parentItem.item_id);
    }

    /**
     * Get parent item id from order item id
     *
     * @param childItem
     * @param order
     */
    getParentItem(childItem, order) {
        if (!childItem.parent_item_id) {
            return false;
        }
        return order.items.find(item => (+item.item_id === +childItem.parent_item_id));
    }
}

/**
 *
 * @type {AbstractOrderService}
 */
let abstractOrderService = ServiceFactory.get(AbstractOrderService);

export default abstractOrderService;