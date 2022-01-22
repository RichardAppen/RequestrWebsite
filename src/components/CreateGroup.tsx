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

interface State {
    groupName: string,
    owner: string,
    usersRole: string,
    numberMembers: number,
    public: boolean,
    hash?: string,
    statusMessage: string
}

interface Props {
    addGroup: (group: Group) => void;
    usersGroups: Group[]
}

class CreateGroup extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            groupName: "",
            owner: "",
            usersRole: "",
            numberMembers: 0,
            public: true,
            statusMessage: ""
        }

    }

    inputChange = (event: ChangeEvent<HTMLInputElement>) => {
        switch (event.target.id) {
            case "groupName": {
                this.setState({groupName: event.target.value})
                break;
            }
            case "public": {
                this.setState({public: true})
                break;
            }
            case "private": {
                this.setState({public: false})
                break;
            }
        }
    }

    didGroupNameViolate = () : boolean => {
        let didViolate = false
        this.props.usersGroups.forEach((group) => {
            if (group.groupName == this.state.groupName) {
                this.setState({statusMessage: "You are already a part of a group with that name"})
                didViolate = true
            }
        })

        return didViolate
    }

    createGroupPressed = () => {
        if (this.state.groupName === "") {
            this.setState({statusMessage: "The group name cannot be empty."})
            return
        }

        if (this.didGroupNameViolate()) {
            return
        }

        const user = UserPool.getCurrentUser()
        this.setState({statusMessage: "Loading..."})
        if (user) {
            user.getSession(async () => {
                let username = user.getUsername()

                const finalGroupToAdd: Group = {
                    username: username,
                    groupName: this.state.groupName,
                    owner: username,
                    usersRole: "Owner",
                    numberMembers: 1,
                    public: this.state.public
                }

                let currGroupMD5 = new Md5()
                currGroupMD5.appendStr(finalGroupToAdd.groupName)
                currGroupMD5.appendStr(finalGroupToAdd.owner)
                const finalHash = currGroupMD5.end() as string
                localStorage.setItem(finalHash, JSON.stringify(finalGroupToAdd))
                finalGroupToAdd.groupHash = finalHash

                await axios.post(
                    "https://d136pqz23a.execute-api.us-east-1.amazonaws.com/prod/addUpdateGroupEntry",
                    {
                        "username" : username,
                        "groupName" : finalGroupToAdd.groupName,
                        "groupHash" : finalGroupToAdd.groupHash,
                        "owner" : username,
                        "usersRole" : "Owner",
                        "public" : finalGroupToAdd.public
                    },
                    {

                    }
                ).then((response) => {
                    this.setState({statusMessage: "Successfully created group! " + response.data})
                }).catch((error) => {
                    console.log(error)
                    this.setState({statusMessage: "Network error"})
                })

                this.props.addGroup(finalGroupToAdd)
            })
        }
    }


    render() {
        return (
            <div>
                <h1 className="account-action-title">Create a new Group</h1>
                <div className="action-container">
                    <ul>
                        <li>
                            <input id="groupName" type="text" placeholder="Group Name" onChange={this.inputChange}></input>
                        </li>
                        <li>
                            <div className="radio-buttons-container">
                                <div className="radio-button-input-div">
                                    <input type="radio" id="public" placeholder="Public?" onChange={this.inputChange} checked={this.state.public}></input>
                                    <div className="radio-button-titles">
                                        Public
                                    </div>
                                </div>
                                <div className="radio-button-input-div">
                                    <input type="radio" id="private" placeholder="Public?" onChange={this.inputChange} checked={!this.state.public}></input>
                                    <div className="radio-button-titles">
                                        Private
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div>

                            </div>
                        </li>
                        <li>
                            <button onClick={this.createGroupPressed}>Create</button>
                        </li>
                    </ul>
                </div>
                <div className="status-message">
                    {this.state.statusMessage}
                </div>
            </div>
        )}
}


export default CreateGroup