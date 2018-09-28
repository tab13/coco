import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import StockService from "./StockService";
import NumberHelper from "../../helper/NumberHelper";
import StockHelper from "../../helper/StockHelper";

export class StockManagementService extends CoreService {
    static className = 'StockManagementService';

    /**
     * itemsToUpdate's format is like {productId: qty, productId: qty}
     * @param {object} itemsToUpdate
     */
    backItemQty(itemsToUpdate) {
        if (itemsToUpdate && Object.keys(itemsToUpdate).length) {
            let request = StockService.getListByProductIds(Object.keys(itemsToUpdate).map(Number));
            request.then(stockItems => {
                stockItems.forEach(stockItem => {
                    if (itemsToUpdate[stockItem.product_id]) {
                        if (this.canSubtractQty(stockItem)) {
                            stockItem.qty = NumberHelper.addNumber(stockItem.qty, itemsToUpdate[stockItem.product_id]);
                        }
                        if(StockHelper.getCanBackInStock() && stockItem.qty > StockService.getMinQty(stockItem)) {
                            stockItem.is_in_stock = true;
                        }
                    }
                });
                StockService.saveToDb(stockItems);
            });
        }
    }

    /**
     * Check if is possible subtract value from item qty
     *
     * @param stockItem
     * @return {*|boolean}
     */
    canSubtractQty(stockItem) {
        return StockService.getManageStock(stockItem) && StockHelper.canSubtractQty();
    }
}

/** @type StockManagementService */
let stockManagementService = ServiceFactory.get(StockManagementService);

export default stockManagementService;

