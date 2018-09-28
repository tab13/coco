import OmcAbstract from "./OmcAbstract";

export default class OmcLocation extends OmcAbstract {
    static className = 'OmcLocation';
    get_list_api = this.get_list_location_api;

    /**
     * assign pos
     * @returns {promise}
     */
    assignPos(posId, locationId, currentStaffId) {
        let params = {
            pos: {
                pos_id: posId,
                location_id: locationId
            }
        };
        let url = this.getBaseUrl() + this.assign_pos_api;
        return this.post(url, params);
    }
}

