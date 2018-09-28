import React from 'react';
import {ProductAbstractOptionComponent} from "./AbstractOption";
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import {DateTime} from 'react-datetime-bootstrap';
import $ from 'jquery';
import moment from 'moment';
import OptionConstant from "../../../../constant/catalog/OptionConstant";
import "../../../../style/css/DateTime.css"
import DateTimeHelper from "../../../../../helper/DateTimeHelper";

export class DateTimePickerOption extends ProductAbstractOptionComponent {
    static className = 'DateTimePickerOption';

    valueDate = "";
    valueTime = "";

    /**
     * componentDidMount create default value input date time
     */
    componentDidMount() {
        let {option} = this.props;
        let isShowDate = false;
        let isShowTime = false;
        if (option.type === OptionConstant.TYPE_DATE) {
            isShowDate = true;
            isShowTime = false;
        } else if (option.type === OptionConstant.TYPE_TIME) {
            isShowDate = false;
            isShowTime = true;
        } else if (option.type === OptionConstant.TYPE_DATE_TIME) {
            isShowDate = true;
            isShowTime = true;
        }
        let currentTime = new Date();
        let option_id = option.option_id;
        let datepicker_id = '#datepicker' + option_id + ' input';
        let timepicker_id = '#timepicker' + option_id + ' input';
        if (isShowDate && isShowTime) {
            $(datepicker_id).val(moment(currentTime).format("LL"));
            $(timepicker_id).val(moment(currentTime).format("LT"));
            this.onChangeDate(currentTime);
            this.onChangeTime(currentTime);
        } else if (isShowDate) {
            $(datepicker_id).val(moment(currentTime).format("LL"));
            this.onChangeDate(currentTime);
        } else if (isShowTime) {
            $(timepicker_id).val(moment(currentTime).format("LT"));
            this.onChangeTime(currentTime);
        }
    }

    /**
     * onchange date
     * @param date
     */
    onChangeDate = date => {
        let {option} = this.props;
        this.valueDate = date;
        let option_id = option.option_id;
        let form_date_id = '#form-date' + option_id;
        $(form_date_id).addClass('active');
        this.addOptionValue(this.props.option);
    };

    /**
     * onchange time
     * @param time
     */
    onChangeTime = time => {
        this.valueTime = time;
        let {option} = this.props;
        let option_id = option.option_id;
        let form_time_id = '#form-time' + option_id;
        $(form_time_id).addClass('active');
        this.addOptionValue(this.props.option);
    };

    /**
     * onchange checkbox
     */
    onChangeCheckbox() {
        this.addOptionValue(this.props.option);
    }

    /**
     * add option value
     */
    addOptionValue(option) {
        let optionValue = {
            "label": option.title,
            "value": "",
            "print_value": "",
            "option_id": option.option_id,
            "option_type": option.type,
            "option_value": "",
            "custom_view": false
        };

        if (this.refs.checkbox && this.refs.checkbox.checked) {
            if (option.type === OptionConstant.TYPE_DATE) {
                let date = moment(this.valueDate).format('LL');
                optionValue.value = date;
                optionValue.print_value = date;
                optionValue.option_value = moment(this.valueDate).format('YYYY-MM-DD 00:00:00');
            } else if (option.type === OptionConstant.TYPE_TIME) {
                let time = moment(this.valueTime).format('LT');
                optionValue.value = time;
                optionValue.print_value = time;
                optionValue.option_value = moment(this.valueTime).format('YYYY-MM-DD HH:mm') + ":00";
            } else if (option.type === OptionConstant.TYPE_DATE_TIME) {
                if (option.is_require) {
                    if (this.valueDate && this.valueTime) {
                        let date_time = moment(this.valueDate).format('DD/MM/YYYY')
                            + ', ' + moment(this.valueTime).format('LT');
                        optionValue.value = date_time;
                        optionValue.print_value = date_time;
                        optionValue.option_value = moment(this.valueDate).format('YYYY-MM-DD')
                            + ' ' + moment(this.valueTime).format('HH:mm') + ":00";
                    }
                } else {
                    if (this.valueDate && this.valueTime) {
                        let date_time = moment(this.valueDate).format('DD/MM/YYYY')
                            + ', ' + moment(this.valueTime).format('LT');
                        optionValue.value = date_time;
                        optionValue.print_value = date_time;
                        optionValue.option_value = moment(this.valueDate).format('YYYY-MM-DD')
                            + ' ' + moment(this.valueTime).format('HH:mm') + ":00";
                    } else
                    if (this.valueDate && !this.valueTime) {
                        optionValue.value = this.date;
                        optionValue.print_value = this.date;
                        optionValue.option_value = moment(this.valueDate).format('YYYY-MM-DD HH:mm') + ":00";
                    } else
                    if (!this.valueDate && this.valueTime) {
                        optionValue.value = this.time;
                        optionValue.print_value = this.time;
                        optionValue.option_value = moment(this.valueTime).format('YYYY-MM-DD HH:mm') + ":00";
                    }
                }
            }
        }
        let databaseTime = DateTimeHelper.getDatabaseDateTime(new Date(optionValue.option_value).getTime());
        optionValue.option_value = moment(databaseTime).format("YYYY-MM-DD HH:mm:00");
        this.props.addCustomOption(optionValue);
    }

