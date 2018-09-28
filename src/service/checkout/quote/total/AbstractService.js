import {AbstractQuoteService} from "../AbstractService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import NumberHelper from "../../../../helper/NumberHelper";

export class AbstractTotalService extends AbstractQuoteService {
    static className = 'AbstractTotalService';

    code;
    total;
    _canSetAddressAmount = true;
    _canAddAmountToAddress = true;
    address;

    /**
     * Collect address total
     *
     * @param {object} quote
     * @param {object} address
     * @param {object} total
     * @return {AbstractTotalService}
     */
    collect(quote, address, total) {
        this._setAddress(address);
        this._setTotal(total);
        this._setAmount(0);
        this._setBaseAmount(0);
        return this;
    }

    /**
     * Set address which can be used inside totals calculation
     *
     * @param address
     * @return {AbstractTotalService}
     * @private
     */
    _setAddress(address) {
        this.address = address;
        return this;
    }

    /**
     * Get quote address object
     *
     * @return {object}
     * @private
     */
    _getAddress() {
        return this.address;
    }

    /**
     * Set total code code name
     *
     * @param {string} code
     * @return {AbstractTotalService}
     */
    setCode(code) {
        this.code = code;
        return this;
    }

    /**
     * Retrieve total code name
     *
     * @param {string|null} code
     * @return {string}
     */
    getCode(code = null) {
        return code || this.code;
    }

    /**
     *
     * @return {object}
     * @private
     */
    _getTotal() {
        return this.total;
    }

    /**
     *
     * @param {object} total
     * @return {AbstractTotalService}
     * @private
     */
    _setTotal(total) {
        this.total = total;
        return this;
    }

    /**
     * Get total code
     *
     * @param {string|null} code
     * @return {string}
     */
    getTotalCode(code = null) {
        let totalCode = code || this.code;
        return totalCode !== 'subtotal' ? totalCode + '_amount' : totalCode;
    }

    /**
     * Get base total code
     *
     * @param {string|null} code
     * @return {string}
     */
    getBaseTotalCode(code = null) {
        let totalCode = code || this.code;
        return totalCode !== 'subtotal' ? 'base_' + totalCode + '_amount' : 'base_' + totalCode;
    }

    /**
     * Set total model amount value to address
     *
     * @param {number} amount
     * @param {string|null} code
     * @return {AbstractTotalService}
     * @private
     */
    _setAmount(amount, code = null) {
        if (this._canSetAddressAmount) {
            this._getTotal()[this.getTotalCode(code)] = amount;
            if (!this._getTotal().totalAmounts) {
                this._getTotal().totalAmounts = {};
            }
            this._getTotal().totalAmounts[this.getCode(code)] = amount;
        }
        return this;
    }

    /**
     * Set total model base amount value to address
     *
     * @param {number} baseAmount
     * @param {string|null} code
     * @return {AbstractTotalService}
     * @private
     */
    _setBaseAmount(baseAmount, code = null) {
        if (this._canSetAddressAmount) {
            this._getTotal()[this.getBaseTotalCode(code)] = baseAmount;
            if (!this._getTotal().baseTotalAmounts) {
                this._getTotal().baseTotalAmounts = {};
            }
            this._getTotal().baseTotalAmounts[this.getCode(code)] = baseAmount;
        }
        return this;
    }

    /**
     * Add total model amount value to address
     *
     * @param {number} amount
     * @param {string|null} code
     * @return $this
     */
    _addAmount(amount, code = null) {
        if (this._canAddAmountToAddress) {
            let total = this._getTotal()[this.getTotalCode(code)];
            this._getTotal()[this.getTotalCode(code)] = total ? NumberHelper.addNumber(total, amount) : amount;
            if (!this._getTotal().totalAmounts) {
                this._getTotal().totalAmounts = {};
            }
            this._getTotal().totalAmounts[this.getCode(code)] = this._getTotal()[this.getTotalCode(code)];
        }
        return this;
    }

    /**
     * Add total model base amount value to address
     *
     * @param {number} baseAmount
     * @param {string|null} code
     * @return {AbstractTotalService}
     */
    _addBaseAmount(baseAmount, code = null) {
        if (this._canAddAmountToAddress) {
            let total = this._getTotal()[this.getBaseTotalCode(code)];
            this._getTotal()[this.getBaseTotalCode(code)] = total ?
                NumberHelper.addNumber(total, baseAmount) : baseAmount;
            if (!this._getTotal().baseTotalAmounts) {
                this._getTotal().baseTotalAmounts = {};
            }
            this._getTotal().baseTotalAmounts[this.getCode(code)] = this._getTotal()[this.getBaseTotalCode(code)];
        }
        return this;
    }
}

/** @type AbstractTotalService */
let abstractTotalService = ServiceFactory.get(AbstractTotalService);

export default abstractTotalService;