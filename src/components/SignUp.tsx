import React from "react";
import {BrowserRouter as Router} from 'react-router-dom';
import Testing from "./Testing";
import './SignUp.css'
import UserPool from "../UserPool";
import {ChangeEvent} from "react";
import {CognitoUserAttribute} from "amazon-cognito-identity-js";

interface State {
    firstName: string
    lastName: string
    email: string
    username: string
    password: string
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
            email: ""
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
            } else {
                console.log(data)
            }
        })
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
        }
    }

    render() {
        return (
            <div>
                <h1 className="signup-title">Sign Up Below</h1>
                <div className="signup-container">
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
            </div>
        )
    }
}
export default SignUp