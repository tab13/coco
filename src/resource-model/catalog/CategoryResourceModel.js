import AbstractResourceModel from "../AbstractResourceModel";

export default class CategoryResourceModel extends AbstractResourceModel {
    static className = 'CategoryResourceModel';

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName : 'Category'};
    }

    /**
     * Call get all category items
     *
     * @returns {Object|*|FormDataEntryValue[]|string[]}
     */
    getAll() {
        return this.getResourceOffline().getAll();
    }
}