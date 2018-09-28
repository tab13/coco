import React from 'react';
import '../../../style/css/Category.css';
import CoreComponent from '../../../../framework/component/CoreComponent'
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../framework/container/CoreContainer";
import SmoothScrollbar from "smooth-scrollbar/index";

class CategoryItems extends CoreComponent {
    static className = 'CategoryItems';
    setCategoryListElement = element => this.category_list = element;
    /**
     * Constructor
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            title: 'All products',
            titleWrapper: 'All products',
            isOpenPopup: false,
            category_id: null,
            rootCategory: null,
            category_items_save: null,
            category_items: null
        }
    }

    /**
     * Component will receive props
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (this.state.category_items == null) {
            this.setState({
                category_items: nextProps.items,
                category_items_save: nextProps.items,
                rootCategory: nextProps.items
            });
        }

        const rootCategory = Object.assign({}, this.state.rootCategory);
        if ((this.state.category_id !== null) && (this.state.category_id !== rootCategory.id)) {
            if (this.props.category_id === null) {
                this.setState({
                    category_items: rootCategory,
                    category_items_save: rootCategory,
                    category_id: rootCategory.id,
                    title: this.splitCategoryTitle(rootCategory.name),
                    titleWrapper: this.splitCategoryTitle("All products"),
                    isOpenPopup : false
                });
                SmoothScrollbar.destroy(this.category_list);
            }
        }
    }

    /**
     * Show category popup
     */
    showPopup() {
        if (this.state.isOpenPopup === false) {
            this.setState({
                isOpenPopup: true
            });
        } else {
            if(this.state.rootCategory != null) {
                if (Number(this.state.category_id) === Number(this.state.rootCategory.id)) {
                    const rootCategory = Object.assign({}, this.state.rootCategory);
                    this.setState({
                        category_items: rootCategory,
                        title: this.splitCategoryTitle(rootCategory.name),
                        titleWrapper: this.splitCategoryTitle("All products"),
                        isOpenPopup : false
                    });
                    SmoothScrollbar.destroy(this.category_list);
                } else {
                    this.setState({
                        category_items: this.state.category_items_save,
                        isOpenPopup : false
                    });
                }
            }
        }
    }

    /**
     * This function will change title fit with <div> tag category
     * @param title
     * @returns {*}
     */
    splitCategoryTitle(title) {
        let widthParentEl = 14;
        let widthElement = title.length;
        let categoryTitle = title;
        while (widthParentEl < widthElement) {
            categoryTitle = categoryTitle.split(' ');
            if (categoryTitle.length === 1)
                break;
            categoryTitle.pop();
            categoryTitle = categoryTitle.join(' ');
            widthElement = categoryTitle.length;
        }
        return categoryTitle;
    }

    /**
     * This function will change name fit with <div> tag category
     * @param name
     * @returns {*}
     */
    splitCategoryName(name) {
        let widthParentEl = 30;
        let widthElement = name.length;
        let categoryName = name;
        while (widthParentEl < widthElement) {
            categoryName = categoryName.split(' ');
            if (categoryName.length === 1)
                break;
            categoryName.pop();
            categoryName = categoryName.join(' ');
            widthElement = categoryName.length;
        }
        return categoryName;
    }

    /**
     * This function open child category when click className="toggle-submenu" button
     */
    openChild(id) {
        const currentCategory = Object.assign({}, this.state.category_items.children.find(
            child => Number(child.id) === Number(id)
        ));
        this.setState({
            category_items: currentCategory,
            title: this.splitCategoryTitle(currentCategory.name),
        });
        SmoothScrollbar.destroy(this.category_list);
    }

    /**
     * This function update state into parents when click className = "dl-back" button
     */
    back() {
        let arrayIdCategory = this.state.category_items.path.split("/");
        arrayIdCategory.pop();
        arrayIdCategory.shift();
        arrayIdCategory.shift();
        let category = Object.assign({}, this.state.rootCategory);
        for (let i = 0; i < arrayIdCategory.length; ++i) {
            category = category.children.find(
                child => Number(child.id) === Number(arrayIdCategory[i])
            );
        }
        this.setState({
            category_items: category,
            title: this.splitCategoryTitle(category.name),
        });
        SmoothScrollbar.destroy(this.category_list);
    }

    /**
     * This function update id state, store current state and callback function parents update category_id
     * @param id
     */
    changeCategory(id) {
        const currentCategory = Object.assign({}, this.state.category_items.children.find(
            child => Number(child.id) === Number(id)
        ));
        const category_items_save = Object.assign({}, this.state.category_items);
        this.setState({
            isOpenPopup: false,
            titleWrapper: this.splitCategoryTitle(currentCategory.name),
            category_id: Number(id),
            category_items_save: category_items_save
        },
            this.props.changeCategory(id)
        );
    }

    /**
     * This function reset initial state
     */
    reset() {
        const rootCategory = Object.assign({}, this.state.rootCategory);
        this.setState({
            category_items: rootCategory,
            category_items_save: rootCategory,
            category_id: rootCategory.id,
            title: this.splitCategoryTitle(rootCategory.name),
            titleWrapper: this.splitCategoryTitle("All products"),
            isOpenPopup : false
        },
            this.props.changeCategory(null)
        );
        SmoothScrollbar.destroy(this.category_list);
    }

    /**
     * Render template
     *
     * @return {*}
     */
    template() {
        if (this.category_list && !this.state.isOpenPopup) {
            SmoothScrollbar.destroy(this.category_list);
            this.scrollbar = null;
        }
        if (!this.scrollbar && this.category_list && this.state.isOpenPopup) {
            this.scrollbar = SmoothScrollbar.init(this.category_list);
        }
        const items = this.state.category_items;
        const hasChildren = (this.state.category_items == null) ? false : (items.children !== null);
        return (
            <div className="category-product-container">
                <div className={this.state.isOpenPopup ? "category-results dl-trigger dl-active" : "category-results dl-trigger"}
                     onClick={() => this.showPopup()}
                >
                    <span className="text">{this.state.titleWrapper}</span>
                </div>
                <div className="category-drop">
                    <div className="category-top" onClick={() => this.reset()}>
                        <a>All products</a>
                    </div>
                    <div id="dl-menu" className="dl-menuwrapper">
                        <ul className={this.state.isOpenPopup ? "dl-menu dl-menu-toggle dl-menuopen" : "dl-menu dl-menu-toggle"}
                            tabIndex={"1"}
                            style={{overflow: "hidden", outline: "none"}}
                            ref={this.setCategoryListElement}>

                            {(items == null ||
                                Number(items.id) === Number(this.state.rootCategory.id))?
                                (<li className="menu-label"><a style={{padding: 15}}>Select Category</a></li>) :
                                (<li className="dl-back"><a onClick={() => this.back()}>{this.state.title}</a></li>)
                            }
                            {
                                (hasChildren === true) && items.children.map((category, key) => {
                                    return (
                                        <li className={"dl-subview"}
                                            key={key}>
                                            <a
                                                onClick={() => this.changeCategory(category.id)}
                                                style={(category.id===this.state.category_id) ? {color: "#007aff"} : {}}
                                            >{this.splitCategoryName(category.name)}</a>
                                            {(category.children != null) &&
                                            (<span className="toggle-submenu" onClick={() => this.openChild(category.id)}><span>open submenu</span></span>)}
                                        </li>
                                    )
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

class CategoryItemsContainer extends CoreContainer {
    static className = 'CategoryItemsContainer';
}

export default ContainerFactory.get(CategoryItemsContainer).withRouter(
    ComponentFactory.get(CategoryItems)
)

