import React from "react";
import ComponentFactory from '../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import CoreComponent from "../../../../framework/component/CoreComponent";
import SessionConstant from "../../../constant/SessionConstant";
import SessionService from "../../../../service/session/SessionService";
import CurrencyHelper from "../../../../helper/CurrencyHelper";

export class Session extends CoreComponent {
    static className = 'Session';

    /**
     * handle select session
     * @param session
     */
    selectSession(session) {
        this.props.selectSession(session);
    }

    /**
     * template
     * @returns {*}
     */
    template() {
        let {session, isActive} = this.props;
        let openDate = SessionService.getDisplayDate(session.opened_at);
        let closeDate = session.closed_at ? SessionService.getDisplayDate(session.closed_at) : '';
        let openTime = SessionService.getDisplayTime(session.opened_at);
        let closeTime = session.closed_at ? SessionService.getDisplayTime(session.closed_at) : '';
        let netAmount = CurrencyHelper.format(SessionService.getNetAmount(session), session.shift_currency_code);
        
        return (
            <li className={"item " + (isActive ? 'active' : '')}
                onClick={() => this.selectSession(session)}>
                <div className="item-info">
                    <div className="name">
                        <span className="value">
                            {openDate}{(closeDate && closeDate !== openDate) ? (' - ' + closeDate) : ''}
                        </span>
                        <span className="date">
                            {openTime}{(closeTime) ? (' - ' + closeTime) : ''}
                            </span>
                        {
                            session.status === SessionConstant.SESSION_OPEN ?
                                <span className="status">{this.props.t("In Progress")}</span>
                                :
                                null
                        }
                    </div>
                    <div className="price">
                        <span className="value">{netAmount}</span>
                    </div>
                </div>
            </li>
        );
    }
}

class SessionContainer extends CoreContainer {
    static className = 'SessionContainer';
}

/**
 * @type {Session}
 */
export default ContainerFactory.get(SessionContainer).withRouter(
    ComponentFactory.get(Session)
);