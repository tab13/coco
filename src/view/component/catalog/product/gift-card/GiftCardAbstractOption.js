import CoreComponent from '../../../../../framework/component/CoreComponent';
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import OptionConstant from "../../../../constant/catalog/OptionConstant";
import CurrencyHelper from "../../../../../helper/CurrencyHelper";

export class GiftCardProductAbstractOptionComponent extends CoreComponent {
    static className = 'GiftCardProductAbstractOptionComponent';

    /**
     * get display price of option
     * @param price
     * @param priceType
     * @param productPrice
     * @return {string}
     */
    getOptionDisplayPrice(price, priceType, productPrice) {
        let realPrice = price;
        if (priceType === OptionConstant.PRICE_TYPE_PERCENT) {
            realPrice = (productPrice * price) / 100;
        }
        return realPrice ? ('+ ' + CurrencyHelper.convertAndFormat(realPrice) ) : '';
    }
}

class GiftCardProductAbstractOptionContainer extends CoreContainer {
    static className = 'GiftCardProductAbstractOptionContainer';
}

/**
 * @type {GiftCardProductAbstractOptionContainer}
 */
export default ContainerFactory.get(GiftCardProductAbstractOptionContainer).withRouter(
    ComponentFactory.get(GiftCardProductAbstractOptionComponent)
);

