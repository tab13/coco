import constant from '../constant/MultiCheckoutConstant';
import LogoutPopupConstant from '../constant/LogoutPopupConstant';
import _ from 'lodash';

const initialState = {
    carts: [],
    activeCart: false
};

/**
 * receive action from Multiple Checkout Action
 *
 * @param state
 * @param action
 * @return {{carts: Array, activeCart: boolean}}
 */
export default (state = initialState, action) => {
    switch (action.type) {
        case constant.GOT_LIST_CART:
            return {...state, carts: action.carts };
        case constant.ADDED_CART:
            return {...state, carts: state.carts.concat([action.cart])};
        case constant.SELECTED_CART:
            return {...state, activeCart: action.cart};
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return {...state, ...initialState};
        case constant.DELETED_CART:
            return {...state,
                activeCart: false,
                carts: _.remove(state.carts, cart => (_.isEqual(cart, action.cart)))
            };
        default:
            return state
    }
}
