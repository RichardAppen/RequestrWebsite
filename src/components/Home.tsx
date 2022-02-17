import React from "react";
import axios from "axios";
import UserPool from "../UserPool";
import {RecentlyViewedTicket} from "../utils/RecentlyViewedTicket";
import './Home.css'

interface State {
    welcomeMessage: string
    recentlyViewedTickets? : RecentlyViewedTicket[]
    statusMessage: string
}

interface Props {

}

class Home extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        const recentlyViewedTickets : string | null = localStorage.getItem('recentlyViewedTickets')

        this.state = {
            welcomeMessage: "",
            recentlyViewedTickets: recentlyViewedTickets ? JSON.parse(recentlyViewedTickets) : undefined,
            statusMessage: ""
        }
    }

    componentDidMount() {
        this.setState({statusMessage: "Loading..."})
        const user = UserPool.getCurrentUser()

        if (user) {
            user.getSession(() => {
                this.setState({welcomeMessage: "Hi " + user.getUsername() + "!", statusMessage: ""})
            })
        } else {
            this.setState({statusMessage: ""})
        }
    }

    recentlyViewedTicketsView = () => {
        if (!this.state.recentlyViewedTickets) {
            return <div>{"You haven't viewed any tickets recently"}</div>
        } else {
            this.state.recentlyViewedTickets.forEach((recentlyViewedTicket) => {

            })
        }
    }

    recentlyViewedTicketClicked = (recentlyViewedTicket: RecentlyViewedTicket) => {
        window.location.href = recentlyViewedTicket.url
    }

    render() {
        return(
            <div>
                <div className="status-message">
                    {this.state.statusMessage}
                </div>
                {(this.state.welcomeMessage !== "") && <div>
                    <h1 className='main-title'>
                        {this.state.welcomeMessage}
                    </h1>
                    <h3 className='quick-links-header'>
                        {"Quick links to your most recently viewed tickets: "}
                    </h3>
                    <div className='recently-viewed-ticket-container'>
                    {(!this.state.recentlyViewedTickets) && <div className='no-recently-viewed-tickets-text'>{"You haven't viewed any tickets recently"}</div>}
                    {(this.state.recentlyViewedTickets) && this.state.recentlyViewedTickets.map(recentlyViewedTicket =>
                        <div className='individual-recently-viewed-ticket' onClick={() => {this.recentlyViewedTicketClicked(recentlyViewedTicket)}}>
                            <div className='recently-viewed-ticket-group-header'>
                                {"\"" + recentlyViewedTicket.subject + "\" by " + recentlyViewedTicket.requestor}
                            </div>
                            <div>
                                {recentlyViewedTicket.group}
                            </div>
                            <div className='arrow'>
                                {"==>"}
                            </div>
                        </div>
                    )}
                    </div>
                </div>}
                {(this.state.welcomeMessage === "" && this.state.statusMessage === "") && <div className='log-in-greeting'>
                    <h3>Hi there! Please <a href={'/LogIn'}> Log In </a> to use Requestr's great features that are described below</h3>
                </div>}
                <div className='divider-special'>

                </div>
            </div>
        )
    }
}

export default Home