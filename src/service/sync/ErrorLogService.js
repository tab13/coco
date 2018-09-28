import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import ErrorLogResourceModel from "../../resource-model/sync/ErrorLogResourceModel";

export class ErrorLogService extends CoreService {
    static className = 'ErrorLogService';
    resourceModel = ErrorLogResourceModel;

    /**
     * get all data in table error log
     *
     * @returns {Object|*|FormDataEntryValue[]|string[]}
     */
    getAllDataErrorLog() {
        return this.getResourceModel().getAllDataErrorLog();
    }
}

/** @type ErrorLogService */
let errorLogService = ServiceFactory.get(ErrorLogService);

export default errorLogService;