import Config from '../config/Config'

export default {
    countries: null,
    location_country_code: null,
    location_state_code: null,

    /**
     * get all country object
     *
     * @return {array}
     */
    getAllCountries() {
        if (!this.countries) {
            if (!Config.countries) {
                return;
            }
            this.countries = Config.countries.filter(function(item){
                return item.id;
            });
        }
        return this.countries;
    },

    /**
     * get all state from country
     *
     * @return {array}
     */
    getCountry(country_id) {
        if (!this.getAllCountries()) {
            return null;
        }
        return this.getAllCountries().find(item => item.id === country_id);
    },

    /**
     * get state from all state
     * @param regions
     * @param region_id
     */
    getState(regions, region_id) {
        if (regions && regions.length) {
            return regions.find(item => item.id === region_id);
        }
        return null;
    },

    /**
     * get default country with location address
     * @returns {null}
     */
    getDefaultCountry() {
        if (!this.location_country_code) {
            this.location_country_code = Config.location_address.country_id;
        }
        if (!this.getAllCountries()) {
            return null;
        }
        let country = this.getAllCountries().find(item => item.id === this.location_country_code);
        return country;
    },

    /**
     * get default state with location address
     * @returns {null}
     */
    getDefaultState() {
        if (!this.location_country_code) {
            this.location_country_code = Config.location_address.country_id;
        }
        if (!this.location_state_code) {
            this.location_state_code = Config.location_address.region.region_id;
        }
        if (!this.getAllCountries()) {
            return null;
        }

        let country = this.getAllCountries().find(item => item.id === this.location_country_code);
        if (country) {
            let states = country.regions;
            if (states && states.length) {
                return states.find(region => region.id === this.location_state_code);
            }
        }

        return null;
    },

    /**
     * Get region code by country id and region id
     *
     * @param countryId
     * @param regionId
     * @return {string}
     */
    getRegionCode(countryId, regionId) {
        let country = this.getCountry(countryId);
        if (!country || !country.regions || !Array.isArray(country.regions) || !country.regions.length) {
            return "";
        }
        let region = this.getState(country.regions, regionId);
        if (!region) {
            return "";
        }
        return region.code;
    }
}