import React from "react";
import './Accounts.css'
import UserPool from "../UserPool";
import {ChangeEvent} from "react";
import {CognitoUser, AuthenticationDetails, CognitoUserAttribute} from "amazon-cognito-identity-js";

interface State {
    password: string
    newPassword: string
    newFirstName: string
    newLastName: string
    changingPassword: boolean
    changingName: boolean
    loadingPassword: boolean
    loadingName: boolean
    passwordStatusMessage: string
    nameStatusMessage: string
}

interface Props {

}

class Settings extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            password: "",
            newPassword: "",
            newFirstName: "",
            newLastName: "",
            changingPassword: false,
            changingName: false,
            loadingPassword: false,
            loadingName: false,
            passwordStatusMessage: "",
            nameStatusMessage: ""
        }
    }

    changePassword = () => {
        this.setState({loadingPassword: true})
        const user = UserPool.getCurrentUser()

        if (user) {
            user.getSession(() => {
                user.changePassword(this.state.password, this.state.newPassword, (error, result) => {
                    if (error) {
                        console.log(error)
                        this.setState({passwordStatusMessage: "Encountered " + error, loadingPassword: false})
                    } else {
                        console.log(result)
                        this.setState({passwordStatusMessage: "Success! Password changed.", loadingPassword: false, changingPassword: false})
                    }
                })
            })
        }
    }

    changeName = () => {
        this.setState({loadingName: true})
        const user = UserPool.getCurrentUser()

        if (user) {
            user.getSession(() => {
                const newEmailAtt = new CognitoUserAttribute({Name: "name", Value: this.state.newFirstName + " " + this.state.newLastName})

                user.updateAttributes([newEmailAtt], (error, result) => {
                    if (error) {
                        console.log(error)
                        this.setState({nameStatusMessage: "Encountered " + error, loadingName: false})
                    } else {
                        console.log(result)
                        this.setState({nameStatusMessage: "Success! Full name changed.", loadingName: false, changingName: false})
                    }
                })
            })
        }
    }

    inputChange = (event: ChangeEvent<HTMLInputElement>) => {
        switch (event.target.id) {
            case "password": {
                this.setState({password: event.target.value})
                break;
            }
            case "newPassword": {
                this.setState({newPassword: event.target.value})
                break;
            }
            case "newFirstName": {
                this.setState({newFirstName: event.target.value})
                break;
            }
            case "newLastName": {
                this.setState({newLastName: event.target.value})
                break;
            }
        }
    }

    render() {
        return (
            <div>
                {(!UserPool.getCurrentUser()) && <div className={"please-login"}>
                    Please Login to access this page
                </div>}
                {(UserPool.getCurrentUser()) && <div>
                    <h1 className="account-action-title">Settings</h1>
                    {!this.state.changingPassword && <div className="action-container">
                        <ul>
                            <li>
                                <button onClick={() => {this.setState({changingPassword: true, passwordStatusMessage: ""})}}>Change Password</button>
                            </li>
                        </ul>
                    </div>}
                    {this.state.changingPassword && <div>
                        <div className="action-container">
                            <ul>
                                <li>
                                    <input id="password" type="text" placeholder="Old Password" onChange={this.inputChange}></input>
                                </li>
                                <li>
                                    <input id="newPassword" type="text" placeholder="New Password" onChange={this.inputChange}></input>
                                </li>
                                <li>
                                    <button onClick={this.changePassword}>Change Password</button>
                                </li>
                            </ul>
                        </div>
                        <div>
                            {this.state.loadingPassword && <div className="status-message">
                                <span>Loading...</span>
                            </div>}
                        </div>
                    </div>}
                    <div className="status-message">
                        <span>{this.state.passwordStatusMessage}</span>
                    </div>

                    {!this.state.changingName && <div className="action-container">
                        <ul>
                            <li>
                                <button onClick={() => {this.setState({changingName: true, nameStatusMessage: ""})}}>Change Name</button>
                            </li>
                        </ul>
                    </div>}
                    {this.state.changingName && <div>
                        <div className="action-container">
                            <ul>
                                <li>
                                    <input id="newFirstName" type="text" placeholder="New First Name" onChange={this.inputChange}></input>
                                </li>
                                <li>
                                    <input id="newLastName" type="text" placeholder="New Last Name" onChange={this.inputChange}></input>
                                </li>
                                <li>
                                    <button onClick={this.changeName}>Change Name</button>
                                </li>
                            </ul>
                        </div>
                        <div>
                            {this.state.loadingName && <div className="status-message">
                                <span>Loading...</span>
                            </div>}
                        </div>
                    </div>}
                    <div className="status-message">
                        <span>{this.state.nameStatusMessage}</span>
                    </div>
                    <div className="disclaimer">
                        <span>{"Please note that your email can be used for logging in and thus, cannot be changed"}</span>
                    </div>
                </div>}
            </div>
        )
    }
}

export default Settings;