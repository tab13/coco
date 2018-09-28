import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {CoreComponent} from '../../../../framework/component/index';
import i18n from "../../../../config/i18n";
import {ButtonToolbar, Popover, OverlayTrigger} from "react-bootstrap";
import GoogleSuggestComponent from "../address/GoogleSuggestComponent";
import CustomerConstant from "../../../constant/CustomerConstant";
import Config from "../../../../config/Config";
import {isAndroid} from 'react-device-detect';
import $ from 'jquery';
import ConfigHelper from "../../../../helper/ConfigHelper";

export default class CustomerInputComponent extends CoreComponent {
    static className = 'CustomerInputComponent';
    regexEmail       = ConfigHelper.regexEmail;
    input;

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            canClear: false,
            requiredInValid: false,
            requiredBlankInValid: false,
            requiredEmailInValid: false,
            isEmailAvailable: true,
            showMessageInValid: false,
            showGoogleSuggest: false,
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
     * set input
     * @param input
     */
    setInput(input) {
        this.input = input;
    }

    /**
     * hidden google suggest
     */
    hiddenGoogleSuggest() {
        this.setState({showGoogleSuggest : false});
    }

    /**
     * hidden clear input
     */
    hiddenClearInput() {
        this.setState({canClear: false});
    }

    /**
     * set value
     * @param value
     */
    setValue(value) {
        if (value) {
            this.input.value = value;
        } else {
            this.input.value = '';
        }
        this.setState({
            canClear:  this.input.value.length,
            requiredInValid: false,
            requiredBlankInValid: false,
            requiredEmailInValid: false,
            isEmailAvailable: true,
            showMessageInValid: false
        });
    }

    /**
     * Onchange Input
     */
    onChange() {
        this.setState({
            canClear:  this.input.value.length,
            requiredInValid: false,
            requiredBlankInValid: false,
            requiredEmailInValid: false,
            isEmailAvailable: true,
            showMessageInValid: false
        });
        if (this.props.inputFieldOnChange) {
            this.props.inputFieldOnChange(this.props.Code, this.input.value);
        }
    }

    /**
     * handle event outside click
     * @param e
     */
    handle = e => {
        let self = this;
        if (isAndroid) {
            if (e.type === 'touchend') this.isTouch = true;
            if (e.type === 'click' && this.isTouch) return;
            let id = this.props.Code + "_root";
            let clear_id = this.props.Code + "_clear";
            $("#" + clear_id).mousedown(function () {
                self.input.value = "";
            });
            $("#" + id).focusout(function () {
                setTimeout(() => {
                    self.setState({
                        canClear: false,
                    })
                }, 200)
            });
        }
    };


    /**
     * onclick show message error
     */
    onClickShowMessageError() {
        this.setState({showMessageInValid: true});
    }

    /**
     * onfocus
     */
    onFocus() {
        this.setState({
            canClear:  this.input.value.length,
            requiredInValid: false,
            isEmailAvailable:true,
            showMessageInValid: false,
            showGoogleSuggest: true
        });
    }

    /**
     * OnBlur Input
     */
    onBlur() {
        if(this.input.value.length && this.regexEmail.test(this.input.value)) {
            if(this.props.checkEmail)
                this.props.checkEmail(this.input.value);
        }
        if (!isAndroid) {
            this.timeOut = setTimeout(() => {
                this.validate();
                this.setState({
                    canClear: false,
                    showGoogleSuggest: false
                })
            }, 200);
        } else {
            this.timeOut = setTimeout(() => {
                this.validate();
            }, 200);
        }
    }

    /**
     * setEmailUnAvailable
     */
    setEmailUnAvailable() {
        this.setState({
            canClear: false,
            isEmailAvailable:false,
            requiredBlankInValid: false,
            requiredInValid: true,
        })
    }

    /**
     * validate input
     * @returns {boolean}
     */
    validate() {
        let { Required, RequiredEmail,  } = this.props;

        let validate = false;
        let validateEmail = false;
        let validateBlank = false;
        if (Required) {
            if (!this.input || this.input.value.length <= 0) {
                validate = true;
                validateBlank = true;
            } else {
                validateBlank = false;
                if (RequiredEmail) {
                    if (this.regexEmail.test(this.input.value)) {
                        validate = false;
                        validateEmail = false;
                    } else {
                        validate = true;
                        validateEmail = true;
                        this.setState({
                            canClear: false
                        });
                    }
                }
            }
        }

        this.setState({
            requiredInValid: validate,
            requiredBlankInValid: validateBlank,
            requiredEmailInValid: validateEmail,
            showMessageInValid: false
        });

        if (!this.state.isEmailAvailable) {
            this.setState({
                canClear: false,
                isEmailAvailable:false,
                requiredBlankInValid: false,
                requiredInValid: true,
            });
            return true;
        }
        return validate;
    }

