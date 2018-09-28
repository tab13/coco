import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from "react-dom";

class TriggerWrapper extends Component {
    constructor(props) {
        super(props);
        this.onShow = this.onShow.bind(this);
    }

    onShow(e) {
        e.stopPropagation();
        const {showPopover} = this.props;
        const coords = this.triggerWrapper ? this.triggerWrapper.getBoundingClientRect() : undefined;
        const Popover = ReactDOM.findDOMNode(this._reactInternalFiber.stateNode);
        showPopover(coords, Popover ? Popover.parentElement.getBoundingClientRect() : false);
    }

    render() {
        const {
            children
        } = this.props;

        return (
            <Fragment>
                <span
                    onClick={this.onShow}
                    role="button"
                    tabIndex={0}
                    ref={wrapper => {
                        this.triggerWrapper = wrapper;
                    }}
                >
                 {(
                     React.Children.map(children, child =>
                         React.cloneElement(
                             child,
                             {}
                         )
                     )
                 )}
                </span>
            </Fragment>
        );
    }
}

TriggerWrapper.displayName = 'TriggerWrapper';

TriggerWrapper.defaultProps = {
    children: undefined,
};

TriggerWrapper.propTypes = {
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.element)]),
};

export default TriggerWrapper;
