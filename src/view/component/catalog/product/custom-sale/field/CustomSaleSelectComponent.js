import React from 'react';
import PropTypes from 'prop-types';
import CoreComponent from '../../../../../../framework/component/CoreComponent'

export default class CustomSaleSelectComponent extends CoreComponent {
    static className = 'CustomSaleSelectComponent';
    select;

    /**
     * Constructor
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            options: props.Options,
            value: props.DefaultValue
        }
    }

    /**
     * Component will receive props
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if(nextProps.isNew){
            this.setState({
                value: this.props.DefaultValue
            });
            this.props.onSelect(this.props.Code, this.props.DefaultValue);
        }
    }

    /**
     * Set select
     *
     * @param select
     */
    setSelect(select) {
        this.select = select;
    }

    /**
     * On change
     *
     * @param event
     */
    onChange(event) {
        this.setState({
            value: event.target.value
        });
        if (this.props.onSelect) {
            this.props.onSelect(this.props.Code, event.target.value);
        }
    }

    template() {
        let { Code, Label, OneRow, KeyValue, KeyTitle } = this.props;
        let id = "custom-sale-" + Code;
        return (
            <div className={OneRow ? "col-sm-12" : "col-sm-6"}>
                <label htmlFor={id}> { Label } </label>
                <select
                    id={id}
                    className="form-control"
                    ref={this.setSelect.bind(this)}
                    value={ this.state.value }
                    onChange={this.onChange.bind(this)}>
                    {
                        this.state.options ? this.state.options.map((option, index) => {
                            return (<option key={index} value={option[KeyValue]}> {option[KeyTitle]} </option>)
                        }) : null
                    }
                </select>
            </div>
        )
    }
}

CustomSaleSelectComponent.propTypes = {
    Label: PropTypes.string,
    Options: PropTypes.array,
    KeyValue: PropTypes.string,
    KeyTitle: PropTypes.string,
    OneRow: PropTypes.bool,
    Code: PropTypes.string,
};