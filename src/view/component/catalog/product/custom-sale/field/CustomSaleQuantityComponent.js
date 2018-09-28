import React from 'react';
import CoreComponent from '../../../../../../framework/component/CoreComponent'
import PropTypes from "prop-types";
import CurrencyHelper from "../../../../../../helper/CurrencyHelper";
import {isAndroid} from "react-device-detect";

export default class CustomSaleQuantityComponent extends CoreComponent {
    static className = 'CustomSaleQuantityComponent';
    input;
    regexNumber = /^[0-9]*([.][0-9]{0,2})?$/;

    /**
     * Constructor
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            input_value: props.DefaultValue,
            canClear: false,
            defaultValue: props.DefaultValue
        };
        this.getContainer = this.getContainer.bind(this);
        this.isTouch = false
    }

    /**
     * get container
     * @param ref
     */
    getContainer(ref) {
        this.container = ref
    }

    /**
     * component did mount
     */
    componentDidMount() {
        document.addEventListener('touchend', this.handle, true);
        document.addEventListener('click', this.handle, true);
    }

    /**
     * component will unmount
     */
    componentWillUnmount() {
        document.removeEventListener('touchend', this.handle, true);
        document.removeEventListener('click', this.handle, true);
        if (this.timeOut) {
            clearTimeout(this.timeOut);
        }
    }

    /**
     * Component will receive props
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if(nextProps.isNew){
            this.input.value = this.props.DefaultValue;
            this.setState({
                input_value: this.props.DefaultValue,
                canClear: false
            });
            if (this.props.inputFieldOnChange) {
                this.props.inputFieldOnChange(this.props.Code, this.props.DefaultValue);
            }
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
     * Change input value
     *
     * @param value
     */
    changeInputValue(value){
        this.setState({
            input_value: value,
            canClear: true
        });
        if (this.props.inputFieldOnChange) {
            value = this.formatNumber(value);
            this.props.inputFieldOnChange(this.props.Code, value);
        }
    }

    /**
     * On change input
     *
     * @param event
     */
    onChange(event) {
        let preInput = event.target.value.replace(/,/g,'');
        if(this.regexNumber.test(preInput)) {
            this.input.value = preInput;
            this.changeInputValue(this.input.value);
        }else{
            this.input.value = this.state.input_value;
            this.setState({
                canClear: true
            })
        }
    }

    /**
     * On blur input
     */
    onBlur() {
        let preInputValue = this.input.value;
        if(preInputValue === ""){
            this.input.value = this.state.defaultValue;
            this.setState({
                input_value: this.state.defaultValue
            });
        }
        if(preInputValue.indexOf('.') !== -1){
            preInputValue.replace(/\D/g, '');
            preInputValue = parseFloat(preInputValue).toFixed(2);
            this.input.value = preInputValue;
            this.changeInputValue(preInputValue);
        }
        if (!isAndroid) {
            this.timeOut = setTimeout(() => {
                this.setState({
                    canClear: false
                })
            }, 200);
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
     * Format number to "1,428.92"
     *
     * @param value
     */
    formatNumber(value) {
        return CurrencyHelper.formatNumberStringToCurrencyString(value);
    }

    /**
     * Clear input
     */
    clear() {
        if (this.input) {
            this.input.focus();
            this.changeInputValue(this.props.DefaultValue);
            this.input.value = "";
        }

        this.setState({
            canClear: false
        })
    }

    /**
     * handle event outside click
     * @param e
     */
    handle = e => {
        if (isAndroid) {
            if (e.type === 'touchend') this.isTouch = true;
            if (e.type === 'click' && this.isTouch) return;
            const el = this.container;
            if (!el.contains(e.target)) {
                this.setState({
                    canClear: false,
                })
            }
        }
    };

    template() {
        let { Code, Label, Placeholder, DefaultValue, MaxLength, OneRow } = this.props;
        let id = "custom-sale-" + Code;
        let title = " ";
        return (
            <div ref={this.getContainer} className={OneRow ? "col-sm-12" : "col-sm-6"}>
                <label htmlFor={id}>{ Label }</label>
                <input
                    id={id}
                    className="form-control"
                    title={title}
                    type="text"
                    pattern="[0-9]*"
                    maxLength={MaxLength}
                    placeholder={Placeholder}
                    defaultValue={DefaultValue}
                    ref={this.setInput.bind(this)}
                    onChange={this.onChange.bind(this)}
                    onBlur={this.onBlur.bind(this)}
                    onFocus={this.onFocus.bind(this)}
                />
                <a
                    onClick={this.clear.bind(this)}
                    className={ this.state.canClear ?  "btn-remove show" : "btn-remove hidden" }
                ><span>remove</span></a>
            </div>
        );
    }
}

CustomSaleQuantityComponent.propTypes = {
    Code: PropTypes.string,
    Label: PropTypes.string,
    DefaultValue: PropTypes.string,
    MaxLength: PropTypes.number,
    OneRow: PropTypes.bool,
};