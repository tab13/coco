import React from 'react';
import CoreComponent from '../../../../../../framework/component/CoreComponent'
import PropTypes from "prop-types";

export default class CustomSaleInputComponent extends CoreComponent {
    static className = 'CustomSaleInputComponent';
    input;

    /**
     * Constructor
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            canClear: false,
        }
    }

    /**
     * Component will receive props
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if(nextProps.isNew){
            if (this.input) {
                this.input.value = "";
                this.props.inputFieldOnChange(this.props.Code, this.props.DefaultValue);
            }
            this.setState({
                canClear: false
            })
        }
    }

    /**
     * Set input
     *
     * @param input
     */
    setInput(input) {
        this.input = input;
    }

    /**
     * On change input
     */
    onChange() {
        this.setState({
            canClear: true
        });
        if (this.props.inputFieldOnChange) {
            this.props.inputFieldOnChange(this.props.Code, this.input.value);
        }
    }

    /**
     * On focus input
     */
    onFocus() {
        this.setState({
            canClear:  this.input.value.length
        });
    }

    /**
     * On blur input
     */
    onBlur() {
        this.timeOut = setTimeout(() => {
            this.setState({
                canClear: false
            })
        }, 200);
    }

    /**
     * Clear input
     */
    clear() {
        if (this.input) {
            this.input.focus();
            this.input.value = "";
            this.props.inputFieldOnChange(this.props.Code, this.props.DefaultValue);
        }
        this.setState({
            canClear: false
        })
    }

    template() {
        let { Code, Label, Placeholder, MaxLength, OneRow } = this.props;
        let id = "custom-sale-" + Code;
        return (
            <div className={OneRow ? "col-sm-12" : "col-sm-6"}>
                <label htmlFor={id}>{ Label }</label>
                <input
                    id={id}
                    className="form-control"
                    type="text"
                    ref={this.setInput.bind(this)}
                    placeholder={Placeholder}
                    maxLength={MaxLength}
                    onChange={this.onChange.bind(this)}
                    onFocus={this.onFocus.bind(this)}
                    onBlur={this.onBlur.bind(this)}
                />
                <a
                    onClick={this.clear.bind(this)}
                    className={ this.state.canClear ?  "btn-remove show" : "btn-remove hidden" }
                >
                    <span>remove</span>
                </a>
            </div>
        );
    }
}

CustomSaleInputComponent.propTypes = {
    Code: PropTypes.string,
    Label: PropTypes.string,
    DefaultValue: PropTypes.string,
    MaxLength: PropTypes.number,
    OneRow: PropTypes.bool,
};