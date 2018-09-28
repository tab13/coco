import React from 'react';
import NumPad from '../../../lib/react-numpad';
import {GiftCardProductAbstractOptionComponent} from "./GiftCardAbstractOption";
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import {GiftCardProductHelper} from "../../../../../helper/GiftCardProductHelper";
import GiftCardProductConstant from "../../../../constant/catalog/GiftCardProductConstant";
import CurrencyHelper from "../../../../../helper/CurrencyHelper";
import _ from "lodash";

export class GiftCardInputTextOption extends GiftCardProductAbstractOptionComponent {
    static className = 'GiftCardInputTextOption';
    input;

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);

        let {option} = this.props;
        let {min} = GiftCardProductHelper.getGiftValues(option);

        this.state = {
            value: min,
            min: option[GiftCardProductConstant.GIFT_VALUE_FROM],
            max: option[GiftCardProductConstant.GIFT_VALUE_TO],
        }
    }

    componentDidMount() {
        return this.addCustomOption(this.state.value);
    }


    /**
     * add option
     */
    addCustomOption(value) {
        this.setState({value});
        return this.props.addCustomOption({
            code: GiftCardProductConstant.GIFT_CARD_AMOUNT,
            value: value,
        });
    }


    template() {
        let {option, t } = this.props;
        let {min, max} = GiftCardProductHelper.getGiftValues(option, true);
        return (
            <div className="product-options-attribute">
                <div className="attribute-label">
                    {t('Enter value ')}( {min} - {max} )<sup>*</sup>
                    <span className="price">
                        {this.getOptionDisplayPrice(option.price, option.price_type, this.props.productPrice)}
                    </span>
                </div>
                <NumPad.CustomNumber
                    onChange={(value) => {
                        value = _.toNumber(value);

                        if (value > this.state.max) {
                            return this.addCustomOption(this.state.max)
                        }

                        if (value < this.state.min) {
                            return this.addCustomOption(this.state.min)
                        }

                        this.addCustomOption(value);
                    }}
                    position="centerRight"
                    sync={true}
                    arrow="right"
                    value={this.state.value}>
                    <div className="attribute-options clear-text">
                        <input
                            className={"textarea form-control"}
                            onChange={
                                () => true
                            }
                            value={CurrencyHelper.convertAndFormat(this.state.value)}
                        />
                    </div>
                </NumPad.CustomNumber>
            </div>
        )
    }
}

class GiftCardInputTextOptionContainer extends CoreContainer {
    static className = 'GiftCardInputTextOptionContainer';
}

/**
 *  @type {GiftCardInputTextOptionContainer}
 */
export default ContainerFactory.get(GiftCardInputTextOptionContainer).withRouter(
    ComponentFactory.get(GiftCardInputTextOption)
);