import OrderConstant from '../../../constant/OrderConstant';
import {Observable} from 'rxjs';
import LocationHelper from "../../../../helper/LocationHelper";
import StockService from "../../../../service/catalog/StockService";
import QuoteService from "../../../../service/checkout/QuoteService";
import NumberHelper from "../../../../helper/NumberHelper";
import OnHoldOrderConstant from "../../../constant/OnHoldOrderConstant";
import ProductAction from "../../../action/ProductAction";

/**
 * Deduce
 *
 * Receive action type(PLACE_ORDER_AFTER) and request, response list product
 * @param action$
 */
export default function PlaceOrderAfterEpic(action$) {
    return action$.ofType(OrderConstant.PLACE_ORDER_AFTER, OnHoldOrderConstant.HOLD_ORDER_AFTER)
        .mergeMap(action => {
            let order = action.order;
            if (!order.pos_fulfill_online || LocationHelper.isPrimaryLocation()) {
                let productIdsQty = getOrderProductIdsQty(action.quote);
                return Observable.from(
                    StockService.getListByProductIds(Object.keys(productIdsQty).map(Number))
                ).mergeMap(stocks => {
                    stocks.map(stock => {
                        if (productIdsQty[stock.product_id]) {
                            stock.qty = parseFloat(stock.qty) - parseFloat(productIdsQty[stock.product_id])
                        }
                        return stock;
                    });
                    StockService.getResourceModel().getResourceOffline().bulkPut(stocks);
                    return Observable.of(ProductAction.syncActionUpdateStockDataFinish(stocks));
                }).catch(error => {
                    console.log(error);
                    return Observable.empty();
                })
            }
            return Observable.empty()
        });
}

/**
 * Get order product ids qty from quote
 *
 * @param quote
 * @return {{}}
 */
function getOrderProductIdsQty(quote) {
    let productIds = {};
    let parentItems = {};
    quote.items.map(item => {
        if (item.product && item.product.id) {
            if (StockService.getProductStockService(item.product).isManageStock(item.product)) {
                if (!productIds[item.product.id]) {
                    productIds[item.product.id] = 0;
                }
                let qty = item.qty;
                if (item.parent_item_id) {
                    let parentItemId = item.parent_item_id;
                    if (!parentItems[parentItemId]) {
                        let parentItem = QuoteService.getParentItem(quote, item);
                        if (parentItem) {
                            parentItems[parentItemId] = parentItem;
                        }
                    }
                    if (parentItems[parentItemId] && parentItems[parentItemId].item_id) {
                        qty = NumberHelper.multipleNumber(qty, parentItems[parentItemId].qty);
                    }
                }
                productIds[item.product.id] = NumberHelper.addNumber(productIds[item.product.id], qty);
            }
        }
        return item;
    });
    return productIds;
}