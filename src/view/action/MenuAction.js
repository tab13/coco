import MenuConstant from "../constant/MenuConstant";

/**
 *  action emit whenever user click MenuItem
 *
 * @param {Object} active
 * @return {{type, active: *}}
 */
export const clickMenuItem = (active) => {
    return {
        type: MenuConstant.CLICK_MENU_ITEM,
        active
    }
};

/**
 * action emit whenever user click export data button
 *
 * @return {{type}}
 */
export const clickExportItem = () => {
    return {
        type: MenuConstant.CLICK_EXPORT_ITEM,
    }
};

/**
 * action emit whenever user click Logout button
 *
 * @return {{type}}
 */
export const clickLogoutItem = () => {
    return {
        type: MenuConstant.CLICK_LOGOUT_ITEM,
    }
};

/**
 * toggle menu
 *
 * @return {{type}}
 */
export const toggle= () => {
    return {
        type: MenuConstant.TOGGLE,
    }
};


/**
 * combine actions to export
 * @type {{clickMenuItem: function(Object), clickLogoutItem: function()}}
 */
const MenuAction = {
    clickMenuItem,
    clickExportItem,
    clickLogoutItem,
    toggle
};

export default MenuAction