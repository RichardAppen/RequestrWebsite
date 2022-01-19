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

interface State {
    hash: string
    statusMessage: string
}

interface Props {
    addGroup: (group: Group) => void;
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

    }

    joinGroupPressed = () => {

        // make sure group hash exist by checking for entry in dynamoDB with the hash and some owner

        // if the group exists return groupName, owner, public and create an entry in the table for this user and the hash

        if (false) {
            this.setState({statusMessage: "This group does not exists, check the hash you entered."})
        }

        // Create group object
        const finalGroupToAdd: Group = {
            groupName: "Placeholder",
            owner: "Placeholder",
            usersRole: "Member",
            numberMembers: 0,
            public: false //placeholder
        }

        // get number of members from dynamo, then update number of members
        finalGroupToAdd.numberMembers = 1

        this.setState({statusMessage: "Success! You have joined the group " + "Placeholder"})

        // add the group to the local groups array
        this.props.addGroup(finalGroupToAdd)

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