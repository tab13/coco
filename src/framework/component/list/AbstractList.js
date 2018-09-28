import React from 'react';
import CoreComponent from '../CoreComponent';
import Item from './item/AbstractListItem';

export default class AbstractList extends CoreComponent {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            columns: [],
            searchKey: '',
            isSearching: false
        }
    }

    /**
     * Set loading flag is true
     */
    startLoading() {
        this.setState({loading: true});
    }

    /**
     * Set loading flag is false
     */
    stopLoading() {
        this.setState({loading: false});
    }

    /**
     * Check list can load
     *
     * @return boolean
     */
    canLoad() {
        return !this.isLoading();
    }

    /**
     * Return loading flag value
     *
     * @return boolean
     */
    isLoading() {
        return this.state.loading;
    }

    /**
     * add items to list
     *
     * @param {Array} items
     */
    addItems(items = []) {
        this.setState({items: items || []});
    }

    /**
     * Push more items to list
     *
     * @param {Array} items
     */
    pushItems(items = []) {
        if (items.length > 0) {
            this.setState({items: [...this.state.items, ...items]});
        }
    }

    /**
     * Remove all items of list
     */
    clearItems() {
        this.setState({items: []})
    }

    /**
     * Load more products when you scroll product list
     *
     * @param {event} event
     */
    lazyload(event) {
        let scrollHeight = event.target.scrollHeight,
            clientHeight = event.target.clientHeight,
            scrollTop = event.target.scrollTop;
        if ((scrollHeight - (clientHeight + scrollTop) <= 0) && (this.canLoad() === true)) {
            this.startLoading();
        }
    }

    /**
     * Start searching list
     */
    startSearching() {
        this.setState({isSearching: true});
    }

    /**
     * Stop searching list
     */
    stopSearching() {
        this.setState({isSearching: false});
    }

    /**
     * List is searching
     *
     * @return {boolean}
     */
    isSearching() {
        return this.state.isSearching;
    }

    template() {
        return (
            <div>
                <table>
                    <thead>
                    <tr>
                        {
                            this.state.columns.map(
                                (column, index) => <th key={index} name={column.name}>{column.label}</th>
                            )
                        }
                    </tr>
                    </thead>
                    <tbody onScroll={event => this.lazyload(event)}>
                    {
                        this.state.items.map((item, index) => <Item key={index} columns={this.state.columns}
                                                                    data={item}/>)
                    }
                    </tbody>
                </table>
            </div>
        )
    }
}