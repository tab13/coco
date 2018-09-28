import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import CategoryResourceModel from "../../resource-model/catalog/CategoryResourceModel";

export class CategoryService extends CoreService {
    static className = 'CategoryService';
    resourceModel = CategoryResourceModel;

    /**
     * Call CategoryResourceModel save to indexedDb
     *
     * @param data
     * @returns {Promise|*|void}
     */
    saveToDb(data) {
        return this.getResourceModel().saveToDb(data);
    }

    /**
     * Call CategoryResourceModel get all
     *
     * @returns {Object|*|FormDataEntryValue[]|string[]}
     */
    getAll() {
        let categoryResourceModel = new CategoryResourceModel();
        return categoryResourceModel.getAll();
    }
}

/** @type CategoryService */
let categoryService = ServiceFactory.get(CategoryService);

export default categoryService;