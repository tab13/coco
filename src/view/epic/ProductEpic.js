import SearchProductEpic from './product/SearchProductEpic';
import GetListProductEpic from './product/GetListProductEpic';
import SearchProductByBarcodeEpic from './product/SearchProductByBarcodeEpic';
import {combineEpics} from 'redux-observable';
import EpicFactory from "../../framework/factory/EpicFactory";

/**
 * Combine all product epic
 * @type {Epic<Action, any, any, T> | any}
 */
const productEpic = combineEpics(
    EpicFactory.get(GetListProductEpic),
    EpicFactory.get(SearchProductEpic),
    EpicFactory.get(SearchProductByBarcodeEpic),
);

export default productEpic;


