import ConfigConstant from '../constant/ConfigConstant';
import Config from '../../config/Config';

const initialState = {configs: []};

/**
 * receive action from Config Action
 *
 * @param state = {configs: []}
 * @param action
 * @returns {*}
 */
const configReducer = function (state = initialState, action) {
    switch (action.type) {
        case ConfigConstant.GET_CONFIG_RESULT:
            const {configs} = action;
            Config.config = configs;
            return {...state, configs: configs};
        case ConfigConstant.GET_CONFIG_ERROR:
            return state;
        // case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
        //     return initialState;
        default:
            return state
    }
};

export default configReducer;