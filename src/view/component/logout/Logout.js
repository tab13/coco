import React from 'react'
import {Modal} from 'react-bootstrap'
import CoreComponent from "../../../framework/component/CoreComponent";
import ComponentFactory from "../../../framework/factory/ComponentFactory";
import CoreContainer from "../../../framework/container/CoreContainer";
import {bindActionCreators} from "redux";
import MenuAction from "../../action/MenuAction";
import LogoutPopupAction from "../../action/LogoutPopupAction";
import ContainerFactory from "../../../framework/factory/ContainerFactory";

export class LogoutComponent extends CoreComponent {
    static className = 'LogoutComponent';

    /**
     *  if request logout is done ,reload page
     *  if request logout has error ,show error alert
     *
     */
    componentDidUpdate() {
        if ( Object.keys(this.props.success).length) {
            this.props.actions.reInit();
            return this.props.history.push({
                pathname: '/login'
            });

        }
    }

    clickBackDropErrorAlert() {
        this.props.actions.afterErrorAlertDismiss();
    }
    /**
     *  component render DOM express
     *
     * @return {*}
     */
    template() {
        return (
            <div>
                <Modal
                    bsSize={"small"}
                    className={"popup-messages"}
                    show={this.props.isOpen && !Object.keys(this.props.error).length }
                    onHide={ () => this.props.actions.clickBackDrop() }>
                    <Modal.Body>
                        <h3 className="title">{ this.props.t('Logout') }</h3>
                        <p> { this.props.t('Are you sure want to logout') }?</p>
                    </Modal.Body>
                    <Modal.Footer className={"logout-actions"}>
                        <a onClick={ () => this.props.actions.clickBackDrop() }> { this.props.t('No') } </a>
                        <a onClick={ () => this.props.actions.clickLogOut() }> { this.props.t('Yes') } </a>
                    </Modal.Footer>
                </Modal>
                <Modal
                    bsSize={"small"}
                    className={"popup-messages"}
                    show={ !!Object.keys(this.props.error).length }
                    onHide={ () => this.clickBackDropErrorAlert() }>
                    <Modal.Body>
                        <h3 className="title">{ this.props.t(this.props.error.type) }</h3>
                        <p> { this.props.t(this.props.error.message) }</p>
                    </Modal.Body>
                    <Modal.Footer className={"logout-actions"}>
                        <a
                            onClick={ () => this.clickBackDropErrorAlert() }>
                            { this.props.t('Cancel') }
                            </a>
                        <a onClick={ () => this.props.actions.clickLogOut() }> { this.props.t('Logout') } </a>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

/**
 * @type {LogoutComponent}
 */
const component = ComponentFactory.get(LogoutComponent);

class LogoutContainer extends CoreContainer {
    static className = 'LogoutContainer';

    /**
     * map state to props of component
     *
     * @param state
     * @return {{isOpen: UserResourceModel.logout.isOpen|OmcUser.logout.isOpen|UserService.logout.isOpen|*|i.isOpen, isRequesting: UserResourceModel.logout.isRequesting|OmcUser.logout.isRequesting|UserService.logout.isRequesting|*|i.isRequesting, success: UserResourceModel.logout.success|OmcUser.logout.success|UserService.logout.success|*|i.success, error: UserResourceModel.logout.error|OmcUser.logout.error|UserService.logout.error|*|i.error}}
     */
    static mapState(state) {
        const  { isOpen, isRequesting, success, error } = state.core.logout;
        return {
            isOpen,
            isRequesting,
            success,
            error
        }
    }

    /**
     * map dispatch to props of component
     *
     * @param dispatch
     * @return {{actions: {clickBackDrop: function(), clickLogOut: function(), finishLogoutRequesting: function(*), logoutRequestingError: function(*)}|ActionCreator<any>|ActionCreatorsMapObject}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: bindActionCreators( { ...LogoutPopupAction, ...MenuAction }, dispatch)
        }

    }
}

/**
 *
 * @type {LogoutContainer}
 */
const container = ContainerFactory.get(LogoutContainer);
export default container.withRouter(component)