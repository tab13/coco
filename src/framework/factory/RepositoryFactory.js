import AbstractFactory from "./AbstractFactory";

export class RepositoryFactory extends AbstractFactory{

    /**
     * get target repository to use
     *
     * @param object
     * @return {*}
     */
  get(object) {
    return this.getObject(`Repository`, object);
  }

}

let repositoryFactory = new RepositoryFactory();

export default repositoryFactory;