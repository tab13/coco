import React from 'react';
import CoreComponent from "../../../framework/component/CoreComponent";
import ComponentFactory from "../../../framework/factory/ComponentFactory";
import RemoveCart from "./left-action/RemoveCart";
import CoreContainer from "../../../framework/container/CoreContainer";
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import MultiCheckout from "./MultiCheckout";
import '../../style/css/CartLeftAction.css';

export class LeftActionComponent extends CoreComponent {
    static className = 'LeftActionComponent';
    template() {
        return (
            <div className="wrapper-action-left">
                <RemoveCart/>
                <MultiCheckout/>
            </div>
        );
    }
}

/**
 *
 * @type {CartComponent}
 */
const component = ComponentFactory.get(LeftActionComponent);

export class LeftActionContainer extends CoreContainer{
    static className = 'LeftActionContainer';
}

/**
 *
 * @type {LeftActionContainer}
 */
const container = ContainerFactory.get(LeftActionContainer);
export default container.getConnect(component)