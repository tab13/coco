import QuoteConstant from '../../../constant/checkout/QuoteConstant';
import QuoteService from '../../../../service/checkout/QuoteService';
import QuoteAction from '../../../action/checkout/QuoteAction';
import { toast } from 'react-toastify'
import i18n from '../../../../config/i18n'

/**
 *
 * @param action$
 * @param store
 * @return {Observable<any>}
 * @constructor
 */
export default function UpdateCustomPriceCartItemEpic(action$, store) {
    return action$.ofType(QuoteConstant.UPDATE_CUSTOM_PRICE_CART_ITEM)
        .mergeMap(action => {
                return QuoteService.updateCustomPriceCartItem(
                    store.getState().core.checkout.quote, action.item, action.customPrice, action.reason)
                    .map(response => {
                        if (response.success) {
                            return QuoteAction.setQuote(response.quote);
                        } else {
                            toast.error(
                                i18n.translator.translate(response.message),
                                {
                                    className: 'wrapper-messages messages-warning'
                                }
                            );
                          return QuoteAction.updateCustomPriceCartItemFail(response)
                        }
                    });

            }
        );
}


