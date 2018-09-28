import React, {Fragment} from "react";
import {Modal} from "react-bootstrap";
import CoreComponent from "../../../../framework/component/CoreComponent";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import ComponentFactory from '../../../../framework/factory/ComponentFactory';

export class ActivitiesHistoryComponent extends CoreComponent {
    static className = 'ActivitiesHistoryComponent';

    template() {
        return (
            <div></div>
        )
    }
}

class ActivitiesHistoryComponentContainer extends CoreContainer {
    static className = 'ActivitiesHistoryComponentContainer';
}

export default ContainerFactory.get(ActivitiesHistoryComponentContainer).withRouter(
    ComponentFactory.get(ActivitiesHistoryComponent)
);