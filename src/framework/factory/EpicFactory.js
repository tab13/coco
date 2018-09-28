import AbstractFactory from "./AbstractFactory";

export class EpicFactory extends AbstractFactory{

    /**
     * get target epic to use
     *
     * @param object
     * @return {*}
     */
     get(object) {
        return this.getObject(`Epic`, object);
    }

}

let epicFactory = new EpicFactory();

export default epicFactory;