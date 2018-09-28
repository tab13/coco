import AbstractResourceModel from "../AbstractResourceModel";

export default class ColorSwatchResourceModel extends AbstractResourceModel {
    static className = 'ColorSwatchResourceModel';

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName : 'ColorSwatch'};
    }
}