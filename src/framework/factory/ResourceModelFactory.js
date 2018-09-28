import AbstractFactory from "./AbstractFactory";

export class ResourceModelFactory extends AbstractFactory{

    /**
     * get target resource model to use
     *
     * @param object
     * @return {*}
     */
  get(object) {
    return this.getObject(`resource_model`, object);
  }

}

let resourceModelFactory = new ResourceModelFactory();

export default resourceModelFactory;
