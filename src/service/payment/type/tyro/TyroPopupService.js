import CoreService from "../../../CoreService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import i18n from "../../../../config/i18n";
import CurrencyHelper from "../../../../helper/CurrencyHelper";

export class TyroPopupService extends CoreService {
    static className = 'TyroPopupService';

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
        this.modal.className = 'modal fade in popup-messages tyro-popup popup-confirm';
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
     * @param service
     * @param showCancel
     * @param cancelCallback
     * @return {HTMLDivElement}
     */
    getModalHeader(service, showCancel = false, cancelCallback) {
        let modalHeader       = document.createElement('div');
        modalHeader.className = 'modal-header';

        if (showCancel) {
            let headerButton       = document.createElement('button');
            headerButton.className = 'cancel btn';
            headerButton.setAttribute('data-dismiss', 'modal');
            headerButton.setAttribute('aria-label', 'Close');
            headerButton.innerHTML = i18n.translator.translate('Cancel');
            headerButton.onclick   = () => {
                if (this.modal) {
                    this.modal.remove();
                }

                cancelCallback && cancelCallback();
            };
            modalHeader.appendChild(headerButton);
        }

        let headerTitle       = document.createElement('h4');
        headerTitle.className = 'modal-title';
        headerTitle.innerHTML = i18n.translator.translate(
            'Tyro {{amount}}',
            {
                amount: service.payment ? CurrencyHelper.format(service.payment.amount_paid, null, null) : ''
            }
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
        const {terminalInfo} = response;
        let modalBody       = document.createElement('div');
        modalBody.className = 'modal-body';

        let modalTitle       = document.createElement('h3');
        modalTitle.className = 'title';
        if (response.message) {
            modalTitle.innerHTML = response.message.replace(/\n/gi, '</br>');
        }

        modalBody.appendChild(modalTitle);


        if (terminalInfo) {
            let terminalInfoTable = `
                <table style="text-align: left">
                    <tbody>
                        <tr>
                            <td style="width: 170px;" nowrap="true">Name:</td>
                            <td nowrap="true">${terminalInfo.name}</td>
                        </tr>
                        <tr>
                            <td style="width: 170px;" nowrap="true">Version:</td>
                            <td nowrap="true">${terminalInfo.version}</td>
                        </tr>
                        <tr>
                            <td style="width: 170px;" nowrap="true">Available:</td>
                            <td nowrap="true">${terminalInfo.available}</td>
                        </tr>
                        <tr>
                            <td style="width: 170px;" nowrap="true">Current business day:</td>
                            <td nowrap="true">${terminalInfo.currentTerminalBusinessDay}</td>
                        </tr>
                        <tr>
                            <td style="width: 170px;" nowrap="true">Next settlement time:</td>
                            <td nowrap="true">${terminalInfo.nextAutoSettlementTime}</td>
                        </tr>
                    </tbody>
                </table>
            `;
            modalBody.innerHTML = terminalInfoTable;
        }

        return modalBody;
    }

    /**
     * Create modal footer
     * @param service
     * @param response
     * @return {HTMLDivElement}
     */
    getModalFooter(service, response) {
        let {options, isError, answerCallback} = response;

        answerCallback = answerCallback ? answerCallback : () => {
            if (this.modal) {
                this.modal.remove();
            }
        };

        let modalFooter       = document.createElement('div');
        modalFooter.className = 'modal-footer actions-2column';
        if (options.length < 2) {
            modalFooter.className += ' actions-1column';
        }

        options.forEach(title => {
            let button       = document.createElement('a');
            button.className = 'close-modal';
            button.innerHTML = i18n.translator.translate(title);


            let onClickCallback = () => answerCallback(title);

            if (isError) {
                onClickCallback = () => {
                    answerCallback(title);
                    if (this.modal) {
                        this.modal.remove();
                    }
                };
            }

            button.onclick = onClickCallback;

            modalFooter.appendChild(button);
        });

        return modalFooter;
    }

    /**
     * Show Tyro popup
     * @param service
     * @param cancelCallback
     * @param response
     */
    showPopup(service, response, cancelCallback) {
        if (this.closeTimeout) {
            window.clearTimeout(this.closeTimeout);
        }

        const hasOption        = Array.isArray(response.options) && response.options.length > 0;
        let modalContent       = document.createElement('div');
        modalContent.className = 'modal-content';

        let modalHeader = this.getModalHeader(service, !hasOption, cancelCallback);
        let modalBody   = this.getModalBody(response);

        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);

        if (hasOption) {
            let modalFooter = this.getModalFooter(service, response);
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
    }

    /**
     * Show Tyro popup
     *
     * @param service
     * @param message
     */
    showMessage(service, message) {

        if (!this.modal) {
            return;
        }

        let modalTitle = this.modal.querySelector('.tyro-popup .modal-body .title');

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

        let modalTitle = this.modal.querySelector('.tyro-popup .modal-body .title');

        if (!modalTitle) {
            return '';
        }

         return modalTitle.innerHTML;
    }

    clearOptions() {
        if (!this.modal) {
            return;
        }

        let modalFooter = this.modal.querySelector('.tyro-popup .modal-footer');

        if (!modalFooter) {
            return;
        }

        modalFooter.innerHTML = '';
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

/** @type TyroPopupService */
let tyroPopupService = ServiceFactory.get(TyroPopupService);

export default tyroPopupService;