import StaffDiscountConstant from "../../constant/StaffDiscountConstant";

const initialState = {
    isChecking: true,
    is_manager: false,
    message: ''
};

const staffDiscountReducer = function (state = initialState, action) {
    switch (action.type) {
        case StaffDiscountConstant.CHECK_MANAGER_PINCODE_RESULT:
            return {
                ...state,
                isChecking: false,
                is_manager: action.is_manager,
                message: action.message
            };
        case StaffDiscountConstant.CHECK_MANAGER_PINCODE_ERROR:
            return {
                ...state
            };
        case StaffDiscountConstant.RESET_CHECK_MANAGER_PINCODE:
            state = initialState;
            return {
                ...state
            }
        default:
            return state;
    }
};

export default staffDiscountReducer;