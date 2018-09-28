import AbstractFactory from "./AbstractFactory";

export class ServiceFactory extends AbstractFactory{

    /**
     * get target service to use
     *
     * @param object
     * @return {*}
     */
  get(object) {
    return new (this.getObject(`Service`, object))();
  }

}

let serviceFactory = new ServiceFactory();

export default serviceFactory;