import Config from "../config/Config";
export default {
    /**
     * Return guest customer information
     * @returns {object}
     */
    getCustomer() {
        return Config.config.guest_customer;
    },

    /**
     * Get guest customer firstname
     * @return {string}
     */
    getFirstname() {
        return this.getCustomer().first_name;
    },

    /**
     * Get guest customer lastname
     * @return {string}
     */
    getLastname() {
        return this.getCustomer().last_name;
    },

    /**
     * Get guest customer middlename
     * @return {string}
     */
    getMiddlename() {
        return this.getCustomer().middlename || null;
    },

    /**
     * Get guest customer prefix
     * @return {string}
     */
    getPrefix() {
        return this.getCustomer().prefix || null;
    },

    /**
     * Get guest customer suffix
     * @return {string}
     */
    getSuffix() {
        return this.getCustomer().suffix || null;
    },

    /**
     * Get guest customer email
     * @return {string}
     */
    getEmail() {
        return this.getCustomer().email;
    },

    /**
     * Get guest customer street
     * @return {string}
     */
    getStreet() {
        return this.getCustomer().street;
    },

    /**
     * Get guest customer city
     * @return {string}
     */
    getCity() {
        return this.getCustomer().city;
    },

    /**
     * Get guest customer country
     * @return {string}
     */
    getCountry() {
        return this.getCustomer().country;
    },

    /**
     * Get guest customer region
     * @return {string}
     */
    getRegion() {
        return this.getCustomer().region;
    },

    /**
     * Get guest customer region id
     * @return {int}
     */
    getRegionId() {
        return this.getCustomer().region_id;
    },

    /**
     * Get guest customer telephone
     * @return {string}
     */
    getTelephone() {
        return this.getCustomer().telephone;
    },

    /**
     * Get guest customer fax
     * @return {string}
     */
    getFax() {
        return this.getCustomer().fax;
    },

    /**
     * Get guest postcode
     * @return {string}
     */
    getPostcode() {
        return this.getCustomer().zip_code;
    },

    /**
     * Get guest tax vat
     * @return {string}
     */
    getTaxvat() {
        return this.getCustomer().taxvat || null;
    },

    /**
     * Get guest dob
     * @return {string}
     */
    getDob() {
        return this.getCustomer().dob || "";
    },

    /**
     * Get guest dob
     * @return {string}
     */
    getGender() {
        return this.getCustomer().gender || null;
    },

    /**
     * Get guest status
     * @returns {boolean}
     */
    getStatus() {
        if (!this.getCustomer().hasOwnProperty('status')) {
            return true;
        }
        return this.getCustomer().status;
    }
}