import React from "react";
import './Groups.css'
import {Group} from "../utils/Group";
import UserPool from "../UserPool";
import {ChangeEvent} from "react";
import {CognitoUser, AuthenticationDetails, CognitoUserAttribute} from "amazon-cognito-identity-js";
import TicketGroup from "./TicketGroup";
import {NavLink} from "react-router-dom";
import { Link } from "react-router-dom";
import {Md5} from "ts-md5";
import {Ticket} from "../utils/Ticket";
import './IndividualTicket.css'

interface State {
    comments: string[][]
    currentInput: string
}

interface Props {
    ticket: Ticket
}

class IndividualTicket extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            comments: this.props.ticket.comments,
            currentInput: ""
        }
    }

    makeComment = () => {
        if (this.state.currentInput !== "") {
            const currSetOfComments = this.state.comments
            const newComment = ["rappen", this.state.currentInput, new Date().toLocaleString()]
            currSetOfComments.unshift(newComment)
            this.setState({comments: currSetOfComments, currentInput: ""})
        }
    }

    render() {
        return (

            <div>
                <div className='flex-header'>
                    <div className='individual-ticket-header-requestor'>
                        {this.props.ticket.requestor}
                    </div>
                    <div className='individual-ticket-header-date'>
                        {this.props.ticket.date}
                    </div>
                </div>
                <div className='individual-ticket-header-subject'>
                    {this.props.ticket.subject}
                </div>
                <div className='individual-ticket-header-status'>
                    {this.props.ticket.status}
                </div>
                <div className='divider-special'>

                </div>
                <div className='individual-ticket-header-entries'>
                    Description:
                </div>
                <div className='individual-ticket-description'>
                    <p>{this.props.ticket.description}</p>
                </div>
                <div className='individual-ticket-header-entries'>
                    Comments:
                </div>
                <div className='comment-box'>
                    {this.state.comments.map((comment, index) =>
                        <div className="single-comment-container">
                            <div className='single-comment-commenter'>
                                {comment[0]}
                            </div>
                            <div className='single-comment-contents'>
                                {comment[1]}
                            </div>
                            <div className='single-comment-date'>
                                {comment[2]}
                            </div>
                        </div>
                    )}
                </div>
                <div className='make-comment'>
                    <input value={this.state.currentInput} onChange={(e) => {this.setState({currentInput: e.target.value})}}></input>
                    <div>
                    <button onClick={this.makeComment}>Comment</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default IndividualTicket;