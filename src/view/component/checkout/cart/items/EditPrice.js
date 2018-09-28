import React from 'react';
import Popover from '../../../lib/react-popover';
import {ContentNumber} from "../../../lib/react-numpad/components/ContentNumber";
import {Panel} from "react-bootstrap";
import CoreComponent from "../../../../../framework/component/CoreComponent";
import CoreContainer from "../../../../../framework/container/CoreContainer";
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import ComponentFactory from "../../../../../framework/factory/ComponentFactory";
import {Content} from "../../../lib/react-numpad/elements/PopoverKeyPad";

class EditPriceComponent extends CoreComponent {
    static className = 'EditPriceComponent';

    blurTimeout = null;
    setReasonBoxElement = element => this.reason_box = element;

    constructor(props) {
        super(props);
        this.state = {
            customPrice: props.customPrice,
            reason: props.reason,
            showXButton: false,
            numpadActive: true
        };
        this.keyDown = this.keyDown.bind(this);
        this.handleChangeCustomPrice = this.handleChangeCustomPrice.bind(this);
        this.confirm = this.confirm.bind(this);
        this.cancel = this.cancel.bind(this);
    }
    componentDidMount() {
        document.addEventListener('keydown', this.keyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.keyDown);
    }

    keyDown(event) {
        if(this.reason_box === event.target){
            const {key} = event;
            if (key === 'Enter' ) {
                this.confirm();
            } else if (key === 'Escape') {
                this.cancel();
            }
        }
    }
    /**
     * Change input reason box
     *
     * @param event
     */
    changeReason(event) {
        let reason = event.target.value;
        this.setState({
            reason: reason,
            showXButton: !!reason
        });
    }

    /**
     * on focus input
     * @param event
     */
    onReasonFocus(event) {
        this.setState({showXButton: !!event.target.value, numpadActive: false});
    }

    /**
     * Clear input reason box
     */
    clearReasonBox() {
        this.setState({reason: ""});
        this.reason_box.value = "";
        setTimeout(() => {
            return this.reason_box.focus();
        }, 220);
    }
    handleChangeCustomPrice(customPrice, isEmpty){
        this.setState({showXButton: false, customPrice: (isEmpty)?null:parseFloat(customPrice)});
    }
    confirm(){
        this.props.confirm();
    }
    cancel(){
        this.props.cancel();
    }
    template() {
        const {
            width,
            height,
            customPrice,
            reason
        } = this.props;

        let customPriceDisplay = parseFloat(customPrice)* 100;
        customPriceDisplay = customPriceDisplay.toFixed(2) * 1;
        return (
            <Content width={width} height={height} className="set-custom-price-popup">
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">{this.props.t('Custom Price')}</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="custom-price-numpad-wrapper">
                            <ContentNumber sync={true}
                                           cancel={this.cancel}
                                           finish={this.confirm}
                                           onChange={this.handleChangeCustomPrice}
                                           active={this.state.numpadActive}
                                           value={customPriceDisplay}
                            />
                        </div>
                        <div className="custom-price-reason-wrapper">
                            <input type="text" className="input-reason form-control"
                                   defaultValue={reason}
                                   ref={this.setReasonBoxElement}
                                   placeholder={
                                       this.props.t("Reason")
                                   }
                                   onKeyUp={event => this.changeReason(event)}
                                   onFocus={event => this.onReasonFocus(event)}
                            />
                            {
                                this.state.showXButton ?
                                    (
                                        <button className="btn-remove" type="button"
                                                onClick={() => this.clearReasonBox()}>
                                            <span>remove</span>
                                        </button>
                                    ) :
                                    ""
                            }
                        </div>
                    </Panel.Body>
                </Panel>
            </Content>
        );
    }
}

const defaultProps = {
    element: EditPriceComponent,
    arrow:"left"
};

/**
 *
 * @type {CartItemComponent}
 */
const component = ComponentFactory.get(Popover(defaultProps));

class EditPriceContainer extends CoreContainer {
    static className = 'EditPriceContainer';

    /**
     *
     * @param state
     * @return {{isDisableEdit: boolean}}
     */
    static mapState(state) {
        return {

        }
    }

    /**
     *
     * @param dispatch
     * @returns {{}}
     */
    static mapDispatch(dispatch) {
        return {

        }
    }
}

/**
 *
 * @type {EditPriceContainer}
 */
const container = ContainerFactory.get(EditPriceContainer);

export default container.getConnect(component);