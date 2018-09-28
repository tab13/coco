import Config from "../config/Config";

export default {
    /**
     * Get current location name
     * @return {string}
     */
    getId() {
        return Config.location_id;
    },
    /**
     * Get current location name
     * @return {string}
     */
    getName() {
        return Config.location_name;
    },
    /**
     * Get current location address
     * @return {object}
     */
    getAddress() {
        return Config.location_address;
    },
    /**
     * Get current location street
     * @return {string}
     */
    getStreet() {
        return this.getAddress().street;
    },
    /**
     * Get current location city
     * @return {string}
     */
    getCity() {
        return this.getAddress().city;
    },
    /**
     * Get current location country id
     * @return {string}
     */
    getCountryId() {
        return this.getAddress().country_id;
    },
    /**
     * Get current location region
     * @return {string}
     */
    getRegion() {
        return this.getAddress().region;
    },
    /**
     * Get current location region id
     * @return {number}
     */
    getRegionId() {
        return this.getAddress().region_id;
    },
    /**
     * Get current location postcode
     * @return {string}
     */
    getPostcode() {
        return this.getAddress().postcode;
    },

    /**
     * Get current location telephone
     * @return {string}
     */
    getTelephone() {
        return this.getAddress().telephone;
    },

    /**
     * Get current location fax
     * @return {string}
     */
    getFax() {
        return this.getAddress().fax;
    },

    /**
     * Check current location is primary location
     *
     * @return {*}
     */
    isPrimaryLocation() {
        return Config.config.is_primary_location;
    }
}