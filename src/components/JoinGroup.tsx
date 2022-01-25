import React from "react";
import {BrowserRouter as Router} from 'react-router-dom';
import Testing from "./Testing";
import './Accounts.css'
import UserPool from "../UserPool";
import {ChangeEvent} from "react";
import {CognitoUser, CognitoUserAttribute} from "amazon-cognito-identity-js";
import {UserInfo} from "../utils/UserInfo";
import {PasswordRequirements} from "../utils/PasswordRequirements";
import {Group} from "../utils/Group";
import {Md5} from "ts-md5";
import axios from "axios";
import {Member} from "../utils/Member";
import {requestrGroupsAPI} from "../api/requestrGroupsAPI";

interface State {
    hash: string
    statusMessage: string
}

interface Props {
    username: string;
}

class JoinGroup extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            hash: "",
            statusMessage: ""
        }
    }

    hashChanged = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({hash: event.target.value})
    }

    postNewGroupEntry = async (group: Group) => {
        await requestrGroupsAPI.addUpdateGroupEntry({
            "username" : group.username,
            "groupName" : group.groupName,
            "groupHash" : group.groupHash,
            "owner" : group.owner,
            "usersRole" : group.usersRole,
            "public" : group.public
        }).then((response) => {
            this.setState({statusMessage: "Success! You have joined the group " + group.groupName})
            window.location.href = "/Groups"
        }).catch((error) => {
            console.log(error)
            this.setState({statusMessage: "Network error: " + error})
        })
    }

    joinGroupPressed = async () => {
        this.setState({statusMessage: "Loading..."})
        await requestrGroupsAPI.getEntriesByHash(this.state.hash)
            .then( (response) => {
                console.log("returned from GET hash method")
                if (response.data.Count !== 0) {
                    console.log("successfully found the group")
                    //add Group
                    let groupInfoSource : Group = response.data.Items[0]

                    // Create group object
                    const finalGroupToAdd: Group = {
                        username: this.props.username,
                        groupName: groupInfoSource.groupName,
                        owner: groupInfoSource.owner,
                        usersRole: "Member",
                        numberMembers: groupInfoSource.numberMembers++,
                        public: groupInfoSource.public,
                        groupHash: groupInfoSource.groupHash
                    }

                    this.postNewGroupEntry(finalGroupToAdd)

                } else {
                    console.log("could not find the group")
                    this.setState({statusMessage: "This group does not exists, check the hash you entered."})
                }
            }).catch((error) => {
                this.setState({statusMessage: JSON.stringify(error)})
            })
    }


    render() {
        return (
            <div>
                <h1 className="account-action-title">Join a Group</h1>
                <div className="action-container">
                    <ul>
                        <li>
                            <input id="groupHash" type="text" placeholder="Group Hash" onChange={this.hashChanged}></input>
                        </li>
                        <li>
                            <button onClick={this.joinGroupPressed}>Join</button>
                        </li>
                    </ul>
                </div>
                <div className="status-message">
                    {this.state.statusMessage}
                </div>
            </div>
        )
    }
}

export default JoinGroup