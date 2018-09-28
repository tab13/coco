import React from "react";
import ComponentFactory from '../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../framework/container/CoreContainer';
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import AbstractGrid from "../../../framework/component/grid/AbstractGrid";
import SessionConstant from "../../constant/SessionConstant";
import Config from "../../../config/Config";
import SmoothScrollbar from "smooth-scrollbar";
import Session from "./session-list/Session";
import SessionAction from "../../action/SessionAction";
import QueryService from "../../../service/QueryService";
import UserService from "../../../service/user/UserService";
import SessionService from "../../../service/session/SessionService";
import SessionHelper from "../../../helper/SessionHelper";
import PermissionConstant from "../../constant/PermissionConstant";
import Permission from "../../../helper/Permission";

export class SessionList extends AbstractGrid {
    static className = 'SessionList';

    setBlockSessionListElement = element => this.session_list = element;

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            items: [],
        }
    }

    /**
     * Component will mount
     */
    componentWillMount() {
        /* Set default state mode for component from Config */
        if (Config.mode) {
            this.setState({mode: Config.mode});
        }
        if (Config.session) {
            /* Load session first time before render session list */
            this.loadSession(SessionConstant.PAGE_SIZE, 1);
            this.startLoading();
        }
    }

    /**
     * This function after mapStateToProps then push more items to component or change load session mode
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (!this.state.mode && this.props.mode) {
            this.setState({mode: nextProps.mode});
        }
        if (!this.state.items.length && nextProps.currentSession) {
            this.addItems([nextProps.currentSession]);
        }
        if (!this.isModeChange(nextProps)) {
            if (
                this.state.mode === nextProps.mode && nextProps.request_mode === this.state.mode
                && nextProps.sessions !== this.props.sessions
            ) {
                if (parseFloat(nextProps.search_criteria.current_page) === 1) {
                    if (!Config.current_session) {
                        let openingSession = nextProps.sessions.find(item =>
                            item.status === SessionConstant.SESSION_OPEN
                            && Number(item.staff_id) === Number(Config.staff_id)
                        );
                        if (openingSession) {
                            SessionService.saveCurrentSession(openingSession);
                            this.props.actions.setCurrentSession(openingSession);
                            this.props.setCurrentPopup(SessionConstant.CLOSE_ALL_POPUP);
                        }
                    }
                    this.addItems(nextProps.sessions);
                    if (nextProps.sessions.length < nextProps.total_count) {
                        this.loadSession(SessionConstant.PAGE_SIZE, 2);
                    }
                    this.selectSession(nextProps.sessions[0]);
                } else {
                    let currentSessionIds = this.state.items.map(item => item.shift_increment_id);
                    let sessions = nextProps.sessions.filter(
                        item => !currentSessionIds.includes(item.shift_increment_id)
                    );
                    this.pushItems(sessions);
                }
                this.stopLoading();
            }
            if (nextProps.updated_sessions && nextProps.updated_sessions.length && this.state.items.length) {
                this.updateListAfterSync(nextProps.updated_sessions);
            }
            if (nextProps.deleted_session_ids && nextProps.deleted_session_ids.length && this.state.items.length) {
                this.updateListAfterSyncDeleted(nextProps.deleted_session_ids);
            }
        }
    }

    /**
     * Init smooth scrollbar
     */
    componentDidMount() {
        if (!this.scrollbarSessionList && this.session_list) {
            this.scrollbarSessionList = SmoothScrollbar.init(this.session_list);
            this.scrollbarSessionList.addListener(event => {
                if (event.limit.y <= (event.offset.y + 100)) {
                    this.lazyload(event);
                }
                return true;
            });
        }
    }

    /**
     * update list session after sync session
     * @param sessions
     */
    updateListAfterSync(sessions = []) {
        if (sessions && sessions.length) {
            let items = this.state.items;
            let selectSession = null;
            let lastSessionOpenedDate;
            items.map((item, index) => {
                let session = sessions.find(x => item.shift_increment_id === x.shift_increment_id);
                if (session) {
                    items[index] = session;
                }
                if (
                    this.props.currentSession
                    && item.shift_increment_id === this.props.currentSession.shift_increment_id
                ) {
                    selectSession = session;
                }
                return item;
            });

            lastSessionOpenedDate = items[0].opened_at;
            let newSession = sessions.filter(item => {
                return (
                    item.opened_at > lastSessionOpenedDate
                );
            });
            items.splice(0,0, ...newSession);
            this.addItems(items);

            let openingSession = items.find(item =>
                item.status === SessionConstant.SESSION_OPEN
                && item.staff_id.toString() === UserService.getStaffId()
            );
            if (!openingSession) {
                SessionService.removeCurrentSession();
            }

            setTimeout(() => selectSession && this.selectSession(selectSession), 20);
            this.props.actions.resetSyncActionUpdateSession();
        }
    }

    /**
     * update list order after sync deleted
     * @param ids
     */
    updateListAfterSyncDeleted(ids = []) {
        if (ids && ids.length) {
            let items = this.state.items;
            let isDeleteCurrentSession = false;
            ids.map(id => {
                let index = items.findIndex(item => item.shift_increment_id === id);
                if (index >= 0) {
                    items.splice(index, 1);
                }
                if (this.props.currentSession && id === this.props.currentSession.shift_increment_id) {
                    isDeleteCurrentSession = true;
                }
                return id;
            });
            this.addItems(items);

            if (isDeleteCurrentSession) {
                setTimeout(() => this.selectSession(items[0]), 20);
            }
            this.props.actions.resetSyncDeletedSessions();
        }
    }

    /**
     * Check can load more sessions
     *
     * @return {boolean}
     */
    canLoad() {
        if (this.props.search_criteria !== undefined) {
            return !this.isLoading() && (this.state.items.length < this.props.total_count);
        }
        return false;
    }

    /**
     * load more sessions when user scroll to last of session list
     * @param event
     */
    lazyload(event) {
        if (this.canLoad() === true) {
            this.startLoading();
            this.loadSession(
                SessionConstant.PAGE_SIZE,
                this.props.search_criteria.current_page + 1
            );
        }
    }

    /**
     * Check mode is changed and reload session list
     *
     * @param nextProps
     * @return {boolean}
     */
    isModeChange(nextProps) {
        if (nextProps.mode && this.state.mode && (nextProps.mode !== this.state.mode)) {
            this.setState({mode: nextProps.mode});
            this.startLoading();
            this.clearItems();
            this.loadSession(SessionConstant.PAGE_SIZE, 1);
            return true;
        }
        return false;
    }

    /**
     * Load session by props action.getListSession which was mapped in
     * @param pageSize
     * @param currentPage
     */
    loadSession(pageSize = SessionConstant.PAGE_SIZE, currentPage = 1) {
        let queryService = QueryService.reset();
        queryService.setOrder('opened_at', 'DESC').setPageSize(pageSize).setCurrentPage(currentPage);
        if (!Permission.isAllowed(PermissionConstant.PERMISSION_VIEW_SESSIONS_CREATED_BY_OTHER_STAFF)) {
            queryService.addFieldToFilter('staff_id', UserService.getStaffId(), 'eq');
        }
        this.props.actions.getListSession(queryService);
    }

    /**
     * handle select session
     * @param session
     */
    selectSession(session) {
        this.props.setCurrentSession(session);
    }

    /**
     * onclick open session
     */
    onClickOpenSession() {
        let {setCurrentPopup} = this.props;
        SessionHelper.isEnableCashControl() ?
            setCurrentPopup(SessionConstant.POPUP_OPEN_SESSION_CASH_CONTROL) :
            setCurrentPopup(SessionConstant.POPUP_OPEN_SESSION)
    }

    /**
     * template
     * @returns {*}
     */
    template() {
        let classBtnAdd = SessionService.needOpenSession() ? "btn btn-add" : "hidden";
        return (
            <div className="session-left">
                <div className="block-title">
                    <strong className="title">{this.props.t("Session Management")}</strong>
                    <button className={classBtnAdd}
                            onClick={() => this.onClickOpenSession()}/>
                </div>
                <div className="block-session-list" data-scrollbar ref={this.setBlockSessionListElement}>
                    <div className="session-list">
                        <ul className="items">
                            {
                                this.state.items.map(session =>
                                    <Session key={session.shift_increment_id}
                                             session={session}
                                             selectSession={(session) => this.selectSession(session)}
                                             isActive={(this.props.currentSession && session.shift_increment_id
                                                 === this.props.currentSession.shift_increment_id)}/>
                                )
                            }
                        </ul>
                    </div>
                    <div className="loader-product"
                         style={{display: (this.isLoading() ? 'block' : 'none')}}>
                    </div>
                </div>
            </div>
        );
    }
}

