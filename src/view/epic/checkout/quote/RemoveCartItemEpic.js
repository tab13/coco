import QuoteConstant from '../../../constant/checkout/QuoteConstant';
import QuoteService from '../../../../service/checkout/QuoteService';
import QuoteAction from '../../../action/checkout/QuoteAction';
import MultiCheckoutAction from "../../../action/MultiCheckoutAction";
import MultiCartService from "../../../../service/MultiCartService";

export default function RemoveCartItemEpic(action$, store) {
    return action$.ofType(QuoteConstant.REMOVE_CART_ITEM)
        .mergeMap(async action => {
            try {
                let response =
                    await QuoteService.removeItem(store.getState().core.checkout.quote, action.item).toPromise();
                if (response.success) {
                    const {activeCart} = store.getState().core.multiCheckout;
                    if (!activeCart) {
                        return QuoteAction.setQuote(response.quote);
                    }
                    /** update active cart */
                    await MultiCartService.updateActiveCartFromStore(store);
                    return MultiCheckoutAction.selectCart(response.quote);
                } else {
                    return {
                        type: '',
                        quote: response
                    }
                }
            } catch (e) {
                return {
                    type: '',
                    quote: e
                }
            }
        });
}


