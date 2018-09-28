import React from 'react';
import Quagga from 'quagga';
import PropTypes from 'prop-types';
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../framework/container/CoreContainer";
import CoreComponent from "../../../../framework/component/CoreComponent";
import "../../../style/css/Scanner.css";
import {isIOS} from 'react-device-detect';

class Scanner extends CoreComponent{

    previosResult = null;

    /**
     * init and start scan screen when component did mount
     */
    componentDidMount() {
        let constrains = {
            facingMode: "environment" // or user
        };
        if (isIOS) {
            constrains.width = 640;
            constrains.height = 480;
        } else {
            // constrains.width = document.getElementById('scanner').offsetWidth;
            // constrains.height = document.getElementById('scanner').offsetHeight;
            constrains.width = 800;
            constrains.height = 600;
        }

        this.props.clearBarcodeString();

        Quagga.init({
            inputStream: {
                type : "LiveStream",
                target: document.querySelector('#scanner'),
                constraints: constrains
            },
            locator: {
                patchSize: "medium",
                halfSample: true
            },
            numOfWorkers: 2,
            decoder: {
                readers : [
                    "code_128_reader",
                    "ean_reader",
                    // "ean_8_reader",
                    "code_39_reader",
                    // "code_39_vin_reader",
                    // "codabar_reader",
                    "upc_reader",
                    "upc_e_reader",
                    "i2of5_reader",
                    "2of5_reader",
                    // "code_93_reader"
                ]
            },
            locate: true
        }, function(err) {
            if (err) {
                return console.log(err);
            }
            Quagga.start();
        });
        Quagga.onDetected(this._onDetected.bind(this));
    }

    /**
     * Component will mount
     * removes the onDetect handler from the event-queue.
     */
    componentWillUnmount() {
        Quagga.offDetected(this._onDetected.bind(this));
        Quagga.stop();
    }

    /**
     * handle scan result
     * @param result
     * @private
     */
    _onDetected(result) {
        let currentResult = {
            code: result.codeResult.code,
            time: Date.now()
        };
        if (this.previosResult) {
            let diffTime = currentResult.time - this.previosResult.time;
            if (this.previosResult.code === currentResult.code && diffTime < 1500) {
                this.previosResult = currentResult;
                return;
            }
        }
        this.props.searchBarcode(currentResult.code);
        this.previosResult = currentResult;
    }

    /**
     * close scanner
     */
    closeScanner() {
        this.props.closeScanner();
    }

    /**
     * template to render
     * @returns {*}
     */
    template() {
        return (
            <div className="wrapper-barcode">
                <div className="close-barcode" onClick={() => this.closeScanner()}></div>
                <div className="bg-barcode"></div>
                <div className="scan-barcode">
                    <span className="arrow-top"></span><span className="arrow-bottom"></span>
                </div>
                <div className="barcode-content">
                    <div id="scanner" className={"viewport "+ (isIOS ? "scanner-ios" : "scanner-android")}></div>
                </div>
            </div>
        );
    }
}

Scanner.propTypes = {
    searchBarcode: PropTypes.func.isRequired,
    closeScanner: PropTypes.func.isRequired,
    clearBarcodeString: PropTypes.func.isRequired
};

class ScannerContainer extends CoreContainer {
    static className = 'ScannerContainer';

    /**
     * This maps the state to the property of the component
     * @param state
     * @returns {{}}
     */
    static mapState(state) {
        return {};
    }

    /**
     * This maps the state to the property of the component
     * @param dispatch
     * @returns {{actions: {}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {}
        }
    }
}

export default ContainerFactory.get(ScannerContainer).withRouter(
    ComponentFactory.get(Scanner)
);