    /**
     * show date picker
     */
    showDatePicker() {
        let {option, scrollToDateTime} = this.props;
        let option_id = option.option_id;
        let datepicker_id = '#datepicker' + option_id + ' input';
        $(datepicker_id).data("DateTimePicker").ignoreReadonly(true);
        $(datepicker_id).data("DateTimePicker").allowInputToggle(true);
        $(datepicker_id).data("DateTimePicker").toggle();
        $(datepicker_id).keydown(function(event) {
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        scrollToDateTime($(datepicker_id), $('.bootstrap-datetimepicker-widget'));
    }

    /**
     * show time picker
     */
    showTimePicker() {
        let {option, scrollToDateTime} = this.props;
        let option_id = option.option_id;
        let timepicker_id = '#timepicker' + option_id + ' input';
        $(timepicker_id).data("DateTimePicker").ignoreReadonly(true);
        $(timepicker_id).data("DateTimePicker").allowInputToggle(true);
        $(timepicker_id).data("DateTimePicker").toggle();
        $(timepicker_id).keydown(function(event) {
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        scrollToDateTime($(timepicker_id), $('.bootstrap-datetimepicker-widget'));
    }

    template() {
        let {option, productPrice} = this.props;
        let option_id = option.option_id;
        let isShowDate = false;
        let isShowTime = false;
        if (option.type === OptionConstant.TYPE_DATE) {
            isShowDate = true;
            isShowTime = false;
        } else if (option.type === OptionConstant.TYPE_TIME) {
            isShowDate = false;
            isShowTime = true;
        } else if (option.type === OptionConstant.TYPE_DATE_TIME) {
            isShowDate = true;
            isShowTime = true;
        }
        return (
            <div className="product-options-attribute">
                <div className="attribute-label">
                    <label className="checkbox">
                        <input
                               ref={'checkbox'}
                               type="checkbox"
                               defaultChecked={option.is_require}
                               disabled={option.is_require}
                               onChange={this.onChangeCheckbox.bind(this)} />
                        <span >
                            <span className="name">{option.title} <sup>{option.is_require ? '*': ''}</sup></span>
                            <span className="price">
                                {this.getOptionDisplayPrice(option.price, option.price_type, productPrice)}
                                </span>
                        </span>
                    </label>
                </div>
                <div id={'form-date' + option_id}
                     className={isShowDate ? "input-append date form-date active" : "hidden"} >
                    <DateTime id={'datepicker' + option_id}
                              pickerOptions={{format:"LL"}}
                              onChange={this.onChangeDate}
                              readOnly={true}/>
                    <label onClick={this.showDatePicker.bind(this)}>{this.props.t('Select Date')}</label>
                </div>
                <div id={'form-time' + option_id}
                     className={isShowTime ? "input-append date form-time active" : "hidden"} >
                    <DateTime id={'timepicker' + option_id}
                              pickerOptions={{format:"LT"}}
                              onChange={this.onChangeTime}
                              readOnly={true}/>
                    <label onClick={this.showTimePicker.bind(this)}>{this.props.t('Select Time')}</label>
                </div>
            </div>
        )
    }
}

class DateTimePickerOptionContainer extends CoreContainer {
    static className = 'DateTimePickerOptionContainer';
}

export default ContainerFactory.get(DateTimePickerOptionContainer).withRouter(
    ComponentFactory.get(DateTimePickerOption)
);