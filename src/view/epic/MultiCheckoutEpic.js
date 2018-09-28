import constant from '../constant/MultiCheckoutConstant';
import QuoteConstant from '../constant/checkout/QuoteConstant';
import OrderConstant from "../constant/OrderConstant";
import MultiCheckoutAction from '../action/MultiCheckoutAction';
import AppStore from '../../view/store/store';
import MultiCartService from "../../service/MultiCartService";
import EpicFactory from "../../framework/factory/EpicFactory";
import {combineEpics} from "redux-observable";
import QuoteService from "../../service/checkout/QuoteService";
import QuoteAction from "../action/checkout/QuoteAction";
import CustomerConstant from "../constant/CustomerConstant";
import PaymentAction from "../action/PaymentAction";

/**
 * get all cart in indexed db
 *
 * @param action$
 * @return {Observable<any>}
 */
export function getListCart(action$) {
    return action$.ofType(constant.GET_LIST_CART)
        .mergeMap( async action => {
            let carts = await MultiCartService.searchByCurrentPos();
            let neededActiveCart = false;

            if (action.activeCartId) {
                neededActiveCart = carts.find(cart => cart.id === action.activeCartId);
            }

            if (action.isActiveLatest) {
                neededActiveCart = carts.length ? carts[0] : false;
            }

            if (neededActiveCart) {
                await AppStore.dispatch(MultiCheckoutAction.getListCartResult(carts));
                return MultiCheckoutAction.selectCart(neededActiveCart);
            }

            return MultiCheckoutAction.getListCartResult(carts)
        });
}


/**
 * save cart in indexed db
 *
 * @param action$
 * @param store
 * @return {Observable<any>}
 */
export function addCart(action$, store) {
    return action$.ofType(constant.ADD_CART)
        .mergeMap( async () => {
            let newCartId = await MultiCartService.addCartFromStore(store);
            return MultiCheckoutAction.getListCart(newCartId);
        });
}

/**
 * delete cart in indexed db
 *
 * @param action$
 * @param store
 * @return {Observable<any>}
 */
export function deleteCart(action$, store) {
    return action$.ofType(QuoteConstant.REMOVE_CART)
        .mergeMap( async () => {
            const { activeCart, carts } = store.getState().core.multiCheckout;
            if (!activeCart) return { type: 'EMPTY'};


            if (carts.length === 1) {
                /** remove active */
                await MultiCartService.delete(activeCart);
                let newCartId = await MultiCartService.resetCountAndAddCartFromStore(store);
                return MultiCheckoutAction.getListCart(newCartId);
            }

            await MultiCartService.delete(activeCart);

            /** delete current cart and set prev cart is active */
            let nextCart = carts.find(cart => {
                return cart.count < activeCart.count;
            });

            /** or latest */
            if (!nextCart) {
                nextCart = carts[0];
            }

            return MultiCheckoutAction.getListCart(nextCart.id)
        });
}

/**
 *
 * @param action$
 * @return {Observable<any>}
 */
export function selectCart(action$) {
    return action$.ofType(constant.SELECT_CART)
        .mergeMap( async action => {
            let quote = QuoteService.collectTotals(action.cart);
            await AppStore.dispatch(QuoteAction.setQuote(quote));

            return MultiCheckoutAction.selectCartResult(quote);
        })
}

/**
 *
 * @param action$
 * @param store
 * @return {Observable<any>}
 */
export function updateCart(action$, store) {
    return action$.ofType(constant.UPDATE_CART)
        .mergeMap( async (action) => {
            /** update active cart */
            await MultiCartService.updateActiveCartFromStore(store);
            return MultiCheckoutAction.updateCartResult(action.cart);
        })
}

/**
 *
 * After user complete checkout for an order an order, this order will disappear in multi-cart bar & new order will have sequence = currently highest sequence + 1
 * Ex:
 * Case 1: Cashier has orders with sequence 5; 6; 7. After complete order 5 => create order 8
 * Case 2: Cashier has 1 order with sequence 5. After complete order 5 => create order 1
 *
 * @param action$
 * @return {Observable<any>}
 */
export function saveCartAfterPlaceOrder(action$, store) {
    return action$.ofType( OrderConstant.PLACE_ORDER_AFTER)
        .mergeMap( async () => {

            const { activeCart, carts } = AppStore.getState().core.multiCheckout;

            /** no active do nothing */
            if (!activeCart) {
                return { type: 'EMPTY'};
            }


            if(carts.length > 1) {
                /** remove active */
                await MultiCartService.delete(activeCart);

                let carts = await MultiCartService.searchByCurrentPos();

                /**
                 *  if latest cart is empty then active it
                 */
                if (!carts[0].items.length) {
                    return MultiCheckoutAction.getListCart(carts[0].id);
                }

                return MultiCheckoutAction.addCart();
            }
            /** remove active */
            await MultiCartService.delete(activeCart);
            let newCartId =  await MultiCartService.resetCountAndAddCartFromStore(store);
            return MultiCheckoutAction.getListCart(newCartId);

        });
}

/**
 * update carts's customer after sync customer
 * @param action$
 * @param store
 * @return {Observable<any>}
 */
export function updateCustomerAfterSync(action$, store) {
    return action$.ofType( CustomerConstant.SYNC_ACTION_UPDATE_DATA_FINISH)
        .mergeMap( async (action) => {

            let { activeCart, carts } = AppStore.getState().core.multiCheckout;

            if(action.items.length) {
                carts.map((cart, index) => {
                    if (cart.customer && cart.customer.id) {
                        let customer = action.items.find(item => item.id === cart.customer.id);
                        if (customer && customer.email) {
                            if (cart.id === activeCart.id) {
                                let quote = store.getState().core.checkout.quote;
                                quote = QuoteService.changeCustomer(quote, customer);
                                carts[index] = QuoteService.collectTotals(quote);
                                AppStore.dispatch(QuoteAction.setQuote(carts[index]));
                                setTimeout(() => AppStore.dispatch(PaymentAction.updatePaymentList(true)), 100);
                            } else {
                                carts[index] = QuoteService.changeCustomer(cart, customer);
                            }
                        }
                    }
                    return cart;
                });
                await MultiCartService.saveToDb(carts);
            }
            return {type: "[Multi Checkout] EMPTY"};
        });
}

/**
 * Combine all epic
 * @type {Epic<Action, any, any, T> | any}
 */
const multiCheckoutEpic = combineEpics(
    EpicFactory.get(getListCart),
    EpicFactory.get(addCart),
    EpicFactory.get(deleteCart),
    EpicFactory.get(selectCart),
    EpicFactory.get(updateCart),
    EpicFactory.get(saveCartAfterPlaceOrder),
    EpicFactory.get(updateCustomerAfterSync),
);

export default multiCheckoutEpic;





