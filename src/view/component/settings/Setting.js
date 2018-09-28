import React from "react";
import ComponentFactory from '../../../framework/factory/ComponentFactory';
import CoreContainer from '../../../framework/container/CoreContainer';
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import SmoothScrollbar from "smooth-scrollbar";
import Config from "../../../config/Config";
import AbstractGrid from "../../../framework/component/grid/AbstractGrid";
import '../../style/css/Setting.css';
import PaymentDetail from "./settings/PaymentDetail";
import SettingListConstant from "../../constant/settings/SettingListConstant";

export class Setting extends AbstractGrid {
    static className = 'Setting';

    setBlockSettingListElement = element => this.setting_list = element;
    items = [
        {
            "id": "Payment",
            "title": SettingListConstant.GET_SETTING_PAYMENT,
            "name" : "Payment",
            "component": PaymentDetail,
            "className": "li-payment",
        },
        /*{
            "id": "Shipping",
            "title": SettingListConstant.GET_SETTING_SHIPPING,
            "name" : "Shipping",
            "component": "",
            "className": "li-payment",

        },
        {
            "id": "Sync",
            "title": SettingListConstant.GET_SETTING_SYNC,
            "name" : "Sync",
            "component": "",
            "className": "li-payment",
        }*/
        ];
    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            currentItem: "",
        }
    }

    /**
     * Component will mount
     */
    componentWillMount() {
        /* Set default state mode for component from Config */
        if (Config.mode) {
            this.setState({mode: Config.mode});
        }
        if (!this.scrollbar && this.setting_list) {
            this.scrollbar = SmoothScrollbar.init(this.setting_list);
        }

        this.setState({currentItem: SettingListConstant.GET_SETTING_PAYMENT});
    }

    /**
     * Init smooth scrollbar
     */
    componentDidMount() {
        if (!this.scrollbar && this.setting_list) {
            this.scrollbar = SmoothScrollbar.init(this.setting_list);
        }
    }

    /**
     * set selected current item
     * @param itemName
     */
    setCurrentSetting(itemName) {
        this.setState({currentItem: itemName});
    }

    /**
     * template
     * @returns {*}
     */
    template() {
        return (
            <div className="wrapper-settings">
                <div className="settings-left">
                    <div className="block-title">
                        <strong className="title">Settings</strong>
                    </div>
                    <div className="block-content" ref={this.setBlockSettingListElement}>
                        <ul className="list">
                            {
                                this.items.map(item => {
                                    return (
                                        <li key={item.id}
                                            className={item.className}
                                            onClick={() => this.setCurrentSetting(item.title)}>
                                            <a >{item.name}</a>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                </div>
                {
                    this.items.map(item => {
                        let Element = item.component;
                        return (this.state.currentItem === item.title) &&
                            (Element !== "") && <Element key={item.id}/>
                    })
                }
            </div>
        )
    }
}

class SettingContainer extends CoreContainer {
    static className = 'SettingContainer';

    /**
     * map state to component's props
     * @param state
     * @return {{}}
     */
    static mapState(state) {
        return {
        };
    }

    /**
     * map actions to component's props
     * @param dispatch
     * @return {{actions: }}
     */
    static mapDispatch(dispatch) {
        return {
        }
    }
}

/**
 * @type {Setting}
 */
export default ContainerFactory.get(SettingContainer).withRouter(
    ComponentFactory.get(Setting)
);