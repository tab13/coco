import CoreService from "../../CoreService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";

export class ProductListService extends CoreService {
    static className = 'ProductListService';

    /**
     * Prepare item to update list product after sync product
     *
     * @param updatedProducts
     * @param items
     * @return {*}
     */
    prepareItemsToUpdateListAfterSyncProduct(updatedProducts, items) {
        let result = false;
        if (updatedProducts && updatedProducts.length) {
            let updateProducts = this.prepareUpdateProductData(updatedProducts);
            items.forEach(item => {
                let isUpdated = this.prepareUpdatedProductItem(item, updateProducts);
                if (isUpdated) {
                    result = true;
                }
            });
        }
        if (!result) {
            return result;
        }
        return items;
    }

    /**
     * Prepare data to update product
     *
     * @param products
     * @return {{}}
     */
    prepareUpdateProductData(products) {
        let updateProducts = {};
        products.map(product => {
            if (product && product.id) {
                updateProducts[product.id] = product;
            }
            return product;
        });
        return updateProducts;
    }

    /**
     * Update item after sync product
     *
     * @param item
     * @param updateProducts
     * @return {*}
     */
    prepareUpdatedProductItem(item, updateProducts) {
        if (updateProducts[item.id]) {
            let product = updateProducts[item.id];
            Object.keys(product).forEach(key => {
                if (key === 'children_products') {
                    product.children_products.forEach(child => {
                        let findChild = item.children_products.find(itemChild => itemChild.id === child.id);
                        if (!findChild) {
                            product.children_products.push(child);
                        } else {
                            Object.keys(child).forEach(key => {
                                findChild[key] = child[key];
                            })
                        }
                    });
                } else {
                    item[key] = product[key];
                }
                return key;
            });
            return true;
        }
        return false;
    }

    /**
     * Prepare item to update list product after sync stock
     *
     * @param updatedStocks
     * @param items
     * @return {*}
     */
    prepareItemsToUpdateListAfterSyncStock(updatedStocks, items) {
        let result = false;
        if (updatedStocks && updatedStocks.length) {
            let updateStocks = this.prepareUpdateStockData(updatedStocks);
            items.forEach(item => {
                let isUpdated = this.prepareUpdatedProductStockItem(item, updateStocks);
                if (isUpdated) {
                    result = true;
                }
            });
        }
        if (!result) {
            return result;
        }
        return items;
    }

    /**
     * @param updatedStocks
     * @return {{}}
     */
    prepareUpdateStockData(updatedStocks) {
        let updateStocks = {};
        updatedStocks.forEach(stock => {
            if (stock && stock.product_id) {
                if (!updateStocks[stock.product_id]) {
                    updateStocks[stock.product_id] = [stock];
                } else {
                    updateStocks[stock.product_id].push(stock);
                }
            }
        });
        return updateStocks;
    }

    /**
     * @param item
     * @param updateStocks
     * @return {boolean}
     */
    prepareUpdatedProductStockItem(item, updateStocks) {
        let result = false;
        if (updateStocks[item.id]) {
            if (item.stocks && item.stocks.length) {
                item.stocks.forEach(stock => {
                    let updatedStock = updateStocks[item.id].find(updateStock => stock.item_id === updateStock.item_id);
                    if (updatedStock && updatedStock.item_id) {
                        Object.keys(updatedStock).forEach(key => {
                            stock[key] = updatedStock[key];
                        })
                    }
                });
            } else {
                item.stocks = updateStocks[item.id];
            }
            result = true;
        }
        if (item.children_products && item.children_products.length) {
            item.children_products.forEach(child => {
                let childResult = this.prepareUpdatedProductStockItem(child, updateStocks);
                if (childResult) {
                    result = true;
                }
            });
        }
        if (result) {
            if (!item.updated_stock) {
                item.updated_stock = 1;
            } else {
                item.updated_stock++;
            }
        }
        return result;
    }

