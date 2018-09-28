import CoreService from "../../../CoreService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import i18n from "../../../../config/i18n";
import "../../../../view/style/css/OrderGiftcardPopup.css";
import OrderResourceModel from "../../../../resource-model/order/OrderResourceModel";

export class OrderGiftCardPopupService extends CoreService {
    static className = 'OrderGiftCardPopupService';
    resourceModel = OrderResourceModel;

    modal;
    dialogInput;
    closeTimeout;

    /**
     * Create modal
     *
     * @return {*}
     */
    createModal() {
        this.modal           = document.createElement('div');
        this.modal.className = 'modal fade in popup-messages orderGiftCard-popup popup-confirm';
        this.modal.setAttribute('role', 'dialog');
        this.modal.style.display = 'none';

        let modalDialog       = document.createElement('div');
        modalDialog.className = 'modal-dialog modal-md2';
        this.modal.setAttribute('role', 'document');

        this.modal.appendChild(modalDialog);
        return this.modal;
    }

    /**
     * Create modal header
     *
     * @param order
     * @return {HTMLDivElement}
     */
    getModalHeader(order) {
        let modalHeader       = document.createElement('div');
        modalHeader.className = 'modal-header';

        let headerButton       = document.createElement('button');
        headerButton.className = 'cancel btn';
        headerButton.setAttribute('data-dismiss', 'modal');
        headerButton.setAttribute('aria-label', 'Close');
        headerButton.innerHTML = i18n.translator.translate('Close');
        headerButton.onclick   = () => {
            if (this.modal) {
                this.modal.remove();
            }
        };
        modalHeader.appendChild(headerButton);

        let headerTitle       = document.createElement('h4');
        headerTitle.className = 'modal-title';
        headerTitle.innerHTML = i18n.translator.translate("Order") + ' ' + order ? order.increment_id : '';

        modalHeader.appendChild(headerTitle);
        return modalHeader;
    }

    /**
     * Create modal body
     *
     * @param response
     * @return {HTMLDivElement}
     */
    getModalBody(response) {
        let modalBody       = document.createElement('div');
        modalBody.className = 'modal-body';

        if (!response || !response.message) {
            let loader       = document.createElement('div');
            loader.className = 'loader-product loader';
            modalBody.appendChild(loader);
            return modalBody;
        }

        let modalTitle       = document.createElement('h3');
        modalTitle.className = 'title';
        modalTitle.innerHTML = response.message.replace(/\n/gi, '</br>');
        modalBody.appendChild(modalTitle);
        return modalBody;
    }

    /**
     * Show OrderGiftCard popup
     * @param order
     * @param completeCallback
     * @param response
     */
    check(order, response, completeCallback) {
        if (this.closeTimeout) {
            window.clearTimeout(this.closeTimeout);
        }

        let modalContent       = document.createElement('div');
        modalContent.className = 'modal-content';

        let modalHeader = this.getModalHeader(order);
        let modalBody   = this.getModalBody(response);

        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);


        if (this.modal) {
            this.modal.remove();
        }
        this.createModal();
        let modalDialog = this.modal.getElementsByClassName('modal-dialog')[0];
        modalDialog.appendChild(modalContent);
        this.modal.style.display = 'block';
        document.body.appendChild(this.modal);

        /**
         *
         * @type {OrderResourceModel}
         */
        let resource = this.getResourceModel();
        resource.loadOrderByIncrement(order.increment_id).then(response => {
            completeCallback(response);
            this.closePopup();
        }).catch((e) => {
            this.showMessage(i18n.translator.translate(e.message))
        })
    }

    /**
     * Show OrderGiftCard popup
     *
     * @param message
     */
    showMessage(message) {

        if (!this.modal) {
            return;
        }

        let modalTitle = this.modal.querySelector('.orderGiftCard-popup .modal-body .title');

        if (!modalTitle) {
            return;
        }

        modalTitle.innerHTML = message.replace(/\n/gi, '</br>');
    }

    /**
     *
     * @return {string}
     */
    getMessage() {

        if (!this.modal) {
            return '';
        }

        let modalTitle = this.modal.querySelector('.orderGiftCard-popup .modal-body .title');

        if (!modalTitle) {
            return '';
        }

         return modalTitle.innerHTML;
    }

    /**
     * Close modal after 2 seconds
     */
    closePopup() {
        if (this.modal) {
            this.closeTimeout = setTimeout(() => {
                this.modal.remove();
            }, 500)
        }
    }
}

/** @type OrderGiftCardPopupService */
let orderGiftCardPopupService = ServiceFactory.get(OrderGiftCardPopupService);

export default orderGiftCardPopupService;