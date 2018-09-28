import React from 'react';
import {CoreComponent} from "../../../framework/component";
import {toast} from "react-toastify";
import GLOBAL_VARIABLES from "../../../config/Config";
import UserService from "../../../service/user/UserService";
import LocationService from "../../../service/LocationService";
import PosService from "../../../service/PosService";
import 'react-select/dist/react-select.css';
import '../../style/css/Location.css';
import SyncService from "../../../service/sync/SyncService";
import CoreContainer from "../../../framework/container/CoreContainer";
import LocationAction from "../../action/LocationAction";
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import ComponentFactory from "../../../framework/factory/ComponentFactory";
import LogoutPopupAction from "../../action/LogoutPopupAction";
import Select from 'react-select';

class SelectLocationPos extends CoreComponent {
    static className = 'SelectLocationPos';

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);

        this.state = {
            changedValue: false,
            pos: [],
            selectedLocation: null,
            selectedPos: null,
        };

        this.handleChangeLocation = this.handleChangeLocation.bind(this);
        this.handleChangePos = this.handleChangePos.bind(this);
        this.handleEnterPos = this.handleEnterPos.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.checkOnceLocationPos = this.checkOnceLocationPos.bind(this);
        this.handleAssignPos = this.handleAssignPos.bind(this);
    }

    /**
     * component will mount
     */
    componentWillMount() {
        let session = GLOBAL_VARIABLES.session;
        let staffId = GLOBAL_VARIABLES.staff_id;
        if (!session) {
            session = UserService.getSession();
            GLOBAL_VARIABLES.session = session;
        }
        if (!staffId) {
            staffId = UserService.getStaffId();
            GLOBAL_VARIABLES.staff_id = staffId;
        }
        if (!session || !staffId) {
            UserService.removeSession();
            UserService.removeStaff();
            window.location.reload();
        }

        let redirectToLoading = false;
        if (this.checkOnceLocationPos() && !this.props.assignPos && !this.props.error) {
            redirectToLoading = true;
            let {locations} = this.props;
            let location = locations[0];
            let pos = location.pos[0];
            this.handleAssignPos(staffId, location, pos);
        }
        if (redirectToLoading || this.checkLocationPosSavedLocalStorage()) {
            GLOBAL_VARIABLES.location_id = LocationService.getCurrentLocationId();
            GLOBAL_VARIABLES.location_name = LocationService.getCurrentLocationName();
            GLOBAL_VARIABLES.location_address = LocationService.getCurrentLocationAddress();
            GLOBAL_VARIABLES.location_telephone = LocationService.getCurrentLocationTelephone();
            GLOBAL_VARIABLES.pos_id = PosService.getCurrentPosId();
            GLOBAL_VARIABLES.pos_name = PosService.getCurrentPosName();
            return this.props.history.push('/loading');
        }
    }

    /**
     * component will receive props
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (!nextProps.assignPos) {
            if (nextProps.error && nextProps.error !== "") {
                toast.error(
                    this.props.t(nextProps.message),
                    {
                        className: 'wrapper-messages messages-warning'
                    }
                );
                UserService.clearLocationPosInLocalStorage();
            }
        } else {
            if (this.checkLocationPosSavedLocalStorage()) {
                GLOBAL_VARIABLES.location_id = LocationService.getCurrentLocationId();
                GLOBAL_VARIABLES.location_name = LocationService.getCurrentLocationName();
                GLOBAL_VARIABLES.location_address = LocationService.getCurrentLocationAddress();
                GLOBAL_VARIABLES.location_telephone = LocationService.getCurrentLocationTelephone();
                GLOBAL_VARIABLES.pos_id = PosService.getCurrentPosId();
                GLOBAL_VARIABLES.pos_name = PosService.getCurrentPosName();
                nextProps.history.push('/loading');
            }
        }
    }

    /**
     *  if request logout is done ,reload page
     *  if request logout has error ,show error alert
     *
     */
    componentDidUpdate() {
        if ( Object.keys(this.props.success).length) {
            this.props.reInit();
            return this.props.history.push({
                pathname: '/login'
            });

        }
    }

    /**
     * check location pos
     * @returns {boolean}
     */
    checkLocationPosSavedLocalStorage() {
        const locationId = LocationService.getCurrentLocationId();
        const locationName = LocationService.getCurrentLocationName();
        const posId = PosService.getCurrentPosId();
        const posName = PosService.getCurrentPosName();
        
        return (locationId && locationName && posId && posName);
    }

    /**
     * check if has once location and once pos
     * @returns {boolean}
     */
    checkOnceLocationPos() {
        let {locations} = this.props;
        if (locations && locations.length === 1) {
            if (locations[0] && locations[0].pos) {
                let pos = locations[0].pos;
                if (pos.length === 1) {
                    if (!pos[0].staff_id) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * change value location selected
     * @param location
     */
    handleChangeLocation = (location) => {
        if (location) {
            this.setState({
                changedValue: false,
                pos: location.pos,
                selectedLocation: location,
                selectedPos: null
            });
        } else {
            this.setState({
                changedValue: false,
                pos: [],
                selectedLocation: null,
                selectedPos: null
            });
        }
    };

    /**
     * change value pos selected
     * @param pos
     */
    handleChangePos = (pos) => {
        if (pos) {
            this.setState({
                changedValue: true,
                selectedPos: pos
            });
        } else {
            this.setState({
                changedValue: false,
                selectedPos: null
            });
        }
    };

    /**
     * handle event click to enter pos button
     */
    handleEnterPos() {
        let staffId = GLOBAL_VARIABLES.staff_id;
        if (!staffId) {
            staffId = UserService.getStaffId();
            GLOBAL_VARIABLES.staff_id = staffId;
        }
        if (staffId) {
            let {selectedLocation, selectedPos} = this.state;
            this.handleAssignPos(staffId, selectedLocation, selectedPos);
        }
    }

    /**
     * assign pos for user and save to localStorage
     * @param staffId
     * @param location
     * @param pos
     */
    handleAssignPos(staffId, location, pos) {
        let locationId = location.location_id;
        let posId = pos.pos_id;
        SyncService.saveNeedSync(this.checkNeedSync(locationId));
        SyncService.saveNeedSyncSession(this.checkNeedSyncSession(posId));
        LocationService.saveCurrentLocation(
            locationId, location.name, location.address, location.telephone
        );
        PosService.saveCurrentPos(posId, pos.pos_name);
        this.props.userAssignPos(posId, locationId, staffId);

    }

    /**
     * compare locationId to check need sync some table in indexeddb
     * @param locationId
     * @returns {string}
     */
    checkNeedSync(locationId) {
        let locationIdLocaStorage = LocationService.getCurrentLocationId();
        if (locationId) {
            if (Number(locationId) === Number(locationIdLocaStorage)) {
                return '0';
            }
        }
        return '1';
    }

    /**
     * compare posId to check need sync session in indexeddb
     * @param posId
     * @return {string}
     */
    checkNeedSyncSession(posId) {
        if (SyncService.getNeedSyncSession() === '1') {
            return '1';
        }

        let posIdLocaStorage = PosService.getOldPosId();
        if (posId) {
            if (Number(posId) === Number(posIdLocaStorage)) {
                return '0';
            }
        }
        return '1';
    }

    /**
     * sort array by alphabet
     * @param array
     * @param fieldSort
     * @return {*}
     */
    sortByAlphabet(array, fieldSort) {
        if (array && array.length > 0) {
            let result = [...array];
            if (fieldSort) {
                result = result.sort(function (a, b) {
                    if (typeof a.status !== 'undefined') {
                        if (a.status < b.status) return -1;
                        if (a.status > b.status) return 1;

                    }
                    if (a[fieldSort] < b[fieldSort]) return -1;
                    if (a[fieldSort] > b[fieldSort]) return 1;
                    return 0;
                });
            }
            return result;
        }
        return [];
    }

    /**
     * handle event click logout
     * note: not remove staff_id in local storage
     */
    handleLogout() {
        this.props.logout();
    }

    /**
     * template render
     * @returns {*}
     */
    template() {
        let {changedValue, pos} = this.state;
        let {locations, loading} = this.props;

        /* sort location by alphabet */
        locations = this.sortByAlphabet(locations, "name");

        /* sort pos by alphabet*/
       if (pos && pos.length > 0) {
           pos = this.sortByAlphabet(pos, "pos_name");
           let enablePos = pos.filter(item => !item.staff_id);
           let posCurrentStaff = pos.filter(item =>(item.staff_id > 0 && item.staff_id.toString() === UserService.getStaffId()));
           let posOtherStaff = pos.filter(item=>(item.staff_id > 0 && item.staff_id.toString() !== UserService.getStaffId()));
           pos = [...posCurrentStaff,...enablePos,...posOtherStaff];
       }

        locations.map(item => {
            item.value = item.location_id;
            item.label = item.name;
            return item;
        });

        pos.map(item => {
            item.value = item.pos_id;
            item.label = item.pos_name + (item.staff_id ? ' (' + item.staff_name + ')' : '');
            if(item.staff_id > 0 && item.staff_id.toString() !== UserService.getStaffId()) {
                item.disabled = !!item.staff_id;
            }
            return item;
        });

        return (
            <div id="selection_location_pos" className="selection_location_pos">
                <div className="wrapper-login">
                    <div className="form-login">
                        <strong className="logo">
                            <a href=""><img src={this.props.logoUrl} alt="logo"/></a>
                        </strong>
                        <div className="form-group">
                            <Select
                                placeholder={this.props.t("Choose a Location")}
                                value={this.state.selectedLocation}
                                onChange={this.handleChangeLocation}
                                options={locations}
                                clearable={false}
                                searchable={false}
                                noResultsText={''}/>
                        </div>
                        <div className="form-group">
                            <Select
                                placeholder={this.props.t("Choose a POS")}
                                value={this.state.selectedPos}
                                onChange={this.handleChangePos}
                                options={pos}
                                clearable={false}
                                searchable={false}
                                noResultsText={''}/>
                        </div>
                        <div className="form-group text-center">
                            <button type="button"
                                    className={'btn btn-default' + ((changedValue && !loading) ? '' : ' disabled')}
                                    disabled={!changedValue}
                                    onClick={this.handleEnterPos}>
                                {this.props.t('Enter To Pos')}
                            </button>
                            <div className="btn-link-logout"
                               onClick={this.handleLogout}>
                                <span>{this.props.t('Logout')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class SelectLocationPosContainer extends CoreContainer {
    static className = 'SelectLocationPosContainer';

    /**
     * map state to props
     * @param state
     * @returns {{error, handleAssignPos, locations: Array, loading, logoUrl: *}}
     */
    static mapState(state) {
        const {error, assignPos, loading} = state.core && state.core.user;
        const {success} = state.core.logout;
        let locations = [];
        let locationsString = LocationService.getLocationsInLocalStorage();
        if (locationsString && locationsString !== "") {
            locations = JSON.parse(locationsString);
            locations = locations.filter(location => location.pos);
        }
        let logoUrl = UserService.getLocalLogo();
        return {
            error,
            assignPos,
            locations,
            loading,
            logoUrl,
            success
        }
    }

    /**
     * map dispatch to props
     * @param dispatch
     * @returns {{userAssignPos: function(*=, *=, *=): *}}
     */
    static mapDispatch(dispatch) {
        return {
            userAssignPos: (posId, locationId, currentStaffId) =>
                dispatch(LocationAction.assignPos(posId, locationId, currentStaffId)),
            logout: () => dispatch(LogoutPopupAction.clickLogOut()),
            reInit: () => dispatch(LogoutPopupAction.reInit())
        };
    }
}

export default ContainerFactory.get(SelectLocationPosContainer).getConnect(
    ComponentFactory.get(SelectLocationPos));

