import SessionConstant from "../constant/SessionConstant";
import Config from "../../config/Config";

export default {
    /**
     * action get list session
     * @param queryService
     * @return {{type: string, queryService: *}}
     */
    getListSession: (queryService) => {
        return {
            type: SessionConstant.GET_LIST_SESSION,
            queryService: queryService,
        }
    },

    /**
     * action get list session result
     * @param sessions
     * @param search_criteria
     * @param total_count
     * @param request_mode
     * @return {{type: string, sessions: Array, search_criteria, total_count: number, request_mode: *}}
     */
    getListSessionResult: (
        sessions = [],
        search_criteria = {},
        total_count = 0,
        request_mode = Config.mode
    ) => {
        return {
            type: SessionConstant.GET_LIST_SESSION_RESULT,
            sessions: sessions,
            search_criteria: search_criteria,
            total_count: total_count,
            request_mode: request_mode
        }
    },

    /**
     * Sync action update session data finish
     * @param items
     * @return {{type: string, sessions: Array}}
     */
    syncActionUpdateDataFinish(items = []) {
        return {
            type: SessionConstant.SYNC_ACTION_UPDATE_DATA_FINISH,
            sessions: items
        }
    },

    /**
     * Sync deleted session finish
     * @param ids
     * @return {{type: string, ids: Array}}
     */
    syncDeletedSessionFinish(ids = []) {
        return {
            type: SessionConstant.SYNC_DELETED_SESSION_FINISH,
            ids: ids
        }
    },
    
    /**
     * open session
     * @param opening_amount
     * @returns {{type: string, base_opening_amount: *}}
     */
    openSession: (opening_amount) => {
        return {
            type: SessionConstant.REQUEST_OPEN_SESSION,
            opening_amount: opening_amount
        }
    },

    /**
     * put money in
     * @param amount
     * @param note
     * @returns {{type: string, amount: *}}
     */
    putMoneyIn: (amount, note) => {
        return {
            type: SessionConstant.REQUEST_PUT_MONEY_IN,
            amount: amount,
            note: note
        }
    },

    /**
     * take money out
     * @param amount
     * * @param note
     * @returns {{type: string, amount: *}}
     */
    takeMoneyOut: (amount, note) => {
        return {
            type: SessionConstant.REQUEST_TAKE_MONEY_OUT,
            amount: amount,
            note: note
        }
    },

    /**
     * set close session
     * @param closing_amount
     * @param denominations
     * @returns {{type: string, closing_amount: *, denominations: *}}
     */
    setCloseSession: (closing_amount, denominations = null) => {
        return {
            type: SessionConstant.REQUEST_SET_CLOSE_SESSION,
            closing_amount: closing_amount,
            denominations: denominations
        }
    },

    /**
     * close session
     * @param session
     * @param note
     * @returns {{type: string, note: *}}
     */
    closeSession: (session, note) => {
        return {
            type: SessionConstant.REQUEST_CLOSE_SESSION,
            session: session,
            note: note
        }
    },

    /**
     * get current session
     * @return {{type: string}}
     */
    getCurrentSession() {
        return {
            type: SessionConstant.GET_CURRENT_SESSION
        };
    },

    /**
     * redirect to manage session
     * @return {{type: string}}
     */
    redirectToManageSession() {
        return {
            type: SessionConstant.REDIRECT_TO_MANAGE_SESSION
        };
    },

    /**
     * redirect to manage session success
     * @return {{type: string}}
     */
    redirectToManageSessionSuccess() {
        return {
            type: SessionConstant.REDIRECT_TO_MANAGE_SESSION_SUCCESS
        };
    },

    /**
     * set current session
     * @param session
     * @param isCloseSession
     * @returns {{type: string, session: *, isCloseSession: boolean}}
     */
    setCurrentSession(session, isCloseSession = false) {
        return {
            type: SessionConstant.SET_CURRENT_SESSION,
            session: session,
            isCloseSession: isCloseSession
        };
    }
}
