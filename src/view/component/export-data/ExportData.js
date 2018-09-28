import React from 'react';
import {Modal} from 'react-bootstrap'
import {bindActionCreators} from "redux";
import CoreComponent from '../../../framework/component/CoreComponent'
import ComponentFactory from "../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../framework/container/CoreContainer";
import ExportDataPopupAction from "../../action/ExportDataPopupAction";
import ProductTypeConstant from "../../constant/ProductTypeConstant";
import WeeeDataService from "../../../service/weee/WeeeDataService";
import OrderService from "../../../service/sales/OrderService";
import OrderHelper from "../../../helper/OrderHelper"
import ConfigData from "../../../config/Config";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from "moment/moment";

class ExportData extends CoreComponent {
    static className = 'ExportData';

    page;

    /**
     * Constructor
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            popup: '',
            unsynced_order: null
        }
    }

    /**
     * This function after mapStateToProps then push more items to component
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if  (nextProps.success &&
            nextProps.success.error_log &&
            nextProps.success.action_log &&
            nextProps.success.error_log.length === 0 &&
            nextProps.success.action_log.length === 0){
            this.setState({
               popup: 'message_no_data'
            });
        }else if(nextProps.success !== this.props.success){
            this.setState({
                popup: 'confirm_message',
                unsynced_order: nextProps.success
            });
        }
    }

    /**
     * Format time to "180412_083756"
     *
     * @param date
     * @returns {string}
     */
    formatDate(date) {
        let year = date.getFullYear().toString();
        let month = (date.getMonth() + 1).toString();
        let day = date.getDate().toString();
        let hour = date.getHours().toString();
        let minute = date.getMinutes().toString();
        let second = date.getSeconds().toString();
        return year.substring(year.length - 2) + ((month.length < 2)? ('0'+ month) : month) +
            ((day.length < 2)? ('0'+ day) : day) + '_' +
            ((hour.length < 2)? ('0'+ hour) : hour) + ((minute.length < 2)? ('0'+ minute) : minute) +
            ((second.length < 2)? ('0'+ second) : second);
    }

    /**
     * Convert string from special character to English format
     * Example : Vietnamese : Xin lỗi => Xin loi
     *
     * @param str
     * @returns {*}
     */
    convertToEnglish(str) {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
        str = str.replace(/đ/g, 'd');
        str = str.replace(/Đ/g, 'D');
        return str;
    }

    /**
     * Convert string to array so that fix overflow row (>43 character)
     *
     * @param string
     * @returns array[string]
     */
    formatString(string) {
        let arr = [];
        if (string.length < 43) {
            arr.push(string);
            return arr;
        } else {
            let arrayString = string.split(' ');
            let length = arrayString.length;
            let result = [''];
            for(let index = 0; index <= length; index++) {
                if(result[result.length - 1].length > 40) {
                    if(result[result.length - 1].split(' ').length === 1) {
                        result.push(arrayString[index]);
                        continue;
                    }
                    result[result.length - 1] = result[result.length - 1].split(' ');
                    result.push(result[result.length - 1].pop());
                    result[result.length - 2] = result[result.length - 2].join(' ');
                }
                if(arrayString[index]) {
                    if(index === 0) {
                        result[result.length - 1] += arrayString[index];
                    } else {
                        result[result.length - 1] += (' ' + arrayString[index]);
                    }
                }
            }
            return result;
        }
    }

