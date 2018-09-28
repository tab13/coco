import React, {Fragment} from 'react';
import CoreComponent from "../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../framework/container/CoreContainer";
import CurrencyHelper from "../../../../helper/CurrencyHelper";

export class ShippingItemComponent extends CoreComponent {
    static className = 'ShippingItemComponent';

    setRadioElement = element => this.radio_element = element;

    /**
     * Component will
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        let {shipping, current_shipping_method_code} = nextProps;
        let isChecked = shipping.code === current_shipping_method_code;
        if (!isChecked) {
            if (this.radio_element && this.radio_element.checked) {
                this.radio_element.checked = false;
            }
        }
    }

    template() {
        let {shipping, selectShippingMethod, current_shipping_method_code} = this.props;
        let isDefaultCheck = shipping.code === current_shipping_method_code;
        return (
            <Fragment>
                <li>
                    <label>
                        <input ref={this.setRadioElement}
                               defaultChecked={isDefaultCheck}
                               type="radio"
                               name="radio1"
                               onClick={() => selectShippingMethod(shipping)}/>
                        <span>
                                <span className="title">{shipping.title}</span>
                                <span className="value">
                                    {CurrencyHelper.convertAndFormat(shipping.display_amount)}
                                </span>
                            </span>
                    </label>
                </li>
            </Fragment>
        )
    }
}

export class ShippingItemContainer extends CoreContainer {
    static className = 'ShippingItemContainer';
}

/**
 *
 * @type {ShippingItemContainer}
 */
const container = ContainerFactory.get(ShippingItemContainer);
export default container.getConnect(ComponentFactory.get(ShippingItemComponent));