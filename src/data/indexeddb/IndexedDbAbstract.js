import AbstractResource from '../DataAbstract';
import db from './index'
import QueryService from '../../service/QueryService';

export default class IndexedDbAbstract extends AbstractResource {
    main_table = '';
    primary_key = '';
    index_table = '';
    index_table_fields = '';
    index_fields = '';
    offline_id_prefix = '';
    default_order_by = '';
    default_order_direction = QueryService.DEFAULT_ORDER_DIRECTION;

    /**
     * Reindex table
     */
    reindexTable() {
        if (!this.index_table || this.indexing) {
            return;
        }
        this.indexing = true;
        // Clear indexed data
        db[this.index_table].clear();

        // Indexing
        let table = db[this.main_table];
        if (this.default_order_by) {
            table = table.orderBy(this.default_order_by);
            if (this.default_order_direction !== QueryService.DEFAULT_ORDER_DIRECTION) {
                table = table.reverse();
            }
        }
        let items = [], id = 1;
        return table.each(item => {
            let indexedItem = {
                id: item[this.primary_key]
            };
            if (this.index_table_fields) {
                this.index_table_fields.forEach(field => {
                    indexedItem[field] = item[field];
                });
            }
            items.push(indexedItem);
            if (items.length >= 60000) {
                // Push data to indexed table
                let data = {
                    id: id++,
                    value: items
                };
                setTimeout(() => db[this.index_table].add(data));
                items = [];
            }
        }).then(() => {
            if (items.length > 0) {
                db[this.index_table].add({
                    id: id,
                    value: items
                }).then(() => {
                    this.indexing = false;
                });
            } else {
                this.indexing = false;
            }
        });
    }

    /**
     * Add or update data in indexedDb table
     *
     * @param {object} data
     * @returns {Promise<any>}
     */
    save(data) {
        if (!data) {
            return null;
        }
        if (data[this.primary_key]) {
            return db[this.main_table].update(data[this.primary_key], data);
        }
        data[this.primary_key] = this.offline_id_prefix + '_' + new Date().getTime();
        return db[this.main_table].put(data);
    }

    /**
     * Add multiple data in indexedDb table
     *
     * @param {array} data
     * @returns {Promise<any>}
     */
    bulkAdd(data) {
        return new Promise((resolve, reject) => {
            if (!Array.isArray(data)) {
                reject(0);
            }
            db[this.main_table].bulkAdd(data)
                .then(lastKey => resolve(data.length))
                .catch(db.BulkError, error => reject(data.length - error.failures.length));
        });
    }

    /**
     * Put new data and replace old data of objects in indexedDb table
     *
     * @param {array} data
     * @returns {Promise<any>}
     */
    bulkPut(data) {
        return new Promise((resolve, reject) => {
            if (!Array.isArray(data)) {
                reject(0);
            }
            db[this.main_table].bulkPut(data)
                .then(lastKey => {
                    resolve(data.length)
                })
                .catch(db.BulkError, error => {
                    reject(data.length - error.failures.length);
                });
        });
    }

    /**
     * Load a first item in indexedDb which is in suitable condition
     *
     * @param {string} id
     * @param {string} field
     * @returns {Promise<any>}
     */
    get(id, field = null) {
        return new Promise((resolve, reject) => {
            if (field === null) {
                field = this.primary_key;
            }
            db[this.main_table].where(field).equals(id).limit(1).first(item => {
                if (item) {
                    resolve(item);
                } else {
                    resolve({});
                }
            }).catch(exception => {
                reject(exception);
            });
        })
    }

    /**
     * get data by id
     * @param id
     * @return {*}
     */
    getById(id) {
        return db[this.main_table].get(id);
    }

