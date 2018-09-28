import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';
import styled, { injectGlobal, ThemeProvider } from 'styled-components';
import Slide from '@material-ui/core/Slide';
import { CustomInputField, Wrapper } from '../elements';
import globalCSS from '../styles/global-css';
import styles from '../styles';
import updateCoords, {HEIGHT, WIDTH, MAX_BOTTOM, MIN_TOP, toCss} from '../helper';

injectGlobal`${globalCSS}`; // eslint-disable-line no-unused-expressions

const Faded = styled.div`
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  opacity: 0.5;
  display: block;
  z-index: 10000;
  background-color: #000;
  position: fixed;
  box-sizing: border-box;
  line-height: 21.4286px;
  text-rendering: optimizeLegibility;
  text-size-adjust: 100%;
  transition-delay: 0s;
  transition-duration: 0.15s;
  transition-property: opacity;
  transition-timing-function: linear;
  word-wrap: break-word;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
`;

/**
 * get transition by position constructor
 * @param show
 * @param position
 * @returns {{transition: React.ComponentType<SlideProps>, transitionProps: {in: *, direction: string, mountOnEnter: boolean, unmountOnExit: boolean}}}
 */
export const getTransition = (show, position) => {
    let transition = Slide;
    let transitionProps = {
        in: show,
        direction: 'up',
        mountOnEnter: true,
        unmountOnExit: true,
    };
    if (position === 'flex-start') {
        transitionProps.direction = 'down';
    }
    if (position !== 'flex-start' && position !== 'flex-end') {
        transition = 'span';
        transitionProps = {};
    }
    return { transition, transitionProps };
};

export default ({
                    element,
                    validation,
                    formatInputValue,
                    displayRule,
                    inputButtonContent,
                    keyValid,
                }) => {
    class CustomNumPad extends Component {
        constructor(props) {
            super(props);
            this.state = {
                show: false,
                value: formatInputValue(0),
            };
            this.toggleKeyPad = this.toggleKeyPad.bind(this);
            this.confirm = this.confirm.bind(this);
            this.update = this.update.bind(this);
        }

        /**
         * component will receive props
         * @param nextProps
         */
        componentWillReceiveProps(nextProps) {
            if (this.props.value !== nextProps.value) {
                this.setState({
                    value: formatInputValue(nextProps.value),
                });
            }
        }

        /**
         * toggle key pad
         * @param coords
         * @param parent
         */
        toggleKeyPad(coords = {}, parent) {
            const { position, minTop, maxBottom } = this.props;
            const inputCoords =
                !this.state.show && updateCoords[position]
                    ? toCss(coords, position, minTop || (parent ? parent.y : 0), maxBottom, this.props)
                    : undefined;
            this.setState(prevState => ({ show: !prevState.show, inputCoords, coords, value: formatInputValue(0) }));
        }

        /**
         * update value display
         * @param value
         */
        update(value) {
            const { dateFormat, onChange } = this.props;
            onChange(displayRule(value, dateFormat));
        }

        /**
         * confirm value input by validate
         * @param value
         */
        confirm(value) {
            let updateValue = {};
            if (this.state.show && validation(value)) {
                updateValue = { value };
                this.update(value);
            }
            this.setState(prevState => Object.assign({}, { show: !prevState.show }, updateValue));
        }

        /**
         * render
         * @returns {*}
         */
        render() {
            const { show, value, inputCoords } = this.state;

            const {
                placeholder,
                label,
                theme,
                dateFormat,
                locale,
                weekOffset,
                markers,
                dates,
                minDate,
                maxDate,
                position,
                sync,
                isDecimal,
                arrow,
                terminalAlign,
                width,
                height,
            } = this.props;
            const customTheme = typeof theme === 'object' ? theme : styles(theme);
            customTheme.position = position;
            customTheme.coords = inputCoords;

            const display = position !== 'flex-start' && position !== 'flex-end' ? show : true;
            const { transition, transitionProps } = getTransition(show, position);

            return (
                <Fragment>
                    <ThemeProvider theme={customTheme}>
                        <CustomInputField
                            placeholder={placeholder}
                            showKeyPad={this.toggleKeyPad}
                            inputValue={value}
                            dateFormat={dateFormat}
                            displayRule={displayRule}
                            label={label}
                            disabled={this.state.show}
                            buttonContent={inputButtonContent}
                        >
                            {this.props.children}
                        </CustomInputField>
                    </ThemeProvider>
                    <Portal>
                        {display && <Faded />}
                        {display &&
                        React.createElement(
                            transition,
                            transitionProps,
                            <ThemeProvider theme={customTheme}>
                                <Wrapper show width={width} height={height} theme={customTheme}>
                                    {React.createElement(
                                        element,
                                        {
                                            cancel: this.toggleKeyPad,
                                            confirm: this.confirm,
                                            update: this.update,
                                            eventTypes: ['click', 'touchend'],
                                            displayRule,
                                            validation,
                                            keyValid,
                                            label,
                                            locale,
                                            markers,
                                            dates,
                                            weekOffset,
                                            dateFormat,
                                            minDate,
                                            maxDate,
                                            value,
                                            sync,
                                            isDecimal,
                                            coords: this.state.coords,
                                            arrow,
                                            terminalAlign,
                                            width,
                                            height,
                                        },
                                        null
                                    )}
                                </Wrapper>
                            </ThemeProvider>
                        )}
                    </Portal>
                </Fragment>
            );
        }
    }

    CustomNumPad.defaultProps = {
        children: undefined,
        placeholder: undefined,
        position: 'flex-end',
        label: undefined,
        theme: undefined,
        dateFormat: 'MM/DD/YYYY',
        weekOffset: 0,
        locale: 'en',
        value: '',
        minDate: undefined,
        maxDate: undefined,
        sync: false,
        markers: [],
        dates: {},
        isDecimal: false,
        arrow: false,
        terminalAlign: 'center',
        width: WIDTH,
        height: HEIGHT,
        minTop: MIN_TOP,
        maxBottom: MAX_BOTTOM,
    };

    CustomNumPad.propTypes = {
        onChange: PropTypes.func.isRequired,
        children: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.element)]),
        placeholder: PropTypes.string,
        position: PropTypes.string,
        label: PropTypes.string,
        locale: PropTypes.string,
        theme: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        dateFormat: PropTypes.string,
        weekOffset: PropTypes.number,
        markers: PropTypes.arrayOf(PropTypes.string),
        dates: PropTypes.objectOf(PropTypes.array),
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        minDate: PropTypes.string,
        maxDate: PropTypes.string,
        sync: PropTypes.bool,
        isDecimal: PropTypes.bool,
        arrow: PropTypes.oneOf(['left', 'right', false]),
        terminalAlign: PropTypes.oneOf(['left', 'right', 'center']),
        width: PropTypes.number,
        height: PropTypes.number,
        minTop: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
        maxBottom: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
    };

    return CustomNumPad;
};
