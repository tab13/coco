import SignOutConstant from "../constant/SignoutConstant";
import LogoutPopupConstant from "../constant/LogoutPopupConstant";
import PosService from "../../service/PosService";
import UserService from "../../service/user/UserService";

const  initialState = {};
/**
 * receive action from DataAbstract
 *
 * @param state
 * @param action
 * @returns {*}
 */
const signoutreducer = function (state = initialState, action) {
    switch (action.type) {
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            if(action.response.code === 901) {
                PosService.removeCurrentPos();
                return { ...state,
                    page: '/location',
                    message: action.response.message
                };
            }

            if(action.response.code === 900) {
                UserService.removeStaff();
                UserService.removeSession();
                PosService.removeCurrentPos();
                return { ...state,
                    page: '/login',
                    message: action.response.message
                };
            }

            return state;
        case SignOutConstant.FORCE_SIGN_OUT_SUCCESS:
            return { ...state,
                page: '',
                message: ''
            };
        default:
            return state;
    }
};

export default signoutreducer;
