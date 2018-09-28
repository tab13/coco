import React from 'react';
import CoreComponent from '../../../../../../framework/component/CoreComponent'
import PropTypes from "prop-types";
import CurrencyHelper from "../../../../../../helper/CurrencyHelper";
import {isAndroid} from 'react-device-detect';


export default class CustomSaleNumberComponent extends CoreComponent {
    static className = 'CustomSaleNumberComponent';
    regexNumber = /^[0-9]*?$/;
    timeOut;
    input;

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
        });
        if(value === this.props.DefaultValue){
            this.setState({
                canClear: false
            })
        }else{
            this.setState({
                canClear: true,
            })
        }
        if (this.props.inputFieldOnChange) {
            this.props.inputFieldOnChange(this.props.Code, value);
        }
    }

    /**
     * On change input
     *
     * @param event
     */
    onChange(event) {
        if(!isAndroid){
            let preInput = event.target.value.replace(/,/g,'');
            if(!this.regexNumber.test(preInput)) {
                this.input.value = this.state.input_value;
                if(this.state.input_value === this.props.DefaultValue){
                    this.setState({
                        canClear: false
                    })
                }else{
                    this.setState({
                        canClear: true,
                    })
                }
            }
        }
    }

    /**
     * On blur input
     */
    onBlur() {
        let preInputValue = this.input.value;
        if(preInputValue === ""){
            this.input.value = this.props.DefaultValue;
            this.setState({
                input_value: this.props.DefaultValue
            });
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
        if(this.input.value === this.props.DefaultValue){
            this.setState({
                canClear:  false
            });
        }else{
            this.setState({
                canClear:  this.input.value.length
            });
        }
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
     * On key up input
     *
     * @param event
     */
    onKeyUp(event) {
        let key = event.key;
        if(isAndroid){
            key = event.target.value;
            if(key.length <= this.state.input_value.length){
                key = 'Backspace';
            }else{
                key = key.substr(event.target.selectionStart - 1, 1);
            }
        }
        if(event.target.value === ""){
            this.input.focus();
            this.setState({
                canClear: false,
                input_value: this.props.DefaultValue
            });
            if (this.props.inputFieldOnChange) {
                this.props.inputFieldOnChange(this.props.Code, this.props.DefaultValue);
            }
            this.input.value = this.props.DefaultValue;
        }else{
            let inputValue = this.state.input_value;
            let [intValue, decimalValue] = CurrencyHelper.formatCurrencyStringToNumberString(inputValue).split('.');
            let decimalLength = decimalValue.length;
            inputValue = intValue + "" + decimalValue;
            if (key === 'Backspace' || key === 'Delete') {
                inputValue = inputValue.substring(0, inputValue.length - 1);
            } else {
                if (this.regexNumber.test(key)) {
                    inputValue += key;
                } else {
                    // if input not valid
                    this.input.value = this.state.input_value;
                    if(this.state.input_value === this.props.DefaultValue){
                        this.setState({
                            canClear: false
                        })
                    }else{
                        this.setState({
                            canClear: true,
                        })
                    }
                    return false;
                }
            }
            intValue = inputValue.substring(0, inputValue.length - decimalLength);
            decimalValue = inputValue.slice(-decimalLength);
            inputValue = intValue + "." + decimalValue;
            inputValue = this.formatNumber(inputValue);
            this.input.value = inputValue;
            this.changeInputValue(this.input.value);
        }
    }

    /**
     * Clear input
     */
    clear() {
        if (this.input) {
            this.input.focus();
            this.setState({
                input_value: this.props.DefaultValue,
            });
            if (this.props.inputFieldOnChange) {
                this.props.inputFieldOnChange(this.props.Code, this.props.DefaultValue);
            }
            this.input.value = this.props.DefaultValue;
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

    /**
     * Render template
     *
     * @return {*}
     */
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
                    onKeyUp={this.onKeyUp.bind(this)}
                />
                <a
                    onClick={this.clear.bind(this)}
                    className={ this.state.canClear ?  "btn-remove show" : "btn-remove hidden" }
                ><span>remove</span></a>
            </div>
        );
    }
}

CustomSaleNumberComponent.propTypes = {
    Code: PropTypes.string,
    Label: PropTypes.string,
    DefaultValue: PropTypes.string,
    MaxLength: PropTypes.number,
    OneRow: PropTypes.bool,
};