    /**
     * Export pdf file
     */
    async printData() {
        this.props.actions.clickBackDrop();
        let {error_log, action_log} = this.state.unsynced_order;

        let error_increment_ids = [];
        let log_increment_ids = [];
        error_log.forEach(action => {
            error_increment_ids.push(action.params.order.increment_id);
        });
        action_log.forEach(action => {
            log_increment_ids.push(action.params.order.increment_id);
        });

        let orders_error = await OrderService.getOrderByIncrementIds(error_increment_ids);
        let orders_log = await OrderService.getOrderByIncrementIds(log_increment_ids);

        let doc = new jsPDF('p', 'pt', 'a4');
        let columns = [
            {title: this.props.t('Items'), dataKey: "items"},
            {title: this.props.t('SKU'), dataKey: "sku"},
            {title: this.props.t('Price'), dataKey: "price"},
            {title: this.props.t('Qty'), dataKey: "qty"},
            {title: this.props.t('Tax'), dataKey: "tax"},
            {title: this.props.t('Subtotal'), dataKey: "subtotal"},
        ];
        this.page = 0;

        // print content action log
        this.printContent(orders_error, doc, columns, false);
        // print content error log
        this.printContent(orders_log, doc, columns, true);

        let currentTime = new Date();
        let fileName = "Orders_" + this.formatDate(currentTime);
        doc.save(fileName + '.pdf');
    }

