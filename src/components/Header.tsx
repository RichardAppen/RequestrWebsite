import React from "react";
import "./Header.css";
import UserPool from "../UserPool";
import {CognitoUser, CognitoUserAttribute, ICognitoUserAttributeData} from "amazon-cognito-identity-js";
import { Navigate } from "react-router-dom";

interface State {
   isActive: boolean;
   signedIn: boolean;
   user: CognitoUser | null;
}

interface Props {

}

class Header extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            isActive: false,
            signedIn: false,
            user: null
        }
    }

    signOut = () => {
        const user = UserPool.getCurrentUser()
        if (user) {
            user.signOut()
            window.location.href = '/Login'
        }
    }

    render() {
        return(
            <div>
                <div className="header-title">Requestr</div>
                <div className="toolbar-container">
                    <button className="toolbar-button" onClick={() => {window.location.href = "/"}}>Home</button>
                    <button className="toolbar-button" onClick={() => {window.location.href = "/Groups"}}>Groups</button>
                    <button className="profile-button" onClick={() => {
                        const user = UserPool.getCurrentUser()
                        this.setState({user: user})
                        if (!user) {
                            this.setState({signedIn: false})
                        } else {
                            this.setState({signedIn: true})
                        }
                        this.setState({isActive: !this.state.isActive});
                    }}>
                        Profile
                    </button>
                    <nav
                        className={this.state.isActive ? "profile-menu active" : "profile-menu"}
                    >
                        {!this.state.signedIn && <ul>
                            <li>
                                <a href="/Login">Login</a>
                            </li>
                            <li>
                                <a href="/SignUp">Sign Up</a>
                            </li>
                        </ul>}
                        {this.state.signedIn && <ul>
                            <li>
                                <span>{"Logged in as " + this.state.user?.getUsername()}</span>
                            </li>
                            <li>
                                <a href="/Profile">My Profile</a>
                            </li>
                            <li>
                                <a href="/Settings">Settings</a>
                            </li>
                            <li>
                                <button onClick={this.signOut}>Sign Out</button>
                            </li>
                        </ul>}
                    </nav>
                </div>
            </div>
        )
    }
}

export default Header