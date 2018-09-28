import React, {Fragment} from 'react';
import ComponentFactory from "../../../framework/factory/ComponentFactory";
import CoreContainer from "../../../framework/container/CoreContainer";
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import {CoreComponent} from "../../../framework/component";
import UserAction from "../../action/UserAction";
import UserService from "../../../service/user/UserService";
import "../../style/css/Login.css"
import Logo from "../../style/images/logo.png"
import {Modal} from 'react-bootstrap'
import i18n from "../../../config/i18n";
import {toast} from "react-toastify";
import SignoutAction from "../../action/SignoutAction";
import SharingAccountPopup from "./SharingAccountPopup";

export class Login extends CoreComponent {
    static className = 'Login';

    /**
     * constructor
     *
     * @param props
     */
    constructor(props) {
        super(props);
        let logoUrl = UserService.getLocalLogo();
        if (!logoUrl) {
            this.props.getLogo();
        }
        let countries = UserService.getLocalCountries();
        if (!countries) {
            this.props.getCountries();
        }
        this.state = {
            active: false,
            loginTitle: this.props.t('login'),
            error: '',
            modalTitle: '',
            modalContent: '',
            logoUrl: logoUrl,
            showSharingPopUp: false
        };
    }

    /**
     * component will mount
     */
    componentWillMount() {
        const session = UserService.getSession();
        const sharingAccount = UserService.getSharingAccount();
        if (session) {
            if(sharingAccount.toString() === '1'){
                return this.props.history.push('/locations');
            }else{
                this.setState({showSharingPopUp : true,
                        loginTitle: this.props.t('login')
                });
            }
        }
    }

    /**
     * component will mount
     */
    componentWillReceiveProps(nextProps) {

        if(this.state.isOpenModal) {
            this.setState({
                isOpenModal: false
            });
        }
        if(this.state.clickedLogin) {
            this.setState({
                clickedLogin: false
            });
        }
        if(!nextProps.user.connection) {
            this.showInternetWarning();
        }
        if (nextProps.user.error) {
            this.showInvalidAccountMessage(nextProps.user.error);
        }
        if(nextProps.user.logoUrl !== undefined) {
            this.setLogoUrl(nextProps.user.logoUrl);
        }
        if(nextProps.signout !== undefined &&
           nextProps.signout.message) {
            this.props.forceSignOutSuccess();
            toast.error(
                i18n.translator.translate(nextProps.signout.message),
                {
                    className: 'wrapper-messages messages-warning',
                    autoClose: 5000
                }
            );
        }

        /* not sharing account && has occupy pos */
        if(nextProps.user.sharing) {
            if (nextProps.user.sharing.sharing_account.toString() !== '1' ) {
                this.setState({
                    showSharingPopUp: true,
                    loginTitle: this.props.t('login')
                });
            }
        }

        if (nextProps.user.after_sharing && nextProps.user.after_sharing === true){
            this.setState({
                showSharingPopUp: false
            });
            this.props.afterContinueLogin(false);
        }
    }

    /**
     * component will update
     *
     * @param nextProps
     */
    componentWillUpdate(nextProps) {
        if (nextProps.user.session) {
            /* not sharing account && has occupy pos */
            if(nextProps.user.sharing.sharing_account.toString() !== '1'){
                return this;
            }
            /* sharing account || (not sharing but occupy pos ) */
            if(this.state.showSharingPopUp === false) {
                return this.props.history.push({
                    pathname: '/locations',
                    state: {}
                });
            }
        }
    }

    /**
     * check active login button
     */
    checkActiveLogin() {
        if (this.refs.username.value && this.refs.password.value) {
            this.setState({active: true});
        } else {
            this.setState({active: false});
        }
    }

    /**
     * reset password after onclick
     */
    resetPassword() {
        if(this.state.resetPassword) {
            this.refs.password.value = '';
            this.setState({active: false});
            this.setState({resetPassword: false});
        }
    }

    /**
     * set state reset password after click to other place
     */
    checkResetPassword() {
        this.setState({resetPassword: true});
    }


    /**
     * focus password field after press enter button from username
     */
    handleUserKeyPress(e) {
        if (e.key === 'Enter') {
            this.refs.password.focus();
        }
    }

    /**
     * login after press enter button
     */
    handlePasswordKeyPress(e) {
        this.refs.password.focus();
        if (e.key === 'Enter' && this.state.active) {
            this.login();
        }
    }

    /**
     * open internet warning popup
     */
    showInternetWarning() {
        let title = this.props.t('Network Error');
        let content = this.props.t('You must connect to a Wi-Fi or cellular data network to access the POS');
        this.setState({
            isOpenModal: true,
            modalTitle: title,
            modalContent: content
        });
    }

    /**
     * open invalid account popup
     * @param message
     */
    showInvalidAccountMessage(message) {
        this.setState({
            loginTitle: this.props.t('login'),
            isOpenModal: true,
            modalTitle: this.props.t('Error'),
            modalContent: message
        });
    }

