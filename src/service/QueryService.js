export default {
    params: [],
    filterParams: [],
    orFilterParams: [],
    queryString: null,
    orderParams: [],
    pageSize: null,
    currentPage: 1,
    DEFAULT_ORDER_DIRECTION: 'ASC',
    DEFAULT_FILTER_CONDITION: '=',

    /**
     * Reset query params
     */
    reset() {
        this.params = [];
        this.filterParams = [];
        this.orFilterParams = [];
        this.queryString = null;
        this.orderParams = [];
        this.pageSize = null;
        this.currentPage = 1;
        this.DEFAULT_ORDER_DIRECTION = 'ASC';
        this.DEFAULT_FILTER_CONDITION = '=';
        return this;
    },

    /**
     * add parameters
     *
     * @param key
     * @param value
     * @returns {addParams}
     */
    addParams(key, value) {
        this.params.push({
            key: key,
            value: value
        });
        return this;
    },

    /**
     * add field to filter
     *
     * @param field
     * @param value
     * @param condition
     * @returns {addFieldToFilter}
     */
    addFieldToFilter(field, value, condition) {
        if (Array.isArray(field)) {
            let orFilter = [];
            field.map(item =>
                orFilter.push({
                    field: item[0],
                    value: item[1],
                    condition: item[2] || this.DEFAULT_FILTER_CONDITION
                })
            )
            this.orFilterParams.push(orFilter);
        } else {
            this.filterParams.push({
                field: field,
                value: value,
                condition: condition
            })
        }
        return this;
    },

    /**
     * Add query string filter
     */
    addQueryString(string) {
        this.queryString = string;
    },

    /**
     * set order
     *
     * @param field
     * @param direction
     * @returns {setOrder}
     */
    setOrder(field, direction) {
        this.orderParams.push({
            field: field,
            direction: direction || this.DEFAULT_ORDER_DIRECTION
        });
        return this;
    },

    /**
     * set page size
     *
     * @param pageSize
     * @returns {setPageSize}
     */
    setPageSize(pageSize) {
        this.pageSize = pageSize;
        return this;
    },

    /**
     * set current page
     *
     * @param currentPage
     */
    setCurrentPage(currentPage) {
        this.currentPage = currentPage;
    },

    /**
     * Add searchCriteria param
     * @param key
     * @param value
     */
    addSearchCriteriaParam(key, value) {
        this.addParams('searchCriteria['+key+']', value)
    }
}