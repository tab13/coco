import React from 'react';
import PropTypes from 'prop-types';
import {CoreComponent} from '../../../../framework/component/index'

export default class CustomerGroupComponent extends CoreComponent {
    static className = 'CustomerInputComponent';
    select;

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            options: props.Options,
            requiredInValid: false,
            defaultValue: props.DefaultValue
        }
    }

    /**
     * componentWillReceiveProps
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        this.setState({options: nextProps.Options});
    }

    /**
     * set select
     * @param select
     */
    setSelect(select) {
        this.select = select;
    }

    /**
     * Set value
     * @param value
     */
    setValue(value) {
        if (value) {
            this.select.value = value;
            this.setState({defaultValue: this.select.value});
        } else {
            this.select.value = '';
        }
    }

    /**
     * onchange
     * @param event
     */
    onChange(event) {
        this.setState({defaultValue: event.target.value});
        if (this.props.onSelect) {
            this.props.onSelect(this.props.Code, event.target.value);
        }
    }

    /**
     * set options
     * @param options
     */
    setOptions(options) {
        this.setState({options: options});
    }

    /**
     * validate
     */
    validate() {
        let { Required } = this.props;

        this.setState({
            requiredInValid:  Required &&  !this.select.value.length,
        })
    }

    /**
     * clear
     */
    clear() {
        if (this.select) {
            this.select.value = "";
        }

        this.validate();
    }

    template() {
        let { Label, OneRow, KeyValue, KeyTitle } = this.props;
        return (
            <div className={OneRow ? "col-sm-12" : "col-sm-6"}>
                <label> { Label } </label>
                <select value={ this.state.defaultValue }
                        className="form-control"
                        ref={this.setSelect.bind(this)}
                        onChange={this.onChange.bind(this)}>
                    {
                        this.state.options ? this.state.options.map(option => {
                            return (<option key={Math.random()} value={option[KeyValue]}> {option[KeyTitle]} </option>)
                        }) : null
                    }
                </select>
            </div>
        )
    }
}

CustomerGroupComponent.propTypes = {
    Label: PropTypes.string,
    Options: PropTypes.array,
    KeyValue: PropTypes.string,
    KeyTitle: PropTypes.string,
    Required: PropTypes.bool,
    OneRow: PropTypes.bool,
    Code: PropTypes.string,
    onSelect: PropTypes.func
};