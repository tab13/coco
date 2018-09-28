import Abstract from './IndexedDbAbstract';
import db from "./index";

export default class IndexedDbPayment extends Abstract {
    static className = 'IndexedDbPayment';

    main_table = 'payment';
    primary_key = 'code';
    offline_id_prefix = '';

    /**
     * Get all data of table
     * @returns {Promise<any>}
     */
    getAll() {
        return db[this.main_table].toCollection().sortBy('sort_order');
    }
}