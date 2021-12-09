import React from "react";
import {BrowserRouter as Router} from 'react-router-dom';
import Testing from "./Testing";
import './Accounts.css'
import UserPool from "../UserPool";
import {ChangeEvent} from "react";
import {CognitoUser, AuthenticationDetails} from "amazon-cognito-identity-js";
import {UserInfo} from "../utils/UserInfo";
import {log} from "util";

interface State {
    username: string;
    password: string;
    email_verified: boolean;
    statusMessage: string;
    user: CognitoUser | null;
    verificationCode: string;
    loading: boolean;
    confirmingNewPassword: boolean
    newPassword: string
}

interface Props {

}

class Login extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            email_verified: true,
            statusMessage: "",
            user: null,
            verificationCode: "",
            loading: false,
            confirmingNewPassword: false,
            newPassword: ""
        }
    }

    onSubmit = () => {
        this.setState({loading: true, statusMessage: ""})
        const userLogin = new CognitoUser({
            Username: this.state.username,
            Pool: UserPool
        })
        this.setState({user: userLogin})

        const authenticationDetails = new AuthenticationDetails({
            Username: this.state.username,
            Password: this.state.password
        })

        userLogin.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                console.log("Logged in: ", result)
                window.location.href = '/'
                this.setState({loading: false})
            },
            onFailure: (error) => {
                console.log("Logging in error: ", error)
                if (error == "UserNotConfirmedException: User is not confirmed.") {
                    this.setState({statusMessage: "Your account is not verified. Please verify to log in", email_verified: false})
                } else {
                    this.setState({statusMessage: "Encountered " + error})
                }
                this.setState({loading: false})
            },
            newPasswordRequired: (result) => {
                console.log("New Password Required thrown: ", result)
                this.setState({loading: false})
            }
        })
    }

    inputChange = (event: ChangeEvent<HTMLInputElement>) => {
        switch (event.target.id) {
            case "username": {
                this.setState({username: event.target.value})
                break;
            }
            case "password": {
                this.setState({password: event.target.value})
                break;
            }
            case "verify": {
                this.setState({verificationCode: event.target.value})
                break;
            }
            case "newPassword": {
                this.setState({newPassword: event.target.value})
                break;
            }
        }
    }

    verify = () => {
        this.setState({loading: true})
        if (this.state.user) {
            this.state.user.confirmRegistration(this.state.verificationCode, true, (err, result) => {
                if (err) {
                    console.log("error: ", err)
                    this.setState({statusMessage: "Verification code was incorrect. Please try Again", loading: false})
                } else {
                    console.log(result)
                    this.setState({statusMessage: "Verification successful!", email_verified: true, loading: false})
                    this.onSubmit()
                }
            })
        }
    }

    resend = () => {
        if (this.state.user) {
            this.state.user.resendConfirmationCode((err) => {
                if (err) {
                    console.log("resend verification error: ", err)
                }
            })
        }
    }

    forgotPassword = () => {
        if (this.state.username == "") {
            this.setState({statusMessage: "Please enter your username or email in the username field to recover your password."})
        } else {
            const user = new CognitoUser({
                Username: this.state.username,
                Pool: UserPool
            })
            this.setState({loading: true})
            if (user) {
                user.getSession(() => {
                    user.forgotPassword({
                        onSuccess: (result) => {
                            console.log("Recovery sent: ", result)
                            this.setState({statusMessage: "New Password sent to account's email", loading: false, confirmingNewPassword: true})
                        },
                        onFailure: (error) => {
                            console.log("Recovery error: ", error)
                            this.setState({statusMessage: "Encountered " + error})
                            this.setState({loading: false})
                        },
                    })
                })
            }
        }
    }

    confirmNewPassword = () => {
        const user = new CognitoUser({
            Username: this.state.username,
            Pool: UserPool
        })
        this.setState({loading: true})
        if (user) {
            user.getSession(() => {
                user.confirmPassword(this.state.verificationCode, this.state.newPassword, {
                    onSuccess: () => {
                        console.log("Password changed")
                        this.setState({loading: false, statusMessage: "Password changed successfully!", confirmingNewPassword: false})
                    },
                    onFailure: (error) => {
                        console.log(error)
                        this.setState({loading: false, statusMessage: "Encountered: " + error})
                    }
                })
            })
        }
    }

    render() {
        return (
            <div>
                <h1 className="account-action-title">Login Below</h1>
                <div className="action-container">
                    <ul>
                        <li>
                            <input id="username" type="text" placeholder="Username or Email" onChange={this.inputChange}></input>
                        </li>
                        <li>
                            <input id="password" type="text" placeholder="Password" onChange={this.inputChange}></input>
                        </li>
                        <li>
                            <button onClick={this.onSubmit}>Login</button>
                        </li>
                        <li>
                            <button onClick={this.forgotPassword}>Recover Password</button>
                        </li>
                    </ul>
                </div>
                {this.state.loading && <div className="status-message">
                    <span>Loading...</span>
                </div>}
                <div className="status-message">
                    <span>{this.state.statusMessage}</span>
                </div>
                {!this.state.email_verified && <div>
                    <div className="verify-container">
                        <button onClick={this.resend}>Resend Verification</button>
                    </div>
                    <div className="verify-container">
                        <span>{"Please Enter Verification Code:"}</span>
                        <input id="verify" type="text" placeholder="Verification Code" onChange={this.inputChange}></input>
                        <button onClick={this.verify}>Verify</button>
                    </div>
                </div>}
                {this.state.confirmingNewPassword && <div className="verify-container">
                    <span>{"Enter verification code and new password:"}</span>
                    <input id="verify" type="text" placeholder="Verification Code" onChange={this.inputChange}></input>
                    <input id="newPassword" type="text" placeholder="New Password" onChange={this.inputChange}></input>
                    <button onClick={this.confirmNewPassword}>Change Password</button>
                </div>}
            </div>
        )
    }
}

export default Login;
