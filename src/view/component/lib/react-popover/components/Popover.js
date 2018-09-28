import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';
import styles from '../../react-numpad/styles';
import updateCoords, {HEIGHT, MAX_BOTTOM, MIN_TOP, toCss, WIDTH} from '../../react-numpad/helper';
import PopoverWrapper  from '../elements/PopoverWrapper';
import TriggerWrapper  from '../elements/TriggerWrapper';
import {Faded, getTransition}  from '../../react-numpad/components/PopoverNumPad';
import {Arrow}  from '../../react-numpad/elements/CustomKeyPad';
import {ThemeProvider} from "styled-components";

export default ({
    element
}) => {
    class Popover extends Component {
        constructor(props) {
            super(props);
            this.state = {
                show: false
            };
            this.contentComponent = React.createRef();
            this.togglePopover = this.togglePopover.bind(this);
            this.confirm = this.confirm.bind(this);
            this.cancel = this.cancel.bind(this);
            this.handleClickOutside = this.handleClickOutside.bind(this);
        }

        togglePopover(coords = {}, parent) {
            const { position, minTop, maxBottom, useParentCoords } = this.props;

            if(useParentCoords && parent){
                coords = parent;
            }

            const inputCoords =
                !this.state.show && updateCoords[position]
                    ? toCss(coords, position, minTop || (parent ? parent.y : 0), maxBottom, this.props)
                    : undefined;
            this.setState(prevState => ({ show: !prevState.show, inputCoords, coords }));
        }

        confirm() {
            if (this.state.show) {
                let data = this.contentComponent.current.state;
                this.update(data);
            }
            this.cancel();
        }
        update(data){
            const {onChange} = this.props;
            onChange(data);
        }
        cancel(){
            this.setState({ show: false});
        }
        handleClickOutside() {
            this.confirm();
        }

        render() {
            const { show, inputCoords, coords } = this.state;

            const { theme, position, width, height, arrow } = this.props;
            const customTheme = typeof theme === 'object' ? theme : styles(theme);
            customTheme.position = position;
            customTheme.coords = inputCoords;

            const display = position !== 'flex-start' && position !== 'flex-end' ? show : true;
            const { transition, transitionProps } = getTransition(show, position);

            return (
                <Fragment>
                    <ThemeProvider theme={customTheme}>
                        <TriggerWrapper
                            showPopover={this.togglePopover}
                        >
                            {this.props.children}
                        </TriggerWrapper>
                    </ThemeProvider>
                    <Portal>
                        {display && <Faded />}
                        {display &&
                        React.createElement(
                            transition,
                            transitionProps,
                            <ThemeProvider theme={customTheme}>
                                <PopoverWrapper show eventTypes={['click', 'touchend']} onClickOutside={this.handleClickOutside} width={width} height={height} theme={customTheme}>
                                    {React.createElement(
                                        element,
                                        {
                                            ...this.props,
                                            coords: coords,
                                            width,
                                            height,
                                            ref: this.contentComponent,
                                            confirm: this.confirm,
                                            cancel: this.cancel
                                        },
                                        null
                                    )}

                                    {arrow && <Arrow coords={coords} arrow={arrow} />}
                                </PopoverWrapper>
                            </ThemeProvider>
                        )}
                    </Portal>
                </Fragment>
            );
        }
    }

    Popover.defaultProps = {
        children: undefined,
        position: 'flex-end',
        theme: undefined,
        locale: 'en',
        width: WIDTH,
        height: HEIGHT,
        minTop: MIN_TOP,
        maxBottom: MAX_BOTTOM
    };
    Popover.propTypes = {
        onChange: PropTypes.func.isRequired,
        children: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.element)]),
        position: PropTypes.string,
        theme: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        arrow: PropTypes.oneOf(['left', 'right', false]),
        terminalAlign: PropTypes.oneOf(['left', 'right', 'center']),
        width: PropTypes.number,
        height: PropTypes.number,
    };

    return Popover;
};