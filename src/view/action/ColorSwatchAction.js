import ColorSwatchConstant from '../constant/ColorSwatchConstant';

export default {
    /**
     * action get color swatch
     * @return type
     */
    getColorSwatch: () => {
        return {
            type: ColorSwatchConstant.GET_COLOR_SWATCH
        }
    },

    /**
     * action result get color swatch
     * @param configs
     * @return type, configs
     */
    getColorSwatchResult: (configs = []) => {
        return {
            type: ColorSwatchConstant.GET_COLOR_SWATCH_RESULT,
            configs: configs
        }
    },

    /**
     * get color swatch error
     * @param error
     * @returns {{type: string, configs: module.exports.configs|{recommended, all}}}
     */
    getColorSwatchError: (error) => {
        return {
            type: ColorSwatchConstant.GET_COLOR_SWATCH_ERROR,
            error: error
        }
    }
}