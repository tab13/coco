import React, {Component, Fragment} from 'react';
import Menu from './component/menu';
import {Route, Switch} from 'react-router-dom'
import MenuConfig from "../config/MenuConfig";
import ComponentFactory from "../framework/factory/ComponentFactory";
import ContainerFactory from "../framework/factory/ContainerFactory";
import CoreContainer from "../framework/container/CoreContainer";
import i18n from "../config/i18n";
import {toast} from "react-toastify";
import SignoutAction from "./action/SignoutAction";
import PrintContainer from "./component/print/PrintContainer";

class Index extends Component {
    /**
     * Component Will Receive Props
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if(nextProps.signout !== undefined && nextProps.signout.message) {
            this.props.forceSignOutSuccess();
            toast.error(
                i18n.translator.translate(nextProps.signout.message),
                {
                    className: 'wrapper-messages messages-warning',
                    autoClose: 5000
                }
            );
        }
        if(nextProps.signout.page) {
            this.props.history.replace(nextProps.signout.page);
        }
        if (nextProps.redirectToManageSession) {
            this.props.history.replace('/session');
        }
    }

    /**
     * Render root template
     * @returns {*}
     */
    render() {

        const embedeeds =  MenuConfig.getMenuItem().filter(menu => {
            return menu.isEmbedded;
        });

        const singlePages =  MenuConfig.getMenuItem().filter(menu => {
            return !menu.isEmbedded;
        });

        return (
            <Fragment>
                <Menu/>
                {
                    embedeeds.map(item => {
                        let TargetComponent = item.component;
                        return <TargetComponent key={item.id}/>
                    })
                }
                <Switch>
                    {
                        singlePages.map(item => {
                            return <Route key={item.id}
                                          path={item.path} component={item.component}/>
                        })
                    }
                </Switch>
                <PrintContainer/>
            </Fragment>
        )
    }
}
export class IndexContainer extends CoreContainer {

    /**
     * Map states
     *
     * @param state
     * @returns {{user: {connection, error, logoUrl: *|string}}}
     */
    static mapState(state) {
        const {signout} = state.core;
        let {redirectToManageSession} = state.core.session.index;
        return {signout, redirectToManageSession};
    }

    /**
     * Map dispatch to props
     * @param dispatch
     * @returns {{forceSignOutSuccess: function(): *}}
     */
    static mapDispatch(dispatch) {
        return {
            forceSignOutSuccess: () => dispatch(SignoutAction.forceSignOutSuccess())
        };
    }
}

export default ContainerFactory.get(IndexContainer).withRouter(
    ComponentFactory.get(Index)
)