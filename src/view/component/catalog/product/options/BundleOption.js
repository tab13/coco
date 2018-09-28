import React from 'react';
import {ProductAbstractOptionComponent} from './AbstractOption';
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import PriceService from "../../../../../service/catalog/product/PriceService";

export class ProductBundleOptionComponent extends ProductAbstractOptionComponent {
    static className = 'ProductBundleOptionComponent';

    setInputQtyElement = element => this.input_qty_element = element;

    /**
     * Component will receive props
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.isOptionSelectOne && nextProps.currentQty !== this.props.currentQty) {
            this.input_qty_element.value = this.getCurentQtyString(nextProps.currentQty);
        }
    }

    /**
     * Get current qty string
     *
     * @param qty
     * @returns {string}
     */
    getCurentQtyString(qty) {
        if (typeof qty !== 'undefined') {
            return qty.toString().replace('.', this.props.decimal_symbol);
        }
        return '';
    }

    /**
     * Get type
     *
     * @returns {string}
     */
    getType() {
        if (this.props.isOptionSelectOne) {
            return 'radio';
        } else {
            return 'checkbox';
        }
    }

    /**
     * Get display price
     *
     * @param product
     * @returns {*|string}
     */
    getDisplayPrice(product) {
        if (product) {
            return PriceService.getPriceService(product).getDisplayFormatPrice(product);
        }
        return "";
    }

    /**
     * Render template
     *
     * @returns {*}
     */
    template() {
        return (
            <div className="bundle-item">
                <div className="bundle-title">
                    <span className="title">
                        {this.props.option.title}
                        {this.props.option.required ?
                            <span className="required"> *</span>
                            : ''}
                    </span>
                    {
                        this.props.isOptionSelectOne ?
                            (
                                <div className="product-field-qty">
                                    <div className="box-field-qty">
                                        <input ref={this.setInputQtyElement}
                                               name={"qty" + this.props.option.option_id}
                                               minLength="1"
                                               maxLength="12"
                                               title="Qty"
                                               defaultValue={this.getCurentQtyString(this.props.currentQty)}
                                               className="form-control qty"
                                               disabled={!this.props.option.can_change_quantity}
                                               onClick={
                                                   (event) => this.props.showNumpad(event, this.props.option)
                                               }
                                               onChange={event => {
                                                   this.props.changeQty(this.props.option, event)
                                               }}
                                               onKeyDown={event => this.props.onKeyDownQty(event, this.props.option)}
                                               onBlur={() => this.props.blurQty(this.props.option)}
                                        />
                                        <a className="btn-number qtyminus"
                                           data-field={"qty" + this.props.option.option_id}
                                           onClick={() => this.props.minusQty(this.props.option)}>
                                            -
                                        </a>
                                        <a className="btn-number qtyplus"
                                           data-field={"qty" + this.props.option.option_id}
                                           onClick={() => this.props.plusQty(this.props.option)}>
                                            +
                                        </a>
                                    </div>
                                </div>
                            ) : ""
                    }
                </div>
                <div className="bundle-options">
                    {
                        !this.props.option.required && this.props.isOptionSelectOne ?
                            (
                                <div className="bundle-option">
                                    <label>
                                        <input type={this.getType()}
                                               name={this.props.option.option_id}
                                               onClick={() => this.props.changeOptions(this.props.option)}
                                        />
                                        <span className="bundle-box">
                                            <span className="name">
                                                {this.props.t('None')}
                                            </span>
                                        </span>
                                    </label>
                                </div>
                            ) : ""
                    }
                    {
                        this.props.option.product_links.map(productLink => {
                            return (
                                productLink.product ?
                                    <div key={productLink.position} className="bundle-option">
                                        <label>
                                            <input type={this.getType()}
                                                   name={this.props.option.option_id}
                                                   defaultChecked={productLink.isChosen}
                                                   onClick={
                                                       () => this.props.changeOptions(this.props.option, productLink)
                                                   }
                                            />
                                            <span className="bundle-box">
                                            {
                                                !this.props.isOptionSelectOne ?
                                                    <span className="qty">{productLink.defaultQty + ' x'}</span> : ""
                                            }
                                                <span className="name">
                                                {productLink.product ? productLink.product.name : ''}
                                            </span>
                                            <span className="price">
                                               + {
                                                    this.props.bundleOptionPrices[
                                                        this.props.option.option_id + "_" + productLink.product.id
                                                    ]
                                                }
                                            </span>
                                        </span>
                                        </label>
                                    </div> : ""
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}

class ProductBundleOptionContainer extends CoreContainer {
    static className = 'ProductBundleOptionContainer';
}

export default ContainerFactory.get(ProductBundleOptionContainer).withRouter(
    ComponentFactory.get(ProductBundleOptionComponent)
);

