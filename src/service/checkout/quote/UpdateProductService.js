import ServiceFactory from "../../../framework/factory/ServiceFactory";
import {AbstractQuoteService} from "./AbstractService";
import StockService from "../../catalog/StockService";
import i18n from "../../../config/i18n";
import ProductTypeConstant from "../../../view/constant/ProductTypeConstant";
import NumberHelper from "../../../helper/NumberHelper";

export class UpdateProductService extends AbstractQuoteService {
    static className = 'UpdateProductService';

    /**
     * update qty after change on number pad
     * @param quote
     * @param item
     * @param qty
     * @return {*}
     */
    updateQty(quote, item, qty) {
        if (!qty) {
            qty = 0;
        }
        let product = item.product;

        if (item.product_type === ProductTypeConstant.CONFIGURABLE) {
            product = this.getChildrenItems(quote, item)[0].product;
        }

        if (item.product_type === ProductTypeConstant.BUNDLE) {
            return this.updateBundleQty(quote, item, qty);
        }

        let totalQty = this.getProductTotalItemsQtyInCart(null, quote, product.id);

        let validateQty = totalQty;

        if (totalQty) {
            validateQty = NumberHelper.addNumber(totalQty, -item.qty, qty);
        }

        /** validate qty increments */
        let {
            qtyIncrement,
            isEnableQtyIncrements,
            minSaleQty,
            isQtyDecimal,
            max,
        } = StockService.getStockInfo(product);

        if (isEnableQtyIncrements && qty % qtyIncrement !== 0) {
            return {
                success: false,
                message: i18n.translator.translate('Please enter multiple of {{qty}}', {qty: qtyIncrement})
            }
        }

        /** validate qty max / min */
        if (validateQty > max) {
            return {
                success: false,
                message: i18n.translator.translate('Error: The most quantity to sell is {{qty}}', {qty: max})
            }
        }

        let realMin;
        if (isQtyDecimal) {
            realMin = Math.max(0, minSaleQty);
        } else {
            realMin = Math.max(1, minSaleQty);
        }

        if (realMin > qty) {
            return {
                success: false,
                message: i18n.translator.translate('Error: The fewest you may purchase is {{qty}}', {qty: realMin})
            }
        }

        let existedItem = quote.items.find(quoteItem => quoteItem.item_id === item.item_id);
        if (existedItem) {
            existedItem.qty = qty;
        }

        return {
            success: true,
            quote: quote
        };
    }

    /**
     * Update qty of bundle item in cart
     *
     * @param quote
     * @param item
     * @param qty
     * @return {{success: boolean}}
     */
    updateBundleQty(quote, item, qty) {
        let result = {
            success: true
        };

        if (!qty) {
            return {
                success: false,
                message: i18n.translator.translate('Cart item must be larger than 0')
            }
        }

        let qtyIncrement = StockService.getProductStockService(item.product).getQtyIncrement(item.product);

        if (qty % qtyIncrement !== 0) {
            return {
                success: false,
                message: i18n.translator.translate('Please enter multiple of {{qty}}', {qty: qtyIncrement})
            }
        }

        let childItems = this.getChildrenItems(quote, item);
        childItems.map(child => {
            if (result.success === false) {
                return false;
            }
            let product = child.product;
            let totalQty = this.getProductTotalItemsQtyInCart(null, quote, product.id);
            let validateQty = totalQty;
            if (totalQty) {
                validateQty = NumberHelper.addNumber(
                    totalQty,
                    -NumberHelper.multipleNumber(child.qty, item.qty),
                    NumberHelper.multipleNumber(child.qty, qty)
                );
            }
            let {
                minSaleQty,
                isQtyDecimal,
                max,
            } = StockService.getStockInfo(product);

            /** validate qty max / min */
            if (validateQty > max) {
                result = {
                    success: false,
                    message: i18n.translator.translate(
                        'The most "{{product}}" quantity to sell is {{qty}}',
                        {product: child.name, qty: max})
                }
            }

            let realMin;
            if (isQtyDecimal) {
                realMin = Math.max(0, minSaleQty);
            } else {
                realMin = Math.max(1, minSaleQty);
            }

            if (realMin > NumberHelper.multipleNumber(item.qty, qty)) {
                result = {
                    success: false,
                    message: i18n.translator.translate(
                        'The fewest "{{product}}" quantity you may purchase is {{qty}}',
                        {product: child.name, qty: realMin}
                    )
                }
            }
            return child;
        });

        if (result.success === false) {
            return result;
        }

        let existedItem = quote.items.find(quoteItem => quoteItem.item_id === item.item_id);
        if (existedItem) {
            existedItem.qty = qty;
        }

        result.quote = quote;
        return result;
    }
}

/**
 *
 * @type {UpdateProductService}
 */
const addProductService = ServiceFactory.get(UpdateProductService);
export default addProductService;