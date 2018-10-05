import StaffDiscountConstant from "../../constant/StaffDiscountConstant";

export default {
    clickConfirmManagerPinCode: (pincode) => {
        return {
            type: StaffDiscountConstant.CHECK_MANAGER_PINCODE,
            pincode: pincode
        }
    },
    checkManagerPinCodeSuccess: (response) => {
        return {
            type: StaffDiscountConstant.CHECK_MANAGER_PINCODE_RESULT,
            is_manager: response[0].is_manager,
            message: response[0].message
        }
    },
    checkManagerPinCodeError: (message) => {
        return {
            type: StaffDiscountConstant.CHECK_MANAGER_PINCODE_ERROR
        }
    }
}