    /**
     * print content
     * @param orders
     * @param doc
     * @param columns
     * @param isError
     */
    printContent(orders, doc, columns, isError) {
        for (let k = 0; k < orders.length; k++) {
            if (this.page > 0) {
                doc.addPage();
            }
            this.page++;
            let locationName = ConfigData.location_name;
            locationName = this.convertToEnglish(locationName);
            let posName = ConfigData.pos_name;
            posName = this.convertToEnglish(posName);
            let orderData = orders[k];
            let posAccount = orderData.pos_staff_name;
            posAccount = this.convertToEnglish(posAccount);
            let rows = [];
            let items = orderData.items ? orderData.items : [];
            items.forEach(
                (item) => {
                    let dataItem = {};
                    if (item.product_type === ProductTypeConstant.BUNDLE) {
                        dataItem = {
                            "items": item.name,
                            "sku": "",
                            "price": "",
                            "qty": "",
                            "tax": "",
                            "subtotal": ""
                        };
                        rows.push(dataItem);
                        let bundleItemChilds = items.filter(
                            (bundleItemChild) =>
                                Number(bundleItemChild.parent_item_id) === Number(item.item_id)
                        );
                        if (bundleItemChilds) {
                            bundleItemChilds.forEach(
                                (bundleItemChild) => {
                                    dataItem = {
                                        "items": "   " + bundleItemChild.name,
                                        "sku": bundleItemChild.sku,
                                        "price": OrderHelper.formatPrice(bundleItemChild.base_price, orderData),
                                        "qty": bundleItemChild.qty_ordered,
                                        "tax": OrderHelper.formatPrice(bundleItemChild.base_tax_amount, orderData),
                                        "subtotal": OrderHelper.formatPrice(bundleItemChild.base_row_total_incl_tax, orderData),
                                    };
                                    rows.push(dataItem);
                                }
                            );
                        }
                    } else if (item.product_type === ProductTypeConstant.CONFIGURABLE) {
                        let orderLable = "";
                        if (item['product_options']) {
                            let strOptions = item['product_options'];
                            if (strOptions && !Array.isArray(strOptions)) {
                                let options = JSON.parse(strOptions);
                                let attributes_info = options.attributes_info;
                                if (attributes_info) {
                                    const options = attributes_info.map(attribute_info => {
                                        return `${attribute_info.value}`;
                                    });
                                    orderLable = options.join('/');
                                }
                            }
                        }
                        dataItem = {
                            "items": item.name + "\n   " + orderLable,
                            "sku": item.sku,
                            "price": OrderHelper.formatPrice(item.base_price, orderData),
                            "qty": item.qty_ordered,
                            "tax": OrderHelper.formatPrice(item.base_tax_amount, orderData),
                            "subtotal": OrderHelper.formatPrice(item.base_row_total_incl_tax, orderData)
                        };
                        rows.push(dataItem);
                    } else if (item.parent_item_id) {
                    } else {
                        dataItem = {
                            "items": item.name,
                            "sku": item.sku,
                            "price": OrderHelper.formatPrice(item.base_price, orderData),
                            "qty": item.qty_ordered,
                            "tax": OrderHelper.formatPrice(item.base_tax_amount, orderData),
                            "subtotal": OrderHelper.formatPrice(item.base_row_total_incl_tax, orderData)
                        };
                        rows.push(dataItem);
                    }
                }
            );

            // Convert date to format: "Apr 11, 2018"
            let orderDate = moment(orderData.created_at).format('ll');
            let order = "Order #" + orderData.increment_id;

            // Customer info
            let customerName = this.props.t('Customer Name') + ": " + orderData.customer_firstname +
                (orderData.customer_middlename ? " " + orderData.customer_middlename : "") + " " + orderData.customer_lastname;
            customerName = this.convertToEnglish(customerName);
            let customerEmail = this.props.t('Email') + ": " + orderData.customer_email;
            let customerGroup = this.props.t('Customer Group') + ": " + ConfigData.config.customer_groups.find(
                child => Number(child.id) === Number(orderData.customer_group_id)
            ).code;

            // Billing Address
            let billingAddressData = orderData.addresses.find( child => child.address_type === 'billing');
            let customerPhone = (billingAddressData.telephone) ? (this.props.t('Phone') + ": " + billingAddressData.telephone): "";
            let billingName = billingAddressData.firstname + " " + billingAddressData.lastname;
            billingName = this.convertToEnglish(billingName);
            let countryBilling = ConfigData.countries.find(
                child => child.id === billingAddressData.country_id
            ).name;
            let billingAddress = billingAddressData.street.join(" ") +
                (billingAddressData.city ? ", " + billingAddressData.city : "" ) +
                (billingAddressData.region ? ", " + billingAddressData.region : "" ) +
                (billingAddressData.postcode ? ", " + billingAddressData.postcode : "" ) +
                ", " + countryBilling ;
            billingAddress = this.convertToEnglish(billingAddress);
            let billingPhone = billingAddressData.telephone ? billingAddressData.telephone : "";

            // Shipping Address
            let shippingAddressData = orderData.addresses.find(child => child.address_type === 'shipping');
            let shippingName = shippingAddressData.firstname + " " + shippingAddressData.lastname;
            shippingName = this.convertToEnglish(shippingName);
            let countryShipping = ConfigData.countries.find(
                child => child.id === shippingAddressData.country_id
            ).name;
            let shippingAddress = shippingAddressData.street.join(" ")+
                (shippingAddressData.city ? ", " + shippingAddressData.city : "" ) +
                (shippingAddressData.region ? ", " + shippingAddressData.region : "" ) +
                (shippingAddressData.postcode ? ", " + shippingAddressData.postcode : "" ) +
                ", " + countryShipping ;
            shippingAddress = this.convertToEnglish(shippingAddress);
            let shippingPhone = shippingAddressData.telephone ? shippingAddressData.telephone : "";

            // Payment method and shipping method
            let paymentMethodData = orderData.payments ? orderData.payments : [];
            let paymentMethodNames_Values = [];
            for (let i = 0; i < paymentMethodData.length; i++) {
                paymentMethodNames_Values.push({name: this.convertToEnglish(paymentMethodData[i].title),
                    value: OrderHelper.formatPrice(paymentMethodData[i].base_amount_paid, orderData),
                    refNumber : (paymentMethodData[i].reference_number) ?
                        this.props.t('( Ref number') + " : " + paymentMethodData[i].reference_number + ")" : ""
                });
            }
            let shippingMethodName = orderData.shipping_description;
            shippingMethodName = this.convertToEnglish(shippingMethodName);
            let shippingMethodValue = OrderHelper.formatPrice(orderData.base_shipping_amount, orderData);
            let deliveryDate = this.props.t('Delivery Date');
            let deliveryDateValue = orderData.pos_delivery_date;

            // Subtotal, discount, fpt, tax...
            let subtotalValue = OrderHelper.formatPrice(orderData.base_subtotal, orderData);
            let discountCode = orderData.coupon_code;
            let discountValue = "";
            if (parseFloat(orderData.base_discount_amount) < 0) {
                discountValue = "-" + OrderHelper.formatPrice(orderData.base_discount_amount*(-1), orderData);
            } else {
                discountValue = OrderHelper.formatPrice(orderData.base_discount_amount, orderData);
            }
            let shippingAmountValue = OrderHelper.formatPrice(orderData.base_shipping_amount, orderData);
            let fptValue = OrderHelper
                .formatPrice(WeeeDataService.getTotalAmounts(orderData.items, orderData), orderData);
            let taxValue = OrderHelper.formatPrice(orderData.base_tax_amount, orderData);

            // Total, paid, remain
            let totalValue = OrderHelper.formatPrice(orderData.base_grand_total, orderData);
            let paidValue = OrderHelper.formatPrice(orderData.base_total_paid, orderData);
            let remainValue = OrderHelper.formatPrice(orderData.base_total_due, orderData);

            // Add header
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setFontStyle("bold");
            doc.text(this.props.t('Location Name') + " :", 45, 50);
            doc.setFontStyle("normal");
            doc.text(locationName, 125, 50);
            doc.setFontStyle("bold");
            doc.text(this.props.t('POS') + "                   :", 45, 70);
            doc.setFontStyle("normal");
            doc.text(posName, 125, 70);
            doc.setFontStyle("bold");
            doc.text(this.props.t('Order Date') + "   :", 400, 50);
            doc.setFontStyle("normal");
            doc.text(orderDate, 467, 50);
            doc.setFontStyle("bold");
            doc.text(this.props.t('Cashier') + "        :", 400, 70);
            doc.setFontStyle("normal");
            doc.text(posAccount, 467, 70);
            doc.setFontStyle("bold");
            doc.setFontSize(12);
            doc.text(order, 225, 95);
            doc.setFontSize(10);

            // Customer information
            doc.text(this.props.t('Customer Information'), 45, 115);
            doc.setFontStyle("normal");
            let height_count_info_customer_left = 135;
            let height_count_info_customer_right = 135;
            doc.text(customerName, 45, height_count_info_customer_left);
            height_count_info_customer_left = height_count_info_customer_left + 20;
            doc.text(customerGroup, 45, height_count_info_customer_left);
            let arrayCustomerEmail = [];
            while (customerEmail.length > 25) {
                arrayCustomerEmail.push(customerEmail.substring(0, 24));
                customerEmail = customerEmail.substring(25);
            }
            if (customerEmail!== "") {
                arrayCustomerEmail.push(customerEmail);
            }
            arrayCustomerEmail.forEach(
                (el) => {
                    doc.text(el, 400, height_count_info_customer_right);
                    height_count_info_customer_right = height_count_info_customer_right + 20;
                }
            );
            if (customerPhone) {
                doc.text(customerPhone, 400, height_count_info_customer_right);
            } else {
                height_count_info_customer_right = height_count_info_customer_right - 20;
            }

            // Add table items
            let height_count_info_customer = (height_count_info_customer_right > height_count_info_customer_left) ?
                height_count_info_customer_right : height_count_info_customer_left;
            doc.autoTable(columns, rows, {
                startY: height_count_info_customer + 20,
                theme: 'plain',
                styles: {
                    font: "helvetica",
                    lineWidth: 0.00,
                    lineColor: 0,
                    fillStyle: 'DF',
                    halign: 'left',
                    valign: 'middle',
                    columnWidth: 'auto',
                    overflow: 'linebreak'
                },
                columnStyles: {
                    text: {columnWidth: 'auto'},
                    items: {columnWidth: 170},
                }
            });

            // Add footer
            doc.setFontStyle("bold");
            let height_count = doc.autoTable.previous.finalY + 30;
            height_count = this.addNewPage(doc, height_count);
            doc.text(this.props.t('Billing Address'), 45, height_count);
            doc.text(this.props.t('Shipping Address'), 310, height_count);
            doc.setFontStyle("normal");
            height_count = height_count + 20;
            doc.text(billingName, 45, height_count);
            doc.text(shippingName, 310, height_count);

            let height_count_billingAddress = height_count;
            this.formatString(billingAddress).forEach(
                (el) => {
                    height_count_billingAddress = height_count_billingAddress + 20;
                    doc.text(el, 45, height_count_billingAddress);
                }
            );
            height_count_billingAddress = height_count_billingAddress + 20;
            doc.text(billingPhone, 45, height_count_billingAddress);

            let height_count_shippingAddress = height_count;
            this.formatString(shippingAddress).forEach(
                (el) => {
                    height_count_shippingAddress = height_count_shippingAddress + 20;
                    doc.text(el, 310, height_count_shippingAddress);
                }
            );
            height_count_shippingAddress = height_count_shippingAddress + 20;
            doc.text(shippingPhone, 310, height_count_shippingAddress);

            // Payment, shipping method
            let height_count_payment_method = ((height_count_shippingAddress > height_count_billingAddress) ?
                height_count_shippingAddress : height_count_billingAddress ) + 20;
            height_count_payment_method = this.addNewPage(doc, height_count_payment_method);
            let height_count_shipping_method = height_count_payment_method;
            height_count_shipping_method = this.addNewPage(doc, height_count_shipping_method);
            doc.setFontStyle("bold");
            doc.text(this.props.t('Shipping Method'), 310, height_count_shipping_method);
            doc.text(this.props.t('Payment Method'), 45, height_count_payment_method);

            doc.setFontStyle("normal");
            height_count_shipping_method = height_count_shipping_method + 20;
            doc.text(545, height_count_shipping_method, shippingMethodValue, null, null, 'right');
            doc.text(shippingMethodName, 310, height_count_shipping_method);
            if ((orderData.pos_delivery_date !== undefined) && (orderData.pos_delivery_date !== null)) {
                height_count_shipping_method = height_count_shipping_method + 20;
                doc.text(deliveryDate, 310, height_count_shipping_method);
                doc.text(545, height_count_shipping_method, deliveryDateValue, null, null, 'right');
            }

            paymentMethodNames_Values.forEach(
                (el) => {
                    height_count_payment_method = height_count_payment_method + 20;
                    doc.text(el.name, 45, height_count_payment_method);
                    doc.text(280, height_count_payment_method, el.value, null, null, 'right');
                    if (el.refNumber !== "") {
                        height_count_payment_method = height_count_payment_method + 20;
                        doc.text(el.refNumber, 45, height_count_payment_method);
                    }
                }
            );

            // Add line
            let height_count_footer = ((height_count_payment_method > height_count_shipping_method) ?
                height_count_payment_method: height_count_shipping_method) + 20;
            height_count_footer = this.addNewPage(doc, height_count_footer);
            doc.setDrawColor(0, 0, 0);
            doc.line(45, height_count_footer, 545, height_count_footer);

            // Subtotal, .v.v.
            height_count_footer = height_count_footer + 20;
            height_count_footer = this.addNewPage(doc, height_count_footer);
            doc.text(this.props.t('Subtotal'), 310, height_count_footer);
            doc.text(545, height_count_footer, subtotalValue, null, null, 'right');
            height_count_footer = height_count_footer + 20;
            height_count_footer = this.addNewPage(doc, height_count_footer);
            if (discountCode) {
                doc.text("Discount(" + discountCode + ")", 310, height_count_footer);
            } else {
                doc.text("Discount", 310, height_count_footer);
            }
            height_count_footer = this.addNewPage(doc, height_count_footer);
            doc.text(545, height_count_footer, discountValue, null, null, 'right');
            height_count_footer = height_count_footer + 20;
            height_count_footer = this.addNewPage(doc, height_count_footer);
            doc.text(this.props.t('Shipping Amount'), 310, height_count_footer);
            doc.text(545, height_count_footer, shippingAmountValue, null, null, 'right');
            height_count_footer = height_count_footer + 20;
            height_count_footer = this.addNewPage(doc, height_count_footer);
            doc.text(this.props.t('FPT'), 310, height_count_footer);
            doc.text(545, height_count_footer, fptValue, null, null, 'right');
            height_count_footer = height_count_footer + 20;
            height_count_footer = this.addNewPage(doc, height_count_footer);
            doc.text(this.props.t('Tax'), 310, height_count_footer);
            doc.text(545, height_count_footer, taxValue, null, null, 'right');

            // Add line
            height_count_footer = height_count_footer  + 20;
            height_count_footer = this.addNewPage(doc, height_count_footer);
            doc.line(310, height_count_footer, 545, height_count_footer);

            // Total, .v.v.
            height_count_footer = height_count_footer  + 12;
            height_count_footer = this.addNewPage(doc, height_count_footer);
            doc.text(this.props.t('Total'), 310, height_count_footer);
            doc.text(545, height_count_footer, totalValue, null, null, 'right');
            doc.setFontStyle("italic");
            height_count_footer = height_count_footer + 20;
            height_count_footer = this.addNewPage(doc, height_count_footer);
            doc.text(this.props.t('Paid'), 310, height_count_footer);
            doc.setFontStyle("normal");
            doc.text(545, height_count_footer, paidValue, null, null, 'right');
            height_count_footer = height_count_footer + 20;
            doc.setFontStyle("italic");
            doc.text(this.props.t('Remains'), 310, height_count_footer);
            doc.setFontStyle("normal");
            doc.text(545, height_count_footer, remainValue, null, null, 'right');
        }
    }

