import {combineEpics} from 'redux-observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import extensionEpic from '../../extension/epics';
import configEpic from './ConfigEpic';
import categoryEpic from './CategoryEpic';
import productEpic from './ProductEpic';
import customerEpic from './CustomerEpic';
import syncEpic from './SyncEpic';
import userEpic from "./UserEpic";
import locationEpic from "./LocationEpic";
import LogoutPopupEpic from "./LogoutPopupEpic";
import exportDataPopupEpic from "./ExportDataPopupEpic";
import loadingEpic from "./LoadingEpic";
import menuEpic from "./MenuEpic";
import paymentEpic from "./PaymentEpic";
import shippingEpic from "./ShippingEpic";
import checkoutEpic from "./CheckoutEpic";
import colorSwatchEpic from "./ColorSwatchEpic";
import signoutEpic from "./SignoutEpic";
import stockEpic from "./StockEpic";
import observerEpic from "./ObserverEpic";
import orderEpic from "./OrderEpic";
import taxEpic from "./TaxEpic";
import multiCheckoutEpic from "./MultiCheckoutEpic";
import onHoldOrderEpic from "./OnHoldOrderEpic";
import sessionEpic from "./SessionEpic";
import staffDiscountEpic from "./staff-discount/StaffDiscountEpic";

export default () => {
    const epic$ = new BehaviorSubject(combineEpics(
        userEpic,
        locationEpic,
        configEpic,
        categoryEpic,
        productEpic,
        customerEpic,
        syncEpic,
        LogoutPopupEpic,
        exportDataPopupEpic,
        loadingEpic,
        menuEpic,
        paymentEpic,
        shippingEpic,
        checkoutEpic,
        colorSwatchEpic,
        signoutEpic,
        stockEpic,
        observerEpic,
        orderEpic,
        taxEpic,
        multiCheckoutEpic,
        onHoldOrderEpic,
        sessionEpic,
        staffDiscountEpic
    ));

    const rootEpic = (action$, store) =>
        epic$.mergeMap(epic =>
            epic(action$, store)
        );

    extensionEpic.loadExtensionEpic(epic$);
    return rootEpic
}
