import React from 'react';
import {ProductAbstractOptionComponent} from './AbstractOption';
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import Config from "../../../../../config/Config";

export class ProductDropdownOptionComponent extends ProductAbstractOptionComponent {
    static className = 'ProductDropdownOptionComponent';

    swatchConfig = null;

    /**
     * Check option can choose
     *
     * @param item
     * @returns {boolean}
     */
    canChooseOption(item) {
        if (!this.props.hasOneOption) {
            let product = item.products.find(
                product => this.props.valid_config_product_by_option_ids.includes(product.id)
            );
            return !!(product && product.id);
        } else {
            return item.products.length > 0;
        }
    }

    /**
     * Check swatch option
     *
     * @param option
     * @returns {boolean}
     */
    isSwatchOption(option) {
        if (Config.swatch_config && Config.swatch_config.length > 0) {
            let config = Config.swatch_config.find(config => config.attribute_id === option.id);
            if (config && config.attribute_id) {
                this.swatchConfig = config;
                return true;
            }
        }
        return false;
    }

    /**
     * Generate swatch option
     *
     * @param itemOption
     * @param index
     * @returns {*}
     */
    generateSwatchOption(itemOption, index) {
        let swatch = this.swatchConfig.swatches.find(swatch => swatch.option_id === itemOption.id);
        switch (swatch.type) {
            case 0:
                return this.generateText(itemOption, swatch, index);
            case 1:
                return this.generateColor(itemOption, swatch, index);
            case 2:
                return this.generateImage(itemOption, swatch, index);
            default:
                return this.generateDefault(itemOption, swatch, index);
        }
    }

    /**
     * General option text
     *
     * @param itemOption
     * @param swatch
     * @param index
     * @returns {*}
     */
    generateText(itemOption, swatch, index) {
        return <div key={index}
                   className={
                       "attribute-option" +
                       (this.canChooseOption(itemOption) ? "" : " not-available") +
                       (itemOption.isChosen ? " selected" : "")
                   }
                   onClick={event => this.props.clickConfigOption(this.props.option.id, itemOption.id)}>
            {swatch.value}
        </div>;
    }

    /**
     * Generate option color
     *
     * @param itemOption
     * @param swatch
     * @param index
     * @returns {*}
     */
    generateColor(itemOption, swatch, index) {
        return <div key={index}
             className={
                 "attribute-option" +
                 (this.canChooseOption(itemOption) ? "" : " not-available") +
                 (itemOption.isChosen ? " selected" : "")
             }
             style={{"backgroundColor": swatch.value}}
             onClick={event => this.props.clickConfigOption(this.props.option.id, itemOption.id)}/>;
    }

    /**
     * Generate option image
     *
     * @param itemOption
     * @param swatch
     * @param index
     * @returns {*}
     */
    generateImage(itemOption, swatch, index) {
        return <div key={index}
                    className={
                        "attribute-option" +
                        (this.canChooseOption(itemOption) ? "" : " not-available") +
                        (itemOption.isChosen ? " selected" : "")
                    }
                    style={{"backgroundImage": swatch.value}}
                    onClick={event => this.props.clickConfigOption(this.props.option.id, itemOption.id)}/>;
    }

    /**
     * Generate default option
     * @param itemOption
     * @param index
     * @returns {*}
     */
    generateDefault(itemOption, index) {
        return <div key={index}
                    className={
                        "attribute-option" +
                        (this.canChooseOption(itemOption) ? "" : " not-available") +
                        (itemOption.isChosen ? " selected" : "")
                    }
                    onClick={event => this.props.clickConfigOption(this.props.option.id, itemOption.id)}>
            {itemOption.label}
        </div>;
    }

    /**
     * Render template
     *
     * @returns {*}
     */
    template() {
        return (
            <div className={"product-options-attribute " + this.props.option.code}>
                <div className="attribute-label">
                    {this.props.option.label}
                </div>
                <div className="attribute-options">
                    {
                        this.isSwatchOption(this.props.option) ?
                            this.props.option.options.map((item, index) => {
                                return this.generateSwatchOption(item, index)
                            }) :
                            this.props.option.options.map((item, index) => {
                                return this.generateDefault(item, index)
                            })
                    }
                </div>
            </div>
        )
    }
}

class ProductDropdownOptionsContainer extends CoreContainer {
    static className = 'ProductRadioOptionsContainer';
}

export default ContainerFactory.get(ProductDropdownOptionsContainer).withRouter(
    ComponentFactory.get(ProductDropdownOptionComponent)
);