    /**
     * clear input
     */
    clear() {
        if (this.input) {
            this.input.value = "";
        }

        this.setState({
            canClear: false
        })
    }

    /**
     * set location info
     * @param locationInfo
     */
    setLocationInfo(locationInfo) {
        this.props.setLocationInfo(locationInfo);
    }

    /**
     * get google api key
     * @returns {*}
     */
    getGoogleKey() {
        let config = Config.config;
        if (config) {
            let googleApiKey = config.settings.find(item => item.path === CustomerConstant.GOOGLE_API_PATH).value;
            if(!googleApiKey) { return ''}
            return googleApiKey
        }
        return '';
    }

    template() {
        let { Label, MaxLength , OneRow, GoogleSuggest, IsOptional, Code} = this.props;
        let { requiredInValid, requiredBlankInValid, requiredEmailInValid,
            showMessageInValid, defaultValue, isEmailAvailable} = this.state;

        let classRequired = "hidden";
        let classHiddenRequired = "";
        if (requiredInValid && !showMessageInValid) {
            classRequired = "validation-advice"
        } else if (requiredInValid && showMessageInValid) {
            classRequired = "validation-advice open"
        } else if (!requiredInValid && showMessageInValid) {
            classRequired = "validation-advice open";
            classHiddenRequired = "hidden";
        } else {
            classRequired = "hidden";
            classHiddenRequired = "hidden";
        }
        let messageError = "";
        if (requiredBlankInValid) {
            messageError = "This is a required field";
        } else {
            if (requiredEmailInValid) {
                messageError = "Please enter a valid email address";
            }
            if (!isEmailAvailable) {
                messageError = "Email address is existed";
            }
        }

        const popoverRight = (
            <Popover id="popover">
                <div>
                    { i18n.translator.translate(messageError) }
                </div>
            </Popover>
        );
        return (

            <div id={Code + "_root"} ref={this.getContainer} className={OneRow ? "col-sm-12" : "col-sm-6"}>
                <label>{ i18n.translator.translate(Label) }
                       { IsOptional ? <Fragment><i>{ i18n.translator.translate('- Optional') }</i></Fragment> : "" }
                </label>
                <input
                    id={Code}
                    type="text"
                    className="form-control"
                    defaultValue={defaultValue}
                    ref={this.setInput.bind(this)}
                    maxLength={MaxLength}
                    onChange={this.onChange.bind(this)}
                    onBlur={this.onBlur.bind(this)}
                    onFocus={this.onFocus.bind(this)}
                />
                <a
                    id={Code + "_clear"}
                    onClick={this.clear.bind(this)}
                    className={ this.state.canClear ?  "btn-remove show" : "btn-remove hidden" }
                ><span>remove</span></a>
                {
                    GoogleSuggest && this.state.showGoogleSuggest && window.navigator.onLine ?
                        <GoogleSuggestComponent input={this.input ? this.input.value : ""}
                                                apiKey={this.getGoogleKey()}
                                                setLocationInfo={this.setLocationInfo.bind(this)}/>
                        :
                        null
                }
                <ButtonToolbar className={classRequired}>
                    <OverlayTrigger
                        trigger={['click', 'hover', 'focus']}
                        rootClose placement="bottom"
                        overlay={popoverRight}
                        container={this}>
                        <span className={"dropdown-toggle" + classHiddenRequired}
                           onClick={this.onClickShowMessageError.bind(this)}> </span>
                    </OverlayTrigger>
                </ButtonToolbar>
            </div>

        )
    }
}

CustomerInputComponent.propTypes = {
    Code: PropTypes.string,
    Required: PropTypes.bool,
    RequiredEmail: PropTypes.bool,
    Label: PropTypes.string,
    IsOptional: PropTypes.bool,
    DefaultValue: PropTypes.string,
    MaxLength: PropTypes.number,
    OneRow: PropTypes.bool,
    GoogleSuggest: PropTypes.bool,
    setLocationInfo: PropTypes.func,
};