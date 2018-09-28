import MultiCheckoutConstant from '../constant/MultiCheckoutConstant';

export default {
    /**
     *
     * @param activeCartId
     * @param isActiveLatest
     * @return {*}
     */
    getListCart: (activeCartId, isActiveLatest) => {
        isActiveLatest = isActiveLatest || false;
        return {
            activeCartId,
            isActiveLatest,
            type: MultiCheckoutConstant.GET_LIST_CART,
        }
    },

    /**
     * action add cart
     * @returns {{type: string, cart: *}}
     */
    addCart: () => {
        return {
            type: MultiCheckoutConstant.ADD_CART,
        }
    },

    /**
     * action select cart
     * @param cart
     * @returns {{type: string, cart: *}}
     */
    selectCart: (cart) => {
        return {
            type: MultiCheckoutConstant.SELECT_CART,
            cart
        }
    },

    /**
     * action delete cart
     * @param cart
     * @returns {{type: string, cart: *}}
     */
    deleteCart: (cart) => {
        return {
            type: MultiCheckoutConstant.DELETE_CART,
            cart
        }
    },
    /**
     * action get carts in indexed db
     * @param carts
     * @returns {{type: string, carts: *}}
     */
    getListCartResult: (carts) => {
        return {
            type: MultiCheckoutConstant.GOT_LIST_CART,
            carts
        }
    },

    /**
     * action add cart into indexed db
     * @param cart
     * @returns {{type: string, cart: *}}
     */
    addCartResult: (cart) => {
        return {
            type: MultiCheckoutConstant.ADDED_CART,
            cart
        }
    },

    /**
     * action delete cart in indexed db
     * @param cart
     * @returns {{type: string, cart: *}}
     */
    deleteCartResult: (cart) => {
        return {
            type: MultiCheckoutConstant.DELETED_CART,
            cart
        }
    },

    /**
     * action after select cart from epic
     * @param cart
     * @returns {{type: string, cart: *}}
     */
    selectCartResult: (cart) => {
        return {
            type: MultiCheckoutConstant.SELECTED_CART,
            cart
        }
    },

    /**
     * action update cart
     * @param cart
     * @param callback
     * @returns {{type: string, cart: *}}
     */
    updateCart: (cart, callback) => {
        callback = callback || function () {};
        return {
            type: MultiCheckoutConstant.UPDATE_CART,
            cart,
            callback
        }
    },

    /**
     * action after updated cart
     * @param cart
     * @returns {{type: string, cart: *}}
     */
    updateCartResult: (cart) => {
        return {
            type: MultiCheckoutConstant.UPDATED_CART,
            cart
        }
    },
}
