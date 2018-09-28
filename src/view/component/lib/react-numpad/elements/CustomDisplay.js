import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  border: none;
  background: white;
  border-radius: 10px;
    border: none;
    box-shadow: none;  
    padding: 20px 20px 15px;
`;

const Input = styled.input`
  height: 60px;
    display: block;
    border-radius: 0;
    background-color: transparent;
    width: 100%;
    border: none;
    padding: 0 3px;
    box-shadow: none;
    pointer-events: none;
  font-size: 36px;
    color: #1d1d1d;
    text-align: right;
    font-weight: normal;
`;
const Display = styled.div`
  flex-grow: 1;
  border-radius: 10px;
    border: none;
    box-shadow: none;
    padding: 0;
    text-align: right;
    position: relative;
`;

const CustomDisplayWrapper = ({value, displayRule, dateFormat}) => (
    <Wrapper>
        <Display>
            <Input value={displayRule(value, dateFormat)} readOnly autoFocus/>
        </Display>
    </Wrapper>
);

CustomDisplayWrapper.propTypes = {
    value: PropTypes.string.isRequired,
    displayRule: PropTypes.func.isRequired,
    dateFormat: PropTypes.string,
    cancel: PropTypes.func,
};

CustomDisplayWrapper.defaultProps = {
    dateFormat: 'MM/DD/YYYY',
    cancel: () => {
    },
};

export default CustomDisplayWrapper;
