import AbstractResourceModel from "../AbstractResourceModel";

export default class StaffDiscountResourceModel extends AbstractResourceModel{
    static className = 'StaffDiscountResourceModel';

    constructor(props) {
        super(props);
        this.state = {resourceName : 'StaffDiscount'};
    }

    checkManagerStaffPinCode(pincode) {
        return this.getResourceOnline().checkManagerStaffPinCode(pincode);
    }
}