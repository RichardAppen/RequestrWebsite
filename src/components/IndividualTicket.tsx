import React from "react";
import './Groups.css'
import {Ticket} from "../utils/Ticket";
import {requestrTicketsAPI} from "../api/requestrTicketsAPI";
import './IndividualTicket.css'
import {Group} from "../utils/Group";

interface State {
    comments: string[][]
    currentInput: string
    commentStatusMessage: string
    approveDenyStatusMessage: string
    archiveStatusMessage: string
}

interface Props {
    ticket: Ticket
    group: Group
    archived: boolean
}

class IndividualTicket extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            comments: this.props.ticket.comments,
            currentInput: "",
            commentStatusMessage: "",
            approveDenyStatusMessage: "",
            archiveStatusMessage: ""
        }
    }

    makeComment = () => {
        if (this.state.currentInput !== "") {
            this.setState({commentStatusMessage: "Loading..."})
            const currSetOfComments = this.state.comments
            const newComment = [this.props.group.username, this.state.currentInput, new Date().toLocaleString()]
            requestrTicketsAPI.interactWithTicket(this.props.ticket.token!, 'Comment', JSON.stringify(newComment)).then((response) => {
                currSetOfComments.unshift(newComment)
                this.setState({comments: currSetOfComments, currentInput: "", commentStatusMessage: ""})
            }).catch((error) => {
                this.setState({commentStatusMessage: "Error: " + error, currentInput: ""})
            })
        }
    }

    approveOrDenyTicket = (username: string, usersRole: string, approvedOrDenied: string) => {
        this.setState({approveDenyStatusMessage: "Loading..."})
        const currSetOfComments = this.state.comments
        const newComment = ["Requestr Automated System", `This ticket has been ${approvedOrDenied} by Group ${usersRole} ${username}. The comment section is now closed.`, new Date().toLocaleString()]
        requestrTicketsAPI.interactWithTicket(this.props.ticket.token!, approvedOrDenied, JSON.stringify(newComment)).then((response) => {
            currSetOfComments.unshift(newComment)
            this.setState({comments: currSetOfComments, currentInput: "", approveDenyStatusMessage: ""})
            window.location.href = '/Groups/' + this.props.group.groupHash + '/active'
        }).catch((error) => {
            this.setState({approveDenyStatusMessage: "Error: " + error, currentInput: ""})
        })
    }

    archiveTicket = () => {
        this.setState({archiveStatusMessage: "Loading..."})
        requestrTicketsAPI.interactWithTicket(this.props.ticket.token!, 'Archived', JSON.stringify([])).then((response) => {
            this.setState({archiveStatusMessage: ""})
            window.location.href = '/Groups/' + this.props.group.groupHash + '/active'
        }).catch((error) => {
            this.setState({archiveStatusMessage: "Error: " + error})
        })
    }

    userHasPower = () : boolean => {
        if (this.props.group.usersRole !== "Member") {
            return true
        }
        return false
    }

    determineStatusClass = () : string => {
        switch (this.props.ticket.ticketData.status) {
            case 'Approved': {
                return 'individual-ticket-header-status-approved'
            }
            case 'Denied': {
                return 'individual-ticket-header-status-denied'
            }
            default: {
                return 'individual-ticket-header-status-pending'
            }
        }
    }

    render() {
        return (

            <div>
                {this.props.archived && <div className="archived-message">
                    {"This Ticket has been archived and is in READ ONLY mode. No further action is possible."}
                </div>}
                <div className='flex-header'>
                    <div className='individual-ticket-header-requestor'>
                        {this.props.ticket.ticketData.requestor}
                    </div>
                    <div className='individual-ticket-header-date'>
                        {this.props.ticket.ticketData.date}
                    </div>
                </div>
                <div className='individual-ticket-header-subject'>
                    {this.props.ticket.ticketData.subject}
                </div>
                <div className={this.determineStatusClass()}>
                    {this.props.ticket.ticketData.status}
                </div>
                <div className='divider-special'>

                </div>
                <div className='individual-ticket-header-entries'>
                    Description:
                </div>
                <div className='individual-ticket-description'>
                    <p>{this.props.ticket.ticketData.description}</p>
                </div>
                <div className='individual-ticket-header-entries'>
                    Comments:
                </div>
                <div className={this.props.archived ? 'comment-box-archived' : 'comment-box'}>
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
                <div className="status-message">
                    {this.state.commentStatusMessage}
                </div>
                {(this.props.ticket.ticketData.status === 'Pending') && <div className='make-comment'>
                    <input value={this.state.currentInput} onChange={(e) => {this.setState({currentInput: e.target.value})}}></input>
                    <div>
                    <button onClick={this.makeComment} disabled={(this.props.ticket.ticketData.status !== 'Pending')}>Comment</button>
                    </div>
                </div>}
                {this.userHasPower() && (this.props.ticket.ticketData.status === 'Pending') && <div className="approve-deny-container">
                    <div className="status-message">
                        {this.state.approveDenyStatusMessage}
                    </div>
                    <button className="approve-deny-button" onClick={() => {this.approveOrDenyTicket(this.props.group.username, this.props.group.usersRole, 'Approved')}}> Approve </button>
                    <button className="approve-deny-button" onClick={() => {this.approveOrDenyTicket(this.props.group.username, this.props.group.usersRole, 'Denied')}}> Deny </button>
                </div>}
                {this.userHasPower() && (!this.props.archived) && (this.props.ticket.ticketData.status !== 'Pending') && <div className="approve-deny-container">
                    <div className="status-message">
                        {this.state.archiveStatusMessage}
                    </div>
                    <button className="approve-deny-button" onClick={() => {this.archiveTicket()}}> Archive </button>
                </div>}
            </div>
        )
    }
}

export default IndividualTicket;