    /**
     * Load a first item in indexedDb which is in suitable condition
     *
     * @param {string} id
     * @param {string} field
     * @returns {Promise<any>}
     */
    getListByIndex(ids, limit = null, field = null) {
        return new Promise((resolve, reject) => {
            if (field === null) {
                field = this.primary_key;
            }
            if (limit === null) {
                limit = 16;
            }
            db[this.main_table].where(field).inAnyRange(ids).limit(limit)(items => {
                if (items) {
                    resolve(items);
                } else {
                    resolve([]);
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
        return db[this.main_table].toArray();
    }

    /**
     * Clear table
     * @returns {*}
     */
    clear() {
        return db[this.main_table].clear();
    }

    /**
     * delete item in table
     * @param id
     */
    delete(id) {
        return db[this.main_table].delete(id);
    }

    /**
     * bulk delete items
     *
     * @param {array} ids
     */
    bulkDelete(ids) {
        return db[this.main_table].bulkDelete(ids);
    }

    /**
     * Filter an item with a condition
     *
     * @param {object} item
     * @param {object} filter
     * @return {boolean}
     */
    filterOne(item, filter) {
        let meetFilter = false;
        if (filter.condition === 'like') {
            filter.value = filter.value.replace('%', '').replace('%', '');
            if (String(item[filter.field]).toLowerCase().indexOf(String(filter.value).toLowerCase()) >= 0) {
                meetFilter = true;
            }
        } else if (filter.condition === 'eq') {
            if (String(item[filter.field]) === String(filter.value)) {
                meetFilter = true;
            }
        } else if (filter.condition === 'neq') {
            if (String(item[filter.field]) !== String(filter.value)) {
                meetFilter = true;
            }
        } else if (filter.condition === 'gt') {
            if (item[filter.field] > filter.value) {
                meetFilter = true;
            }
        } else if (filter.condition === 'lt') {
            if (item[filter.field] < filter.value) {
                meetFilter = true;
            }
        } else if (filter.condition === 'gteq') {
            if (item[filter.field] >= filter.value) {
                meetFilter = true;
            }
        } else if (filter.condition === 'lteq') {
            if (item[filter.field] <= filter.value) {
                meetFilter = true;
            }
        } else if (filter.condition === 'in') {
            if (Array.isArray(filter.value) && filter.value.indexOf(item[filter.field]) >= 0) {
                meetFilter = true;
            }
        } else if (filter.condition === 'nin') {
            if (Array.isArray(filter.value) && filter.value.indexOf(item[filter.field]) < 0) {
                meetFilter = true;
            }
        }
        return meetFilter;
    }

    /**
     * Filter an item with filter params
     *
     * @param {object} item
     * @param {object} query
     * @return {boolean}
     */
    filter(item, query) {
        let meetFilter = true;
        if (query.queryString) {
            meetFilter = false;
            query.queryString = query.queryString.replace(/%/g, "");
            if (String(item.search_string).toLowerCase().indexOf(String(query.queryString).toLowerCase()) >= 0) {
                meetFilter = true;
            }
        }
        if (query.filterParams.length > 0) {
            query.filterParams.map(filterParam => {
                if (!meetFilter) {
                    return false;
                }
                meetFilter = this.filterOne(item, filterParam);
                return filterParam;
            });
        }
        if (!meetFilter) {
            return false;
        }

        if (query.orFilterParams.length > 0) {
            query.orFilterParams.map(filterParams => {
                if (!meetFilter) {
                    return false;
                }
                meetFilter = false;
                filterParams.map(filter => {
                    if (meetFilter) {
                        return true;
                    }
                    meetFilter = this.filterOne(item, filter);
                    return false;
                });
                return filterParams;
            });
        }
        return meetFilter;
    }

    /**
     * Sort all filtered items
     *
     * @param {array} items
     * @param {array} orderParams
     * @return {*}
     */
    sort(items, orderParams) {
        orderParams.map(value => {
            if (value.direction !== QueryService.DEFAULT_ORDER_DIRECTION) {
                items.sort(function (a, b) {
                    let x = a[value.field];
                    let y = b[value.field];
                    if (typeof x === "string") {
                        x = x.toLowerCase();
                    }
                    if (typeof y === "string") {
                        y = y.toLowerCase();
                    }
                    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
                });
            } else {
                items.sort(function (a, b) {
                    let x = a[value.field];
                    let y = b[value.field];
                    if (typeof x === "string") {
                        x = x.toLowerCase();
                    }
                    if (typeof y === "string") {
                        y = y.toLowerCase();
                    }
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
            }
            return value;
        });
        return items;
    }

    /**
     * Get list item in indexed DB with QueryService object
     *
     * @param {object} queryService
     * @return {Promise<any>}
     */
    getList(queryService = {}) {
        let query = Object.assign({}, queryService);
        let table = db[this.main_table];
        let total = 0;
        // let cacheKey = JSON.stringify(query.filterParams) + JSON.stringify(query.paramOrFilter);
        // use cache in next sprint
        let cacheKey = Date.now();
        if (this.index_table && !this.indexing) {
            return this.searchIndex(query, cacheKey);
        } else {
            return this.getListByQuery(query, table, total);
        }

    }

    /**
     * get list normally
     *
     * @param queryService
     * @param query
     * @param table
     * @param total
     * @returns {Promise<any>}
     */
    getListByQuery(query, table, total) {
        return new Promise((resolve) => {
            table = table.toCollection();
            if (query.orFilterParams.length > 0 || query.filterParams.length > 0 || query.queryString) {
                table.filter(item => this.filter(item, query));
            }
            return table.toArray(items =>
                this.sort(items, query.orderParams)
            ).then(items => {
                total = items.length;
                if (query.pageSize) {
                    let from = (query.currentPage - 1) * query.pageSize,
                        to = query.currentPage * query.pageSize - 1;
                    if (items.length - 1 < to) {
                        to = items.length - 1;
                    }
                    if (from === to) {
                        items = items.slice(from);
                    } else {
                        items = items.slice(from, to + 1);
                    }
                }
                resolve({
                    items: items,
                    search_criteria: {
                        page_size: query.pageSize,
                        current_page: query.currentPage
                    },
                    total_count: total
                })
            }).catch(error => {
                resolve({
                    items: [],
                    search_criteria: {
                        page_size: query.pageSize,
                        current_page: query.currentPage
                    },
                    total_count: 0
                })
            });
        });
    }

    /**
     * Search from index table
     *
     * @param filter
     * @param pageSize
     * @param currentPage
     * @param cacheKey
     * @param orderParams
     * @returns {*}
     */
    searchIndex(query, cacheKey) {
        return new Promise((resolve, reject) => {
            let result = [],
                total = 0,
                pageSize = query.pageSize,
                // orderParams = query.orderParams, // Use default_order_by
                currentPage = query.currentPage ? query.currentPage : 1,
                self = this;
            // Start search
            db[self.index_table].each(items => {
                if (!items) {
                    return;
                }
                let res = items.value;
                for (let i = 0, n = res.length; i < n; i++) {
                    let item = res[i];
                    if (self.filter(item, query)) {
                        total++;
                        result.push(item.id);
                    }
                }
            }).then(() => {
                self.getIdsFromIndexTable(result, total, cacheKey, null, pageSize, currentPage)
                    .then(data => {
                        if (0 === data.result.length) {
                            resolve({
                                items: [],
                                search_criteria: {
                                    page_size: query.pageSize,
                                    current_page: query.currentPage
                                },
                                total_count: data.total
                            });
                        }
                        // Load Real Data
                        let ordered = data.result,
                        range = ordered.slice(0).sort(function (a, b) {
                            return a - b;
                        });
                        db[self.main_table].where(self.primary_key).anyOf(range).toArray(items => {
                            if (!items) {
                                return;
                            }
                            this.sort(items, query.orderParams);
                            resolve({
                                items: items,
                                search_criteria: {
                                    page_size: query.pageSize,
                                    current_page: query.currentPage
                                },
                                total_count: data.total
                            });
                        })
                        .catch(function (err) {
                            return reject(err);
                        });
                    });
            }).catch(function (err) {
                return reject(err);
            });
        })
    }

    /**
     * get not existed ids
     *
     * @param {Array} ids
     * @returns {Promise}
     */
    getNotExistedIds(ids) {
        return new Promise((resolve, reject) => {
            db[this.main_table].where('id').anyOf(ids)
              .keys(existedIds => resolve(ids.filter(id => -1 === existedIds.indexOf(id))))
              .catch(err => reject(err));
        });
    }

    /**
     * Get Ids from index table
     *
     * @param cacheKey
     * @param orderParams
     * @param pageSize
     * @param currentPage
     * @returns {Promise<any>}
     */
    getIdsFromIndexTable(result, total, cacheKey, orderParams, pageSize, currentPage) {
        return new Promise((resolve) => {
            let self = this;
            result.cacheKey = cacheKey;
            // $[self.index_table] = result;
            if (orderParams && result.length && typeof result[0] === 'object') {
                orderParams.forEach((value) => {
                    if (value.direction === 'DESC') {
                        result.sort(function (a, b) {
                            let x = a[value.field];
                            let y = b[value.field];
                            if (typeof x === "string") {
                                x = x.toLowerCase();
                            }
                            if (typeof y === "string") {
                                y = y.toLowerCase();
                            }
                            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
                        });
                    } else {
                        result.sort(function (a, b) {
                            let x = a[value.field];
                            let y = b[value.field];
                            if (typeof x === "string") {
                                x = x.toLowerCase();
                            }
                            if (typeof y === "string") {
                                y = y.toLowerCase();
                            }
                            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                        });
                    }
                });
                result = self.sort(result, orderParams);
                for (let i = result.length - 1; i >= 0; i--) {
                    result[i] = result[i].id;
                }
            }
            // Resolve Result
            if (pageSize) {
                let from = (currentPage - 1) * pageSize,
                    to = currentPage * pageSize - 1;
                if (result.length - 1 < to) {
                    to = result.length - 1;
                }
                if (from === to) {
                    result = result.slice(from);
                } else {
                    result = result.slice(from, to + 1);
                }
            }
            resolve({
                result: result,
                total: total,
            });
        });
    }
}
