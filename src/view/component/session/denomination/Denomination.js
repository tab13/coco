import React, {Fragment} from "react";
import NumPad from '../../lib/react-numpad';
import Config from "../../../../config/Config";
import CoreComponent from "../../../../framework/component/CoreComponent";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import ComponentFactory from '../../../../framework/factory/ComponentFactory';
import CurrencyHelper from "../../../../helper/CurrencyHelper";

export class DenominationComponent extends CoreComponent {
    static className = 'DenominationComponent';

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            denomination : props.denomination
        };
        if (!this.state.denomination.denomination_number) {
            this.state.denomination.denomination_number = 0;
        }
        this.state.denomination.denomination_subtotal =
            this.state.denomination.denomination_number * this.state.denomination.denomination_value;
    }

    /**
     * on click minus
     */
    onClickMinus() {
        let {denomination} = this.state;
        if (denomination.denomination_number > 0)
            denomination.denomination_number -= 1;
        denomination.denomination_subtotal = denomination.denomination_number * denomination.denomination_value;
        this.setState({denomination: denomination});
        this.props.updateDenomination(this.state.denomination);
    }

    /**
     * on click plus
     */
    onClickPlus() {
        let {denomination} = this.state;
        denomination.denomination_number += 1;
        denomination.denomination_subtotal = denomination.denomination_number * denomination.denomination_value;
        this.setState({denomination: denomination});
        this.props.updateDenomination(this.state.denomination);
    }

    /**
     * on change denomination value
     * @param value
     */
    onChangeDenominationNumber(value) {
        let {denomination} = this.state;
        denomination.denomination_number = Number(value);
        denomination.denomination_subtotal = denomination.denomination_number * denomination.denomination_value;
        this.setState({denomination: denomination});
        this.props.updateDenomination(this.state.denomination);
    }

    template() {
        let {denomination} = this.state;
        let shift_currency_code = Config.current_session ?
            Config.current_session.shift_currency_code : CurrencyHelper.getCurrentCurrencyCode();
        return (
            <Fragment>
                <li>
                    <div className="title">{this.props.t(denomination.denomination_name)}</div>
                    <div className="number">
                        <div className="product-field-qty">
                            <div className="box-field-qty" >
                                <NumPad.CustomIntegerNumber
                                    position="centerRight"
                                    sync={true}
                                    arrow="right"
                                    value={denomination.denomination_number}
                                    onChange={(value) => this.onChangeDenominationNumber(value)}>
                                    <span className="form-control qty">{denomination.denomination_number}</span>
                                </NumPad.CustomIntegerNumber>
                                <a className="btn-number  qtyminus"
                                   data-type="minus"
                                   data-field="qty"
                                   onClick={() => this.onClickMinus()}>-</a>
                                <a className="btn-number  qtyplus"
                                   data-type="plus"
                                   data-field="qty"
                                   onClick={() => this.onClickPlus()}>+</a>
                            </div>
                        </div>
                    </div>
                    <div className="price">{CurrencyHelper.format(denomination.denomination_subtotal, shift_currency_code)}</div>
                </li>
            </Fragment>
        )
    }
}

class DenominationComponentContainer extends CoreContainer {
    static className = 'DenominationComponentContainer';
}

export default ContainerFactory.get(DenominationComponentContainer).withRouter(
    ComponentFactory.get(DenominationComponent)
);