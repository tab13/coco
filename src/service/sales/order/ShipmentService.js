import {AbstractOrderService} from "../AbstractService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import OrderItemService from "./OrderItemService";

export class ShipmentService extends AbstractOrderService {
    static className = 'ShipmentService';

    /**
     * Create shipment
     *
     * @param order
     */
    createShipmentAfterPlaceOrder(order) {
        if (order && order.items && order.items.length) {
            order.items.forEach(item => {
                item.qty_shipped = OrderItemService.getQtyToShip(item, order);
            });
        }
    }

    canShipItem(item, order, items = {}) {
        if (item.is_virtual) {
            return false;
        }
        if (OrderItemService.isDummy(item, order, true)) {
            let childrenItems = this.getChildrenItems(item, order);
            if (childrenItems && childrenItems.length) {
                if (OrderItemService.isShipSeparately(item, order)) {
                    return true;
                }
                childrenItems.find(child => {
                    if (child.is_virtual) {
                        return false;
                    }
                    if (!items || !Object.keys(items).length) {
                        if (OrderItemService.getQtyToShip(child, order) > 0) {
                            return true;
                        }
                    } else {
                        if (items[child.item_id] && items[child.item_id] > 0) {
                            return true;
                        }
                    }
                    return false;
                });
                return false;
            } else if (item.parent_item_id) {
                let parent = OrderItemService.getParentItem(item, order);
                if (!items || !Object.keys(items).length) {
                    return OrderItemService.getQtyToShip(parent, order) > 0;
                } else {
                    return items[parent.item_id] && items[parent.item_id] > 0;
                }
            }
        } else {
            return OrderItemService.getQtyToShip(item, order) > 0;
        }
    }
}

/** @type ShipmentService */
let shipmentService = ServiceFactory.get(ShipmentService);

export default shipmentService;