import Abstract from './IndexedDbAbstract';
import db from "./index";

export default class IndexedDbCart extends Abstract {
    static className = 'IndexedDbCart';
    main_table = 'cart';
    primary_key = 'id';


    /**
     * Search by pos Id
     *
     * @param posId
     * @returns {Promise<any>}
     */
    searchByPosId(posId){
        return new Promise((resolve, reject)=> {
            db[this.main_table]
                .where('pos_id')
                .equalsIgnoreCase(posId)
                .reverse()
                .sortBy('id')
                .then(items => resolve(items))
                .catch(() => reject([]));
        });
    }

    /**
     * add new record
     * @param data
     */
    add(data) {
        return db[this.main_table].add(data);
    }
}