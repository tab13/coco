import React, {Fragment} from 'react';
import {Modal} from "react-bootstrap";
import {CoreComponent} from "../../../../framework/component/index";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import {toast} from "react-toastify";
import $ from 'jquery';
import SmoothScrollbar from "smooth-scrollbar";
import OrderAction from "../../../action/OrderAction";

class OrderAddComment extends CoreComponent {
    static className = 'OrderAddComment';

    setBlockContentElement = element => {
        this.block_content = element;
        if (!this.scrollbarOrderAddComment && this.block_content) {
            this.scrollbarOrderAddComment = SmoothScrollbar.init(this.block_content);
            this.heightPopup('.popup-edit-customer.popup-add-comment .modal-dialog');
        }
    };

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            comment: '',
            btnSaveClassName: 'save disabled'
        }
    }

    /**
     * get height popup
     * @param elm
     */
    heightPopup(elm) {
        var height = $( window ).height();
        $(elm).css('height', height + 'px');
    }

    /**
     * Add new payment
     */
    saveComment() {
        if (this.state.comment) {
            this.props.actions.addComment(this.props.order, this.state.comment, true, true);
            this.cancelAddComment();
            let messageSuccess = this.props.t('Success') + ': ' +this.props.t('Comment has been added successfully.');
            toast.success (
                messageSuccess,
                {
                    position: toast.POSITION.BOTTOM_CENTER,
                    className: 'wrapper-messages messages-success'
                }
            );
        }
    }

    /**
     * cancel take payment
     */
    cancelAddComment() {
        this.props.closeAddComment();
    }

    /**
     * comment change
     * @param event
     */
    commentChange(event) {
        if (event.target.value) {
            this.setState({
                comment: event.target.value,
                btnSaveClassName: 'save'
            });
        } else {
            this.setState({
                comment: '',
                btnSaveClassName: 'save disabled'
            });
        }
    }

    /**
     * template to render
     * @returns {*}
     */
    template() {
        return (
            <Fragment>
                <Modal
                    bsSize={"lg"}
                    className={"popup-edit-customer popup-add-comment"}
                    dialogClassName={"popup-create-customer in"}
                    show={this.props.showAddCommentOrder}
                >
                    <div className="modal-header">
                        <button type="button" className="cancel" data-dismiss="modal" aria-label="Close"
                                onClick={() => this.cancelAddComment()}>
                            {this.props.t('Cancel')}
                        </button>
                        <h4 className="modal-title">{this.props.t('Add Comment')}</h4>
                        <button type="button" className={this.state.btnSaveClassName}
                                onClick={() => this.saveComment()}>
                            {this.props.t('Save')}
                        </button>
                    </div>
                    <div data-scrollbar ref={this.setBlockContentElement} className="modal-body">
                        <div className="add-comment-order">
                            <div className="box-text-area">
                                        <textarea  className="form-control"
                                                   placeholder={this.props.t('Add comment for this order')}
                                                   onChange={(event) => this.commentChange(event)}
                                                   style={{resize: 'none'}}>
                                        </textarea>
                            </div>
                        </div>
                    </div>
                </Modal>
            </Fragment>
        );
    }
}

class OrderAddCommentContainer extends CoreContainer {
    static className = 'OrderAddCommentContainer';

    /**
     * Map dispatch to props
     *
     * @param dispatch
     * @return {{actions: {selectPayment: function(*=, *=): *, switchPage: function(*=): *, resetState: function(): *, addPayment: function(*=): *}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                addComment: (order, comment, notify, visibleOnFront) => dispatch(OrderAction.addComment(order, comment, notify, visibleOnFront)),
            }
        }
    }
}

/**
 * @type {OrderAddComment}
 */
export default ContainerFactory.get(OrderAddCommentContainer).withRouter(
    ComponentFactory.get(OrderAddComment)
)