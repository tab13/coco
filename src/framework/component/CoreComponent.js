import React, {Component, Fragment} from 'react'
// import AppStore from "../../view/store/store";
import permission from '../../helper/Permission'

export default class CoreComponent extends Component {
    static acl = false;
    beforeHTML;
    afterHTML;
    showOnPages = [];

    constructor(props) {
        super(props);
        this.fireEvent();
    }

    /**
     *  check permission for component
     *
     * @param {string} acl
     * @return {boolean}
     */
    isAllowed(acl = '') {
        if (acl) {
            return permission.isAllowed(acl);
        }
        if (this.acl) {
            return permission.isAllowed(this.acl);
        }
        return true;
    }

    /**
     *
     * @return {boolean}
     */
    canShow() {
        if (!this.props) return true;
        if (!this.props.hasOwnProperty('currentPage')) return true;
        return this.showOnPages.indexOf(this.props.currentPage) !== -1; // eslint-disable-line
    }

    /**
     *  abstract render method
     * @return {string}
     */
    template() {
        return '';
    }

    /**
     *  dispatch event to add render before or after template
     *  @return {void}
     */
    fireEvent() {
        let payload = {
            name: this.constructor.className,
            beforeHTML: this.beforeHTML,
            component: this
        };

        // AppStore.dispatch({
        //     type: `${payload.name}BeforeHtml`,
        //     payload
        // });

        this.beforeHTML = payload.beforeHTML;

        payload = {
            name: this.constructor.className,
            afterHTML: this.afterHTML,
            component: this
        };

        // AppStore.dispatch({
        //     type: `${payload.name}AfterHtml`,
        //     payload
        // });

        this.afterHTML = payload.afterHTML
    }

    /**
     *  render component
     *
     * @return {*}
     */
    render() {
        return (
            <Fragment>
                {this.beforeHTML}
                {this.template()}
                {this.afterHTML}
            </Fragment>
        )
    }
}