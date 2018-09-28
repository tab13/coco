import CoreService from "./CoreService";
import ServiceFactory from "../framework/factory/ServiceFactory";
import MultiCartResourceModel from "../resource-model/MultiCartResourceModel";
import PosService from "./PosService";


export let count = 0;

export class MultiCartService extends CoreService {
    static className = 'MultiCartService';
    resourceModel = MultiCartResourceModel;

    /**
     * Call MultiCartResourceModel save to indexedDb
     *
     * @param data
     * @returns {Promise|*|void}
     */
    saveToDb(data) {
        return this.getResourceModel().saveToDb(data);
    }


    /**
     * Call MultiCartResourceModel search by cashier Id
     * @param posId
     * @return {Promise<*>}
     */
    async searchByPosId(posId) {
        let resourceModel = new MultiCartResourceModel();
        let list = await resourceModel.searchByPosId(posId);
        count = list.length ? list[0].count : 0;
        return list;
    }

    /**
     * Call MultiCartResourceModel search by cashier Id
     * @return {Promise<*>}
     */
    async searchByCurrentPos() {
        return this.searchByPosId(PosService.getCurrentPosId());
    }

    /**
     * Call MultiCartResourceModel add cart
     * @param cart
     * @returns {*|{type: string, code: *}}
     */
    add(cart) {
        cart = {...cart, payments: [], valid_salesrule: null, coupon_code: null, count: ++count};
        let resourceModel = new MultiCartResourceModel();
        return resourceModel.add(cart);
    }

    /**
     * add new cart from Store
     * @param store
     */
    addCartFromStore(store) {
        let quote = store.getState().core.checkout.quote;
        let newCart = {
            pos_id: PosService.getCurrentPosId(),
            ...quote,
            payments: [],
            valid_salesrule: [],
        };
        return this.add(newCart);
    }

    /**
     * add new cart from Store
     * @param quote
     */
    addCartByQuote(quote) {
        let newCart = {
            pos_id: PosService.getCurrentPosId(),
            ...quote,
            payments: [],
            valid_salesrule: [],
        };
        return this.add(newCart);
    }

    /**
     * reset count and add new cart from Store
     * @param store
     */
    resetCountAndAddCartFromStore(store) {
        count = 0;
        return this.addCartFromStore(store);
    }

    /**
     * Call MultiCartResourceModel update cart
     * @param cart
     * @returns {*|{type: string, code: *}}
     */
    update(cart) {
        let resourceModel = new MultiCartResourceModel();
        return resourceModel.update(cart);
    }

    /**
     * Call MultiCartResourceModel update cart
     * @param store
     * @return {*|{type: string, code: *}}
     */
    updateActiveCartFromStore(store) {
        let quote = store.getState().core.checkout.quote;
        let neededUpdateCart = { ...quote, payments: [], valid_salesrule: [] };
        let resourceModel = new MultiCartResourceModel();
        return resourceModel.update(neededUpdateCart);
    }

    /**
     * Call MultiCartResourceModel delete cart
     * @param cart
     * @returns {*|{type: string, code: *}}
     */
    delete(cart) {
        let resourceModel = new MultiCartResourceModel();
        return resourceModel.delete(cart);
    }
}

/** @type MultiCartService */
let multiCartService = ServiceFactory.get(MultiCartService);

export default multiCartService;