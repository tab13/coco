import React from 'react';
import {ProductAbstractOptionComponent} from "./AbstractOption";
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";

export class CheckboxOption extends ProductAbstractOptionComponent {
    static className = 'CheckboxOption';

    selectedList = [];

    /**
     * on change checkbox value
     * @param event
     * @param value
     */
    onChangeCheckbox(event, value) {
        if (event.target.checked) {
            this.selectedList.push(value);
        } else {
            let index = this.selectedList.indexOf(value);
            this.selectedList.splice(index, 1);
        }
        this.selectedList.sort(function (a, b) {
            let x = a.sort_order;
            let y = b.sort_order;
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });

        this.prepareOptionValue();
    }

    /**
     *  prepare option value and add custom option
     */
    prepareOptionValue() {
        let {option} = this.props;
        let titles = [];
        let ids = [];
        let optionValue = {
            "label": option.title,
            "value": "",
            "print_value": "",
            "option_id": option.option_id,
            "option_type": option.type,
            "option_value": "",
            "custom_view": false
        };

        this.selectedList.map(item => {
            titles.push(item.title);
            ids.push(item.option_type_id);
            return null;
        });

        titles = titles.join(', ');
        ids = ids.join(',');

        optionValue.value = titles;
        optionValue.print_value = titles;
        optionValue.option_value = ids;

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
                                        <input type="checkbox"
                                               name={'options[' + option.option_id + '][]'}
                                               onChange={(event) => this.onChangeCheckbox(event, value)}/>
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

class CheckboxOptionContainer extends CoreContainer {
    static className = 'CheckboxOptionContainer';
}

/**
 * @type {CheckboxOption}
 */
export default ContainerFactory.get(CheckboxOptionContainer).withRouter(
    ComponentFactory.get(CheckboxOption)
);