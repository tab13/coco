import Abstract from './IndexedDbAbstract';
import db from "./index";

export default class IndexedDbStock extends Abstract {
    static className = 'IndexedDbStock';

    main_table = 'stock';
    primary_key = 'item_id';
    offline_id_prefix = '';

    /**
     * Get stock by product id
     *
     * @param productId
     * @return {Promise<any>}
     */
    getStock(productId) {
        return this.get(productId, 'product_id');
    }

    /**
     * Get list stock by product ids
     *
     * @param productIds
     * @return {Promise<any>}
     */
    getListByProductIds(productIds) {
        return new Promise((resolve, reject)=> {
            db[this.main_table].where('product_id').anyOf(productIds).toArray()
                .then(items => resolve(items))
                .catch(exception => reject(exception));
        });
    }
}