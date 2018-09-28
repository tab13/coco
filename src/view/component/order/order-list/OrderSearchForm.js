import React from 'react';
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../framework/container/CoreContainer";
import CoreComponent from "../../../../framework/component/CoreComponent";
import {isMobile} from 'react-device-detect';

export class OrderSearchForm extends CoreComponent {
    static className = 'OrderSearchForm';

    searchTimeOut = null;
    blurTimeout = null;

    setSearchBoxElement = element => this.search_box = element;

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            search_box_value: "",
            showXButton: false,
        };
    }

    /**
     * component will receive props
     *  if searchKey is not empty, set it to search box's value
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.scanningBarcode) {
            this.search_box.value = nextProps.barcodeString;
            this.setState({search_box_value: nextProps.barcodeString});
        }
    }

    /**
     * Change input search box
     *
     * @param event
     */
    changeSearchKey(event) {
        let searchKey = event.target.value;
        this.setState({
            search_box_value: searchKey,
            showXButton: !!searchKey
        });
        if (this.searchTimeOut) {
            clearTimeout(this.searchTimeOut);
        }
        this.searchTimeOut = setTimeout(() => {
            this.props.changeSearchKey(searchKey);
        }, 100);
    }

    /**
     * on focus input
     * @param event
     */
    onFocus(event) {
        this.setState({
            showXButton: !!event.target.value,
        });
    }

    /**
     * on blur search box
     * @param event
     */
    blurSearchBox(event) {
        if (this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }
        this.blurTimeout = setTimeout(() => {
            this.setState({
                showXButton: false,
            });
            this.props.blurSearchBox(event);
            return null;
        }, 200);
    }

    /**
     * Clear input search box
     */
    clearSearchBox() {
        this.search_box.value = "";
        this.setState({search_box_value: ""});
        this.props.changeSearchKey('');
        setTimeout(() => {
            this.props.clickSearchBox();
            return this.search_box.focus();
        }, 220);
    }

    /**
     * Cancel searching
     */
    cancelSearching() {
        this.search_box.value = "";
        this.setState({
            search_box_value: ''
        });
        this.props.cancelSearching();
    }

    /**
     *
     * @returns {*}
     */
    render() {
        return (
            <div className="block-search">
                <div className="box-search">
                    <button className="btn-search" type="button"><span>search</span></button>
                    <input type="text" className="input-search form-control order-input-search"
                           ref={this.setSearchBoxElement}
                           placeholder={
                               this.props.isSearching() ? '' : this.props.t("Search by order, product, customer info ")
                           }
                           onClick={event => this.props.clickSearchBox(event)}
                           onBlur={event => this.blurSearchBox(event)}
                           onKeyUp={event => this.changeSearchKey(event)}
                           onFocus={event => this.onFocus(event)}
                           disabled={this.props.scanningBarcode}
                    />
                    {
                        this.state.showXButton ?
                            (
                                <button className="btn-remove" type="button"
                                        onClick={() => this.clearSearchBox()}>
                                    <span>remove</span>
                                </button>
                            ) :
                            ""
                    }
                    {
                        isMobile && !this.props.isSearching() ?
                            <button className="btn-barcode" type="button"
                                    onClick={() => this.props.openScanner()}>
                                <span>barcode</span>
                            </button>
                            :
                            null
                    }
                </div>
                {
                    this.props.searchKey || this.props.barcodeString || this.props.isSearching() ?
                        <button className="btn-cannel" type="button"
                                onClick={() => this.cancelSearching()}>
                            Cancel
                        </button>
                        :
                        null
                }
            </div>
        );
    }
}

class OrderSearchFormContainer extends CoreContainer {
    static className = 'OrderSearchFormContainer';
}

/**
 * @type {OrderSearchForm}
 */
export default ContainerFactory.get(OrderSearchFormContainer).withRouter(
    ComponentFactory.get(OrderSearchForm)
)