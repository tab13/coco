import Abstract from './IndexedDbAbstract';
import SyncConstant from '../../view/constant/SyncConstant';

let initialSyncData = [
    {
        type: SyncConstant.TYPE_PRODUCT,
        count: 0,
        total: SyncConstant.DEFAULT_TOTAL,
        updated_time: null,
        updated_data_time: null
    },
    {
        type: SyncConstant.TYPE_STOCK,
        count: 0,
        total: SyncConstant.DEFAULT_TOTAL,
        updated_time: null,
        updated_data_time: null
    },
    {
        type: SyncConstant.TYPE_CUSTOMER,
        count: 0,
        total: SyncConstant.DEFAULT_TOTAL,
        updated_time: null,
        updated_data_time: null
    },
    {
        type: SyncConstant.TYPE_ORDER,
        count: 0,
        total: SyncConstant.DEFAULT_TOTAL,
        updated_time: null,
        updated_data_time: null
    },
    {
        type: SyncConstant.TYPE_SESSION,
        count: 0,
        total: SyncConstant.DEFAULT_TOTAL,
        updated_time: null,
        updated_data_time: null
    },
    {
        type: SyncConstant.TYPE_CATALOG_RULE_PRODUCT_PRICE,
        count: 0,
        total: SyncConstant.DEFAULT_TOTAL,
        updated_time: null,
        updated_data_time: null
    }
];

export default class IndexedDbSync extends Abstract {
    static className = 'IndexedDbSync';
    main_table = 'sync';
    primary_key = 'type';
    offline_id_prefix = '';
    // constructor(props) {
    //     super(props);
    // }

    /**
     * Set Default data of Sync table when Sync table is empty
     */
    async setDefaultData() {
        let result = await this.getAll();
        if (!result.length) {
            this.bulkPut(initialSyncData);
        }
    }

    /**
     * Reset items's data of sync table in indexedDb
     * @param items
     * @returns {Promise<any>}
     */
    resetData(items) {
        let itemList = initialSyncData.filter(function (data) {
            return items.indexOf(data.type) >= 0;
        });
        return this.bulkPut(itemList);
    }
}