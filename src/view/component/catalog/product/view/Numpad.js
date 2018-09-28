import React, {Fragment} from 'react';
import CoreComponent from '../../../../../framework/component/CoreComponent';
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import ProductAction from "../../../../action/ProductAction";
import '../../../../style/css/Option.css'

export class ProductNumpadComponent extends CoreComponent {
    static className = 'ProductNumpadComponent';

    setNumpad = element => this.numpad = element;

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {};
    }

    /**
     * Init smooth scrollbar for modal body
     */
    componentDidMount() {
        document.body.addEventListener('keyup', event => this.onKeyupKeyboard(event.key));
    }

    /**
     * Add numpad modal modal and numpad to body
     */
    addNumpadModal() {
        this.numpadModal = document.createElement("div");
        this.numpadModal.className = "modal-backdrop fade in popover-backdrop popover-backdrop_option";
        this.numpadModal.style.position = "absolute";
        this.numpadModal.style.display = "none";
        this.numpadModal.onclick = () => this.hideNumpad();
        document.body.appendChild(this.numpadModal);
        document.body.appendChild(this.numpad);
    }

    /**
     * Show numpad when click qty field
     */
    showNumpad() {
        this.numpadModal.style.display = "block";
        this.onKeyupKeyboard = this.enableKeyupKeyboard;
    }

    /**
     * Hide numpad when click anywhere except it-self
     */
    hideNumpad() {
        this.numpadModal.style.display = "none";
        this.onKeyupKeyboard = this.disableKeyupKeyboard;
        this.setState({showNumPad: false});
        let minQty = this.getMinimumValidQty(this.state.valid_product);
        if (isNaN(this.state.current_qty) || this.state.current_qty === '' ||
            this.state.current_qty < minQty) {
            this.setState({current_qty: String(minQty)});
        }
    }

    /**
     * Event to press keyboard after show numpad
     *
     * @param key
     */
    onKeyupKeyboard(key) {
        return key;
    }

    /**
     * Enable press keyboard event after show numpad
     *
     * @param key
     */
    enableKeyupKeyboard(key) {
        return this.props.enableKeyupKeyboard(key);
    }

    /**
     * Disable press keyboard event after hide numpad
     *
     * @param key
     * @return {null}
     */
    disableKeyupKeyboard(key) {
        return key;
    }

    template() {
        return (
            <div ref={this.setNumpad}
                 className="popover fade right in" role="tooltip" id="numpad-configure-product"
                 style={{
                     'top': this.props.numpad_left + 'px',
                     'display': this.props.showNumPad ? 'block' : 'none'
                 }}>
                <div className="arrow" style={{'top': '50%'}}>
                </div>
                <div className="popover-content">
                    <div className="popup-calculator">
                        <ul className="list-number">
                            <li onClick={() => this.props.clickNumpad('1')}>1</li>
                            <li onClick={() => this.props.clickNumpad('2')}>2</li>
                            <li onClick={() => this.props.clickNumpad('3')}>3</li>
                            <li onClick={() => this.props.clickNumpad('4')}>4</li>
                            <li onClick={() => this.props.clickNumpad('5')}>5</li>
                            <li onClick={() => this.props.clickNumpad('6')}>6</li>
                            <li onClick={() => this.props.clickNumpad('7')}>7</li>
                            <li onClick={() => this.props.clickNumpad('8')}>8</li>
                            <li onClick={() => this.props.clickNumpad('9')}>9</li>
                            {
                                this.isQtyDecimal(this.props.product) ?
                                    <li onClick={() => this.props.clickNumpad(this.props.decimal_symbol)}>
                                        <span>{this.props.decimal_symbol}</span>
                                    </li>
                                    : <li></li>
                            }
                            <li onClick={() => this.props.clickNumpad('0')}>0</li>
                            <li className="clear-number" onClick={() => this.props.clickNumpad('Delete')}>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        );
    }
}

class ProductNumpadContainer extends CoreContainer {
    static className = 'ProductNumpadContainer';

    /**
     * This maps the state to the property of the component
     *
     * @param state
     * @returns {{product}}
     */
    static mapState(state) {
        let product = state.core.product.viewProduct.product;
        return {product: product};
    }

    /**
     * This maps the state to the property of the component
     *
     * @param state
     * @returns {{product}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                closePopup: () => dispatch(ProductAction.viewProduct())
            }
        }
    }
}

export default ContainerFactory.get(ProductNumpadContainer).withRouter(
    ComponentFactory.get(ProductNumpadComponent)
);

