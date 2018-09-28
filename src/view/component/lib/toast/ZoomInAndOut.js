import React from 'react';
import Transition from 'react-transition-group/Transition';

export const ZoomInAndOut = ({ children, position, ...props }) => (
    <Transition
        {...props}
        timeout={200}
        onEnter={ node => node.classList.add('zoomIn', 'animate')}
        onExit={node => {
            node.classList.remove('zoomIn', 'animate');
            node.classList.add('zoomOut', 'animate');
        }}
    >
        {children}
    </Transition>
);

export default ZoomInAndOut;

