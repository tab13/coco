import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';

const KeypadButton = styled(Button)`
  && {
    font-size: 20px;
    padding: 0px;
    border-radius: 0;
    width: 33%;
    float: left;
    text-align: center;
    border-right: 1px solid #dfe1e4;
    color: #1d1d1d;
  }
`;

const ButtonWrapper = ({value, click, disabled}) => (
    <KeypadButton onClick={() => click(value)} disabled={disabled}>
        {value}
    </KeypadButton>
);

ButtonWrapper.defaultProps = {
    value: undefined,
    disabled: false,
};

ButtonWrapper.propTypes = {
    click: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    disabled: PropTypes.bool,
};

export default ButtonWrapper;
