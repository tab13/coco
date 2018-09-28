// @flow
import 'babel-polyfill';
import React from 'react';
import { CreditCardForm } from './CreditCardForm';
import {ButtonToolbar, Popover, OverlayTrigger} from "react-bootstrap";

import {
  DangerText,
  HiddenNumberStyle,
  NumberWrapper,
  CIDWrapper,
  Label
} from './utils/styles';

import "./utils/popup.css"

export class CreditCardFormNPayViaEmail extends CreditCardForm {
  toggleModeBtn;
  containerEmail;
  containerCCNumber;
  containerCardExpiry;
  containerCardCVC;
  containerCardZip;

  /**
   * get container CCNumber
   * @param ref
   */
  getContainerCCNumber(ref) {
      this.containerCCNumber = ref
  }

  /**
   * get container CardExpiry
   * @param ref
   */
  getContainerCardExpiry(ref) {
      this.containerCardExpiry = ref
  }

  /**
   * get container CardCVC
   * @param ref
   */
  getContainerCardCVC(ref) {
      this.containerCardCVC = ref
  }

  /**
   * get container CardZip
   * @param ref
   */
  getContainerCardZip(ref) {
      this.containerCardZip = ref
  }

  /**
   * get container Email
   * @param ref
   */
  getContainerEmail(ref) {
      this.containerEmail = ref
  }

  toggleMode = async () => {
    await this.setState({
      isCardMode: !this.state.isCardMode
    });

    const { afterValidateCard } = this.props;
    afterValidateCard && afterValidateCard(this.formIsValid());
  };

  setEmail = async email => {
    this.toggleModeBtn.click();
    this.emailField.value = email;
    this.handleEmailChange()({ target: { value: email } });
    this.handleEmailBlur()({ target: { value: email } });
  };

  setToggleModeBtn = toggleModeBtn => {
    this.toggleModeBtn = toggleModeBtn;
  };

