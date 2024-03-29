import React from "react";
import './Groups.css'
import {Ticket} from "../utils/Ticket";
import {requestrTicketsAPI} from "../api/requestrTicketsAPI";
import './IndividualTicket.css'
import {Group} from "../utils/Group";
import {Execution} from "../utils/Execution";
import {requestrGroupsAPI} from "../api/requestrGroupsAPI";

interface State {
    comments: string[][]
    currentInput: string
    commentStatusMessage: string
    approveDenyStatusMessage: string
    archiveStatusMessage: string
    tokenExpired: boolean
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
            archiveStatusMessage: "",
            tokenExpired: false
        }
    }

    makeComment = () => {
        if (this.state.currentInput !== "") {
            this.setState({commentStatusMessage: "Loading..."})
            // first make sure the user hasn't been kicked out
            this.userIsStillPartOfTheGroup().then((userInGroup) => {
                if (userInGroup) {
                    //Second check if there weren't updates from another user
                    requestrTicketsAPI.getTicketExecutionsByStateMachineARN(
                        this.props.group.stateMachineARN!,
                        "RUNNING",
                        this.props.group.username,
                        this.props.group.usersRole,
                        this.props.group.public).then((response ) => {
                        // Find matching ticket
                        let foundTicket = false
                        response.data.forEach((execution: Execution) => {
                            if (execution.request.ticketData.ticketId === this.props.ticket.ticketData.ticketId && execution.request.ticketData.status === 'Pending') {
                                foundTicket = true
                                const currSetOfComments = execution.request.comments
                                const newComment = [this.props.group.username, this.state.currentInput, new Date().toLocaleString()]
                                requestrTicketsAPI.interactWithTicket(execution.token, 'Comment', JSON.stringify(newComment)).then((response) => {
                                    currSetOfComments.unshift(newComment)
                                    this.setState({
                                        comments: currSetOfComments,
                                        currentInput: "",
                                        commentStatusMessage: "",
                                        tokenExpired: true
                                    })
                                }).catch((error) => {
                                    this.setState({commentStatusMessage: "Error: " + error, currentInput: ""})
                                })
                            }
                        })
                        if (!foundTicket) {
                            this.setState({commentStatusMessage: ""})
                            window.location.href = `/Groups/${this.props.group.groupHash!}/active`
                        }
                    })
                } else {
                    this.setState({commentStatusMessage: ""})
                    window.location.href = `/Groups/${this.props.group.groupHash!}/active`
                }
            })
        }
    }

    approveOrDenyTicket = (username: string, usersRole: string, approvedOrDenied: string) => {
        this.setState({approveDenyStatusMessage: "Loading..."})
        // Confirm users membership before doing anything
        this.userIsStillPartOfTheGroup().then((userInGroup) => {
            if (userInGroup[0] && userInGroup[1] !== "Member") {
                const currSetOfComments = this.state.comments
                const newComment = ["Requestr Automated System", `This ticket has been ${approvedOrDenied} by Group ${usersRole} ${username}. The comment section is now closed.`, new Date().toLocaleString()]

                // Normal case of just hitting approve or deny without having commented first
                if (!this.state.tokenExpired) {
                    requestrTicketsAPI.interactWithTicket(this.props.ticket.token!, approvedOrDenied, JSON.stringify(newComment)).then((response) => {
                        currSetOfComments.unshift(newComment)
                        this.setState({comments: currSetOfComments, currentInput: "", approveDenyStatusMessage: ""})
                        window.location.href = '/Groups/' + this.props.group.groupHash + '/active'
                    }).catch((error) => {
                        this.setState({approveDenyStatusMessage: "Error: " + error, currentInput: ""})
                    })

                    // Special case of having commented first, thus invalidating the saved ticket. We must go back and get the most recent ticket.
                } else {
                    requestrTicketsAPI.getTicketExecutionsByStateMachineARN(
                        this.props.group.stateMachineARN!,
                        "RUNNING",
                        this.props.group.username,
                        this.props.group.usersRole,
                        this.props.group.public).then((response ) => {
                        response.data.forEach((execution: Execution) => {
                            if (execution.request.ticketData.ticketId === this.props.ticket.ticketData.ticketId) {
                                requestrTicketsAPI.interactWithTicket(execution.token, approvedOrDenied, JSON.stringify(newComment)).then((response) => {
                                    currSetOfComments.unshift(newComment)
                                    this.setState({comments: currSetOfComments, currentInput: "", approveDenyStatusMessage: ""})
                                    window.location.href = '/Groups/' + this.props.group.groupHash + '/active'
                                }).catch((error) => {
                                    this.setState({approveDenyStatusMessage: "Error: " + error, currentInput: ""})
                                })
                            }
                        })
                    })
                }
            } else {
                this.setState({approveDenyStatusMessage: ""})
                window.location.href = `/Groups/${this.props.group.groupHash!}/active`
            }
        })
    }

    archiveTicket = () => {
        this.setState({archiveStatusMessage: "Loading..."})
        // Confirm users membership before doing anything
        this.userIsStillPartOfTheGroup().then((userInGroup) => {
            if (userInGroup[0] && userInGroup[1] !== 'Member') {
                requestrTicketsAPI.interactWithTicket(this.props.ticket.token!, 'Archived', JSON.stringify([])).then((response) => {
                    this.setState({archiveStatusMessage: ""})
                    window.location.href = '/Groups/' + this.props.group.groupHash + '/active'
                }).catch((error) => {
                    this.setState({archiveStatusMessage: "Error: " + error})
                })
            } else {
                this.setState({archiveStatusMessage: ""})
                window.location.href = `/Groups/${this.props.group.groupHash!}/active`
            }
        })
    }

    userIsStillPartOfTheGroup = async () : Promise<[boolean, string]> => {
        let isMember = false
        let usersRole = "Non-Member"
        await requestrGroupsAPI.getEntriesByUsername(this.props.group.username)
            .then( (response) => {
                response.data.forEach((group: Group) => {
                    if (this.props.group.groupHash! === group.groupHash) {
                        isMember = true
                        usersRole = group.usersRole
                    }
                })
            }).catch((error) => {
            })
        return new Promise<[boolean, string]>((resolve, reject) => {
            resolve([isMember, usersRole])
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