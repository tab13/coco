import React from 'react';
import {ProductAbstractOptionComponent} from "./AbstractOption";
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";

export class InputTextOption extends ProductAbstractOptionComponent {
    static className = 'InputTextOption';
    input;

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            inputLength: 0,
            isMaxLength : false,
            canClear: false
        }
    }

    /**
     * component will unmount
     */
    componentWillUnmount() {
        if (this.timeOut) {
            clearTimeout(this.timeOut);
        }
    }

    /**
     * set input
     * @param input
     */
    setInput(input) {
        this.input = input;
    }

    /**
     * onchange input
     */
    onChange() {
        let maxLength = this.props.option.max_characters;
        if (this.input.value.length === maxLength) {
            this.input.blur();
            this.input.focus();
        }
        if (this.input.value.length === (maxLength-1)) {
            this.input.blur();
            this.input.focus();
        }
        this.setState({
            inputLength: this.input.value.length,
            canClear: this.input.value.length,
            isMaxLength: this.input.value.length === maxLength
        });
        if (this.timeOut) {
            clearTimeout(this.timeOut);
        }
        this.timeOut = setTimeout(() => {
            this.addCustomOption();
        }, 100);
    }

    /**
     * add option
     */
    addCustomOption() {
        let {option} = this.props;
        let value = this.input.value;
        let optionValue = {
            "label": option.title,
            "value": value,
            "print_value": value,
            "option_id": option.option_id,
            "option_type": option.type,
            "option_value": value,
            "custom_view": false
        };

        this.props.addCustomOption(optionValue);
    }

    /**
     * onfocus
     */
    onFocus() {
        if (this.timeOut) {
            clearTimeout(this.timeOut);
        }
        this.setState({
            canClear: this.input.value.length,
            isMaxLength: (this.input.value.length === this.props.option.max_characters)
        });
    }

    /**
     * on blur input => add option value
     */
    onBlur() {
        if (this.timeOut) {
            clearTimeout(this.timeOut);
        }
        this.timeOut = setTimeout(() => {
            this.setState({
                canClear: false
            });
        }, 200);

        this.addCustomOption();
    }

    /**
     * clear input
     */
    clear() {
        if (this.input) {
            this.input.value = "";
            this.setState({
                inputLength: this.input.value.length
            });
            this.addCustomOption();
        }
    }

    template() {
        let {inputLength, isMaxLength} = this.state;
        let {option} = this.props;
        let maxLength = option.max_characters;
        let isShowLength = true;
        if (maxLength === 0) {
           isShowLength = false;
           maxLength = -1;
        }
        return (
            <div className="product-options-attribute">
                <div className="attribute-label">
                    {option.title} <sup>{option.is_require ? '*': ''}</sup>
                    <span className="price">
                        {this.getOptionDisplayPrice(option.price, option.price_type, this.props.productPrice)}
                    </span>
                </div>
                <div className="attribute-options clear-text">
                    <input
                        className={isMaxLength ? "textarea form-control max-length" : "textarea form-control"}
                        ref={this.setInput.bind(this)}
                        maxLength={maxLength}
                        onFocus={this.onFocus.bind(this)}
                        onChange={this.onChange.bind(this)}
                        onBlur={() => this.onBlur()}/>
                    <button onClick={this.clear.bind(this)}
                            className={ this.state.canClear ?  "btn-remove show" : "btn-remove hidden" }
                            type="button"/>
                    <div className={isShowLength ? "count-text" : "hidden"}>
                        {inputLength + "/" + maxLength}
                    </div>
                </div>
            </div>
        )
    }
}

class InputTextOptionContainer extends CoreContainer {
    static className = 'InputTextOptionContainer';
}

export default ContainerFactory.get(InputTextOptionContainer).withRouter(
    ComponentFactory.get(InputTextOption)
);