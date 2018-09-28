import React from 'react';
import IconEdit from 'react-icons/lib/md/edit';
import NumPad from './NumPad';
import { KeyPad } from '../elements';

/**
 * Default validation
 * @type {{float: function(): boolean, negative: function(): boolean}}
 */
const DefaultValidation = {
    float: () => true,
    negative: () => true,
};

/**
 * Positive validation
 * @type {{float: function(): boolean, negative: function(*=): boolean}}
 */
const PositiveValidation = {
    float: () => true,
    negative: value => parseInt(value, 10) > 0,
};

/**
 * Integer validation
 * @type {{float: function(*=): boolean, negative: function(): boolean}}
 */
const IntegerValidation = {
    float: value => parseFloat(value) % 1 === 0,
    negative: () => true,
};

/**
 * Positive integer validation
 * @type {{float: function(*=): boolean, negative: function(*=): boolean}}
 */
const PositiveIntegerValidation = {
    float: value => parseFloat(value) % 1 === 0,
    negative: value => parseInt(value, 10) > 0,
};

/**
 * init default prop validation
 * @param Validation
 * @returns {{element, validation: function(*): boolean, formatInputValue: function(*): string, keyValid: keyValid, displayRule: function(*): string, inputButtonContent: *}}
 */
const defaultProps = Validation => ({
  element: KeyPad,
  validation: value => value.length > 0,
  formatInputValue: value => value.toString().replace(/\D+/g, ''),
  keyValid: (value = '', key) => {
    let next;
    if (key === '-') {
      next = value.charAt(0) === '-' ? value.substr(1) : key + value;
    } else {
      next = key === '.' ? value + key + 1 : value + key;
    }
    // eslint-disable-next-line no-restricted-globals
    return !isNaN(next) && Validation.float(next) && Validation.negative(next);
  },
  displayRule: value => value,
  inputButtonContent: <IconEdit />,
});

const Number = NumPad(defaultProps(DefaultValidation));
const PositiveNumber = NumPad(defaultProps(PositiveValidation));
const IntegerNumber = NumPad(defaultProps(IntegerValidation));
const PositiveIntegerNumber = NumPad(defaultProps(PositiveIntegerValidation));

export { Number, PositiveNumber, IntegerNumber, PositiveIntegerNumber };
