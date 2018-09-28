import ServiceFactory from "../../../framework/factory/ServiceFactory";
import {AbstractQuoteService} from "./AbstractService";
import AddSimpleProductService from './add-product/SimpleService';
import AddConfigurableProductService from './add-product/ConfigurableService';
import AddBundleProductService from './add-product/BundleService';
import AddGroupedProductService from './add-product/GroupedService';
import GiftCardService from "./add-product/GiftCardService";
import ProductTypeConstant from "../../../view/constant/ProductTypeConstant";

export class AddProductService extends AbstractQuoteService {
    static className = 'AddProductService';

    addProductServices = {
        simple: AddSimpleProductService,
        configurable: AddConfigurableProductService,
        bundle: AddBundleProductService,
        grouped: AddGroupedProductService,
        [ProductTypeConstant.GIFT_CARD]: GiftCardService,
    };

    /**
     * Get Add product service per product type
     *
     * @param product
     * @return {*}
     */
    getAddProductService(product) {
        if (typeof product === 'string' && this.addProductServices[product]) {
            return this.addProductServices[product];
        }
        if (product.type_id && this.addProductServices[product.type_id]) {
            return this.addProductServices[product.type_id];
        }
        return this.addProductServices.simple;
    }

    /**
     * Add product to cart
     *
     * @param quote
     * @param data
     * @return {*|{type, data}|void}
     */
    addProduct(quote, data) {
        return this.getAddProductService(data.product).addProduct(quote, data);
    }
}

/** @type AddProductService */
let addProductService = ServiceFactory.get(AddProductService);

export default addProductService;