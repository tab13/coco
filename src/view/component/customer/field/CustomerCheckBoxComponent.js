import React from 'react';
import PropTypes from 'prop-types';
import {CoreComponent} from '../../../../framework/component/index'

export default class CustomerCheckboxComponent extends CoreComponent {
    static className = 'CustomerCheckboxComponent';
    input;

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            defaultValue: props.IsCheck
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
     * validate
     */
    validate() {

    }

    /**
     * onchange
     */
    onChange() {
        if (this.props.checkboxFieldOnChange) {
            this.props.checkboxFieldOnChange(this.props.Code, this.input.checked);
        }
    }

    template() {
        let { Label, OneRow, Disabled } = this.props;
        return (
            <div className={OneRow ? "col-sm-12" : "col-sm-6"}>
                <label className="pull-left"> { Label } </label>
                <div className="checkbox pull-right">
                    <label>
                        <input type="checkbox"
                               defaultChecked={this.state.defaultValue}
                               ref={this.setInput.bind(this)}
                               disabled={Disabled}
                               onChange={this.onChange.bind(this)}/>
                        <span><span>no</span></span>
                    </label>
                </div>
            </div>
        )
    }
}

CustomerCheckboxComponent.propTypes = {
    Label: PropTypes.string,
    OneRow: PropTypes.bool,
    Disabled: PropTypes.bool
};