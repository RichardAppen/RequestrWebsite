import React from "react";
import {BrowserRouter as Router} from 'react-router-dom';
import Testing from "./Testing";
import './Accounts.css'
import UserPool from "../UserPool";
import {ChangeEvent} from "react";
import {CognitoUser, AuthenticationDetails} from "amazon-cognito-identity-js";
import {UserInfo} from "../utils/UserInfo";

interface State {
    fullname: string | null
    username: string | null
    email: string | null
    loading: boolean
}

interface Props {

}

class Profile extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            fullname: null,
            username: null,
            email: null,
            loading: false
        }
    }

    componentDidMount() {
        const user = UserPool.getCurrentUser()

        if (user) {
            this.setState({loading: true})
            user.getSession(() => {
                this.setState({username: user.getUsername()})
                user.getUserAttributes((err, result) => {
                    if (result) {
                        result.forEach((att) => {
                            switch (att.Name) {
                                case "name": {
                                    this.setState({fullname: att.Value})
                                    break;
                                }
                                case "email": {
                                    this.setState({email: att.Value})
                                    break;
                                }
                            }
                        })
                        this.setState({loading: false})
                    }
                })
            })
        }
    }

    render() {
        return (
            <div>
                {(!UserPool.getCurrentUser()) && <div className={"please-login"}>
                    Please Login to access this page
                </div>}
                {(UserPool.getCurrentUser()) &&<div>
                    <h1 className="account-action-title">Your Profile Information</h1>
                    <div className="profile-container">
                        <ul>
                            <li>
                                <div>
                                    <label> Name: </label>
                                    <span> {this.state.fullname ? this.state.fullname : ""}</span>
                                </div>
                            </li>
                            <li>
                                <div>
                                    <label> Username: </label>
                                    <span> {this.state.username ? this.state.username : ""}</span>
                                </div>
                            </li>
                            <li>
                                <div>
                                    <label> Email: </label>
                                    <span> {this.state.email ? this.state.email : ""}</span>
                                </div>
                            </li>
                            {this.state.loading && <li>
                                <div>
                                    <div> Loading... </div>
                                </div>
                            </li>}
                        </ul>
                    </div>
                </div>}
            </div>
        )
    }
}

export default Profile