    /**
     * set logo url
     * @param logoUrl
     */
    setLogoUrl(logoUrl) {
        let url = Logo;
        if(logoUrl) {
            url = logoUrl;
        }
        UserService.saveLocalLogo(url);
        this.setState({
            logoUrl: url
        });
    }

    /**
     * login handle
     */
    login(e) {
        if(this.state.clickedLogin) {
            return;
        }
        if(this.props.user.connection) {
            this.setState({
                loginTitle: this.props.t('please wait') + '...',
                clickedLogin: true
            });
            this.props.clickLogin(this.refs.username.value, this.refs.password.value);
        } else {
            this.showInternetWarning();
        }
    }

    /**
     * confirm modal
     */
    confirm() {
        if(!this.props.user.connection) {
            this.setState({isOpenModal: false});
        } else {
            this.props.closePopup();
        }
    }

    /**
     *
     */
    handleShowSharingPopup(){
       this.setState({
           showSharingPopUp: false,
           loginTitle: this.props.t('login')
       });
    }

    /**
     * render login form
     *
     */
    template() {
        let loginButton;
        if (this.state.active) {
            loginButton = <button type="button"
                                  className="btn btn-default"
                                  ref="loginButton"
                                  onClick={(e) => this.login(e)}>{this.state.loginTitle}</button>
        } else {
            loginButton = <button type="button"
                                  disabled
                                  ref="loginButton"
                                  className="btn btn-default disabled"
                                  onClick={(e) => this.login(e)}>{this.state.loginTitle}</button>
        }
        return (
            <Fragment>

            {
                    this.state.showSharingPopUp ?
                    <SharingAccountPopup sharingPopupBehavious={() => this.handleShowSharingPopup()}/>
                    :
                    null
            }

            <form className="wrapper-login" onSubmit={e => e.preventDefault()}>
                <div className="form-login">
                    <strong className="logo">
                        <a href=""><img src={this.state.logoUrl} alt="logo"/></a>
                    </strong>
                    <h2 className="page-title">Login</h2>
                    <div className="form-group group-username">
                        <label><span> {this.props.t('Username')}</span></label>
                        <input id="username" name="username" type="text"
                               className="form-control" placeholder={this.props.t('Username')}
                               ref="username"
                               onChange={() => this.checkActiveLogin()}
                               onKeyPress={(e) => this.handleUserKeyPress(e)}
                               autoCapitalize="none"
                        />
                    </div>
                    <div className="form-group group-password">
                        <label><span>{this.props.t('Password')}</span></label>
                        <input id="password" name="password" type="password"
                               className="form-control" placeholder={this.props.t('Password')}
                               ref="password"
                               onChange={() => this.checkActiveLogin()}
                               onClick={() => this.resetPassword()}
                               onBlur={() => this.checkResetPassword()}
                               onKeyPress={(e) => this.handlePasswordKeyPress(e)}
                               autoComplete="off"
                        />
                    </div>
                    <div className="form-group">
                        {loginButton}
                    </div>
                </div>
            </form>
            <div>
                <Modal
                    bsSize={"small"}
                    className={"popup-messages"}
                    show={this.state.isOpenModal} onHide={ () => this.confirm() }>
                    <Modal.Body>
                        <h3 className="title">{this.state.modalTitle}</h3>
                        <p>{this.props.t(this.state.modalContent)}</p>
                    </Modal.Body>
                    <Modal.Footer className={"close-modal"}>
                        <button onClick={ () => this.confirm() }>OK</button>
                    </Modal.Footer>
                </Modal>
            </div>
            </Fragment>
        );
    }
}

export class LoginContainer extends CoreContainer {
    static className = 'LoginContainer';
    /**
     * Map states
     *
     * @param state
     * @returns {{user: {connection, error, logoUrl: *|string}}}
     */
    static mapState(state) {
        const {user, signout} = state.core;
        let connection = state.core.internet.connection;
        let error = user.error;
        let logoUrl = user.logoUrl;
        if(!connection) {
            error = '';
        }
        let userProps = {...user, connection: connection, error: error, logoUrl: logoUrl};
        return {user: userProps, signout};
    }

    /**
     * Map actions
     *
     * @param dispatch
     * @returns {{clickLogin: function(*=, *=): *, closePopup: function(): *, getLogo: function(): *, getCountries: function(): *, forceSignOutSuccess: function(): *}}
     */
    static mapDispatch(dispatch) {
        return {
            clickLogin: (username, password) => dispatch(UserAction.clickLogin(username, password)),
            closePopup: () => dispatch(UserAction.closePopup()),
            getLogo: () => dispatch(UserAction.getLogo()),
            getCountries: () => dispatch(UserAction.getCountries()),
            forceSignOutSuccess: () => dispatch(SignoutAction.forceSignOutSuccess()),
            afterContinueLogin : (string) => dispatch(UserAction.afterContinueLogin(string)),
        }
    }
}

export default ContainerFactory.get(LoginContainer).withRouter(
    ComponentFactory.get(Login)
)
