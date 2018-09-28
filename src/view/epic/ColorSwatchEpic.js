import ColorSwatchAction from "../action/ColorSwatchAction";
import LoadingAction from "../action/LoadingAction";
import {Observable} from 'rxjs';
import ColorSwatchService from "../../service/config/ColorSwatchService";
import SyncService from "../../service/sync/SyncService";
import ColorSwatchConstant from "../constant/ColorSwatchConstant";

/**
 * Receive action type(GET_CONFIG) and request, response data config
 * @param action$
 */
export default action$ => action$.ofType(ColorSwatchConstant.GET_COLOR_SWATCH)
    .mergeMap(() => Observable.from(SyncService.getColorSwatch())
        .mergeMap((response) => {
            ColorSwatchService.saveToLocalStorage(response.items);
            return [
                LoadingAction.increaseCount(),
                ColorSwatchAction.getColorSwatchResult(response.items)
            ];
        }).catch(error => {
            return Observable.of(ColorSwatchAction.getColorSwatchError(error));
        })
    );
