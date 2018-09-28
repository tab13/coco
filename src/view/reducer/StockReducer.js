import StockConstant from "../constant/StockConstant";

/**
 *  initial State for reducer
 * @type {{locations: Array}}
 */
const initState = {
    stock_locations: []
};

/**
 * receive action from Stock Action 
 * 
 * @param state
 * @param action
 * @returns {*}
 */
export default function stockReducer(state = initState, action) {
    switch (action.type) {
        case StockConstant.GET_EXTERNAL_STOCK_RESULT:
            return {...state, stock_locations: action.locations};
        case StockConstant.CANCEL_EXTERNAL_STOCK:
            return {...state, stock_locations: []};
        default: return state
    }
}