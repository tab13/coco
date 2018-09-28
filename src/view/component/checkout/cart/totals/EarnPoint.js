import React from 'react';
import CoreComponent from "../../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../../framework/container/CoreContainer";
import {RewardPointHelper} from "../../../../../helper/RewardPointHelper";

export class EarnPointComponent extends CoreComponent {
    static className = 'EarnPointComponent';
    /**
     * Render earn point total
     *
     * @return {*}
     */
    template() {
        const { value } = this.props.total;
        return (
            <li className={"totals-tax"}>
                <span className="mark">{this.props.total.title}</span>
                <span className="amount">{ this.props.t("{{point}} {{pointName}}", {
                    point: value,
                    pointName: value > 1 ? RewardPointHelper.getPluralOfPointName() : RewardPointHelper.getPointName()
                })}</span>
            </li>
        )
    }
}

export class EarnPointContainer extends CoreContainer {
    static className = 'EarnPointContainer';
}

/**
 *
 * @type {EarnPointContainer}
 */
const container = ContainerFactory.get(EarnPointContainer);
export default container.getConnect(ComponentFactory.get(EarnPointComponent));