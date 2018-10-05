import { combineReducers } from 'redux'
import menu from './MenuReducer';
import logout from './LogoutPopupReducer';
import exportData from './ExportDataPopupReducer';
import user from './UserReducer';
import product from './ProductReducer';
import category from './CategoryReducer';
import customer from './CustomerReducer';
import loading from './LoadingReducer';
import sync from './SyncReducer';
import config from './ConfigReducer';
import checkout from './CheckoutReducer';
import signout from './SignoutReducer';
import stock from './StockReducer';
import Extension from "../../framework/Extension";
import { reducer as internet } from 'react-redux-internet-connection';
import print from "./PrintReducer";
import order from "./OrderReducer";
import multiCheckout from "./MultiCheckoutReducer";
import onHoldOrder from "./OnHoldOrderReducer";
import session from "./SessionReducer";
import staffDiscount from "./staff-discount/StaffDiscountReducer";

/**
 * Init core reducer
 *
 * @returns {Reducer<any>}
 */
function coreReducer() {
    return combineReducers({
        internet,
        menu,
        logout,
        exportData,
        user,
        product,
        category,
        customer,
        sync,
        loading,
        config,
        checkout,
        print,
        signout,
        stock,
        order,
        multiCheckout,
        onHoldOrder,
        session,
        staffDiscount
    })
}

/**
 * Check extension reducer
 *
 * @returns {*}
 */
function extensionReducer() {
    if ( Extension.ExtensionConfig.reducer && Object.keys(Extension.ExtensionConfig.reducer).length ) {
        return combineReducers({...Extension.ExtensionConfig.reducer})
    }

    return false
}

/**
 * Root reducer
 *
 * @returns {*}
 */
function rootReducer() {
    let extension = extensionReducer();
    if ( !extension) {
        return {
            core: coreReducer(),
        }
    }
    return {
        core: coreReducer(),
        extension: extensionReducer()
    }
}

export default combineReducers(rootReducer())

