import CoreService from "../../../../CoreService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";

export class CreditmemoAbstractTotalService extends CoreService {
    static className = 'CreditmemoAbstractTotalService';

    /**
     * Collect credit memo total
     *
     * @param creditmemo
     * @return {CreditmemoAbstractTotalService}
     */
    collect(creditmemo) {
        return this;
    }
}

/** @type CreditmemoAbstractTotalService */
let creditmemoAbstractTotalService = ServiceFactory.get(CreditmemoAbstractTotalService);

export default creditmemoAbstractTotalService;