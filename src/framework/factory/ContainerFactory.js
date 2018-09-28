import AbstractFactory from "./AbstractFactory";

export class ContainerFactory extends AbstractFactory{

    /**
     * get target container to use
     *
     * @param object
     * @return {*}
     */
  get(object) {
      return this.getObject(`Container`, object);
  }

}

let containerFactory = new ContainerFactory();

export default containerFactory;