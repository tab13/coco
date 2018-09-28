import ConfigHelper from "./ConfigHelper";
import ConfigConstant from "../view/constant/ConfigConstant";

export default {
    /**
     * Get use custom prefix
     *
     * @return {boolean}
     */
    getUseCustomPrefix() {
        return ConfigHelper.getConfig(ConfigConstant.CONFIG_XML_PATH_USE_CUSTOM_PREFIX) === '1';
    },

    /**
     *
     * custom prefix
     * @return {string}
     */
    getCustomPrefix() {
        return ConfigHelper.getConfig(ConfigConstant.CONFIG_XML_PATH_CUSTOM_PREFIX);
    }
}