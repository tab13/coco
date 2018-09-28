
import deepmerge from "../framework/Merge";
/**
 *  collect all config.js each extension module
 *
 * @return {*}
 */
function getConfig() {
    return deepmerge.all([
        {},
        {},
        /** ADD config class in here  */
    ])
}

let cachedConfig = getConfig();

/**
 *
 * cache config
 *
 * @return {*}
 */
export default () => {
    if (!cachedConfig) {
        cachedConfig = getConfig()
    }

    return cachedConfig
}

export function updateConfig(newConfig) {
    cachedConfig = newConfig;
}
