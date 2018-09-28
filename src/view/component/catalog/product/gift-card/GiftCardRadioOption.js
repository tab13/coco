import React from 'react';
import {GiftCardProductAbstractOptionComponent} from "./GiftCardAbstractOption";
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import {GiftCardProductHelper} from "../../../../../helper/GiftCardProductHelper";
import GiftCardProductConstant from "../../../../constant/catalog/GiftCardProductConstant";

export class GiftCardRadioOption extends GiftCardProductAbstractOptionComponent {
    static className = 'GiftCardRadioOption';

    constructor(props) {
        super(props);


        let {option} = this.props;
        let giftDropDownValues = GiftCardProductHelper.getGiftDropdownValues(option);

        let defaultValue = giftDropDownValues[0];

        if (
            option[GiftCardProductConstant.GIFT_PRICE]
            && giftDropDownValues.includes(option[GiftCardProductConstant.GIFT_PRICE])
        ) {
            defaultValue = option[GiftCardProductConstant.GIFT_PRICE];
        }

        this.state = {
            defaultValue
        }
    }

    componentDidMount() {
        return this.selectRadio(this.state.defaultValue);
    }

    /**
     * handle select radio option
     * @param value
     */
    selectRadio(value) {
        return this.props.addCustomOption({
            code: GiftCardProductConstant.GIFT_CARD_AMOUNT,
            value,
        });
    }

    template() {
        let {option, t} = this.props;
        let giftDropDownFormattedValues = GiftCardProductHelper.getGiftDropdownValues(option, true);
        let giftDropDownValues = GiftCardProductHelper.getGiftDropdownValues(option);
        return (
            <div className="custom-item">
                <div className="custom-title">
                    <span className="title">{t('Select value ')} <sup>*</sup></span>
                </div>
                <div className="custom-options">
                    {
                        giftDropDownFormattedValues.map((value, key) => {
                            return (
                                <div className="gift-card-custom-option custom-option"
                                     key={key}>
                                    <label>
                                        <input type="radio"
                                               name="options"
                                               onClick={() => this.selectRadio(giftDropDownValues[key])}
                                               defaultChecked={this.state.defaultValue === giftDropDownValues[key]}
                                        />
                                        <span className="custom-box">
                                            <span className="name">{value}</span>
                                            <span className="price"/>
                                        </span>
                                    </label>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}

class GiftCardRadioOptionContainer extends CoreContainer {
    static className = 'GiftCardRadioOptionContainer';
}

/**
 * @type {GiftCardRadioOption}
 */
export default ContainerFactory.get(GiftCardRadioOptionContainer).withRouter(
    ComponentFactory.get(GiftCardRadioOption)
);