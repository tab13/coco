const GLOBAL_VARIABLES = window.pos.config;

/**
 * get allow permission of current staff
 *
 * @return {Array}
 *
 * */
export function getPermission() {
    if ( !GLOBAL_VARIABLES.config) return [];
    if ( !GLOBAL_VARIABLES.config.permissions) {
        return [];
    }
    let permissions = GLOBAL_VARIABLES.config.permissions;
    if ( permissions.length) {
        return permissions;
    }
    return [];
}

export default GLOBAL_VARIABLES;

