import Abstract from './IndexedDbAbstract';
import db from './index';

export default class IndexedDbCatalogRuleProductPrice extends Abstract {
    static className = 'IndexedDbCatalogRuleProductPrice';

    main_table = 'catalogrule_product_price';
    primary_key = 'rule_product_price_id';
    index_table = 'catalogrule_product_price_index';
    index_table_fields = [
        'rule_product_price_id',
        'rule_date',
        'customer_group_id',
        'product_id',
        'rule_price',
        'website_id',
        'latest_start_date',
        'earliest_end_date',
    ];
    default_order_by = 'rule_product_price_id';

    /**
     * get not existed ids
     * @param ruleProductPriceIds
     * @return {Promise<Array>}
     */
    async getNotExistedIds(ruleProductPriceIds) {
        let indexData = await db[this.index_table].toArray();
        let ids = [];
        indexData.forEach(data => {
            data.value.forEach(item => {
                if (ruleProductPriceIds.indexOf(item.rule_product_price_id) === -1) {
                    ids.push(item.rule_product_price_id);
                }
            });
        });
        return ids;
    }

    /**
     * get all data from index table
     * @return {Promise<Array>}
     */
    async getAllDataFromIndexTable() {
        let indexData = await db[this.index_table].toArray();
        let data = [];
        indexData.forEach(item => data = data.concat(item.value));
        return data;
    }
}
