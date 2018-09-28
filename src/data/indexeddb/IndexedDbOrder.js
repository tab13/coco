import Abstract from './IndexedDbAbstract';
import db from "./index";

export default class IndexedDbOrder extends Abstract {
    static className = 'IndexedDbOrder';

    main_table = 'order';
    primary_key = 'increment_id';
    index_table = 'order_index';
    index_table_fields = [
        'increment_id',
        'search_string',
        'created_at',
        'state'
    ];
    index_fields = [];
    offline_id_prefix = 'order';
    default_order_by = 'created_at';
    default_order_direction = 'DESC';

    /**
     * get order by increment ids
     * @param ids
     * @returns {Promise}
     */
    getOrderByIncrementIds(ids) {
        return new Promise((resolve, reject) => {
            let self = this;
            db[self.main_table].where(self.primary_key).anyOf(ids).toArray(items => {
                if (!items) {
                    return;
                }
                let orderParams = [{field: "created_at", direction: "DESC"}];
                self.sort(items, orderParams);
                resolve(items);
            })
                .catch(function (err) {
                    return reject(err);
                });
        });
    }
}