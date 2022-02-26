import React from "react";
import {Group} from "../utils/Group";
import UserPool from "../UserPool";
import {ChangeEvent} from "react";
import {CognitoUser, AuthenticationDetails, CognitoUserAttribute} from "amazon-cognito-identity-js";
import {URLSearchParams} from "url";
import {Md5} from "ts-md5";
import {RouteProps} from "react-router-dom";
import './TicketGroup.css'
import './Groups.css'
import Table from "./Table";
import {Ticket} from "../utils/Ticket";
import NewTicket from "./NewTicket";
import axios from "axios";
import {Member} from "../utils/Member";
import {requestrGroupsAPI} from "../api/requestrGroupsAPI";
import {requestrTicketsAPI} from "../api/requestrTicketsAPI";
import {Execution} from "../utils/Execution";

interface State {
    group: Group
    tickets: Ticket[]
    archivedTickets: Ticket[]
    renderNewTicketWindow: boolean,
    renderIndividualTicket: boolean,
    hashGiven: boolean,
    memberUpdateLoading: boolean,
    memberStatusMessage: string,
    leavingGroup: boolean,
    leavingStatusMessage: string,
    leavingGroupLoading: boolean,
    overallLoading: boolean,
    tableStatusMessage: string,
    archiveStatusMessage: string,
    viewingArchive: boolean,
    ticketFromUrl?: Ticket,
    belowTableStatusMessage: string,
    tableComponentRef: React.RefObject<Table>
}

interface Props {
    hash: string
    archived: string
    ticketId?: string
}

class TicketGroup extends React.Component<Props & RouteProps, State> {
    constructor(props: Props) {
        super(props);

        const currentGroup : string | null = localStorage.getItem(this.props.hash)

        this.state = {
            group: currentGroup ? JSON.parse(currentGroup) : null,
            tickets: [],
            archivedTickets: [],
            renderNewTicketWindow: false,
            renderIndividualTicket: false,
            hashGiven: currentGroup ? true : false,
            memberUpdateLoading: false,
            memberStatusMessage: "",
            leavingGroup: false,
            leavingStatusMessage: "",
            leavingGroupLoading: false,
            overallLoading: false,
            tableStatusMessage: "",
            archiveStatusMessage: "",
            viewingArchive: false,
            belowTableStatusMessage: "",
            tableComponentRef: React.createRef()
        }
    }

    handleIndividualTicketWasSelected = () => {
        this.setState({belowTableStatusMessage: "", renderIndividualTicket: true})
    }

    componentDidMount() {
        this.setState({overallLoading: true})
        if (this.state.group) {
            this.getGroupMembers(this.state.group)

            this.userIsActuallyPartOfGroup().then((result) => {
                localStorage.removeItem(this.state.group.groupHash!)
                if (!result[0]) {
                    this.setState({hashGiven: false})
                } else {
                    this.state.group.usersRole = result[1]
                    localStorage.setItem(this.state.group.groupHash!, JSON.stringify(this.state.group))
                }
                this.setState({overallLoading: false})
                this.loadGroupsTickets()
            })
        } else {
            this.setState({overallLoading: false})
        }
    }

    loadGroupsTickets = async () => {
        if (this.state.tickets !== []) {
            this.setState({tickets: []})
        }
        if (this.props.archived === "archived") {
            this.setState({viewingArchive: true})
        } else if (this.props.archived == 'active') {
            this.setState({viewingArchive: false})
        } else {
            this.setState({belowTableStatusMessage: "Bad URL, specify only \"/active\" or \"/archived\" (By default url was changed to \"/active\")"})
            window.history.replaceState(null, "", `/Groups/${this.state.group.groupHash}/active`)
        }
        this.setState({tableStatusMessage: "Loading...", archiveStatusMessage: "Loading..."})

        requestrTicketsAPI.getTicketExecutionsByStateMachineARN(
            this.state.group.stateMachineARN!,
            'SUCCEEDED',
            this.state.group.username,
            this.state.group.usersRole,
            this.state.group.public).then((response) => {
            this.setState({archivedTickets: response.data, archiveStatusMessage: ""})
            if (this.props.ticketId && this.props.archived === 'archived') {
                let found: boolean = false
                this.state.archivedTickets.forEach((ticket) => {
                    if (ticket.ticketData.ticketId === this.props.ticketId) {
                        found = true
                        this.setState({ticketFromUrl: ticket, renderIndividualTicket: true})
                        return
                    }
                })
                if (!found) {
                    this.setState({belowTableStatusMessage: "The specific ticket ID you are trying to access does not exists in this group"})
                }
            }
        }).catch((error) => {
            console.log("error in loading archived tickets: " + error)
            this.setState({archiveStatusMessage: "Error: " + error})
        })

        await requestrTicketsAPI.getTicketExecutionsByStateMachineARN(
            this.state.group.stateMachineARN!,
            'RUNNING',
            this.state.group.username,
            this.state.group.usersRole,
            this.state.group.public).then((response) => {
            console.log(response)
            let groupsTickets: Ticket[] = []
            response.data.forEach((execution: Execution) => {
                let currentTicket: Ticket = execution.request
                currentTicket.token = execution.token
                groupsTickets.push(currentTicket)
            })
            this.setState({tickets: groupsTickets, tableStatusMessage: ""})
            if (this.props.ticketId && this.props.archived === 'active') {
                let found : boolean = false
                this.state.tickets.forEach((ticket) => {
                    if (ticket.ticketData.ticketId === this.props.ticketId) {
                        found = true
                        this.setState({ticketFromUrl: ticket, renderIndividualTicket: true})
                        return
                    }
                })
                if (!found) {
                    this.setState({belowTableStatusMessage: "The specific ticket ID you are trying to access does not exists in this group or it is not active. Perhaps it was archived?"})
                }
            }
        }).catch((error) => {
            this.setState({tableStatusMessage: JSON.stringify(error)})
        })
    }

