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

interface State {
    group: Group
    tickets: Ticket[]
    renderNewTicketWindow: boolean
    hashGiven: boolean,
    memberUpdateLoading: boolean,
    memberStatusMessage: string
}

interface Props {
    hash: string
}

class TicketGroup extends React.Component<Props & RouteProps, State> {
    constructor(props: Props) {
        super(props);

        const currentGroup : string | null = localStorage.getItem(this.props.hash)

        this.state = {
            group: currentGroup ? JSON.parse(currentGroup) : null,
            tickets: [
                {ticketId: '1111', requestor: 'rich', subject: '1st', date: '1/09/21', status: 'Pending', description: 'This is a long description about which we can test the individual ticket view and see how it handles wrapped around text and what it may do with it', comments: [["rappen", "Hello", "1/09/12 12:41"], ["rappen", "Hello", "1/09/21 12:40"]]},
                {ticketId: '2222', requestor: 'rich', subject: '2nd', date: '1/09/21', status: 'Pending', description: '', comments: []},
                {ticketId: '3333', requestor: 'rich', subject: '3rd', date: '1/09/21', status: 'Pending', description: '', comments: []},
                {ticketId: '4444', requestor: 'rich', subject: '4th', date: '1/09/21', status: 'Pending', description: '', comments: []},
                {ticketId: '5555', requestor: 'rich', subject: '5th', date: '1/09/21', status: 'Pending', description: '', comments: []}
            ],
            renderNewTicketWindow: false,
            hashGiven: currentGroup ? true : false,
            memberUpdateLoading: false,
            memberStatusMessage: ""
        }
    }

    componentDidMount() {
        if (this.state.group) {
            this.getGroupMembers(this.state.group)
        }
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

    addTicket = (ticket: Ticket) => {
        const currTickets = this.state.tickets
        currTickets.push(ticket)
        this.setState({tickets: currTickets, renderNewTicketWindow: false})
    }

    handleNewTicketPressed = () => {
        this.setState({renderNewTicketWindow: true})
    }

    backButtonPressed = () => {
        this.setState({renderNewTicketWindow: false})
    }

    changeUsersRole = async (username: string, currentRole: string) => {
        this.setState({memberStatusMessage: "Loading...", memberUpdateLoading: true})
        if (currentRole !== "Member") {
            await axios.post(
                "https://d136pqz23a.execute-api.us-east-1.amazonaws.com/prod/addUpdateGroupEntry",
                {
                    "username" : username,
                    "groupName" : this.state.group.groupName,
                    "groupHash" : this.state.group.groupHash,
                    "owner" : this.state.group.owner,
                    "usersRole" : "Member",
                    "public" : this.state.group.public
                },
                {

                }
            ).then((response) => {
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
            await axios.post(
                "https://d136pqz23a.execute-api.us-east-1.amazonaws.com/prod/addUpdateGroupEntry",
                {
                    "username" : username,
                    "groupName" : this.state.group.groupName,
                    "groupHash" : this.state.group.groupHash,
                    "owner" : this.state.group.owner,
                    "usersRole" : "Admin",
                    "public" : this.state.group.public
                },
                {

                }
            ).then((response) => {
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


    getGroupMembers = async (group: Group) => {
        this.setState({memberStatusMessage: "Loading...", memberUpdateLoading: true})
            await axios.get(
                "https://d136pqz23a.execute-api.us-east-1.amazonaws.com/prod/getEntriesByHash",
                {params: {groupHash: group.groupHash}})
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

                {(!this.state.hashGiven) && <div className="status-message">
                    This group link does not exists
                </div>}
                {(!UserPool.getCurrentUser()) && <div className={"please-login"}>
                    Please Login to access this page
                </div>}
                {(UserPool.getCurrentUser()) && (this.state.hashGiven) && <div>
                    <h1 className='group-title'> Ticket Group: {this.state.group.groupName} </h1>
                    <div className='ticket-side'>
                        <div className='display-block'>
                            <button className='new-ticket-button' onClick={this.handleNewTicketPressed}> New Ticket </button>
                            <h1 className='ticket-title'> Tickets </h1>
                            <div className='table'>
                                {this.state.renderNewTicketWindow ?
                                    <div>
                                        <div className='flex-header-grey'>
                                            <button className='ticket-selected-back-button' onClick={this.backButtonPressed}>Back</button>
                                            <div className='ticket-selected-id'>New Ticket</div>
                                        </div>
                                        <div className='ticket-selected-div'></div>
                                        <NewTicket addTicket={this.addTicket}></NewTicket>
                                    </div>
                                    :
                                    <Table tickets={this.state.tickets}></Table> }
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
                                                </div>
                                        </div>}
                                    </div>
                                )}
                                <div className="status-message">
                                    {this.state.memberStatusMessage}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
            </div>
        )
    }
}

export default TicketGroup;