    /**
     * Prepare item to update list product after sync catalog rule price
     * @param updatedCatalogRulePrices
     * @param items
     * @return {*}
     */
    prepareItemsToUpdateListAfterSyncCatalogRulePrice(updatedCatalogRulePrices, items) {
        let result = false;
        if (updatedCatalogRulePrices && updatedCatalogRulePrices.length) {
            let updateCatalogRulePrices = this.prepareUpdateCatalogRulePriceData(updatedCatalogRulePrices);
            items.forEach(item => {
                let isUpdated = this.prepareUpdatedProductCatalogRulePricesItem(item, updateCatalogRulePrices);
                if (isUpdated) {
                    result = true;
                }
            });
        }
        if (!result) {
            return result;
        }
        return items;
    }

    /**
     * prepare update catalog rule price data
     * @param updatedCatalogRulePrices
     */
    prepareUpdateCatalogRulePriceData(updatedCatalogRulePrices) {
        let updateCatalogRulePrices = {};
        updatedCatalogRulePrices.forEach(catalogRulePrice => {
            if (catalogRulePrice && catalogRulePrice.product_id) {
                if (!updateCatalogRulePrices[catalogRulePrice.product_id]) {
                    updateCatalogRulePrices[catalogRulePrice.product_id] = [catalogRulePrice];
                } else {
                    updateCatalogRulePrices[catalogRulePrice.product_id].push(catalogRulePrice);
                }
            }
        });
        return updateCatalogRulePrices;
    }

    /**
     * prepare updated product catalog rule prices item
     * @param item
     * @param updateCatalogRulePrices
     * @return {boolean}
     */
    prepareUpdatedProductCatalogRulePricesItem(item, updateCatalogRulePrices) {
        let result = false;
        if (updateCatalogRulePrices[item.id]) {
            if (item.catalogrule_prices && item.catalogrule_prices.length) {
                item.catalogrule_prices.forEach((catalogRulePrice, index) => {
                    let updatedCatalogRulePrice = updateCatalogRulePrices[item.id].find(x =>
                        catalogRulePrice.rule_product_price_id === x.rule_product_price_id
                    );
                    if (updatedCatalogRulePrice) {
                        item.catalogrule_prices[index] = updatedCatalogRulePrice;
                    }
                });
            } else {
                item.catalogrule_prices = updateCatalogRulePrices[item.id];
            }
            result = true;
        }
        if (item.children_products && item.children_products.length) {
            item.children_products.forEach(child => {
                let childResult = this.prepareUpdatedProductCatalogRulePricesItem(child, updateCatalogRulePrices);
                if (childResult) {
                    result = true;
                }
            });
        }
        if (result) {
            if (!item.updated_catalogrule_prices) {
                item.updated_catalogrule_prices = 1;
            } else {
                item.updated_catalogrule_prices++;
            }
        }
        return result;
    }

    /**
     * Prepare item to update list product after sync deleted catalog rule price
     * @param ids
     * @param items
     * @return {*}
     */
    prepareItemsToUpdateListAfterSyncDeletedCatalogRulePrice(ids, items) {
        let result = false;
        if (ids && ids.length) {
            items.forEach(item => {
                let isUpdated = this.updateDeletedCatalogRulePricesInItem(item, ids);
                if (isUpdated) {
                    result = true;
                }
            });
        }
        if (!result) {
            return result;
        }
        return items;
    }

    /**
     * update deleted catalog rule prices in item
     * @param item
     * @param ids
     * @return {boolean}
     */
    updateDeletedCatalogRulePricesInItem(item, ids) {
        let result = false;
        if (ids && ids.length) {
            if (item.catalogrule_prices && item.catalogrule_prices.length) {
                item.catalogrule_prices = item.catalogrule_prices.filter(x =>
                    ids.indexOf(x.rule_product_price_id) === -1
                );
            }
            result = true;
        }
        if (item.children_products && item.children_products.length) {
            item.children_products.forEach(child => {
                let childResult = this.updateDeletedCatalogRulePricesInItem(child, ids);
                if (childResult) {
                    result = true;
                }
            });
        }
        if (result) {
            if (!item.updated_catalogrule_prices) {
                item.updated_catalogrule_prices = 1;
            } else {
                item.updated_catalogrule_prices++;
            }
        }
        return result;
    }
}

/** @type ProductListService */
let productListService = ServiceFactory.get(ProductListService);

export default productListService;