class SessionListContainer extends CoreContainer {
    static className = 'SessionListContainer';

    /**
     * map state to component's props
     * @param state
     * @return {{mode: *, orders: sessionListReducer.sessions, search_criteria: sessionListReducer.search_criteria, total_count: sessionListReducer.total_count, request_mode: sessionListReducer.request_mode}}
     */
    static mapState(state) {
        let {mode} = state.core.sync;
        let {
            sessions, search_criteria, total_count, request_mode, updated_sessions, deleted_session_ids
        } = state.core.session.sessionList;
        return {
            mode: mode,
            sessions: sessions,
            search_criteria: search_criteria,
            total_count: total_count,
            request_mode: request_mode,
            updated_sessions: updated_sessions,
            deleted_session_ids: deleted_session_ids
        };
    }

    /**
     * map actions to component's props
     * @param dispatch
     * @return {{actions: {getListSession: function(*=): *}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                getListSession: queryService => dispatch(SessionAction.getListSession(queryService)),
                resetSyncActionUpdateSession: () => dispatch(SessionAction.syncActionUpdateDataFinish()),
                resetSyncDeletedSessions: () => dispatch(SessionAction.syncDeletedSessionFinish()),
                setCurrentSession: (session) => dispatch(SessionAction.setCurrentSession(session)),
            }
        }
    }
}

/**
 * @type {SessionList}
 */
export default ContainerFactory.get(SessionListContainer).withRouter(
    ComponentFactory.get(SessionList)
);