import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import {AbstractAddProductService} from "./AbstractService";

export class AddSimpleProductService extends AbstractAddProductService {
    static className = 'AddSimpleProductService';
}

/** @type AddSimpleProductService */
let addSimpleProductService = ServiceFactory.get(AddSimpleProductService);

export default addSimpleProductService;