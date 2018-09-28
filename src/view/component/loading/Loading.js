import React from 'react';
import ComponentFactory from "../../../framework/factory/ComponentFactory";
import CoreContainer from "../../../framework/container/CoreContainer";
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import {CoreComponent} from "../../../framework/component";
import CircularProgressbar from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import '../../style/css/Loading.css';
import LoadingAction from '../../action/LoadingAction';
import ConfigAction from '../../action/ConfigAction';
import SyncAction from '../../action/SyncAction';
import PaymentAction from "../../action/PaymentAction";
import ShippingAction from "../../action/ShippingAction";
import CategoryAction from "../../action/CategoryAction";
import ColorSwatchAction from "../../action/ColorSwatchAction";
import MenuConfig from "../../../config/MenuConfig";
import TaxAction from "../../action/TaxAction";
import OrderAction from "../../action/OrderAction";
import SessionAction from "../../action/SessionAction";
import SessionService from "../../../service/session/SessionService";

export class LoadingComponent extends CoreComponent {
    static className = 'LoadingComponent';

    /**
     * clear data for sync if needed
     * set default data for sync table in indexedDb
     * call load config
     */
    componentWillMount() {
        this.props.actions.clearPaymentData();
        if (this.props.count < this.props.total) {
            this.props.actions.setDefaultSyncDB();
            this.props.actions.clearData();
            this.syncDataLoading();
        }
        this.props.actions.getCurrentSession();
    }

    /**
     * Sync Data in loading page
     */
    syncDataLoading() {
        this.props.actions.getConfig();
        this.props.actions.getColorSwatch();
        this.props.actions.getPaymentOnline();
        this.props.actions.getShippingOnline();
        this.props.actions.getCategory();
        this.props.actions.getListOrderStatuses();
        // this.props.actions.getTaxRate();
        // this.props.actions.getTaxRule();
    }

    /**
     * if complete sync config -> call sync data, redirect to next page and reset state
     * @param nextProps
     */
    componentWillUpdate(nextProps) {
        if (nextProps.count >= nextProps.total) {
            let self = this;
            // redirect to next page
            setTimeout(function () {
                if (SessionService.needDirectSession()) {
                    self.props.history.replace('/session');
                } else {
                    self.props.history.replace(MenuConfig.defaultItem().path);
                }
                self.props.actions.resetState();
                setTimeout(() => self.props.actions.syncData(), 4000);
            }, 1000);
        }
    }

    /**
     * template
     * @returns {*}
     */
    template() {
        let percent = (this.props.count / this.props.total)*100;
        percent = Number(percent.toFixed(0));
        return (
            <div className="wrapper-circular">
                <CircularProgressbar percentage={percent}/>
            </div>
        );
    }
}

export class LoadingContainer extends CoreContainer {
    static className = 'LoadingContainer';

    /**
     * map state to props
     * @param state
     * @returns {{count: *, total: *}}
     */
    static mapState(state) {
        return {
            count: state.core.loading.count,
            total: state.core.loading.total
        }
    }

    /**
     * map dispatch to props
     * @param dispatch
     * @returns {{actions: {
     * clearData: function(): *,
     * resetState: function(): *,
     * getConfig: function(): *,
     * getColorSwatch: function(): *,
     * setDefaultSyncDB: function(): *,
     * syncData: function(): *,
     * getPaymentOnline: function(): *,
     * getShipping: function(): *}|ActionCreator<any>|ActionCreatorsMapObject}}
     * getCategory: function(): *,
     * getTaxRate: function(): *,
     * getTaxRule: function(): *,
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                clearData: () => dispatch(LoadingAction.clearData()),
                resetState: () => dispatch(LoadingAction.resetState()),
                getConfig: () => dispatch(ConfigAction.getConfig()),
                getColorSwatch: () => dispatch(ColorSwatchAction.getColorSwatch()),
                setDefaultSyncDB: () => dispatch(SyncAction.setDefaultSyncDB()),
                syncData: () => dispatch(SyncAction.syncData()),
                getPaymentOnline: () => dispatch(PaymentAction.getPaymentOnline()),
                getShippingOnline: () => dispatch(ShippingAction.getShippingOnline()),
                getCategory: () => dispatch(CategoryAction.getCategoryOnline()),
                getTaxRate: () => dispatch(TaxAction.getTaxRate()),
                getTaxRule: () => dispatch(TaxAction.getTaxRule()),
                clearPaymentData: () => dispatch(PaymentAction.clearData()),
                getListOrderStatuses: () => dispatch(OrderAction.getListOrderStatuses()),
                getCurrentSession: () => dispatch(SessionAction.getCurrentSession()),
            }
        }
    }
}
export default ContainerFactory.get(LoadingContainer).withRouter(
    ComponentFactory.get(LoadingComponent)
)
