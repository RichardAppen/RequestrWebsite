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

interface State {
    group: Group
    tickets: Ticket[]
}

interface Props {
    hash: string
}

class TicketGroup extends React.Component<Props & RouteProps, State> {
    constructor(props: Props) {
        super(props);

        const currentGroup : string | null = localStorage.getItem(this.props.hash)

        this.state = {
            group: currentGroup ? JSON.parse(currentGroup) : "Invalid Group",
            tickets: [
                {ticketId: '1111', requestor: 'rich', subject: '1st', date: '1/09/21', status: 'Pending', description: 'This is a long description about which we can test the individual ticket view and see how it handles wrapped around text and what it may do with it', comments: [["rappen", "Hello", "1/09/12 12:41"], ["rappen", "Hello", "1/09/21 12:40"]]},
                {ticketId: '2222', requestor: 'rich', subject: '2nd', date: '1/09/21', status: 'Pending', description: '', comments: []},
                {ticketId: '3333', requestor: 'rich', subject: '3rd', date: '1/09/21', status: 'Pending', description: '', comments: []},
                {ticketId: '4444', requestor: 'rich', subject: '4th', date: '1/09/21', status: 'Pending', description: '', comments: []},
                {ticketId: '5555', requestor: 'rich', subject: '5th', date: '1/09/21', status: 'Pending', description: '', comments: []}
            ]

        }
    }

    loadMemberList = () : boolean => {
        //only load member list if logged in user is owner or admin
        if (this.state.group.usersRole == 'member') {
            return false
        }

        //once this is checked then load all members from DynamoDB

        return true
    }

    render() {
        return(
            <div>
                <h1 className='group-title'> Ticket Group: {this.state.group.groupName} </h1>
                <div className='ticket-side'>
                    <div className='display-block'>
                        <h1 className='ticket-title'> Tickets </h1>
                        <div className='table'>
                            <Table tickets={this.state.tickets}></Table>
                        </div>
                    </div>
                </div>
                <div className='group-info-side'>
                    <div className='display-block'>
                        <div className='group-info-your-role-header'>
                            <h1> Your Role: </h1>
                            <div> {this.state.group.usersRole}</div>
                            <h2> Other Info: </h2>
                            <div className="group-info-headers">
                                <div>Owner:</div>
                                <div>Number of Members:</div>
                            </div>
                            <div className="group-info-entries">
                                <div>{this.state.group.owner}</div>
                                <div>{this.state.group.numberMembers}</div>
                            </div>
                        </div>
                        {this.loadMemberList() && <div className='member-list'>
                            <h1> Member List: </h1>
                        </div>}
                    </div>
                </div>
            </div>
        )
    }
}

export default TicketGroup;