import React from 'react';
import {ProductAbstractOptionComponent} from "./AbstractOption";
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";

export class RadioOption extends ProductAbstractOptionComponent {
    static className = 'RadioOption';

    /**
     * handle select radio option
     * @param value
     */
    selectRadio(value) {
        let {option} = this.props;
        let optionValue = {
            "label": option.title,
            "value": "",
            "print_value": "",
            "option_id": option.option_id,
            "option_type": option.type,
            "option_value": "",
            "custom_view": false
        };

        optionValue.value = value.title;
        optionValue.print_value = value.title;
        optionValue.option_value = value.option_type_id;

        this.props.addCustomOption(optionValue);
    }

    template() {
        let {option} = this.props;
        return (
            <div className="custom-item">
                <div className="custom-title">
                    <span className="title">{option.title} <sup>{option.is_require ? '*': ''}</sup></span>
                </div>
                <div className="custom-options">
                    {
                        option.values.map(value => {
                            return (
                                <div className="custom-option" key={value.option_type_id}>
                                    <label>
                                        <input type="radio"
                                               name={'options[' + option.option_id + ']'}
                                               onClick={() => this.selectRadio(value)}/>
                                        <span className="custom-box">
                                            {/*<span className="qty">2x</span>*/}
                                            <span className="name">{value.title}</span>
                                            <span className="price">
                                                {
                                                    this.getOptionDisplayPrice(
                                                        value.price,
                                                        value.price_type,
                                                        this.props.productPrice
                                                    )
                                                }
                                            </span>
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

class RadioOptionContainer extends CoreContainer {
    static className = 'RadioOptionContainer';
}

/**
 * @type {RadioOption}
 */
export default ContainerFactory.get(RadioOptionContainer).withRouter(
    ComponentFactory.get(RadioOption)
);