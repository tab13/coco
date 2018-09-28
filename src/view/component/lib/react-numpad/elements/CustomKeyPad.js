import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import onClickOutside from 'react-onclickoutside';

import Button from './KeypadButton';
import CustomDisplay from './CustomDisplay';
import {media} from '../styles/media-templates';
import MdBackspace from 'react-icons/lib/md/backspace';
import {PADDING} from "../helper";
import {WIDTH, HEIGHT} from "../helper/index";

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: ${WIDTH}px;
  ${media.mobile`width: 100%;`} 
  height: ${HEIGHT}px;
  background: ${props => props.theme.body.backgroundColor};
  transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 45px, rgba(0, 0, 0, 0.22) 0px 10px 18px;
  border-radius: 10px;
  border: none;
  box-shadow: none;
`;

const Keys = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-grow: 1;
  button {
    border-bottom: 1px solid #ddd;
    border-right: 1px solid #ddd;
  }
  button:nth-child(3n) {
    border-right: none;
  }
  button:nth-child(-n + 3) {
    border-top: 1px solid #ddd;
  }
  button:nth-child(10) {
    border-bottom: none;
  }
  button:nth-child(11) {
    border-bottom: none;
  }
  button:nth-child(12) {
    border-bottom: none;
  }
  font-size: 20px;
  color: #1d1d1d;
  text-align: center;
`;

const Backspace = styled.button`
  background: none;
  cursor: pointer;
  border: none;
  outline: none;
  font-size: 1.6em;
  padding: 0px 2px 0px 0px;
  color: ${props => props.theme.header.primaryColor};
  width: 33%;
  &:hover ${this} {
    text-decoration: none;
    background-color: rgba(0, 0, 0, 0.12);
  }
  
  font-size: 20px;
  color: #1d1d1d;
  text-align: center;
`;

export const Arrow = styled.div`
  border-width: ${PADDING}px;
  position: fixed;
  z-index: 10000;
  display: block;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;
  border-right-color: ${props => {
    if (props.arrow === 'left') {
      return 'transparent';
    }
    return '#fff';
  }};
  border-left-width: ${props => {
    if (props.arrow === 'left') {
      return '11px';
    }
    return '0';
  }};
  border-left-color: ${props => {
    if (props.arrow === 'left') {
      return '#fff';
    }
    return 'transparent';
  }};
  border-right-width: ${props => {
    if (props.arrow === 'left') {
      return '0';
    }
    return '11px';
  }};
  left: ${props => {
    if (props.arrow === 'left') {
      return props ? `${props.coords.left - PADDING - 5}px` : '50%';
    }
    return props ? `${props.coords.left + props.coords.width}px` : '50%';
  }};
  margin-top: -${PADDING}px;
  top: ${props => (props ? `${props.coords.top + props.coords.height / 2}px` : '50%')};
`;

class CustomKeyPad extends Component {

    /**
     * Constructor
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {input: props.value};
        this.handleClick = this.handleClick.bind(this);
        this.keyDown = this.keyDown.bind(this);
        this.cancelLastInsert = this.cancelLastInsert.bind(this);
        this.numericKeys = [...Array(10).keys()];
    }

    /**
     * Component did mount
     */
    componentDidMount() {
        document.addEventListener('keydown', this.keyDown);
    }

    /**
     * Component will update
     *
     * @param nextProps
     * @param nextState
     */
    componentWillUpdate(nextProps, nextState) {
        const {input} = this.state;
        const {sync, validation, update} = this.props;
        if (sync && nextState.input !== input && validation(nextState.input)) {
            update(nextState.input);
        }
    }

    /**
     * Component will unmount
     */
    componentWillUnmount() {
        document.removeEventListener('keydown', this.keyDown);
    }

    /**
     * Handle click out side event
     *
     * @param evt
     */
    handleClickOutside(evt) {
        const {
            contentOnly
        } = this.props;

        if(!contentOnly){
            evt.preventDefault();
            evt.stopPropagation();
            const {validation, confirm, cancel} = this.props;
            const {input} = this.state;
            if (validation(input)) {
                confirm(input);
            } else {
                cancel();
            }
        }
    }

    /**
     * Cancel last insert
     */
    cancelLastInsert() {
        this.setState(prevState => ({input: prevState.input.slice(0, -1)}));
    }

    /**
     * Keydown event
     * @param event
     */
    keyDown(event) {
        const {active} = this.props;
        if(active){
            event.preventDefault();
            const {key} = event;
            const {input} = this.state;
            const {confirm, cancel, validation, finish} = this.props;
            if (key === 'Enter' && validation(input)) {
                confirm(input);
                if((key === 'Enter') && (typeof finish === "function")){
                    finish();
                }
            } else if (key === 'Backspace') {
                this.cancelLastInsert();
            } else if (key === 'Escape') {
                cancel();
            } else if (this.numericKeys.includes(parseInt(key, 10)) || key === '.' || key === '-') {
                this.handleClick(key);
            }
        }
    }

    /**
     * Handle click event
     *
     * @param key
     */
    handleClick(key) {
        if (this.props.keyValid(this.state.input, key, this.props.dateFormat)) {
            if (key === '-') {
                this.setState(prevState => ({
                    input:
                        prevState.input.charAt(0) === '-' ? prevState.input.substr(1) : `-${prevState.input}`,
                }));
            } else {
                this.setState(prevState => ({input: prevState.input + key}));
            }
        }
    }
    getContent(){
        const {
            displayRule,
            theme,
            keyValid,
            dateFormat,
            arrow,
            coords
        } = this.props;

        return (
            <Fragment>
                <CustomDisplay
                    value={this.state.input}
                    displayRule={displayRule}
                    dateFormat={dateFormat}
                    cancel={this.cancelLastInsert}
                />
                <Keys>
                    {[7, 8, 9, 4, 5, 6, 1, 2, 3, '00', 0].map(key => (
                        <Button
                            key={`button-${key}`}
                            theme={theme}
                            click={clickedKey => this.handleClick(clickedKey)}
                            value={key}
                            disabled={!keyValid(this.state.input, key, dateFormat)}
                        />
                    ))}
                    <Backspace onClick={this.cancelLastInsert}>
                        <MdBackspace/>
                    </Backspace>
                </Keys>
                {arrow && <Arrow coords={coords} arrow={arrow}/>}
            </Fragment>
        )
    }
    render() {
        const {
            width,
            height,
            contentOnly
        } = this.props;

        let content = this.getContent();
        return contentOnly ? content :(
            <Content width={width} height={height}>{content}</Content>
        );
    }
}

CustomKeyPad.displayName = 'CustomKeyPad';

CustomKeyPad.propTypes = {
    label: PropTypes.string,
    theme: PropTypes.string,
    confirm: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired,
    displayRule: PropTypes.func.isRequired,
    validation: PropTypes.func.isRequired,
    keyValid: PropTypes.func.isRequired,
    dateFormat: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    sync: PropTypes.bool.isRequired,
    coords: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    arrow: PropTypes.oneOf(['left', 'right', false]),
    width: PropTypes.number,
    height: PropTypes.number,
    active: PropTypes.bool
};

CustomKeyPad.defaultProps = {
    label: undefined,
    theme: undefined,
    dateFormat: 'MM/DD/YYYY',
    value: '',
    coords: false,
    arrow: false,
    width: WIDTH,
    height: HEIGHT,
    active: true
};

export default onClickOutside(CustomKeyPad);
