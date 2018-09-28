import React from "react";
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import CoreComponent from "../../../../../framework/component/CoreComponent";
import moment from "moment/moment";
import DateTimeHelper from "../../../../../helper/DateTimeHelper";

export class CommentItem extends CoreComponent {
    static className = 'CommentItem';

    /**
     * template
     * @returns {*}
     */
    template() {
        let {comment} = this.props;
        let date = moment(
            DateTimeHelper.convertDatabaseDateTimeToLocalDate(comment.created_at)
        ).format('L LT');
        return (
            <li>
                <div className="date">{date}</div>
                <div className="comment">
                    {
                        comment.comment
                    }
                </div>
            </li>
        );
    }
}

class CommentItemContainer extends CoreContainer {
    static className = 'CommentItemContainer';
}

/**
 * @type {CommentItem}
 */
export default ContainerFactory.get(CommentItemContainer).withRouter(
    ComponentFactory.get(CommentItem)
);