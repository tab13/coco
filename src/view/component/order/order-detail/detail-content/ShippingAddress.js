import React from "react";
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import CoreComponent from "../../../../../framework/component/CoreComponent";
import AddressConstant from "../../../../constant/checkout/quote/AddressConstant";
import OrderService from "../../../../../service/sales/OrderService";

export class ShippingAddress extends CoreComponent {
    static className = 'ShippingAddress';

    /**
     * template
     * @returns {*}
     */
    template() {
        let {order} = this.props;
        let address = order.addresses.find(item => item.address_type === AddressConstant.SHIPPING_ADDRESS_TYPE);
        if (!address) {
            return null;
        }
        return (
            <ul className="shipping-address">
                <li>
                    <div className="title">{address.firstname + " " + address.lastname}</div>
                </li>
                <li>
                    <div className="title">{OrderService.getFullAddress(address)}</div>
                </li>
            </ul>
        );
    }
}

class ShippingAddressContainer extends CoreContainer {
    static className = 'ShippingAddressContainer';
}

/**
 * @type {ShippingAddress}
 */
export default ContainerFactory.get(ShippingAddressContainer).withRouter(
    ComponentFactory.get(ShippingAddress)
);