import React from 'react';
import CoreComponent from '../../CoreComponent';

export default class AbstractListItem extends CoreComponent {
    template() {
        return (
            <tr>
                {
                    this.props.columns.map((column, index) => <td key={index}>{this.props.data[column.name]}</td>)
                }
            </tr>
        )
    }
}