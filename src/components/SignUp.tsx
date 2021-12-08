import React from "react";
import {BrowserRouter as Router} from 'react-router-dom';
import Testing from "./Testing";
import './Accounts.css'
import UserPool from "../UserPool";
import {ChangeEvent} from "react";
import {CognitoUser, CognitoUserAttribute} from "amazon-cognito-identity-js";
import {UserInfo} from "../utils/UserInfo";

interface State {
    firstName: string
    lastName: string
    email: string
    username: string
    password: string
    verificationCode: string
    verify: boolean
    user: CognitoUser | null
    statusMessage: string
}

interface Props {

}

class SignUp extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            username: "",
            firstName: "",
            lastName: "",
            password: "",
            email: "",
            verificationCode: "",
            verify: false,
            user: null,
            statusMessage: ""
        }
    }

    onSubmit = () => {
        const attName: CognitoUserAttribute = new CognitoUserAttribute({
            Name: 'name',
            Value: `${this.state.firstName} ${this.state.lastName}`
        })

        const attEmail: CognitoUserAttribute = new CognitoUserAttribute({
            Name: 'email',
            Value: this.state.email
        })
        UserPool.signUp(this.state.username, this.state.password, [attName, attEmail], [],(err, data) => {
            if (err) {
                console.log('error:', err);
                this.setState({statusMessage: "Encountered " + err})
            } else {
                console.log(data)
                this.setState({statusMessage: "Account created successfully! Please verify your account by inputting the code sent to your email.", verify: true})
            }
        })

        const user = new CognitoUser({
            Username: this.state.username,
            Pool: UserPool
        })

        this.setState({user: user})
    }

    verify = () => {
        if (this.state.user) {
            this.state.user.confirmRegistration(this.state.verificationCode, true, (err, result) => {
                if (err) {
                    console.log("error: ", err)
                    this.setState({statusMessage: "Verification code was incorrect. Please try Again"})
                } else {
                    console.log(result)
                    this.setState({statusMessage: "Verification successful!", verify: false})
                    window.location.href = '/Login'
                }
            })
        }
    }

    inputChange = (event: ChangeEvent<HTMLInputElement>) => {
        switch (event.target.id) {
            case "firstName": {
                this.setState({firstName: event.target.value})
                break;
            }
            case "lastName": {
                this.setState({lastName: event.target.value})
                break;
            }
            case "email": {
                this.setState({email: event.target.value})
                break;
            }
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
        }
    }

    render() {
        return (
            <div>
                <h1 className="account-action-title">Sign Up Below</h1>
                <div className="action-container">
                    <ul>
                        <li>
                            <input id="firstName" type="text" placeholder="First Name" onChange={this.inputChange}></input>
                        </li>
                        <li>
                            <input id="lastName" type="text" placeholder="Last Name" onChange={this.inputChange}></input>
                        </li>
                        <li>
                            <input id="email" type="text" placeholder="Email" onChange={this.inputChange}></input>
                        </li>
                        <li>
                            <input id="username" type="text" placeholder="Username" onChange={this.inputChange}></input>
                        </li>
                        <li>
                            <input id="password" type="text" placeholder="Password" onChange={this.inputChange}></input>
                        </li>
                        <li>
                            <button onClick={this.onSubmit}>Sign Up</button>
                        </li>
                    </ul>
                </div>
                <div className="status-message">
                    <span>{this.state.statusMessage}</span>
                </div>
                {this.state.verify && <div className="verify-container">
                    <span>{"Please Enter Verification Code:"}</span>
                    <input id="verify" type="text" placeholder="Verification Code" onChange={this.inputChange}></input>
                    <button onClick={this.verify}>Verify</button>
                </div>}
            </div>
        )
    }
}
export default SignUp