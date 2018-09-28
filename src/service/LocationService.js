import LocalStorageHelper from "../helper/LocalStorageHelper";
import CoreService from "./CoreService";
import ServiceFactory from "../framework/factory/ServiceFactory";
import LocationResourceModel from "../resource-model/user/LocationResourceModel";

export class LocationService extends CoreService{
    static className = 'LocationService';
    resourceModel = LocationResourceModel;
    /**
     * get location name local storage
     *
     * @return {string}
     */
    getCurrentLocationName() {
        return LocalStorageHelper.get(LocalStorageHelper.LOCATION_NAME);
    }

    /**
     * get location id from localStorage
     * @returns {*|string}
     */
    getCurrentLocationId(){
        return Number(LocalStorageHelper.get(LocalStorageHelper.LOCATION_ID));
    }

    /**
     * save location id and location name local storage
     *
     * @param locationId
     * @param locationName
     */
    saveCurrentLocation(locationId, locationName, locationAddress, locationTelephone) {
        LocalStorageHelper.set(LocalStorageHelper.LOCATION_ID, locationId);
        LocalStorageHelper.set(LocalStorageHelper.LOCATION_NAME, locationName);
        LocalStorageHelper.set(LocalStorageHelper.LOCATION_ADDRESS, JSON.stringify(locationAddress));
        LocalStorageHelper.set(LocalStorageHelper.LOCATION_TELEPHONE, locationTelephone);
    }

    /**
     * remove location id and location name local storage
     *
     * @return void
     */
    removeCurrentLocation() {
        LocalStorageHelper.remove(LocalStorageHelper.LOCATION_ID);
        LocalStorageHelper.remove(LocalStorageHelper.LOCATION_NAME);
    }

    /**
     * get locations from localStorage
     * @returns {*|string}
     */
    getLocationsInLocalStorage(){
        return LocalStorageHelper.get(LocalStorageHelper.LOCATIONS);
    }

    /**
     * user assign pos
     * @param posId
     * @param locationId
     * @param currentStaffId
     * @returns {*|promise|{type, posId, locationId, currentStaffId}}
     */
    assignPos(posId, locationId, currentStaffId) {
        let locationResource = new LocationResourceModel();
        return locationResource.assignPos(posId, locationId, currentStaffId);
    }

    /**
     * get current location address
     * @returns {*|string}
     */
    getCurrentLocationAddress(){
        return JSON.parse(LocalStorageHelper.get(LocalStorageHelper.LOCATION_ADDRESS));
    }

    /**
     * get current location telephone
     * @returns {*|string}
     */
    getCurrentLocationTelephone(){
        return LocalStorageHelper.get(LocalStorageHelper.LOCATION_TELEPHONE);
    }

    /**
     * Call LocationResourceModel request get list location
     *
     * @param queryService
     */
    getNewLocations(queryService) {
        return this.getDataOnline(queryService);
    }

    /**
     * get location by id
     * @returns {string}
     */
    getLocationById(locationId) {
        let locationsString = this.getLocationsInLocalStorage();
        let locations = [];
        if (locationsString && locationsString !== "") {
            locations = JSON.parse(locationsString);
        }
        return locations.find(location => location.location_id === locationId);
    }
}

/**
 * @type {LocationService}
 */
let locationService = ServiceFactory.get(LocationService);

export default locationService;