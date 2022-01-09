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

interface State {
    group: Group
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