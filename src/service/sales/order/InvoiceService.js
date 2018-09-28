import {AbstractOrderService} from "../AbstractService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import cloneDeep from 'lodash/cloneDeep';
import InvoiceFactoryService from "./InvoiceFactoryService";
import AppStore from "../../../view/store/store";
import CreditmemoAction from "../../../view/action/order/CreditmemoAction";
import SubtotalService from "./invoice/total/SubtotalService";
import DiscountService from "./invoice/total/DiscountService";
import ShippingService from "./invoice/total/ShippingService";
import TaxService from "./invoice/total/TaxService";
import CostService from "./invoice/total/CostService";
import GrandTotalService from "./invoice/total/GrandTotalService";
import WeeeService from "../../weee/invoice/total/WeeeService";
import GiftcardTotalService from "../../giftcard/order/invoice/total/GiftcardService";
import InvoicePriceService from "./invoice/InvoicePriceService";
import InvoiceItemService from "./invoice/InvoiceItemService";
import NumberHelper from "../../../helper/NumberHelper";
import {RewardPointHelper} from "../../../helper/RewardPointHelper";
import CustomerService from "../../customer/CustomerService";

export class InvoiceService extends AbstractOrderService {
    static className = 'InvoiceService';

    isInitTotalCollectors = false;

    totalModels = [
        {
            name: "subtotal",
            class: SubtotalService,
            sort_order: 50
        },
        {
            name: "discount",
            class: DiscountService,
            sort_order: 100
        },
        {
            name: "shipping",
            class: ShippingService,
            sort_order: 150
        },
        {
            name: "giftvoucher",
            class: GiftcardTotalService,
            sort_order: 170
        },
        {
            name: "tax",
            class: TaxService,
            sort_order: 200
        },
        {
            name: "cost_total",
            class: CostService,
            sort_order: 250
        },
        {
            name: "grand_total",
            class: GrandTotalService,
            sort_order: 350
        },
        {
            name: "weee",
            class: WeeeService,
            sort_order: 600
        },
    ];

    /**
     * Create invoice after place order
     *
     * @param order
     */
    createInvoiceAfterPlaceOrder(order) {
        let items = {};
        order.items.forEach(item => {
            items[item.item_id] = item.qty_ordered;
        });
        let invoice = {
            order: order,
            params: {
                items: items
            }
        };

        invoice = this.createInvoice(invoice);
        invoice = this.register(invoice);
        /** reward point */
        if (
            RewardPointHelper.isEnabledRewardPoint()
            && order.customer_id
            && !RewardPointHelper.holdPointDay()
        ) {
            CustomerService.rewardCustomerWithPoint(
                order.customer_id,
                order.rewardpoints_earn - order.rewardpoints_spent
            );
        }

        return invoice.order;
    }

    /**
     * Execute invoice
     *
     * @param invoice
     * @return {*}
     */
    createInvoice(invoice) {
        let params = invoice.params;
        let qtys = params.items;
        let order = cloneDeep(invoice.order);
        invoice.order = order;
        invoice = InvoiceFactoryService.prepareInvoice(invoice, order, qtys);
        this.collectTotal(invoice);
        return invoice;
    }

    /**
     * Init total collectors
     */
    initTotalCollectors() {
        if (!this.isInitTotalCollectors) {
            AppStore.dispatch(CreditmemoAction.salesOrderCreditmemoInitTotalCollectors(this));
            this.isInitTotalCollectors = true;
        }
    }

    /**
     * Collect invoice total
     * @param invoice
     * @return {*}
     */
    collectTotal(invoice) {
        this.initTotalCollectors();
        this.totalModels.sort((a, b) => a.sort_order - b.sort_order);
        InvoicePriceService.resetCalculators();
        this.totalModels.map(model => model.class.collect(invoice));
        return invoice;
    }

    /**
     * Register invoice. Apply to order, order items.
     *
     * @param invoice
     * @return {*}
     */
    register(invoice) {
        if (invoice && invoice.items && invoice.items.length) {
            invoice.items.forEach(item => {
                InvoiceItemService.register(item);
            });
        }
        let order = invoice.order;
        order.base_total_invoiced = NumberHelper.addNumber(order.base_total_invoiced, invoice.base_grand_total);
        order.total_invoiced = NumberHelper.addNumber(order.total_invoiced, invoice.grand_total);
        order.base_subtotal_invoiced = NumberHelper.addNumber(order.base_subtotal_invoiced, invoice.base_subtotal);
        order.subtotal_invoiced = NumberHelper.addNumber(order.subtotal_invoiced, invoice.subtotal);
        order.base_tax_invoiced = NumberHelper.addNumber(order.base_tax_invoiced, invoice.base_tax_amount);
        order.tax_invoiced = NumberHelper.addNumber(order.tax_invoiced, invoice.tax_amount);
        order.base_discount_tax_compensation_invoiced = NumberHelper.addNumber(
            order.base_discount_tax_compensation_invoiced, invoice.base_discount_tax_compensation_amount
        );
        order.discount_tax_compensation_invoiced = NumberHelper.addNumber(
            order.discount_tax_compensation_invoiced, invoice.discount_tax_compensation_amount
        );
        order.base_shipping_tax_invoiced = NumberHelper.addNumber(
            order.base_shipping_tax_invoiced, invoice.base_shipping_tax_amount
        );
        order.shipping_tax_invoiced = NumberHelper.addNumber(order.shipping_tax_invoiced, invoice.shipping_tax_amount);
        order.base_shipping_invoiced = NumberHelper.addNumber(
            order.base_shipping_invoiced, invoice.base_shipping_amount
        );
        order.shipping_invoiced = NumberHelper.addNumber(order.shipping_invoiced, invoice.shipping_amount);
        order.base_discount_invoiced = NumberHelper.addNumber(
            order.base_discount_invoiced, invoice.base_discount_amount
        );
        order.discount_invoiced = NumberHelper.addNumber(order.discount_invoiced, invoice.discount_amount);
        order.base_total_invoiced_cost = NumberHelper.addNumber(order.base_total_invoiced_cost, invoice.base_cost);
        return invoice;
    }
}

/** @type InvoiceService */
let invoiceService = ServiceFactory.get(InvoiceService);

export default invoiceService;