  isEmail = email => {
    let re = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)?@[a-z][a-zA-Z-0-9]*\.[a-z][a-z]+(\.[a-z]+)?$/;
    return re.test(String(email).toLowerCase());
  };

  handleEmailBlur = ({ onBlur }: { onBlur?: ?Function } = { onBlur: null }) => (
    e: SyntheticInputEvent<*>
  ) => {
    const { value } = e.target;
    if (!this.isEmail(value)) {
        let message = value.length
            ? 'Please enter a valid email address'
            : 'This is a required filed';
        this.setFieldInvalid(message, {
            state: 'ccEmailErrorText'
        });
        this.setState({errorMessageEmail: this.translate(message), showErrorMessageEmail: true});
    } else {
        this.setState({showErrorMessageEmail: false});
        this.setFieldValid({ state: 'ccEmailErrorText' });
    }
    const { emailInputProps } = this.props;
    emailInputProps.onBlur && emailInputProps.onBlur(e);
    onBlur && onBlur(e);
  };

  handleEmailChange = (
    { onChange }: { onChange?: ?Function } = { onChange: null }
  ) => (e: SyntheticInputEvent<*>) => {
    this.setState({showErrorMessageEmail: false});
    if (!this.isEmail(e.target.value) && this.props.autoFocus) {
        this.setFieldInvalid('Please enter a valid email address', {
            state: 'ccEmailErrorText'
        });
        this.setState({errorMessageEmail: this.translate('Please enter a valid email address'), showErrorMessageEmail: true});
    } else {
        this.setFieldValid({ state: 'ccEmailErrorText' });
    }
    const { emailInputProps } = this.props;
    emailInputProps.onChange && emailInputProps.onChange(e);
    onChange && onChange(e);
  };

  handleEmailKeyPress = (e: any) => {};

  /**
   * popover view
   * @param message
   */
  popoverView(message) {
    return (
        <Popover id="popover">
          <div>
              { message }
          </div>
        </Popover>
    );
  }

  render = () => {
    const {
      ccNumberErrorText,
      ccExpDateErrorText,
      ccCIDErrorText,
      ccZipErrorText,
      errorMessageCCNumber,
      errorMessageCardExpiry,
      errorMessageCardCVC,
      errorMessageCardZip,
      errorMessageEmail,
      showErrorMessageCCNumber,
      showErrorMessageCardExpiry,
      showErrorMessageCardCVC,
      showErrorMessageCardZip,
      showErrorMessageEmail,
      isReadyToSwipe
    } = this.state;
    const {
      cardNameInputProps,
      cardCVCInputProps,
      cardZipInputProps,
      cardExpiryInputProps,
      cardNumberInputProps,
      emailInputProps,
      cardCVCInputRenderer,
      cardExpiryInputRenderer,
      cardNumberInputRenderer,
      cardZipInputRenderer,
      containerClassName,
      containerStyle,
      controlClassName,
      showError,
      dangerTextClassName,
      dangerTextStyle,
      enableZipInput,
      inputClassName
    } = this.props;
    const popoverEmail = this.popoverView(errorMessageEmail);
    const popoverCCNumber = this.popoverView(errorMessageCCNumber);
    const popoverCardExpiry = this.popoverView(errorMessageCardExpiry);
    const popoverCardCVC = this.popoverView(errorMessageCardCVC);
    const popoverCardZip = this.popoverView(errorMessageCardZip);
    return (
      <div className={containerClassName} styled={containerStyle}>
        <input
          type="checkbox"
          name=""
          id={controlClassName}
          className={controlClassName}
        />
        <label
          className="toggle"
          htmlFor={controlClassName}
          ref={this.setToggleModeBtn}
          onClick={this.toggleMode}
        >
          <span className="text-left custom-control-label">
            {this.translate('Pay by Card')}
          </span>
          <span className="text-right custom-control-label">
            {this.translate('Pay by Email')}
          </span>
        </label>

        <div role="tabpanel" className="tab-pane by-card">
          <div className="button-swipe">
            <button
              className={'btn ' + (isReadyToSwipe ? 'active' : '')}
              onClick={this.toggleSwipe}
            >
              {isReadyToSwipe
                ? this.translate('Ready to swipe')
                : this.translate('Click to swipe card')}
            </button>
          </div>
          <div className="form-group">
            <Label onClick={() => this.cardNameField.focus()}>
              {this.translate('Name on Card')}
            </Label>
            {this.inputRenderer({
              props: {
                id: 'name-on-card',
                ref: cardNameField => {
                  this.cardNameField = cardNameField;
                },
                className: `form-control ${inputClassName}`,
                type: 'text',
                autoComplete: 'off',
                ...cardNameInputProps,
                style: { textTransform: 'uppercase' },
                onKeyUp: this.handleCardNameKeyUp
              }
            })}
          </div>
          <div className="row">
            <div className="col-xs-8">
              <div className="form-group last" ref={this.getContainerCCNumber.bind(this)}>
                <Label onClick={() => this.cardNumberField.focus()}>
                  {this.translate('Card Number')}
                </Label>
                <NumberWrapper>
                  {this.inputRenderer({
                    props: {
                      id: 'ccHiddenNumber',
                      ref: cardHiddenNumberField => {
                        this.cardHiddenNumberField = cardHiddenNumberField;
                      },
                      tabIndex: '-1',
                      autoComplete: 'off',
                      className: `cc-hidden-number`,
                      style: HiddenNumberStyle,
                      placeholder: '',
                      type: 'text',
                      onKeyUp: this.handleCardHiddenNumberKeyUp
                    }
                  })}
                  {cardNumberInputRenderer({
                    handleCardNumberChange: onChange =>
                      this.handleCardNumberChange({ onChange }),
                    handleCardNumberBlur: onBlur =>
                      this.handleCardNumberBlur({ onBlur }),
                    props: {
                      id: 'ccNumber',
                      ref: cardNumberField => {
                        this.cardNumberField = cardNumberField;
                      },
                      autoComplete: 'off',
                      className: `form-control ${inputClassName}`,
                      type: 'text',
                      ...cardNumberInputProps,
                      onBlur: this.handleCardNumberBlur(),
                      onChange: this.handleCardNumberChange(),
                      onKeyPress: this.handleCardNumberKeyPress,
                      onKeyUp: this.handleCardNumberKeyUp
                    }
                  })}
                  {this.inputRenderer({
                    props: {
                      id: 'ccNumberdMasked',
                      ref: cardNumberdMaskedField => {
                        this.cardNumberdMaskedField = cardNumberdMaskedField;
                      },
                      tabIndex: '-1',
                      autoComplete: 'off',
                      type: 'text'
                    }
                  })}
                  {this.inputRenderer({
                    props: {
                      id: 'ccNumberdUnmasked',
                      ref: cardNumberdUnmaskedField => {
                        this.cardNumberdUnmaskedField = cardNumberdUnmaskedField;
                      },
                      type: 'text',
                      tabIndex: '-1',
                      autoComplete: 'off',
                      readOnly: true
                    }
                  })}
                </NumberWrapper>
                <ButtonToolbar className={showErrorMessageCCNumber ? "validation-advice" : ""}>
                  <OverlayTrigger
                      trigger={['click', 'hover', 'focus']}
                      rootClose placement="bottom"
                      overlay={popoverCCNumber}
                      container={this.containerCCNumber}>
                        <span className={"dropdown-toggle"}
                        > </span>
                  </OverlayTrigger>
                </ButtonToolbar>
              </div>
            </div>
            <div className="col-xs-2">
              <div className="form-group last" ref={this.getContainerCardExpiry.bind(this)}>
                <Label onClick={() => this.cardExpiryField.focus()}>
                  {this.translate('Exp Date')}
                </Label>
                {cardExpiryInputRenderer({
                  handleCardExpiryChange: onChange =>
                    this.handleCardExpiryChange({ onChange }),
                  handleCardExpiryBlur: onBlur =>
                    this.handleCardExpiryBlur({ onBlur }),
                  props: {
                    id: 'ccExpDate',
                    ref: cardExpiryField => {
                      this.cardExpiryField = cardExpiryField;
                    },
                    autoComplete: 'off',
                    className: `form-control ${inputClassName}`,
                    placeholder: 'MM/YY',
                    type: 'text',
                    ...cardExpiryInputProps,
                    onBlur: this.handleCardExpiryBlur(),
                    onChange: this.handleCardExpiryChange(),
                    onKeyDown: this.handleKeyDown(this.cardNumberField),
                    onKeyPress: this.handleCardExpiryKeyPress,
                    onKeyUp: this.handleCardExpiryKeyUp
                  }
                })}
                <ButtonToolbar className={showErrorMessageCardExpiry ? "validation-advice" : ""}>
                  <OverlayTrigger
                      trigger={['click', 'hover', 'focus']}
                      rootClose placement="bottom"
                      overlay={popoverCardExpiry}
                      container={this.containerCardExpiry}>
                        <span className={"dropdown-toggle"}
                        > </span>
                  </OverlayTrigger>
                </ButtonToolbar>
              </div>
            </div>
            <div className="col-xs-2">
              <div className="form-group last" ref={this.getContainerCardCVC.bind(this)}>
                <Label onClick={() => this.cvcField.focus()}>
                  {this.translate('CSC')}
                </Label>
                <CIDWrapper>
                  {cardCVCInputRenderer({
                    handleCardCVCChange: onChange =>
                      this.handleCardCVCChange({ onChange }),
                    handleCardCVCBlur: onBlur =>
                      this.handleCardCVCBlur({ onBlur }),
                    props: {
                      id: 'ccCID',
                      ref: cvcField => {
                        this.cvcField = cvcField;
                      },
                      autoComplete: 'off',
                      className: `form-control ${inputClassName}`,
                      pattern: '[0-9]*',
                      placeholder: '',
                      type: 'number',
                      ...cardCVCInputProps,
                      onBlur: this.handleCardCVCBlur(),
                      onChange: this.handleCardCVCChange(),
                      onKeyDown: this.handleKeyDown(this.cardExpiryField),
                      onKeyPress: this.handleCardCVCKeyPress,
                      onKeyUp: this.handleCardCVCKeyUp
                    }
                  })}
                  {this.inputRenderer({
                    props: {
                      ref: cvcMaskedField => {
                        this.cvcMaskedField = cvcMaskedField;
                      },
                      className: `form-control`,
                      tabIndex: '-1',
                      autoComplete: 'off',
                      type: 'text'
                    }
                  })}
                </CIDWrapper>
                <ButtonToolbar className={showErrorMessageCardCVC ? "validation-advice" : ""}>
                  <OverlayTrigger
                      trigger={['click', 'hover', 'focus']}
                      rootClose placement="bottom"
                      overlay={popoverCardCVC}
                      container={this.containerCardCVC}>
                        <span className={"dropdown-toggle"}
                        > </span>
                  </OverlayTrigger>
                </ButtonToolbar>
              </div>
            </div>
          </div>
          {enableZipInput && (
            <div className="row">
              <div className="col-xs-2">
                <div className="form-group last" ref={this.getContainerCardZip.bind(this)}>
                  <Label onClick={() => this.zipField.focus()}>
                    {this.translate('Zip')}
                  </Label>
                  {cardZipInputRenderer({
                    handleCardZipChange: onChange =>
                      this.handleCardZipChange({ onChange }),
                    handleCardZipBlur: onBlur =>
                      this.handleCardZipBlur({ onBlur }),
                    props: {
                      id: 'zip',
                      ref: zipField => {
                        this.zipField = zipField;
                      },
                      className: `form-control ${inputClassName}`,
                      pattern: '[0-9]*',
                      placeholder: '',
                      type: 'text',
                      ...cardZipInputProps,
                      onBlur: this.handleCardZipBlur(),
                      onChange: this.handleCardZipChange(),
                      onKeyDown: this.handleKeyDown(this.cvcField),
                      onKeyPress: this.handleCardZipKeyPress
                    }
                  })}
                  <ButtonToolbar className={showErrorMessageCardZip ? "validation-advice" : ""}>
                    <OverlayTrigger
                        trigger={['click', 'hover', 'focus']}
                        rootClose placement="bottom"
                        overlay={popoverCardZip}
                        container={this.containerCardZip}>
                        <span className={"dropdown-toggle"}
                        > </span>
                    </OverlayTrigger>
                  </ButtonToolbar>
                </div>
              </div>
            </div>
          )}
          {showError && (
            <DangerText
              className={dangerTextClassName}
              styled={dangerTextStyle}
            >
              {ccNumberErrorText ||
                ccExpDateErrorText ||
                ccCIDErrorText ||
                ccZipErrorText}
            </DangerText>
          )}
        </div>
        <div role="tabpanel" className="tab-pane by-email">
          <div className="form-group last" ref={this.getContainerEmail.bind(this)}>
            <Label onClick={() => this.emailField.focus()}>
              {this.translate('Email')}
            </Label>
            {this.inputRenderer({
              props: {
                id: 'ccEmail',
                ref: emailField => {
                  this.emailField = emailField;
                },
                className: `form-control ${inputClassName}`,
                placeholder: 'email@company.com',
                type: 'email',
                ...emailInputProps,
                onBlur: this.handleEmailBlur(),
                onChange: this.handleEmailChange(),
                onKeyDown: this.handleKeyDown(this.emailField),
                onKeyPress: this.handleEmailKeyPress
              }
            })}
            <ButtonToolbar className={showErrorMessageEmail ? "validation-advice" : ""}>
              <OverlayTrigger
                  trigger={['click', 'hover', 'focus']}
                  rootClose placement="bottom"
                  overlay={popoverEmail}
                  container={this.containerEmail}>
                        <span className={"dropdown-toggle"}
                              > </span>
              </OverlayTrigger>
            </ButtonToolbar>
          </div>
        </div>
      </div>
    );
  };
}
