import { getPermission } from "../config/Config";
import PermissionConstant from "../view/constant/PermissionConstant";

export class Permission {
    /**
     *  check permission for component
     *
     * @param {string} acl
     * @return {boolean}
     */
    isAllowed(acl = '') {
        let permissions = getPermission();
        if (permissions.indexOf(PermissionConstant.PERMISSION_ALL) !== -1) {
            return true;
        }
        if (acl && permissions.length) {
            return permissions.indexOf(acl) !== -1;
        }
        return true;
    }
}

const permission = new Permission();

export default permission;