    userIsActuallyPartOfGroup = async () : Promise<[boolean, string]> => {
        let isMember = false
        let userRole = "Non-Member"
        await requestrGroupsAPI.getEntriesByUsername(this.state.group.username)
            .then( (response) => {
                response.data.forEach((group: Group) => {
                    if (this.state.group.groupHash! === group.groupHash) {
                        isMember = true
                        userRole = group.usersRole
                    }
                })
            }).catch((error) => {
            })
        return new Promise<[boolean, string]>((resolve, reject) => {
            resolve([isMember, userRole])
        })
    }

    renderChangeRoleButton = (targetUser: Member) : boolean => {
        if (targetUser.username == this.state.group.username) {
            return false
        }

        switch (this.state.group.usersRole) {
            case "Owner": {
                return true
                break
            }
            case "Admin": {
                if (targetUser.usersRole === "Member") {
                    return true
                } else {
                    return false
                }
                break
            }
            default: {
                return false
            }
        }
    }

    addTicket = () => {
        this.setState({renderNewTicketWindow: false})
        this.loadGroupsTickets()
    }

    handleNewTicketPressed = () => {
        this.setState({renderNewTicketWindow: true, belowTableStatusMessage: ""})
    }

    scrollToTopOfTable = () => {
        const tableElement = document.getElementById('ticketTable')
        tableElement!.scrollTop = 0
    }

    backButtonPressed = () => {
        this.scrollToTopOfTable()
        this.setState({renderNewTicketWindow: false, belowTableStatusMessage: "", renderIndividualTicket: false})
       if (this.state.tableComponentRef.current) {
           this.state.tableComponentRef.current.backButtonPressed()
       }
    }

    firstLeaveGroupButtonPressed = () => {
        this.setState({leavingGroup: true})
    }

    leaveButtonConfirmPressed = () => {
        this.setState({leavingStatusMessage: "Loading...", leavingGroupLoading: true})
        requestrGroupsAPI.deleteEntryByHashAndUsername(this.state.group.groupHash!, this.state.group.username)
            .then( (response) => {
            this.setState({leavingStatusMessage: "", leavingGroupLoading: false})
            window.location.href = "/Groups"
            localStorage.removeItem(this.state.group.groupHash!)
        }).catch((error) => {
            this.setState({leavingStatusMessage: JSON.stringify(error), leavingGroupLoading: false})
        })
    }

    leaveButtonDeniedPressed = () => {
        this.setState({leavingGroup: false})
    }

    kickOutUser = (username: string) => {
        this.setState({memberStatusMessage: "Loading...", memberUpdateLoading: true})
        requestrGroupsAPI.deleteEntryByHashAndUsername(this.state.group.groupHash!, username)
            .then( (response) => {
            this.getGroupMembers(this.state.group)
        }).catch((error) => {
            this.setState({leavingStatusMessage: JSON.stringify(error), leavingGroupLoading: false})
        })
    }

