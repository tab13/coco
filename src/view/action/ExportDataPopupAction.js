import ExportDataPopupConstant from "../constant/ExportDataPopupConstant";

/**
 * action emit whenever user click outside modal export
 *
 * @return {{type}}
 */
export const clickBackDrop = () => {
    return {
        type: ExportDataPopupConstant.CLICK_MODAL_BACKDROP,
    }
};

/**
 * action emit when export request done
 *
 * @param response
 * @return {{type, response: *}}
 */
export const finishExportDataRequesting = (response) => {
    return {
        type: ExportDataPopupConstant.FINISH_EXPORT_REQUESTING,
        response
    }
};

/**
 * Combine actions
 */
export default {
    clickBackDrop,
    finishExportDataRequesting
};