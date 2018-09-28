import React from 'react';
import CoreComponent from '../../../../../../framework/component/CoreComponent'
import Textarea from "react-textarea-autosize";
import PropTypes from "prop-types"

export default class CustomSaleTextareaComponent extends CoreComponent {
    static className = 'CustomSaleTextareaComponent';
    input;

    /**
     * Component will receive props
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if(nextProps.isNew){
            if (this.input) {
                this.input.value = "";
                this.props.inputFieldOnChange(this.props.Code, null);
            }
        }
    }

    /**
     * Set text area
     *
     * @param input
     */
    setInput(input) {
        this.input = input;
    }

    /**
     * On change text area
     */
    onChange() {
        if (this.props.inputFieldOnChange) {
            this.props.inputFieldOnChange(this.props.Code, this.input.value);
        }
    }

    /**
     * Clear input
     */
    clear() {
        if (this.input) {
            this.input.focus();
            this.input.value = "";
            this.props.inputFieldOnChange(this.props.Code, null);
        }
    }

    template() {
        let { Code, Label , OneRow} = this.props;
        let id = "custom-sale-" + Code;
        let style = {
            resize: "none",
            padding: "0px",
        };
        return (
            <div className={OneRow ? "col-sm-12" : "col-sm-6"}>
                <label htmlFor={id}>{ Label }</label>
                <Textarea
                    id={id}
                    className="form-control"
                    inputRef={this.setInput.bind(this)}
                    onChange={this.onChange.bind(this)}
                    maxRows={3}
                    style={style}
                />
            </div>
        );
    }
}

CustomSaleTextareaComponent.propTypes = {
    Label: PropTypes.string,
    OneRow: PropTypes.bool,
    Code: PropTypes.string,
};