    changeUsersRole = async (username: string, currentRole: string) => {
        this.setState({memberStatusMessage: "Loading...", memberUpdateLoading: true})
        if (currentRole !== "Member") {
            await requestrGroupsAPI.addUpdateGroupEntry({
                "username" : username,
                "groupName" : this.state.group.groupName,
                "groupHash" : this.state.group.groupHash,
                "owner" : this.state.group.owner,
                "usersRole" : "Member",
                "public" : this.state.group.public
            }).then((response) => {
                this.state.group.members?.forEach((member) => {
                    if (username === member.username) {
                        member.usersRole = "Member"
                    }
                })
                console.log(this.state.group.members)
                localStorage.setItem(this.state.group.groupHash!, JSON.stringify(this.state.group!))
                this.setState({memberStatusMessage: "", memberUpdateLoading: false})
            }).catch((error) => {
                console.log(error)
                this.setState({memberStatusMessage: "Network error", memberUpdateLoading: false})
            })
        } else {
            await requestrGroupsAPI.addUpdateGroupEntry({
                "username" : username,
                "groupName" : this.state.group.groupName,
                "groupHash" : this.state.group.groupHash,
                "owner" : this.state.group.owner,
                "usersRole" : "Admin",
                "public" : this.state.group.public
            }).then((response) => {
                this.state.group.members?.forEach((member) => {
                    if (username === member.username) {
                        member.usersRole = "Admin"
                    }
                })
                console.log(this.state.group.members)
                this.setState({memberStatusMessage: "", memberUpdateLoading: false})
                localStorage.setItem(this.state.group.groupHash!, JSON.stringify(this.state.group!))
            }).catch((error) => {
                console.log(error)
                this.setState({memberStatusMessage: "Network error", memberUpdateLoading: false})
            })
        }
    }

    handleArchiveButtonPressed = () => {
        this.scrollToTopOfTable()
        this.setState({viewingArchive: !this.state.viewingArchive, belowTableStatusMessage: "", renderIndividualTicket: false, renderNewTicketWindow: false})
        if (!this.state.viewingArchive) {
            window.history.replaceState(null, '', `/Groups/${this.props.hash}/archived`)
        } else {
            window.history.replaceState(null, '', `/Groups/${this.props.hash}/active`)
        }
    }


    getGroupMembers = async (group: Group) => {
        this.setState({memberStatusMessage: "Loading...", memberUpdateLoading: true})
        await requestrGroupsAPI.getEntriesByHash(group.groupHash!)
            .then( (response) => {
                    const finalMembers: Member[] = []
                    response.data.Items.forEach((groupEntryFromHash : Group) => {
                        const groupMember = {username: groupEntryFromHash.username, usersRole: groupEntryFromHash.usersRole }
                        finalMembers.push(groupMember)
                    })
                    group.members = finalMembers
                    group.numberMembers = response.data.Count
                    this.setState({group: group, memberStatusMessage: "", memberUpdateLoading: false})
                    localStorage.setItem(group.groupHash!, JSON.stringify(group))
                }).catch((error) => {
                    this.setState({memberStatusMessage: JSON.stringify(error), memberUpdateLoading: false})
                })
        }



