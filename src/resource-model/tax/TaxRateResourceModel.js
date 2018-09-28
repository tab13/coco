import AbstractResourceModel from "../AbstractResourceModel";

export default class TaxRateResourceModel extends AbstractResourceModel {
    static className = 'TaxRateResourceMode';

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName : 'TaxRate'};
    }
}