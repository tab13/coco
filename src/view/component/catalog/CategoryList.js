import React from 'react';
import '../../style/css/Category.css';
import CoreComponent from '../../../framework/component/CoreComponent'
import ComponentFactory from "../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../framework/container/CoreContainer";
import CategoryAction from "../../action/CategoryAction";
import CategoryItems from "./category/CategoryItems";

export class CategoryList extends CoreComponent {
    static className = 'CategoryList';
    /**
     * Constructor
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            category_id: null
        }
    }

    /**
     * componentWillMount: load list category when start
     */
    componentWillMount() {
        this.props.actions.getListCategory();
    }

    /**
     * This function update category when click 1 category
     * @param id
     */
    updateCategory(id) {
        this.setState({
            category_id: id
        });
    }

    /**
     * This function after mapStateToProps then push more items to component
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if(nextProps.searchKey){
            if (nextProps.category_id === null) {
                this.setState({
                    category_id: null,
                });
            }
        }
    }

    /**
     * This function change id category turn into idCategory, product will show
     * follow idCategory
     * @param idCategory
     */
    showProduct(idCategory) {
        if(idCategory){
            this.props.changeCategory(Number(idCategory));
            this.updateCategory(Number(idCategory));
        }else{
            this.props.changeCategory();
            this.updateCategory(null);
        }
    }

    /**
     * Render template
     *
     * @return {*}
     */
    template() {
        let items = this.props.categories[0];

        return (
            <CategoryItems items={items}
                changeCategory={this.showProduct.bind(this)}
                updateCategory={this.updateCategory.bind(this)}
                category_id={this.state.category_id}
            />
        );
    }
}

class CategoryListContainer extends CoreContainer {
    static className = 'CategoryListContainer';

    // This maps the state to the property of the component
    static mapState(state) {
        let {categories} = state.core.category;
        return {
            categories
        };
    }

    // This maps the dispatch to the property of the component
    static mapDispatch(dispatch) {
        return {
            actions: {
                getListCategory: () => dispatch(CategoryAction.getListCategory())
            }
        }
    }
}

export default ContainerFactory.get(CategoryListContainer).withRouter(
    ComponentFactory.get(CategoryList)
)

