import React from 'react';
import {ProductAbstractOptionComponent} from "./AbstractOption";
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import Textarea from 'react-textarea-autosize';

export class TextAreaOption extends ProductAbstractOptionComponent {
    static className = 'TextAreaOption';
    input;

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            inputLength: 0,
            isMaxLength : false
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
        this.setState({
            inputLength: this.input.value.length,
            isMaxLength: this.input.value.length === maxLength
        });
        if (this.timeOut) {
            clearTimeout(this.timeOut);
        }
        this.timeOut = setTimeout(() => {
            this.onBlur();
        }, 100);
    }

    /**
     * on blur text area => add option value
     */
    onBlur() {
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
                <div className="attribute-options">
                    <Textarea
                        className={isMaxLength ? "form-control max-length" : "form-control"}
                        inputRef={this.setInput.bind(this)}
                        maxRows={3}
                        style={{resize: 'none', overflow: 'hidden'}}
                        maxLength={maxLength}
                        onChange={this.onChange.bind(this)}
                        onBlur={() => this.onBlur()}/>
                    <div className={isShowLength ? "count-text" : "hidden"}>
                        {inputLength + "/" + maxLength}
                    </div>
                </div>
            </div>
        )
    }
}

class TextAreaOptionContainer extends CoreContainer {
    static className = 'TextAreaOptionContainer';
}

export default ContainerFactory.get(TextAreaOptionContainer).withRouter(
    ComponentFactory.get(TextAreaOption)
);