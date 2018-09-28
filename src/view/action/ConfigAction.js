import ConfigConstant from '../constant/ConfigConstant';

export default {
    /**
     * action get config
     * @return type
     */
    getConfig: () => {
        return {
            type: ConfigConstant.GET_CONFIG
        }
    },

    /**
     * action result get config
     * @param configs
     * @return type, configs
     */
    getConfigResult: (configs = []) => {
        return {
            type: ConfigConstant.GET_CONFIG_RESULT,
            configs: configs
        }
    },

    /**
     * get config error
     * @param error
     * @returns {{type: string, configs: module.exports.configs|{recommended, all}}}
     */
    getConfigError: (error) => {
        return {
            type: ConfigConstant.GET_CONFIG_ERROR,
            error: error
        }
    }
}