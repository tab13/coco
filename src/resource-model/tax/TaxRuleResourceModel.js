import AbstractResourceModel from "../AbstractResourceModel";

export default class TaxRuleResourceModel extends AbstractResourceModel {
    static className = 'TaxRuleResourceModel';

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName : 'TaxRule'};
    }
}