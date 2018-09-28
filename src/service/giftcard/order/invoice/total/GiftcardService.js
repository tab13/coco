import {InvoiceAbstractTotalService} from "../../../../sales/order/invoice/total/AbstractTotalService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import NumberHelper from "../../../../../helper/NumberHelper";
import OrderItemService from "../../../../sales/order/OrderItemService";
import InvoicePriceService from "../../../../sales/order/invoice/InvoicePriceService";

export class InvoiceGiftcardTotalService extends InvoiceAbstractTotalService {
    static className = 'InvoiceGiftcardTotalService';

    /**
     * Collect invoice tax
     *
     * @param invoice
     * @return {InvoiceTaxService}
     */
    collect(invoice) {
        let order = invoice.order;
        if(!order.gift_voucher_discount) {
            return this;
        }
        let baseTotalDiscountAmountGiftvoucher = 0,
            totalDiscountAmountGiftvoucher = 0,
            totalGiftvoucherDiscountInvoiced = 0,
            baseTotalGiftvoucherDiscountInvoiced = 0;
        let addShippingDiscount = true;

        if(addShippingDiscount) {
            totalDiscountAmountGiftvoucher = order.giftvoucher_discount_for_shipping;
            baseTotalDiscountAmountGiftvoucher = order.base_giftvoucher_discount_for_shipping;
        }

        if(this.isLast(invoice)) {
            totalDiscountAmountGiftvoucher = NumberHelper.minusNumber(
                order.gift_voucher_discount, totalGiftvoucherDiscountInvoiced
            );
            totalDiscountAmountGiftvoucher = NumberHelper.minusNumber(
                order.base_gift_voucher_discount, baseTotalGiftvoucherDiscountInvoiced
            );
        } else {
            if (invoice.items && invoice.items.length) {
                invoice.items.forEach(item => {
                    let orderItem = item.order_item;
                    if (OrderItemService.isDummy(orderItem, order)) {
                        return false;
                    }
                    let orderItemDiscountGiftvoucher = orderItem.gift_voucher_discount;
                    let baseOrderItemDiscountGiftvoucher = orderItem.base_gift_voucher_discount;

                    let orderItemQty = orderItem.qty_ordered;
                    let invoiceItemQty = item.qty;

                    if(orderItemDiscountGiftvoucher && orderItemQty) {
                        let discount = InvoicePriceService.roundPrice(
                            orderItemDiscountGiftvoucher / orderItemQty * invoiceItemQty,
                            'regular',
                            false
                        );
                        let baseDiscount = InvoicePriceService.roundPrice(
                            baseOrderItemDiscountGiftvoucher / orderItemQty * invoiceItemQty,
                            'base',
                            false
                        );
                        totalDiscountAmountGiftvoucher += discount;
                        baseTotalDiscountAmountGiftvoucher += baseDiscount;
                    }
                });
            }
        }

        invoice.base_gift_voucher_discount = baseTotalDiscountAmountGiftvoucher;
        invoice.gift_voucher_discount = totalDiscountAmountGiftvoucher;

        return this;
    }
}

/** @type invoiceGiftcardTotalService */
let invoiceGiftcardTotalService = ServiceFactory.get(InvoiceGiftcardTotalService);

export default invoiceGiftcardTotalService;