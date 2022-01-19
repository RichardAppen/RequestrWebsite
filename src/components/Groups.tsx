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
import CreateGroup from "./CreateGroup";
import {Ticket} from "../utils/Ticket";
import JoinGroup from "./JoinGroup";

interface State {
    usersGroups: Group[],
    creatingGroup: boolean,
    joiningGroup: boolean
}

interface Props {
}

class Groups extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        // Load groups associated with logged in user
        this.state = {
            usersGroups: [
                {groupName: "Group Name 1", numberMembers: 0, owner: "Richard Appen", public: true, usersRole: "owner"},
                {groupName: "Group Name 2", numberMembers: 1, owner: "rich Main", public: true, usersRole: "member"}
            ],
            creatingGroup: false,
            joiningGroup: false
        }

        // Create hash for each group
        this.state.usersGroups.forEach((group) => {
            let currGroupMD5 = new Md5()
            currGroupMD5.appendStr(group.groupName)
            currGroupMD5.appendStr(group.owner)
            const finalHash = currGroupMD5.end() as string
            localStorage.setItem(finalHash, JSON.stringify(group))
            group.hash = finalHash
        })
    }


    goToTicketGroup = (group: Group) => {
        window.location.href = `/Groups/${group.hash}`
    }

    goToCreateGroup = () => {
        this.setState({creatingGroup: true})
    }

    goToJoinGroup = () => {
        this.setState({joiningGroup: true})
    }

    addGroup = (group: Group) => {
        const currGroups = this.state.usersGroups
        currGroups.push(group)
        this.setState({usersGroups: currGroups, creatingGroup: false, joiningGroup: false})
    }

    render() {
        return(
                <div>
                    {(!UserPool.getCurrentUser()) && <div className={"please-login"}>
                        Please Login to access this page
                    </div>}
                    {(UserPool.getCurrentUser()) && !this.state.creatingGroup && !this.state.joiningGroup && <div>
                    <div className="toolbar-buttons-container">
                        <button className="toolbar-buttons" onClick={this.goToCreateGroup}>Create a Group</button>
                        <button className="toolbar-buttons" onClick={this.goToJoinGroup}>Join a Group</button>
                    </div>
                    <h1 className="group-title"> My Groups </h1>
                    {this.state.usersGroups.map(group =>
                        <button className="group-container" onClick={() => this.goToTicketGroup(group)}>
                            <div className="group-name">{group.groupName}</div>
                            <div className="group-info">
                                <div>
                                    <div className="group-info-headers">Your Role:</div>
                                    <div className="group-info-entries">{group.usersRole}</div>
                                </div>
                                <div>
                                    <div className="group-info-headers">Owner:</div>
                                    <div className="group-info-entries">{group.owner}</div>
                                </div>
                                <div>
                                    <div className="group-info-headers">Number of Members:</div>
                                    <div className="group-info-entries">{group.numberMembers}</div>
                                </div>
                            </div>
                        </button>
                    )}
                    </div>}
                    {(UserPool.getCurrentUser()) && this.state.creatingGroup && <CreateGroup addGroup={this.addGroup}></CreateGroup> }
                    {(UserPool.getCurrentUser()) && this.state.joiningGroup && <JoinGroup addGroup={this.addGroup}></JoinGroup>}
                </div>
        )
    }
}

export default Groups;