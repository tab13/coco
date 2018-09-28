import ShippingConstant from "../../constant/ShippingConstant";

const initialState = {
    shipping_methods: []
};

/**
 * Receive action from Shipping Action
 * @param state
 * @param action
 * @returns {*}
 */
const shippingReducer =  function (state = initialState, action) {
    switch (action.type) {
        case ShippingConstant.GET_LIST_SHIPPING_RESULT:
            const {shipping_methods} = action;
            return {...state, shipping_methods: shipping_methods};
        default:
            return state;
    }
};

export default shippingReducer;