import ExportDataPopupConstant from "../constant/ExportDataPopupConstant";

/**
 * initial State for reducer
 *
 * @type {{isOpen: boolean, success: {}, error: {}}}
 */
const initState = {
    isOpen: false,
    success: {},
    error: {}
};

/**
 * receive action from Export Data Popup Action
 *
 * @param state
 * @param action
 * @returns {{isOpen: boolean, success: {}, error: {}}}
 * @constructor
 */
export default function ExportDataPopupReducer(state = initState, action) {
    switch (action.type) {
        case ExportDataPopupConstant.CLICK_MODAL_BACKDROP:
            return {...state , isOpen: !state.isOpen };
        case ExportDataPopupConstant.FINISH_EXPORT_REQUESTING:
            return {...state , ...{ success: action.response, isOpen: !state.isOpen }};
        default: return state
    }
}