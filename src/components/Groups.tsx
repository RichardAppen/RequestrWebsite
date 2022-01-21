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
import axios from "axios";

interface State {
    usersGroups: Group[],
    creatingGroup: boolean,
    joiningGroup: boolean
    statusMessage: string
}

interface Props {
}

class Groups extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        // Load groups associated with logged in user

        this.state = {
            usersGroups: [],
            creatingGroup: false,
            joiningGroup: false,
            statusMessage: ""
        }
    }
    componentDidMount() {
        this.loadUsersGroup()
    }

    loadUsersGroup = async () => {
        this.setState({statusMessage: "Loading..."})

        const user = UserPool.getCurrentUser()
        if (user) {
            user.getSession(async () => {
                let username = user.getUsername()
                await axios.get(
                    "https://d136pqz23a.execute-api.us-east-1.amazonaws.com/prod/",
                    {params: {username: username}})
                    .then( (response) => {
                        this.setState({statusMessage: ""})
                        // Set Groups
                        this.setState({usersGroups: response.data})
                        // Create hash for each group
                        this.state.usersGroups.forEach((group) => {
                            if (group.groupHash) {
                                localStorage.setItem(group.groupHash, JSON.stringify(group))
                            }
                        })
                    }).catch((error) => {
                        this.setState({statusMessage: JSON.stringify(error)})
                    })
            })
        }
    }

    goToTicketGroup = (group: Group) => {
        window.location.href = `/Groups/${group.groupHash}`
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
                        <div className={"status-message"}>{this.state.statusMessage}</div>
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
                    {(UserPool.getCurrentUser()) && this.state.creatingGroup && <CreateGroup addGroup={this.addGroup} usersGroups={this.state.usersGroups}></CreateGroup> }
                    {(UserPool.getCurrentUser()) && this.state.joiningGroup && <JoinGroup addGroup={this.addGroup}></JoinGroup>}
                </div>
        )
    }
}

export default Groups;