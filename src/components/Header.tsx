import React from "react";
import "./Header.css";
import UserPool from "../UserPool";
import {CognitoUserAttribute, ICognitoUserAttributeData} from "amazon-cognito-identity-js";
import { Navigate } from "react-router-dom";

interface State {
   isActive: boolean;
   signedIn: boolean;
}

interface Props {

}

class Header extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            isActive: false,
            signedIn: false,
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
                    <button className="toolbar-button">Home</button>
                    <button className="toolbar-button">My Requests</button>
                    <button className="toolbar-button">Satisfy Requests</button>
                    <button className="profile-button" onClick={() => {
                        const user = UserPool.getCurrentUser()
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
                        className={`profile-menu ${this.state.isActive ? "active" : "inactive"}`}
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
                                <a href="/Profile">My Profile</a>
                            </li>
                            <li>
                                <a href="#">Settings</a>
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