import Extension from "../Extension";

export default class AbstractFactory {
    /**
     *  create new instance from entity
     * @return {*}
     */
    create(entity) {
        return new entity();
    }

    /**
     * get target class to use
     *
     * @param type
     * @param object
     * @return {*}
     */
    getObject(type, object) {
        return Extension.get(type.toLowerCase(), object);
    }
}
