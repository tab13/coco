/* eslint-disable jsx-a11y/label-has-for */
import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

class CustomInputField extends Component {
    constructor(props) {
        super(props);
        this.onShowKeyPad = this.onShowKeyPad.bind(this);
    }

    /**
     * check to show or hidden key pad
     */
    onShowKeyPad() {
        const {showKeyPad} = this.props;
        if (this.input) {
            this.input.blur();
        }
        const inputCoords = this.inputWrapper ? this.inputWrapper.getBoundingClientRect() : undefined;
        const keyPad = ReactDOM.findDOMNode(this._reactInternalFiber.stateNode); //eslint-disable-line
        showKeyPad(inputCoords, keyPad ? keyPad.parentElement.getBoundingClientRect() : false);
    }

    render() {
        const {
            placeholder,
            inputValue,
            dateFormat,
            displayRule,
            label,
            disabled,
            buttonContent,
            children,
        } = this.props;

        return (
            <Fragment>
                {label && <label disabled={disabled}>{label}</label>}
                <span
                    className="wrapper-numpad"
                    onClick={this.onShowKeyPad}
                    onKeyPress={this.onShowKeyPad}
                    role="button"
                    tabIndex={0}
                    ref={wrapper => {
                        this.inputWrapper = wrapper;
                    }}
                >
          {children ? (
              React.Children.map(children, child =>
                  React.cloneElement(
                      child,
                      child.type === 'input'
                          ? {
                              placeholder,
                              value: inputValue ? displayRule(inputValue, dateFormat) : inputValue,
                              disabled,
                              tabIndex: -1,
                              readOnly: true,
                              ref: input => {
                                  this.input = input;
                              },
                          }
                          : {}
                  )
              )
          ) : (
              <Fragment>
                  <input
                      style={{outline: 'none'}}
                      ref={input => {
                          this.input = input;
                      }}
                      placeholder={placeholder}
                      value={inputValue ? displayRule(inputValue, dateFormat) : inputValue}
                      disabled={disabled}
                      tabIndex={-1}
                      readOnly
                  />
                  {buttonContent && <button tabIndex={-1}>{buttonContent}</button>}
              </Fragment>
          )}
        </span>
            </Fragment>
        );
    }
}

CustomInputField.displayName = 'CustomInputField';

CustomInputField.defaultProps = {
    placeholder: '',
    inputValue: '',
    dateFormat: 'MM/DD/YYYY',
    label: '',
    disabled: false,
    buttonContent: undefined,
    children: undefined,
};

CustomInputField.propTypes = {
    showKeyPad: PropTypes.func.isRequired,
    displayRule: PropTypes.func.isRequired,
    dateFormat: PropTypes.string,
    inputValue: PropTypes.string,
    placeholder: PropTypes.string,
    label: PropTypes.string,
    disabled: PropTypes.bool,
    buttonContent: PropTypes.element,
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.element)]),
};

export default CustomInputField;
