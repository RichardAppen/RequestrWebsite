import React from "react";
import "./Header.css";
import UserPool from "../UserPool";
import {CognitoUserAttribute, ICognitoUserAttributeData} from "amazon-cognito-identity-js";

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
            signedIn: false
        }
    }

    render() {
        return(
            <div>
                <div className="toolbar-container">
                    <button className="toolbar-button">Home</button>
                    <button className="toolbar-button">My Requests</button>
                    <button className="toolbar-button">Satisfy Requests</button>
                    <nav
                        className={`profile-menu ${this.state.isActive ? "active" : "inactive"}`}
                    >
                        {!this.state.signedIn && <ul>
                            <li>
                                <a href="#">Login</a>
                            </li>
                            <li>
                                <a href="/SignUp">Sign Up</a>
                            </li>
                        </ul>}
                        {this.state.signedIn && <ul>
                            <li>
                                <a href="#">My Profile</a>
                            </li>
                            <li>
                                <a href="#">Settings</a>
                            </li>
                            <li>
                                <a href="#">Sign Out</a>
                            </li>
                        </ul>}
                    </nav>
                    <div className="header-title">Requestr</div>
                    <button className="profile-button" onClick={() => {
                        this.setState({isActive: !this.state.isActive});
                    }}>
                        Profile
                    </button>
                </div>
            </div>
        )
    }
}

export default Header