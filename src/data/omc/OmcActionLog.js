import OmcAbstract from "./OmcAbstract";
import SyncConstant from "../../view/constant/SyncConstant";

export default class OmcActionLog extends OmcAbstract {
    static className = 'OmcActionLog';

    /**
     * request action log with type
     * @param api_url
     * @param method
     * @param params
     * @returns {Promise.<any>}
     */
    requestActionLog(api_url, method, params) {
        let url = this.getBaseUrl() + api_url;
        if (method === SyncConstant.METHOD_POST) {
            return this.post(url, params);
        } else if(method === SyncConstant.METHOD_PUT) {
            return this.put(url, params);
        } else if (method === SyncConstant.METHOD_DELETE) {
            return this.delete(url, params);
        }
    }
}