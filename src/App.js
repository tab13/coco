import React, {Component, Fragment} from 'react';
import {ToastContainer, toast} from "react-toastify";
import GLOBAL_VARIABLES from "./config/Config";
import {ReactReduxInternetConnection} from 'react-redux-internet-connection';
import { connect } from 'react-redux';
import ConfigAction from "./view/action/ConfigAction";
import ShippingAction from "./view/action/ShippingAction";
import SyncConstant from "./view/constant/SyncConstant";
import UserService from "./service/user/UserService";
import LocationService from "./service/LocationService";
import PosService from "./service/PosService";
import SyncService from "./service/sync/SyncService";
import ActionLogService from "./service/sync/ActionLogService";
import ConfigService from "./service/config/ConfigService";
import ColorSwatchService from "./service/config/ColorSwatchService";
import './view/style/css/LazyLoadImage.css'
import {isMobile} from 'react-device-detect'
import $ from 'jquery';
import MenuConfig from './config/MenuConfig'
import PropTypes from 'prop-types';
import { style } from "react-toastify";
import ZoomInAndOut from "./view/component/lib/toast/ZoomInAndOut";
import './view/style/css/App.css'
import moment from "moment/moment";
import "moment/min/locales";
import OrderService from "./service/sales/OrderService";
import OrderAction from "./view/action/OrderAction";
import SessionService from "./service/session/SessionService";

style({
    zIndex: 10001,
});

class App extends Component {

    /**
     * component will mount
     */
    componentWillMount() {
        ActionLogService.saveIsSyncingActionLog(SyncConstant.NOT_SYNCING_ACTION_LOG);

        const session = UserService.getSession();
        const locationId = LocationService.getCurrentLocationId();
        const locationName = LocationService.getCurrentLocationName();
        const locationAddress = LocationService.getCurrentLocationAddress();
        const posId = PosService.getCurrentPosId();
        const posName = PosService.getCurrentPosName();
        const staffId = UserService.getStaffId();
        const staffName = UserService.getStaffName();
        let mode = SyncService.getMode();
        let config = ConfigService.getConfigFromLocalStorage();
        let countries = UserService.getLocalCountries();
        let swatchConfig = ColorSwatchService.getColorSwatchFromLocalStorage();
        let orderStatus = OrderService.getOrderStatus();
        let currentSession = SessionService.getCurrentSession();
        let closeSession = SessionService.getLocalCloseSession();

        GLOBAL_VARIABLES.firstLoad = true;

        window.addEventListener('online', () => {GLOBAL_VARIABLES.isOnline = true});
        window.addEventListener('offline', () => {GLOBAL_VARIABLES.isOnline = false});

        this.setLocaleForMoment();

        if (!mode) {
            mode = SyncConstant.ONLINE_MODE;
        }
        GLOBAL_VARIABLES.mode = mode;

        if (orderStatus) {
            orderStatus = JSON.parse(orderStatus);
            GLOBAL_VARIABLES.orderStatus = orderStatus;
        }

        if (!session) {
            if (countries) {
                countries = JSON.parse(countries);
                GLOBAL_VARIABLES.countries = countries;
            }
        } else {
            if (config) {
                config = JSON.parse(config);
                GLOBAL_VARIABLES.config = config;
            }
            if (countries) {
                countries = JSON.parse(countries);
                GLOBAL_VARIABLES.countries = countries;
            }
            if (swatchConfig) {
                GLOBAL_VARIABLES.swatch_config = JSON.parse(swatchConfig);
            }
            GLOBAL_VARIABLES.session = session;
            // Update Config
            this.props.getConfig();
            this.props.getListShipping();
            this.props.getListOrderStatuses();
            if (!locationId || !posId) {
                let sharingAccount = UserService.getSharingAccount();
                if(sharingAccount.toString() === '1'){
                    return this.props.history.replace('/locations');
                }
            } else {
                GLOBAL_VARIABLES.location_id = locationId;
                GLOBAL_VARIABLES.location_name = locationName;
                GLOBAL_VARIABLES.location_address = locationAddress;
                GLOBAL_VARIABLES.pos_id = posId;
                GLOBAL_VARIABLES.pos_name = posName;
                GLOBAL_VARIABLES.staff_id = staffId;
                GLOBAL_VARIABLES.staff_name = staffName;

                GLOBAL_VARIABLES.current_session = currentSession;
                GLOBAL_VARIABLES.close_session = closeSession;

                /**
                 *
                 *  auto redirect to default route if logged and route is empty
                 *
                 * */
                let { pathname } = this.props.history.location;
                [ '/' , '//'].indexOf(pathname) !== -1
                && this.props.history.replace(MenuConfig.defaultItem().path);
            }
        }
    }

    /**
     * set locale for moment by browser language
     */
    setLocaleForMoment() {
        if (
            moment.locale() !== window.navigator.language.toLowerCase()
        ) {
            moment.locale(window.navigator.language.toLowerCase());
        }
    }

    /**
     * render
     * @returns {*}
     */
    render() {
        if (isMobile) {
            let $body = $('body');
            $body.addClass('body-touch');
            $(document)

                .on('focus', 'textarea,input', function() {
                    $body.addClass('fixfixed');
                })
                .on('blur', 'textarea,input', function() {
                    $body.removeClass('fixfixed');
                });
        }
        const {children} = this.props;
        return (
            <Fragment>
                <div>
                    <ReactReduxInternetConnection/>
                    {children}
                </div>
                <ToastContainer
                    autoClose={2000}
                    closeButton={false}
                    hideProgressBar={true}
                    transition={ZoomInAndOut}
                    position={toast.POSITION.TOP_CENTER}
                />
            </Fragment>
        );
    }
}

App.propTypes = {
    children: PropTypes.array,
    history: PropTypes.object,
};

const mapDispatchToProps = dispatch => ({
    getConfig: () => dispatch(ConfigAction.getConfig()),
    getListShipping: () => dispatch(ShippingAction.getListShipping()),
    getListOrderStatuses: () => dispatch(OrderAction.getListOrderStatuses())
 });

export default connect(null, mapDispatchToProps)(App);
