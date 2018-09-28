import AbstractResourceModel from "../AbstractResourceModel";

export default class ConfigResourceModel extends AbstractResourceModel {
    static className = 'ConfigResourceModel';

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName : 'Config'};
    }
}