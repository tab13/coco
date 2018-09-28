import MenuConfig from "../../config/MenuConfig";
import LogoutPopupConstant from "../constant/LogoutPopupConstant";
import MenuConstant from "../constant/MenuConstant";


/**
 *  init state for reducer
 *
 * @type {{active: *, items: *}}
 */
const initialState = {
    items: MenuConfig.getMenuItem(),
    isOpen: false
};

/**
 * receive action from Menu Action
 *
 * @param state
 * @param action
 * @return {{active: *, items: *}}
 * @constructor
 */
export default function MenuReducer(state = initialState, action) {
    switch (action.type) {
        case MenuConstant.TOGGLE:
            return {...state,  isOpen: !state.isOpen};
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return {...initialState};
        case MenuConstant.TRIGGER_REFRESH_MENU_ITEMS: {
            return {...state, items: MenuConfig.getMenuItem()}
        }
        default:
            return state
    }
}