    /**
     * Auto add page when text is full page
     *
     * @param doc
     * @param height
     * @returns {*}
     */
    addNewPage(doc, height){
        // A4 height
        let pageHeight = 791.89;
        if(height >= pageHeight){
            doc.addPage();
            height = 50;
        }
        return height;
    }

    template() {
        return (
            <div>
                <Modal
                    bsSize={"small"}
                    className={"popup-messages"}
                    show={(this.props.isOpen && this.state.popup === 'confirm_message')}
                    onHide={ () => this.props.actions.clickBackDrop() }
                >
                    <Modal.Body>
                        <h3 className="title">{ this.props.t('Export') }</h3>
                        <p> { this.props.t('Do you want to export unsynced orders to PDF files') }?</p>
                    </Modal.Body>
                    <Modal.Footer className={"logout-actions"}>
                        <a onClick={ () => this.props.actions.clickBackDrop() }> { this.props.t('No') } </a>
                        <a onClick={ () => this.printData()}> { this.props.t('Yes') } </a>
                    </Modal.Footer>
                </Modal>
                <Modal
                    bsSize={"small"}
                    className={"popup-messages"}
                    show={(this.props.isOpen && this.state.popup === 'message_no_data')}
                    onHide={ () => this.props.actions.clickBackDrop() }
                >
                    <Modal.Body>
                        <h3 className="title">{ this.props.t('Export') }</h3>
                        <p> { this.props.t('POS has no unsynced order to export') }</p>
                    </Modal.Body>
                    <Modal.Footer className={"close-modal"}>
                        <button onClick={ () => this.props.actions.clickBackDrop() }>OK</button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

class ExportDataContainer extends CoreContainer {
    static className = 'ExportDataContainer';

    /**
     * This maps the state to the property of the component
     *
     * @param state
     * @returns {{isOpen: *, success: *, error: *}}
     */
    static mapState(state) {
        const  { isOpen, success, error } = state.core.exportData;
        return {
            isOpen,
            success,
            error
        }
    }

    /**
     * This maps the dispatch to the property of the component
     *
     * @param dispatch
     * @returns {{actions: ({clickBackDrop, finishExportDataRequesting}|ActionCreator<any>|ActionCreatorsMapObject)}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: bindActionCreators( { ...ExportDataPopupAction}, dispatch)
        }
    }
}

export default ContainerFactory.get(ExportDataContainer).withRouter(
    ComponentFactory.get(ExportData)
)
