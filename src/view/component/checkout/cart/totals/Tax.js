import React, {Fragment} from 'react';
import CoreComponent from "../../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../../framework/container/CoreContainer";
import CurrencyHelper from "../../../../../helper/CurrencyHelper";
import {OverlayTrigger, Popover} from "react-bootstrap";
import TaxHelper from "../../../../../helper/TaxHelper";

export class CartTotalsTaxComponent extends CoreComponent {
    static className = 'CartTotalsTaxComponent';

    /**
     * Get tax list
     *
     * @return {{}}
     */
    getListTax() {
        let quote = this.props.quote;
        if (!quote) {
            return {};
        }
        let listTax = {};
        let addresses = quote.addresses;
        if (addresses && addresses.length) {
            addresses.forEach(address => {
                let appliedTaxes = address.applied_taxes
                if (appliedTaxes) {
                    let keys = Object.keys(appliedTaxes);
                    if (keys && keys.length) {
                        keys.forEach(key => {
                            if (appliedTaxes[key].rates && appliedTaxes[key].rates.length) {
                                appliedTaxes[key].rates.forEach(rate => {
                                    if (!listTax[rate.code]) {
                                        listTax[rate.code] = rate;
                                    }
                                });
                            }
                        })
                    }
                }
            });
        }
        return listTax;
    }

    /**
     * Render tax total
     *
     * @return {*}
     */
    template() {
        let displayFullTaxSummary = TaxHelper.displayFullTaxSummary();
        let displayValue = CurrencyHelper.format(Math.abs(this.props.total.value));
        let listTax = this.getListTax();
        let popOver = "";
        if (displayFullTaxSummary) {
            popOver = (
                <Popover id="tax popover">
                    <div className="popup-totals-tax">
                        <div className="tax-title">{this.props.t('Tax')} ({displayValue})</div>
                        <div className="tax-content">
                            <div className="img-tax"/>
                            <ul className="list-tax">
                                {
                                    Object.keys(listTax).map(code => {
                                        return <li key={code}>
                                            <span className="mark">{listTax[code].code}</span>
                                            <span className="amount">{listTax[code].percent}%</span>
                                        </li>;
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                </Popover>
            );
        }

        return (
            <Fragment key={this.props.total.code}>
                <OverlayTrigger trigger={displayFullTaxSummary ? "click" : null}
                                rootClose placement="right"
                                overlay={popOver}
                                onClick={() => displayFullTaxSummary ? this.props.showBackDrop() : false}
                >
                    <li className={"totals-tax" + (displayFullTaxSummary ? " totals-action" : "")}>
                        <span className="mark">{this.props.total.title}</span>
                        <span className="amount">{displayValue}</span>
                    </li>
                </OverlayTrigger>
            </Fragment>
        )
    }
}

export class CartTotalsTaxContainer extends CoreContainer {
    static className = 'CartTotalsTaxContainer';
}

/**
 *
 * @type {CartTotalsTaxContainer}
 */
const container = ContainerFactory.get(CartTotalsTaxContainer);
export default container.getConnect(ComponentFactory.get(CartTotalsTaxComponent));