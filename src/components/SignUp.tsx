import React from "react";
import {BrowserRouter as Router} from 'react-router-dom';
import Testing from "./Testing";
import './Accounts.css'
import UserPool from "../UserPool";
import {ChangeEvent} from "react";
import {CognitoUser, CognitoUserAttribute} from "amazon-cognito-identity-js";
import {UserInfo} from "../utils/UserInfo";
import {PasswordRequirements} from "../utils/PasswordRequirements";

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
    loading: boolean
    passwordReqs: PasswordRequirements
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
            statusMessage: "",
            loading: false,
            passwordReqs: {
                minimumSize: false,
                hasLowercase: false,
                hasUppercase: false,
                hasDigit: false,
                hasSpecial: false
            }
        }

    }

    onSubmit = () => {
        console.log(this.state.password)
        this.setState({loading: true})
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
                this.setState({statusMessage: "Encountered " + err, loading: false})
            } else {
                console.log(data)
                this.setState({statusMessage: "Account created successfully! Please verify your account by inputting the code sent to your email.", verify: true, loading: false})
            }
        })

        const user = new CognitoUser({
            Username: this.state.username,
            Pool: UserPool
        })

        this.setState({user: user})
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
                    this.setState({statusMessage: "Verification successful!", verify: false, loading: false})
                    window.location.href = '/Login'
                }
            })
        }
    }

    checkPasswordRes = (currPass: string) => {
        const passwordReqs = this.state.passwordReqs

        if (currPass.length >= 10) {
            passwordReqs.minimumSize = true
        } else {
            passwordReqs.minimumSize = false
        }
        if (!(currPass.toUpperCase() == currPass)) {
            passwordReqs.hasLowercase = true
        } else {
            passwordReqs.hasLowercase = false
        }
        if (!(currPass.toLowerCase() == currPass)) {
            passwordReqs.hasUppercase= true
        } else {
            passwordReqs.hasUppercase = false
        }
        const regexDig = new RegExp('[0-9]')
        if (regexDig.test(currPass)) {
            passwordReqs.hasDigit = true
        }else {
            passwordReqs.hasDigit = false
        }
        const regexSymb = new RegExp('[ `!@#$%^&*()_+={};:",.<>/?~-]')
        if (regexSymb.test(currPass)) {
            passwordReqs.hasSpecial = true
        } else {
            passwordReqs.hasSpecial  = false
        }
        this.setState({passwordReqs: passwordReqs})
    }

    signUpEnabled = () => {
        const passwordReqs = this.state.passwordReqs

        if (passwordReqs.minimumSize && passwordReqs.hasLowercase && passwordReqs.hasUppercase && passwordReqs.hasDigit && passwordReqs.hasSpecial) {
            return true
        }
        return false
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
                this.checkPasswordRes(event.target.value)
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
                            <span>{"Password must include:"}</span>
                            <ul>
                                <li>
                                    <span className={this.state.passwordReqs.minimumSize ? "green" : "red"}>{"- A minimum 10 characters"}</span>
                                </li>
                                <li>
                                    <span className={this.state.passwordReqs.hasLowercase ? "green" : "red"}>{"- One lowercase letter"}</span>
                                </li>
                                <li>
                                    <span className={this.state.passwordReqs.hasUppercase ? "green" : "red"}>{"- One uppercase letter"}</span>
                                </li>
                                <li>
                                    <span className={this.state.passwordReqs.hasDigit ? "green" : "red"}>{"- One digit"}</span>
                                </li>
                                <li>
                                    <span className={this.state.passwordReqs.hasSpecial ? "green" : "red"}>{"- One symbol"}</span>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <button className={this.signUpEnabled() ? "" : "disabled"} disabled={!(this.signUpEnabled())} onClick={this.onSubmit}>Sign Up</button>
                        </li>
                    </ul>
                </div>
                {this.state.loading && <div className="status-message">
                    <span>Loading...</span>
                </div>}
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