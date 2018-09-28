import Abstract from './IndexedDbAbstract';
import db from "./index";

export default class IndexedDbActionLog extends Abstract {
    static className = 'IndexedDbActionLog';

    main_table = 'action_log';
    primary_key = 'action_id';
    offline_id_prefix = 'action';

    // /**
    //  * Constructor
    //  * @param props
    //  */
    // constructor(props) {
    //     super(props);
    // }

    /**
     * get last order of uuid
     * @param uuid
     * @returns {Promise<any>}
     */
    getLastOrder(uuid) {
        return new Promise((resolve, reject) => {
            db[this.main_table].where('uuid').equals(uuid).reverse().sortBy('order').then(results => {
                if (results[0]) {
                    resolve(results[0].order);
                } else {
                    resolve(0);
                }
            }).catch(exception => {
                reject(exception);
            });
        })
    }

    /**
     * check dependent request action log
     * @param uuid
     * @param order
     * @returns {Promise}
     */
    checkDependent(uuid, order) {
        return new Promise((resolve, reject) => {
            db[this.main_table].where('uuid').equals(uuid).and(function(item) {
                return item.order < order;
            }).toArray().then(results => {
                if (results.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(exception => {
                reject(exception);
            });
        })
    }

    /**
     * Get all data of table
     * @returns {Promise<any>}
     */
    getAll() {
        return db[this.main_table].toCollection().sortBy('created_at');
    }
}