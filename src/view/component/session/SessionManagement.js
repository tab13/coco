import React, {Fragment} from "react";
import "../../style/css/Session.css";
import CoreComponent from '../../../framework/component/CoreComponent';
import ComponentFactory from '../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../framework/container/CoreContainer';
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import SessionConstant from "../../constant/SessionConstant";
import OpenSessionCashControl from "./open-session/OpenSessionCashControl";
import OpenSession from "./open-session/OpenSession";
import CloseSessionCashControl from "./close-session/CloseSessionCashControl";
import CloseSession from "./close-session/CloseSession";
import ValidateSession from "./close-session/ValidateSession";
import SessionList from "./SessionList";
import SessionDetail from "./SessionDetail";
import SessionService from "../../../service/session/SessionService";
import SessionHelper from "../../../helper/SessionHelper";
import SessionAction from "../../action/SessionAction";

export class SessionManagement extends CoreComponent {
    static className = 'SessionManagement';

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        let isCurrentPopup;
        let isEnableCashControl = SessionHelper.isEnableCashControl();
        if (SessionService.needOpenSession()) {
            isCurrentPopup = isEnableCashControl ?
                SessionConstant.POPUP_OPEN_SESSION_CASH_CONTROL : SessionConstant.POPUP_OPEN_SESSION
        } else {
            isCurrentPopup = SessionConstant.CLOSE_ALL_POPUP;
        }
        this.state = {
            isCurrentPopup: isCurrentPopup
        };

        this.props.actions.redirectToManageSessionSuccess();
    }

    /**
     * componentWillReceiveProps
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.isCloseSession) {
            this.setCurrentSession(nextProps.currentSession);
        }
    }

    /**
     * set current popup
     * @param popup
     */
    setCurrentPopup(popup) {
        this.setState({isCurrentPopup: popup});
    }

    /**
     * set current session
     * @param session
     */
    setCurrentSession(session) {
        this.props.actions.setCurrentSession(session);
    }

    /**
     * template
     * @returns {*}
     */
    template() {
        let {isCurrentPopup} = this.state;
        let {currentSession} = this.props;
        return (
            <Fragment>
                <div className="wrapper-session">
                    <SessionList setCurrentSession={this.setCurrentSession.bind(this)}
                                 currentSession={currentSession}
                                 setCurrentPopup={(popup) => this.setCurrentPopup(popup)}/>
                    
                    <SessionDetail currentSession={currentSession}
                                   setCurrentPopup={(popup) => this.setCurrentPopup(popup)}/>
                </div>
                <div>
                    {
                        isCurrentPopup === SessionConstant.POPUP_OPEN_SESSION_CASH_CONTROL ?
                            <OpenSessionCashControl setCurrentPopup={(popup) => this.setCurrentPopup(popup)}
                            /> : null
                    }
                    {
                        isCurrentPopup === SessionConstant.POPUP_OPEN_SESSION ?
                            <OpenSession setCurrentPopup={(popup) => this.setCurrentPopup(popup)}
                            /> : null
                    }
                    {
                        isCurrentPopup === SessionConstant.POPUP_CLOSE_SESSION_CASH_CONTROL ?
                            <CloseSessionCashControl setCurrentSession={this.setCurrentSession.bind(this)}
                                                     currentSession={currentSession}
                                                     setCurrentPopup={(popup) => this.setCurrentPopup(popup)}
                            /> : null
                    }
                    {
                        isCurrentPopup === SessionConstant.POPUP_CLOSE_SESSION ?
                            <CloseSession setCurrentSession={this.setCurrentSession.bind(this)}
                                          currentSession={currentSession}
                                          setCurrentPopup={(popup) => this.setCurrentPopup(popup)}
                            /> :  null
                    }
                    {
                        isCurrentPopup === SessionConstant.POPUP_VALIDATE_SESSION ?
                            <ValidateSession setCurrentSession={this.setCurrentSession.bind(this)}
                                             setCurrentPopup={(popup) => this.setCurrentPopup(popup)}
                            /> : null
                    }
                </div>
            </Fragment>
        )
    }
}

class SessionManagementContainer extends CoreContainer {
    static className = 'SessionManagementContainer';

    static mapState(state) {
        let {currentSession, isCloseSession} = state.core.session.index;
        return {
            currentSession,
            isCloseSession
        };
    }

    static mapDispatch(dispatch) {
        return {
            actions: {
                redirectToManageSessionSuccess: () => dispatch(SessionAction.redirectToManageSessionSuccess()),
                setCurrentSession: (session) => dispatch(SessionAction.setCurrentSession(session))
            }
        }
    }
}

/**
 * @type {SessionManagement}
 */
export default ContainerFactory.get(SessionManagementContainer).withRouter(
    ComponentFactory.get(SessionManagement)
);