import AbstractFactory from "./AbstractFactory";
import {translate} from "react-i18next";

export class ComponentFactory extends AbstractFactory{

    /**
     * get target component to use
     *
     * @param object
     * @return {*}
     */
  get(object) {
      return translate('translations')(this.getObject(`Component`, object));
  }

}

let componentFactory = new ComponentFactory();

export default componentFactory;