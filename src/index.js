import React from 'react';
import './view/style/css/bootstrap.min.css'
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {HashRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import AppStore from './view/store/store';
import Login from './view/component/user/Login';
import Index from './view/Index';
import Loading from './view/component/loading/Loading';
import registerServiceWorker from './registerServiceWorker';
import SelectLocationPos from "./view/component/user/SelectLocationPos";
import App from "./App";
import i18n from './config/i18n';
import { I18nextProvider } from 'react-i18next';
import UserService from "./service/user/UserService";

let isLogin = (pathname) => {
    let session = UserService.getSession();
    if (pathname !== '/login' && !session) {
        return false;
    } else if (pathname !== '/login' && session) {
        return true;
    }
    return true;
}

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            isLogin(props.location.pathname) ? (
                <Component {...props} />
            ) : (
                <Redirect
                    to={{
                        pathname: "/login"
                    }}
                />
            )
        }
    />
);


ReactDOM.render(
    <I18nextProvider i18n={ i18n }>
    <Provider store={AppStore}>
        <Router>
            <div>
                <PrivateRoute component={App}/>
                <Switch>
                    <PrivateRoute path="/login" exact component={Login}/>
                    <PrivateRoute path="/loading" exact component={Loading}/>
                    <PrivateRoute path="/locations" exact component={SelectLocationPos}/>
                    <PrivateRoute path="/" component={Index}/>
                </Switch>
            </div>
        </Router>
    </Provider>
    </I18nextProvider>,
    document.getElementById('root'));
registerServiceWorker();
