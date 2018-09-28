import React, {Fragment} from "react";
import ComponentFactory from '../../../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../../../framework/container/CoreContainer';
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import SmoothScrollbar from "smooth-scrollbar";
import AbstractGrid from "../../../../../framework/component/grid/AbstractGrid";
import '../../../../style/css/Setting.css';
import BamboraPaymentService from "../../../../../service/payment/type/BamboraPaymentService";
import LocalStorageHelper from "../../../../../helper/LocalStorageHelper";
import BamboraConstant from "../../../../constant/payment/BamboraConstant";
import {toast} from "react-toastify";


export class Bambora extends AbstractGrid {
    static className = 'Bambora';

    setBlockBamboraListElement = element => this.bambora_list = element;

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            currentItem: "",
            isRequesting: false,
        }
    }

    /**
     * Init smooth scrollbar
     */
    componentDidMount() {
        if (!this.scrollbar && this.bambora_list) {
            this.scrollbar = SmoothScrollbar.init(this.bambora_list);
        }
    }

    /**
     * destroy scrollbar and call closeChild() PaymentList
     */
    closeOwn() {
        this.props.closeChild();
        SmoothScrollbar.destroy(this.bambora_list);
        this.scrollbar = null;
    }

    /**
     * Save IP
     *
     * @param event
     */
    saveIP(event) {
        LocalStorageHelper.set(BamboraConstant.CONFIG_TERMINAL_IP_ADDRESS, event.target.value);
    }

    /**
     * Save Port
     *
     * @param event
     */
    savePort(event) {
        LocalStorageHelper.set(BamboraConstant.CONFIG_TERMINAL_PORT, event.target.value);
    }

    /**
     * Save Mode
     *
     * @param event
     */
    saveMode(event) {
        LocalStorageHelper.set(BamboraConstant.CONFIG_TERMINAL_MODE, event.target.checked);
    }

    /**
     * connect bambora payment
     */
    connect() {
        if (this.state.isRequesting) {
            return false;
        }
        let IP = BamboraPaymentService.getIP(),
            port = BamboraPaymentService.getPort();
        if (!IP || !port) {
            toast.error(
                this.props.t('Please fill out IP address and port number.'),
                {
                    className: 'wrapper-messages messages-warning',
                    autoClose: 1000
                }
            );
            return false;
        }
        this.setState({isRequesting: true});
        BamboraPaymentService.testConnection().then(response => {
            if (response === 'success') {
                this.connectionSuccess();
            } else {
                this.connectionFail();
            }
        }).catch(error => {
            this.connectionFail();
        })
    }

    /**
     * Connect bambora success
     */
    connectionSuccess() {
        toast.success(
            this.props.t('Connection succeeded.'),
            {
                position: toast.POSITION.TOP_CENTER,
                className: 'wrapper-messages messages-success',
                autoClose: 1000
            }
        );
        this.setState({isRequesting: false})
    }


    /**
     * Connect bambora fail
     */
    connectionFail() {
        toast.error(
            this.props.t('Connection failed.'),
            {
                className: 'wrapper-messages messages-warning',
                autoClose: 1000
            }
        );
        this.setState({isRequesting: false})
    }

    /**
     * Destroy smooth scrollbar
     */
    componentWillUnmount() {
        SmoothScrollbar.destroy(this.bambora_list);
        this.scrollbar = null;
    }

    /**
     * template
     * @returns {*}
     */
    template() {
        return (
            <Fragment>
                <div className="settings-right">
                    <div className="block-title">
                        <button className="btn-back" onClick={() => this.closeOwn()}>
                            <span>back</span>
                        </button>
                        <strong className="title">{this.props.t('Bambora')}</strong>
                    </div>
                    <div className="block-content" ref={this.setBlockBamboraListElement}>
                        <ul className="list-lv1">
                            <li>
                                <label className="title">{this.props.t('Terminal IP Address')}</label>
                                <input type="text"
                                       className="form-control"
                                       defaultValue={BamboraPaymentService.getIP()}
                                       onChange={(event) => this.saveIP(event)}
                                />
                            </li>
                            <li>
                                <label className="title">{this.props.t('Terminal Port')}</label>
                                <input type="text"
                                       className="form-control"
                                       defaultValue={BamboraPaymentService.getPort()}
                                       onChange={(event) => this.savePort(event)}
                                />
                            </li>
                            <li>
                                <span className="title">{this.props.t('Offline Terminal')}</span>
                                <span className="value">
                                    <label className="checkbox">
                                        <input type="checkbox"
                                               defaultChecked={
                                                   BamboraPaymentService.getMode() === BamboraConstant.MODE_OFFLINE
                                               }
                                               onChange={(event) => this.saveMode(event)}
                                        />
                                        <span></span>
                                    </label>
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div className="block-bottom">
                        <button className="btn btn-default" type="button"
                                onClick={() => this.connect()}>{this.props.t('Connect')}</button>
                    </div>
                </div>
            </Fragment>
        )
    }
}

class BamboraContainer extends CoreContainer {
    static className = 'BamboraContainer';

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
export default ContainerFactory.get(BamboraContainer).withRouter(
    ComponentFactory.get(Bambora)
);