    render() {
        return(
            <div>
                {(this.state.overallLoading) && <div className="status-message">
                    Loading...
                </div>}
                {(!this.state.hashGiven) && <div className="status-message">
                    This group link does not exists or you don't have access to this group
                </div>}
                {(!UserPool.getCurrentUser()) && <div className={"please-login"}>
                    Please Login to access this page
                </div>}
                {(UserPool.getCurrentUser()) && (this.state.hashGiven) && (!this.state.overallLoading) && <div>
                    <h1 className='group-title'> Ticket Group: {this.state.group.groupName} </h1>
                    <div className='ticket-side'>
                        <div className='display-block'>
                            {(this.state.renderNewTicketWindow || this.state.renderIndividualTicket) && <button className='back-button' onClick={this.backButtonPressed}>Back</button>}
                            <div className='archived-and-new-ticket-button-container'>
                                <button className='archived-tickets-button' onClick={this.handleArchiveButtonPressed}>{this.state.viewingArchive ? 'Active Tickets' : 'Archived Tickets'}</button>
                                <button className='new-ticket-button' onClick={this.handleNewTicketPressed}> New Ticket </button>
                            </div>
                            <h1 className='ticket-title'> {this.state.viewingArchive ? 'Archived Tickets' : 'Tickets'} </h1>
                            <div id='ticketTable' className='table'>
                                {this.state.renderNewTicketWindow ?
                                    <div>
                                        <div className='flex-header-pending'>
                                            <div className='ticket-selected-id'>New Ticket</div>
                                        </div>
                                        <div className='ticket-selected-div'></div>
                                        <NewTicket addTicket={this.addTicket} stateMachineARN={this.state.group.stateMachineARN!} group={this.state.group}></NewTicket>
                                    </div>
                                    :
                                    <div>
                                        {(this.state.viewingArchive) &&
                                            <div>
                                                <Table
                                                    ref={this.state.tableComponentRef}
                                                    tickets={this.state.archivedTickets}
                                                    group={this.state.group} archived={true}
                                                    ticketFromURL={this.state.ticketFromUrl}
                                                    handleIndividualTicketWasSelected={this.handleIndividualTicketWasSelected}
                                                    scrollToTopOfTable={this.scrollToTopOfTable}>
                                                </Table>
                                                <div className="status-message">
                                                    {this.state.archiveStatusMessage}
                                                </div>
                                            </div>
                                        }
                                        {(!this.state.viewingArchive) &&
                                            <div>
                                                <Table
                                                    ref={this.state.tableComponentRef}
                                                    tickets={this.state.tickets}
                                                    group={this.state.group}
                                                    archived={false}
                                                    ticketFromURL={this.state.ticketFromUrl}
                                                    handleIndividualTicketWasSelected={this.handleIndividualTicketWasSelected}
                                                    scrollToTopOfTable={this.scrollToTopOfTable}>
                                                </Table>
                                                <div className="status-message">
                                                    {this.state.tableStatusMessage}
                                                </div>
                                            </div>}
                                    </div>}
                            </div>
                            <div className="status-message">
                                {this.state.belowTableStatusMessage}
                            </div>
                        </div>
                    </div>
                    <div className='group-info-side'>
                        <div className='display-block'>
                            <div className='group-info-your-role-header'>
                                <h1> Your Role: </h1>
                                <div> {this.state.group.usersRole}</div>
                                <h2> Other Info: </h2>
                                <div>
                                    <div className="group-info-headers">Owner:</div>
                                    <div className="group-info-entries">{this.state.group.owner}</div>
                                </div>
                                <div>
                                    <div className="group-info-headers">Number of Members:</div>
                                    <div className="group-info-entries">{this.state.group.numberMembers}</div>
                                </div>
                                <div>
                                    <div className="group-info-headers">Group Type:</div>
                                    <div className="group-info-entries">{this.state.group.public ? 'Public' : 'Private'}</div>
                                    <div className="unique-code-text"> {this.state.group.public ? 'In a public group, all members of the group can see all tickets' : 'In a private group, tickets can only be seen by admins, the owner, and the requestor of the ticket'} </div>
                                </div>
                                <h2> Unique Code: </h2>
                                <div className="unique-code"> {this.state.group.groupHash}</div>
                                <div className="unique-code-text"> Share this unique code with others that want to join this group! </div>
                            </div>
                            <div className='member-list'>
                                <h1> Member List: </h1>
                                <div className="member-row">
                                    <div className="member-username-header">
                                        Username:
                                    </div>
                                    <div className="member-role-header">
                                        Role:
                                    </div>
                                </div>
                                {this.state.group.members && !this.state.memberUpdateLoading && this.state.group.members.map(memberRolePair =>
                                    <div>
                                        <div className="member-row">
                                            <div className="member-username-entry">
                                            {memberRolePair.username}
                                            </div>
                                            <div className="member-role-entry">
                                                {memberRolePair.usersRole}
                                            </div>
                                        </div>
                                        {this.renderChangeRoleButton(memberRolePair) &&
                                            <div className="member-promote-container">
                                                <div className="member-username-entry"></div>
                                                <div className="member-role-entry">
                                                    <button className='member-promote-button'
                                                            onClick={() => this.changeUsersRole(memberRolePair.username, memberRolePair.usersRole)}>
                                                        {memberRolePair.usersRole === "Member" ? "Promote" : "Demote"}
                                                    </button>
                                                    <button className='member-kick-button'
                                                            onClick={() => this.kickOutUser(memberRolePair.username)}>
                                                        Kick Out
                                                    </button>
                                                </div>
                                        </div>}
                                    </div>
                                )}
                                <div className="status-message">
                                    {this.state.memberStatusMessage}
                                </div>
                            </div>
                            {this.state.group.usersRole != "Owner" && <div className="member-list">
                                {this.state.leavingGroupLoading && <div className="status-message"> {this.state.leavingStatusMessage} </div>}
                                {!this.state.leavingGroup && !this.state.leavingGroupLoading && <button className="leave-button" onClick={this.firstLeaveGroupButtonPressed}> Leave Group </button>}
                                {this.state.leavingGroup && !this.state.leavingGroupLoading && <div>
                                    <div> Are you sure you want to leave this group? </div>
                                    <button className="leave-button-small" onClick={this.leaveButtonConfirmPressed}> Yes </button>
                                    <button className="leave-button-small" onClick={this.leaveButtonDeniedPressed}> No  </button>
                                </div>}
                            </div>}
                        </div>
                    </div>
                </div>}
            </div>
        )
    }
}

export default TicketGroup;