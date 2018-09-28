import AbstractResourceModel from "../AbstractResourceModel";

export default class LocationResourceModel extends AbstractResourceModel {
    static className = 'LocationResourceModel';

    /**
     * constructor
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName : 'Location'};
    }

    /**
     * assign pos to session
     *
     * @param posId
     * @param locationId
     * @param currentStaffId
     * @returns {*|promise|{type, posId, locationId, currentStaffId}}
     */
    assignPos(posId, locationId, currentStaffId){
        return this.getResourceOnline().assignPos(posId, locationId, currentStaffId);
    }
}

