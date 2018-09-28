import PropTypes from 'prop-types'
import CoreContainer from "../framework/container/CoreContainer";
import CoreComponent from "../framework/component/CoreComponent";

class Container extends CoreContainer{}

class RewriteClass {}

function reducer(state = {}) { return state }

function anotherReducer(state = {}) { return state }

export default class ModuleConfigAbstract {
    module = ['name_module'];
    menu = {
        id_module: {
            "id": "id_module",
            "title": "Title in menu",
            "path": "unique key in here ...",
            "component": Container.withRouter(CoreComponent),
            "isEmbedded": false,
            "className": "icon class name",
            "sortOrder": 0
        }
    };
    reducer = { reducer , anotherReducer};
    rewrite = {
        service: {
            "NeededRewriteService": RewriteClass,
        },
        container: {
            "NeededRewriteContainer": RewriteClass,
        },
        component: {
            "NeededRewriteComponent": RewriteClass,
        }
    };
}

ModuleConfigAbstract.propTypes = {
    module: PropTypes.array.isRequired,
    menu: PropTypes.object,
    reducer: PropTypes.object,
    rewrite: PropTypes.shape({
        component: PropTypes.object,
        container: PropTypes.object,
        service: PropTypes.object,
    }),
};