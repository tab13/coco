import {AbstractProcessor} from "../../../checkout/quote/processor/AbstractProcessor";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";

export class ResetRewardProcessor extends AbstractProcessor {
    static className = 'ResetRewardProcessor';

    execute(quote) {
        super.execute(quote);
        quote.rewardpoints_spent                      = 0;
        quote.rewardpoints_base_discount              = 0;
        quote.rewardpoints_discount                   = 0;
        quote.rewardpoints_earn                       = 0;
        quote.rewardpoints_base_amount                = 0;
        quote.rewardpoints_amount                     = 0;
        quote.rewardpoints_base_discount_for_shipping = 0;
        quote.rewardpoints_discount_for_shipping      = 0;
        quote.magestore_base_discount_for_shipping    = 0;
        quote.magestore_discount_for_shipping         = 0;
        quote.magestore_base_discount                 = 0;
        quote.magestore_discount                      = 0;
        quote.base_discount_amount                    = 0;
        quote.discount_amount                         = 0;
        quote.addresses.map(address => {
            address.rewardpoints_spent                      = 0;
            address.rewardpoints_base_discount              = 0;
            address.rewardpoints_discount                   = 0;
            address.rewardpoints_base_amount                = 0;
            address.rewardpoints_amount                     = 0;
            address.magestore_base_discount_for_shipping    = 0;
            address.magestore_discount_for_shipping         = 0;
            address.rewardpoints_base_discount_for_shipping = 0;
            address.rewardpoints_discount_for_shipping      = 0;
            address.magestore_base_discount                 = 0;
            address.magestore_discount                      = 0;
            address.rewardpoints_earn                       = 0;
            address.base_discount_amount                    = 0;
            address.discount_amount                         = 0;
            return address;
        });

        quote.items.map(item => {
            if (!item.product) return item;
            item.rewardpoints_base_discount = 0;
            item.rewardpoints_discount      = 0;
            item.magestore_base_discount    = 0;
            item.magestore_discount         = 0;
            item.rewardpoints_earn          = 0;
            item.rewardpoints_spent         = 0;
            item.discount_amount            = 0;
            item.base_discount_amount       = 0;
            item.discount_percent           = 0;
            return item;
        });
        return this;
    }

   
}

/**
 * 
 * @type {ResetRewardProcessor}
 */
const resetRewardProcessor = ServiceFactory.get(ResetRewardProcessor);

export default resetRewardProcessor;