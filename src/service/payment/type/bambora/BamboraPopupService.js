import CoreService from "../../../CoreService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import i18n from "../../../../config/i18n";
import BamboraConstant from "../../../../view/constant/payment/BamboraConstant";
import CurrencyHelper from "../../../../helper/CurrencyHelper";

export class BamboraPopupService extends CoreService {
    static className = 'BamboraPrintService';

    modal;
    dialogInput;
    closeTimeout;

    /**
     * Create modal
     *
     * @return {*}
     */
    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'modal fade in popup-messages popup-confirm';
        this.modal.setAttribute('role', 'dialog');
        this.modal.style.display = 'none';

        let modalDialog = document.createElement('div');
        modalDialog.className = 'modal-dialog modal-md2';
        this.modal.setAttribute('role', 'document');

        this.modal.appendChild(modalDialog);
        return this.modal;
    }

    /**
     * Create modal header
     *
     * @param response
     * @param showCancel
     * @return {HTMLDivElement}
     */
    getModalHeader(service, response, showCancel = false) {
        let modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';

        if (showCancel) {
            let headerButton = document.createElement('button');
            headerButton.className = 'cancel btn';
            headerButton.setAttribute('data-dismiss', 'modal');
            headerButton.setAttribute('aria-label', 'Close');
            headerButton.innerHTML = i18n.translator.translate('Cancel');
            headerButton.onclick = event => {
                if (this.modal) {
                    this.modal.remove();
                }
            };
            modalHeader.appendChild(headerButton);
        }

        let headerTitle = document.createElement('h4');
        headerTitle.className = 'modal-title';
        headerTitle.innerHTML = i18n.translator.translate(
            'Bambora {{amount}}',
            {amount: CurrencyHelper.format(service.payment.amount_paid, null, null)}
        );

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
        let modalBody = document.createElement('div');
        modalBody.className = 'modal-body';

        let modalTitle = document.createElement('h3');
        modalTitle.className = 'title';
        if (response.DialogText) {
            modalTitle.innerHTML = response.DialogText.replace(/\n/gi, '</br>');
        }

        modalBody.appendChild(modalTitle);

        if (response.GetMessageType === BamboraConstant.MESSAGE_TYPE_DIALOG_REQUEST &&
            response.DialogType === BamboraConstant.DIALOG_TYPE_TEXT_ENTRY) {
            this.dialogInput = document.createElement('input');
            modalBody.appendChild(this.dialogInput);
        }

        return modalBody;
    }

    /**
     * Create modal footer
     * @param service
     * @param response
     * @param resolve
     * @param reject
     * @return {HTMLDivElement}
     */
    getModalFooter(service, response, resolve, reject) {
        let modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer actions-2column';
        if (response.DialogType === BamboraConstant.DIALOG_TYPE_TEXT_ENTRY) {
            modalFooter.className += ' actions-1column';
        }

        let acceptButton = document.createElement('a');
        acceptButton.className = 'close-modal';

        let rejectButton = acceptButton.cloneNode(true);
        acceptButton.innerHTML = i18n.translator.translate(
            response.DialogType === BamboraConstant.DIALOG_TYPE_CONFIRMATION ? 'Yes' : 'Ok'
        );
        acceptButton.onclick = event => {
            return this.acceptResponse(service, response, resolve, reject);
        };

        if (response.DialogType === BamboraConstant.DIALOG_TYPE_CONFIRMATION) {
            rejectButton.innerHTML = i18n.translator.translate('No');
            rejectButton.onclick = event => {
                return this.acceptResponse(service, response, resolve, reject, false);
            };
            modalFooter.appendChild(rejectButton);
        }
        modalFooter.appendChild(acceptButton);
        return modalFooter;
    }

    /**
     * Show Bambora popup
     *
     * @param service
     * @param response
     * @return {Promise<any>}
     */
    showPopup(service, response) {
        if (this.closeTimeout) {
            window.clearTimeout(this.closeTimeout);
        }
        return new Promise(async (resolve, reject) => {
            let modalContent = document.createElement('div');
            modalContent.className = 'modal-content';

            let modalHeader = this.getModalHeader(service, response);
            let modalBody = this.getModalBody(response);

            modalContent.appendChild(modalHeader);
            modalContent.appendChild(modalBody);

            if (response.GetMessageType === BamboraConstant.MESSAGE_TYPE_DIALOG_REQUEST
                && response.DialogType !== BamboraConstant.DIALOG_TYPE_INFORMATION) {
                let modalFooter = this.getModalFooter(service, response, resolve, reject);
                modalContent.appendChild(modalFooter);
            }
            if (this.modal) {
                this.modal.remove();
            }
            this.createModal();
            let modalDialog = this.modal.getElementsByClassName('modal-dialog')[0];
            modalDialog.appendChild(modalContent);
            this.modal.style.display = 'block';

            document.body.appendChild(this.modal);

            if (response.GetMessageType === BamboraConstant.MESSAGE_TYPE_DIALOG_REQUEST
                && response.DialogType === BamboraConstant.DIALOG_TYPE_INFORMATION) {
                this.acceptResponse(service, response, resolve, reject);
            }
        })
    }

    /**
     * Accept response from Bambora
     *
     * @param service
     * @param response
     * @param resolve
     * @param reject
     * @param isConfirm
     */
    acceptResponse(service, response, resolve, reject, isConfirm = true) {
        new Promise(async (resultResolve, resultReject) => {
            let params = service.getDefaultRequestParams();
            params.type = BamboraConstant.TRANSACTION_TYPE_GET_DIALOG_REQUEST;
            if (response.DialogType === BamboraConstant.DIALOG_TYPE_CONFIRMATION) {
                params.type = BamboraConstant.TRANSACTION_TYPE_SEND_DIALOG_RESULT;
                params.dialogResult = isConfirm ? '1' : '0';
            } else if (response.DialogType === BamboraConstant.DIALOG_TYPE_TEXT_ENTRY) {
                params.type = BamboraConstant.TRANSACTION_TYPE_SEND_DIALOG_RESULT;
                params.dialogResult = this.dialogInput.value;
            }
            params.GetMessageType = response.GetMessageType;
            params.DialogType = response.DialogType;
            params.DialogId = response.DialogId;
            params.DialogText = response.DialogText;
            let confirmResponse = await service.request(params);
            if (confirmResponse.GetMessageType === BamboraConstant.MESSAGE_TYPE_DIALOG_REQUEST) {
                return resolve(service.processResponse(confirmResponse));
            } else if (confirmResponse.GetMessageType === BamboraConstant.MESSAGE_TYPE_SALE_RESPONSE) {
                return resolve(confirmResponse);
            }
        });
    }

    /**
     * Close modal after 2 seconds
     */
    closePopup() {
        if (this.modal) {
            this.closeTimeout = setTimeout(() => {
                this.modal.remove();
            }, 1000)
        }
    }
}

/** @type BamboraPopupService */
let bamboraPopupService = ServiceFactory.get(BamboraPopupService);

export default bamboraPopupService;