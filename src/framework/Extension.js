import config from '../extension/config'

export class Extension {
  ExtensionConfig = config();

    /**
     *  get rewrite class if available or itself class
     *
     * @param type
     * @param Class
     * @return {*}
     */
  get(type, Class){
    if (
        !this.ExtensionConfig
        || !this.ExtensionConfig.rewrite
        || !this.ExtensionConfig.rewrite[type]
    ) {
        return Class;
    }

    let className = Class.className ? Class.className : Class.name;
    if ( this.ExtensionConfig.rewrite[type][className]) {
      return this.ExtensionConfig.rewrite[type][className];
    }
    return Class;
  }
}

let extension = new Extension();

export default extension;
