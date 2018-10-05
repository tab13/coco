import OmcAbstract from "./OmcAbstract";

export default class OmcStaffDiscount extends OmcAbstract{
    static className = 'OmcStaffDiscount';

    checkManagerStaffPinCode(pincode) {
        let params = {params:pincode};
        let url = this.getBaseUrl() + this.check_staff_manager_pin_code_api;
        return this.post(url, params);
    }
}