import React, {Fragment} from "react";
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import SmoothScrollbar from "smooth-scrollbar";
import AbstractGrid from "../../../../../framework/component/grid/AbstractGrid";
import TyroPaymentService from "../../../../../service/payment/type/TyroPaymentService";
import {toast} from "react-toastify";
import '../../../../style/css/Setting.css';


export class Tyro extends AbstractGrid {
    static className = 'Tyro';

    setBlockListElement = element => this.tyro_list = element;

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            currentItem : "",
            isRequesting: false,
        }
    }

    /**
     * Init smooth scrollbar
     */
    componentDidMount() {
        if (!this.scrollbar && this.tyro_list) {
            this.scrollbar = SmoothScrollbar.init(this.tyro_list);
        }
    }

    /**
     * destroy scrollbar and call closeChild() PaymentList
     */
    closeOwn() {
        this.props.closeChild();
        SmoothScrollbar.destroy(this.tyro_list);
        this.scrollbar = null;
    }

    /**
     * Save IP
     *
     * @param event
     */
    saveMerchantId(event) {
        TyroPaymentService.setMerchantId(event.target.value);
    }

    /**
     * Save Port
     *
     * @param event
     */
    saveTerminalId(event) {
        TyroPaymentService.setTerminalId(event.target.value);
    }

    /**
     *
     * @param TID
     * @return {boolean}
     */
    infoIsValid(TID = false) {
        TID = TID || TyroPaymentService.getTerminalId();
        if (!TID) {
            toast.error(
                this.props.t('Please fill Terminal ID.'),
                {
                    className: 'wrapper-messages messages-warning',
                    autoClose: 1000
                }
            );
            return false;
        }
        return true
    }

    /**
     * test payment
     */
    test() {
        if (this.state.isRequesting) {
            return;
        }

        if (!this.infoIsValid(TyroPaymentService.getTerminalId())) {
            return
        }

        this.setState({isRequesting: true});
        TyroPaymentService.testConnection(response => {
            if (response.status === 'success') {
                // let message = `Terminal ${response.terminalInfo.name}, available: ${response.terminalInfo.available}`;
                return this.connectionSuccess();
            }

            if (response.status === 'failure') {
                this.connectionFail();
            }

            // processing
        }, () => this.connectionFail());
    }

    /**
     * connect payment
     */
    pair() {
        if (this.state.isRequesting) {
            return;
        }

        if (!this.infoIsValid(TyroPaymentService.getTerminalId())) {
            return
        }

        this.setState({isRequesting: true});
        TyroPaymentService.pairConnection(response => {
            if (response.status === 'success') {
                return this.connectionSuccess(response.message);
            }

            if (response.status === 'failure') {
                this.connectionFail(response);
            }
            // processing
        }, () => this.connectionFail());
    }

    /**
     * Connect  success
     */
    connectionSuccess() {
        this.setState({isRequesting: false})
    }


    /**
     * Connect  fail
     */
    connectionFail() {
        this.setState({isRequesting: false})
    }

    /**
     * Destroy smooth scrollbar
     */
    componentWillUnmount() {
        SmoothScrollbar.destroy(this.tyro_list);
        this.scrollbar = null;
    }

    /**
     * template
     * @returns {*}
     */
    template() {

        const {isRequesting}  = this.state;
        const canCheckTerminalInfo = TyroPaymentService.getIntegrationKey();
        const buttonClassName = `btn ${isRequesting ? "btn-cancel" : "btn-default"}`;

        return (
            <Fragment>
                <div className="settings-right">
                    <div className="block-title">
                        <button className="btn-back" onClick={() => this.closeOwn()}>
                            <span>back</span>
                        </button>
                        <strong className="title">{this.props.t('Tyro iClient')}</strong>
                    </div>
                    <div className="block-content" ref={this.setBlockListElement}>
                        <ul className="list-lv1">
                            <li>
                                <label className="title">{this.props.t('Terminal ID')}</label>
                                <input type="text"
                                       className="form-control"
                                       defaultValue={TyroPaymentService.getTerminalId()}
                                       onChange={(event) => this.saveTerminalId(event)}
                                />
                            </li>
                            <li>
                                <span className="title">
                                    {this.props.t('Integrated Receipt')}
                                    <br></br>
                                    <span className="title-description">
                                        Sales information and payment information in 1 receipt
                                    </span>
                                </span>
                                <span className="value">
                                    <label className="checkbox">
                                        <input type="checkbox"
                                               defaultChecked={TyroPaymentService.getIntegratedReceipt()}
                                               onChange={(event) =>
                                                   TyroPaymentService.setIntegratedReceipt(event.target.checked)}
                                        />
                                        <span></span>
                                    </label>
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div className="block-bottom">
                        <button
                            className={ canCheckTerminalInfo ? buttonClassName : 'btn btn-default disabled'}
                            type="button"
                            onClick={() => this.test()}>{this.props.t('Check Terminal Info')}</button>
                        <button
                            className={buttonClassName}
                            type="button"
                            onClick={() => this.pair()}>{this.props.t('Pairing')}</button>
                    </div>
                </div>
            </Fragment>
        )
    }
}

class TyroContainer extends CoreContainer {
    static className = 'TyroContainer ';

    /**
     * map state to component's props
     * @param state
     * @return {{}}
     */
    static mapState(state) {
        return {};
    }

    /**
     * map actions to component's props
     * @param dispatch
     * @return {{actions: }}
     */
    static mapDispatch(dispatch) {
        return {}
    }
}

/**
 * @type {Setting}
 */
export default ContainerFactory.get(TyroContainer).withRouter(
    ComponentFactory.get(Tyro)
);