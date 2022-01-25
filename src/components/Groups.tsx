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
import axios, {AxiosResponse} from "axios";
import {Member} from "../utils/Member";
import {requestrGroupsAPI} from "../api/requestrGroupsAPI";

interface State {
    usersGroups: Group[],
    creatingGroup: boolean,
    joiningGroup: boolean
    statusMessage: string,
    username: string
}

interface Props {
}

class Groups extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            usersGroups: [],
            creatingGroup: false,
            joiningGroup: false,
            statusMessage: "",
            username: ""
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
                this.setState({username: username})
                await requestrGroupsAPI.getEntriesByUsername(username)
                    .then( (response) => {
                        //Get Group Members and set the users groups
                        this.getGroupMembers(response.data).then((results) => {
                            // Create hash for each group
                            results.forEach((group: Group) => {
                                if (group.groupHash) {
                                    localStorage.setItem(group.groupHash, JSON.stringify(group))
                                }
                            })
                            this.setState({statusMessage: "", usersGroups: results})
                        })
                    }).catch((error) => {
                        this.setState({statusMessage: JSON.stringify(error)})
                    })
            })
        }
    }

    getGroupMembers = (groups: Group[]) => {
        let groupPromises: Promise<Group>[] = []
        groups.forEach((group) => {
            groupPromises.push(requestrGroupsAPI.getEntriesByHash(group.groupHash!)
                .then( (response) => {
                    const finalMembers: Member[] = []
                    response.data.Items.forEach((groupEntryFromHash : Group) => {
                        const groupMember = {username: groupEntryFromHash.username, usersRole: groupEntryFromHash.usersRole }
                        finalMembers.push(groupMember)
                    })
                    group.members = finalMembers
                    group.numberMembers = response.data.Count
                    return new Promise<Group>((resolve) => {
                        resolve(group)
                    })
                }).catch((error) => {
                    this.setState({statusMessage: JSON.stringify(error)})
                    return new Promise<Group>((resolve, reject) => {
                        reject()
                    })
                })
            )
        })

        return Promise.all(groupPromises)
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
                    {(UserPool.getCurrentUser()) && this.state.joiningGroup && <JoinGroup username={this.state.username}></JoinGroup>}
                </div>
        )
    }
}

export default Groups;