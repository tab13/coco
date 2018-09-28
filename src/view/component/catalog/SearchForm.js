import React from 'react';
import ComponentFactory from "../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../framework/container/CoreContainer";
import CoreComponent from "../../../framework/component/CoreComponent";
import SearchConstant from "../../constant/SearchConstant";
import {isMobile} from 'react-device-detect'

export class SearchFormComponent extends CoreComponent {
    static className = 'SearchFormComponent';

    searchTimeOut = null;
    previosKey = null;
    startTime = null;
    needClearSearchBox = false;

    setSearchBoxElement = element => {
        this.props.setSearchBoxRef(element);
        return this.search_box = element;
    };

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {search_box_value: ""};
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
        if(
            (nextProps.categoryId === undefined && nextProps.categoryId !== this.props.categoryId) ||
            (nextProps.categoryId && nextProps.categoryId !== this.props.categoryId)
        ){
            this.search_box.value = "";
            this.setState({search_box_value: ""});
        }
    }

    /**
     * Component will mount
     */
    componentWillMount() {
        document.addEventListener("keydown", this._handleKeyDown.bind(this));
    }

    /**
     * Component did mount
     */
    componentDidMount() {
        if(!isMobile) {
            this.search_box.focus();
        }
    }

    /**
     * Handle key down event
     *
     * @param event
     * @private
     */
    _handleKeyDown(event) {
        if (
            this.needClearSearchBox
            && ( event.target.tagName !== 'INPUT' || event.target.className.indexOf('catalog-input-search') >= 0 )
        ) {
            this.props.clickSearchBox();
            if (this.search_box) {
                this.search_box.focus();
                this.search_box.value = "";
            }

            this.setState({search_box_value: ""});
            this.needClearSearchBox = false;
            this.startTime = null;
        }
    }

    /**
     * Before change search key event
     *
     * @param event
     */
    beforeChangeSearchKey(event) {
        if (this.props.isLoading()) {
            event.preventDefault();
        }
    }

    /**
     * Change input search box
     *
     * @param event
     */
    changeSearchKey(event) {
        let now = Date.now();
        this.previosKey = {
            key: event.key,
            timeStamp: now,
        };
        this.startTime = (this.search_box.value.length <= 1 || !this.startTime) ? now : this.startTime;
        let searchKey = event.target.value;
        this.setState({search_box_value: searchKey});
        if (this.searchTimeOut) {
            clearTimeout(this.searchTimeOut);
        }
        this.searchTimeOut = setTimeout(() => {
            let time = this.search_box.value.length ?
                        ((this.previosKey.timeStamp - this.startTime) / this.search_box.value.length)
                        : -1;
            if (
                time > 0 &&
                time < SearchConstant.MAX_DIFF_TIME_WITH_SCAN_BARCODE &&
                this.previosKey.key === SearchConstant.ENTER_KEY
            ) {
                this.props.searchBarcode(this.search_box.value);
                this.props.clickSearchBox();
                this.needClearSearchBox = true;
            } else {
                this.props.changeSearchKey(searchKey);
            }
        }, 100);
    }

    /**
     * Clear input search box
     */
    clearSearchBox() {
        this.search_box.value = "";
        this.startTime = null;
        this.setState({search_box_value: ""});
    }

    /**
     * Cancel searching
     *
     * @param event
     */
    cancelSearching(event) {
        this.search_box.value = "";
        this.startTime = null;
        this.props.cancelSearching(event);
    }

    /**
     *
     * @returns {*}
     */
    render() {
        return (
            <div className="catalog-search">
                <a className="toggle-search"><span>search</span></a>
                <div className={'form-search ' + (this.props.isSearching() ? 'active' : '')}>
                    <div className="box-search">
                        <button className="btn-search" type="button"><span>search</span></button>
                        <input type="text" className="input-search form-control catalog-input-search"
                               ref={this.setSearchBoxElement}
                               onClick={event => this.props.clickSearchBox(event)}
                               onBlur={event => this.props.blurSearchBox(event)}
                               onKeyUp={event => this.changeSearchKey(event)}
                               disabled={this.props.scanningBarcode}
                        />
                        {
                            this.state.search_box_value ?
                                (
                                    <button className="btn-remove" type="button"
                                            onClick={() => this.clearSearchBox()}>
                                        <span>remove</span>
                                    </button>
                                ) :
                                ""
                        }
                    </div>
                    {
                        this.props.searchKey || this.props.barcodeString || this.props.isSearching() ?
                            (
                                <button className="btn-cannel" type="button"
                                        onClick={(event) => this.cancelSearching(event)}>
                                    {this.props.t('Cancel')}
                                </button>
                            ) :
                            ""
                    }
                </div>
            </div>
        );
    }
}

class SearchFormContainer extends CoreContainer {
    static className = 'SearchFormContainer';
}

export default ContainerFactory.get(SearchFormContainer).withRouter(
    ComponentFactory.get(SearchFormComponent)
)