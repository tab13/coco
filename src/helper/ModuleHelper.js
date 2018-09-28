import Config from '../config/Config'

export default {
    modules: null,

    /**
     * get all module
     * @returns {null}
     */
    getModules() {
        if (!Config.config || !Config.config.enable_modules) {
            return null;
        }
        this.modules = Config.config.enable_modules;
        return this.modules;
    },

    /**
     * enable module inventory
     * @returns {boolean}
     */
    enableModuleInventory() {
        if (!this.getModules())
            return false;
        return this.getModules().find(module => module === 'Magestore_InventorySuccess');
    }
}