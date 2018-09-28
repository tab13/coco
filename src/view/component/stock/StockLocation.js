import React, {Fragment} from "react";
import CoreComponent from '../../../framework/component/CoreComponent';
import ComponentFactory from '../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../framework/container/CoreContainer';
import ContainerFactory from "../../../framework/factory/ContainerFactory";

export class StockLocation extends CoreComponent {

    /**
     * Render template
     *
     * @return {*}
     */
    template() {
        let {stock_location} = this.props;
        return (
            <Fragment>
                <li className={stock_location.is_current_location === "1" ? "active" : ""}>
                    <div className="info">
                        <div className="name">{stock_location.name}</div>
                        <div className="detail">
                            {stock_location.address}
                        </div>
                        <div className={stock_location.is_in_stock === "1" ? "qty" : "qty not-available"}>
                            {stock_location.qty}
                        </div>
                    </div>
                </li>
            </Fragment>
        )
    }
}

class StockLocationContainer extends CoreContainer {
    static className = 'StockLocationContainer';
}

export default ContainerFactory.get(StockLocationContainer).withRouter(
    ComponentFactory.get(StockLocation)
);