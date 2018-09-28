import React, {Fragment} from 'react';
import {CoreComponent} from "../../../framework/component";
import 'react-select/dist/react-select.css';
import '../../style/css/Location.css';
import CoreContainer from "../../../framework/container/CoreContainer";
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import ComponentFactory from "../../../framework/factory/ComponentFactory";
import LogoutPopupAction from "../../action/LogoutPopupAction";
import '../../style/css/SharingAccount.css';
import UserAction from "../../action/UserAction";
import SmoothScrollbar from "smooth-scrollbar";

class SharingAccountPopup extends CoreComponent {
    static className = 'SharingAccountPopup';


    setBlockContentElement = element => {
        this.block_content = element;
        if (!this.scrollbarOrderDetail) {
            this.scrollbarOrderDetail = SmoothScrollbar.init(this.block_content);
        }
    };

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
    }

    /**
     *  if request logout is done ,reload page
     *  if request logout has error ,show error alert
     *
     */

    /**
     * handle event click logout
     * note: not remove staff_id in local storage
     */
    handleLogout() {
        this.props.logout();
        this.props.sharingPopupBehavious();
    }

    /**
     * continue login
     */
    handleContinueLogin() {
        this.props.continueLogin();
    }

    /**
     * template render
     * @returns {*}
     */
    template() {
        return (
            <Fragment>
                <div className="wrapper-switch-device">
                    <div className="block-title">
                    </div>
                    <div className="block-content" data-scrollbar ref={this.setBlockContentElement}>
                        <div className="img-switchdevice">
                            <p>System has detected that your account is being used onn another device.
                                Do you want to logout of that device and stay on the current one.
                            </p>
                        </div>
                    </div>
                    <div className="block-bottom">
                        <button className="btn btn-cancel"
                                type="button"
                                onClick={() => this.handleLogout()}>
                            {this.props.t('Cancel')}
                        </button>
                        <button className="btn btn-default "
                                type="button"
                                onClick={() => this.handleContinueLogin()}>
                            {this.props.t('Continue To Login')}
                        </button>
                    </div>
                </div>
            </Fragment>
        );
    }
}

class SharingAccountContainer extends CoreContainer {
    static className = 'SharingAccountContainer';

    /**
     * map state to props
     * @param state
     * @returns {{error, handleAssignPos, locations: Array, loading, logoUrl: *}}
     */
    static mapState(state) {
        const {user} = state.core;
        let connection = state.core.internet.connection;
        let error = user.error;
        if(!connection) {
            error = '';
        }
        let userProps = {...user, connection: connection, error: error};
        return {user: userProps};
    }

    /**
     * map dispatch to props
     * @param dispatch
     * @returns {{userAssignPos: function(*=, *=, *=): *}}
     */
    static mapDispatch(dispatch) {
        return {
            logout: () => dispatch(LogoutPopupAction.clickLogOut()),
            continueLogin : () => dispatch(UserAction.continueLogin()),
            reInit: () => dispatch(LogoutPopupAction.reInit()),

        };
    }
}

export default ContainerFactory.get(SharingAccountContainer).getConnect(
    ComponentFactory.get(SharingAccountPopup));

