import {combineEpics} from 'redux-observable';
import EpicFactory from "../../../framework/factory/EpicFactory";
import AddProductEpic from "./quote/AddProductEpic";
import RemoveCartItemEpic from "./quote/RemoveCartItemEpic";
import UpdateQtyCartItemEpic from "./quote/UpdateQtyCartItemEpic";
import UpdateCustomPriceCartItemEpic from "./quote/UpdateCustomPriceCartItemEpic";
import ChangeCustomerEpic from "./quote/ChangeCustomerEpic";
import SaveCustomerAfterEpic from "./quote/SaveCustomerAfterEpic";
import CreateCustomerAfterEpic from "./quote/CreateCustomerAfterEpic";
import RemoveCouponCodeEpic from "./quote/RemoveCouponCodeEpic";
import ValidateQuoteSalesRuleEpic from "./quote/ValidateQuoteSalesRuleEpic";
import ResetQuoteEpic from "./quote/ResetQuoteEpic";
import CheckoutToCatalogEpic from "./quote/CheckoutToCatalogEpic";

/**
 * Combine all product epic
 * @type {Epic<Action, any, any, T> | any}
 */
const quoteEpic = combineEpics(
    EpicFactory.get(AddProductEpic),
    EpicFactory.get(RemoveCartItemEpic),
    EpicFactory.get(UpdateQtyCartItemEpic),
    EpicFactory.get(UpdateCustomPriceCartItemEpic),
    EpicFactory.get(ChangeCustomerEpic),
    EpicFactory.get(SaveCustomerAfterEpic),
    EpicFactory.get(CreateCustomerAfterEpic),
    EpicFactory.get(RemoveCouponCodeEpic),
    EpicFactory.get(ValidateQuoteSalesRuleEpic),
    EpicFactory.get(ResetQuoteEpic),
    EpicFactory.get(CheckoutToCatalogEpic),
);

export default quoteEpic;


