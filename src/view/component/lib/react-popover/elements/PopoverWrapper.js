import React, { Component } from 'react';
import onClickOutside from "react-onclickoutside";
import {BackgroundPanel, Container, Content} from "../../react-numpad/elements/Wrapper";
import PropTypes from "prop-types";
import {HEIGHT, WIDTH} from "../../react-numpad/helper";

class PopoverWrapper extends Component {
    handleClickOutside(evt) {
        evt.preventDefault();
        this.props.onClickOutside(evt);
    }
    render() {
        const {
            width,
            height,
            children
        } = this.props;

        return(
            <BackgroundPanel>
                <Container>
                    <Content width={width} height={height}>
                        {children}
                    </Content>
                </Container>
            </BackgroundPanel>
        );
    }
}

PopoverWrapper.propTypes = {
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    onClickOutside: PropTypes.func
};

PopoverWrapper.defaultProps = {
    width: WIDTH,
    height: HEIGHT,
    onClickOutside: () => {}
};
export default onClickOutside(PopoverWrapper);
