export const ADD_TABLE_INSTALL = '[install] GET_TABLE_INSTALL';

export const addTableInstall = (tables = {}) => {
    return {
        type: ADD_TABLE_INSTALL,
        tables: tables
    }
}