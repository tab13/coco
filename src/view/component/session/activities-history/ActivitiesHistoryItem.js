import React from "react";
import moment from 'moment';
import CoreComponent from "../../../../framework/component/CoreComponent";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import ComponentFactory from '../../../../framework/factory/ComponentFactory';
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import DateTimeHelper from "../../../../helper/DateTimeHelper";
import SessionConstant from "../../../constant/SessionConstant";

export class ActivitiesHistoryItemComponent extends CoreComponent {
    static className = 'ActivitiesHistoryItemComponent';

    template() {
        let {transaction} = this.props;
        if (transaction.value === 0) {
            return null;
        }
        let currencyCode = transaction.transaction_currency_code;
        let date_time = moment(DateTimeHelper.convertDatabaseDateTimeToLocalDate(transaction.updated_at)).format('LLL');
        let value = transaction.type === SessionConstant.CASH_TRANSACTION_ADD ?
                    "+" + CurrencyHelper.format(transaction.value, currencyCode) :
                    "-" + CurrencyHelper.format(transaction.value, currencyCode);
        let title = transaction.note;
        return (
            <div className="subitem">
                <span className="datetime pull-left">{date_time}</span>
                <span className="price pull-right">{value}</span>
                <span className="title">{title}</span>
            </div>
        )
    }
}

class ActivitiesHistoryItemComponentContainer extends CoreContainer {
    static className = 'ActivitiesHistoryItemComponentContainer';
}

export default ContainerFactory.get(ActivitiesHistoryItemComponentContainer).withRouter(
    ComponentFactory.get(ActivitiesHistoryItemComponent)
);