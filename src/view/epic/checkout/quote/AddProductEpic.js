import QuoteConstant from '../../../constant/checkout/QuoteConstant';
import QuoteService from '../../../../service/checkout/QuoteService';
import QuoteAction from '../../../action/checkout/QuoteAction';
import MultiCheckoutAction from "../../../action/MultiCheckoutAction";
import MultiCartService from "../../../../service/MultiCartService";
import AppStore from "../../../../view/store/store";

/**
 *
 * @param action$
 * @param store
 * @return {Observable<any>}
 */
export default function getListProduct(action$, store) {
    return action$.ofType(QuoteConstant.ADD_PRODUCT)
        .mergeMap(async action => {


                try {
                    let response =
                        await QuoteService.addProduct(store.getState().core.checkout.quote, action.data).toPromise();
                    if (!response.success) {
                        return {
                            type: '',
                            quote: response
                        }
                    }

                    /** auto create cart if empty */
                    const {activeCart} = store.getState().core.multiCheckout;
                    if (!activeCart) {
                        await QuoteAction.setQuote(response.quote);
                        let newCartId = await MultiCartService.addCartFromStore(store);
                        return MultiCheckoutAction.getListCart(newCartId);
                    }
                    AppStore.dispatch(QuoteAction.addedItemIdInQuote(response.added_item_id));
                    return QuoteAction.setQuote(response.quote);
                } catch (e) {
                    return {
                        type: '',
                        quote: store.getState().core.checkout.quote
                    }
                }


            }
        );
}
