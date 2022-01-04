import React from "react";
import './Groups.css'
import {Group} from "../utils/Group";
import UserPool from "../UserPool";
import {ChangeEvent} from "react";
import {CognitoUser, AuthenticationDetails, CognitoUserAttribute} from "amazon-cognito-identity-js";

interface State {
    usersGroups: Group[]
}

interface Props {

}

class Groups extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            usersGroups: [
                {groupName: "Group Name 1", numberMembers: 0, owner: "Richard Appen", public: true, usersRole: "owner"},
                {groupName: "Group Name 2", numberMembers: 1, owner: "rich Main", public: true, usersRole: "member"}
            ]
        }
    }

    render() {
        return(
            <div>
                <div className="toolbar-buttons-container">
                    <button className="toolbar-buttons">Create a Group</button>
                    <button className="toolbar-buttons">Join a Group</button>
                </div>
                <h1 className="group-title"> My Groups </h1>
                {this.state.usersGroups.map(item =>
                    <button className="group-container">
                        <div className="group-name">{item.groupName}</div>
                        <div className="group-info">
                            <div className="group-info-headers">
                                <div>Your Role:</div>
                                <div>Owner:</div>
                                <div>Number of Members:</div>
                            </div>
                            <div className="group-info-entries">
                                <div>{item.usersRole}</div>
                                <div>{item.owner}</div>
                                <div>{item.numberMembers}</div>
                            </div>
                        </div>
                    </button>
                )}
            </div>
        )
    }
}

export default Groups;