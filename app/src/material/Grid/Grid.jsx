import React, { PropTypes } from 'react';
import classNames from 'classnames'
const propTypes = {
    children: PropTypes.node,
    additionalClasses: PropTypes.string
};

const Grid = (props) => (
    <div className={classNames('mdc-layout-grid', props.additionalClasses)}>
        {props.children}
    </div>
)

Grid.propTypes = propTypes;

export default Grid;