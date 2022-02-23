import React from "react";
import axios from "axios";
import UserPool from "../UserPool";
import {RecentlyViewedTicket} from "../utils/RecentlyViewedTicket";
import './Home.css'
import createGroup1 from "../assets/createGroup1.png"
import createGroup2 from "../assets/createGroup2.png"
import createGroup3 from "../assets/createGroup3.png"
import createGroup4 from "../assets/createGroup4.png"
import joinGroup1 from "../assets/joinGroup1.png"
import joinGroup2 from "../assets/joinGroup2.png"
import joinGroup3 from "../assets/joinGroup3.png"
import joinGroup4 from "../assets/joinGroup4.png"
import createTicket1 from "../assets/createTicket1.png"
import createTicket2 from "../assets/createTicket2.png"
import createTicket3 from "../assets/createTicket3.png"
import createTicket4 from "../assets/createTicket4.png"
import managingTicket1 from "../assets/managingTickets1.png"
import managingTicket2 from "../assets/managingTickets2.png"
import managingTicket3 from "../assets/managingTickets3.png"
import archiveTicket1 from "../assets/archiveTicket1.png"
import archiveTicket2 from "../assets/archiveTicket2.png"
import archiveTicket3 from "../assets/archiveTicket3.png"
import archiveTicket4 from "../assets/archiveTicket4.png"
import managingUsers1 from "../assets/managingUsers1.png"
import managingUsers2 from "../assets/managingUsers2.png"
import managingUsers3 from "../assets/managingUsers3.png"
import notifications1 from "../assets/notifications1.png"
import notifications2 from "../assets/notifications2.png"
import notifications3 from "../assets/notifications3.png"
import notifications4 from "../assets/notifications4.png"
import glance1 from "../assets/glance1.png"
import glance2 from "../assets/glance2.png"
import glance2_2 from "../assets/glance2-2.png"
import glance3 from "../assets/glance3.png"
import glance4 from "../assets/glance4.png"
import glance5 from "../assets/glance5.png"
import glance6 from "../assets/glance6.png"

interface State {
    welcomeMessage: string
    recentlyViewedTickets? : RecentlyViewedTicket[]
    statusMessage: string
    displayCreateGroup: boolean
    displayJoinGroup: boolean
    displayCreateTicket: boolean
    displayManagingTicket: boolean
    displayArchiveTicket: boolean
    displayManagingUsers: boolean
    displayNotifications: boolean
    atAGlanceRef: React.RefObject<any>
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
            statusMessage: "",
            displayCreateGroup: false,
            displayJoinGroup: false,
            displayCreateTicket: false,
            displayManagingTicket: false,
            displayArchiveTicket: false,
            displayManagingUsers: false,
            displayNotifications: false,
            atAGlanceRef: React.createRef()
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

    changeTutorialDisplay = (section: string) => {
        switch (section) {
            case 'createGroup': {
                this.setState({displayCreateGroup: !this.state.displayCreateGroup})
                break;
            }
            case 'joinGroup': {
                this.setState({displayJoinGroup: !this.state.displayJoinGroup})
                break;
            }
            case 'createTicket': {
                this.setState({displayCreateTicket: !this.state.displayCreateTicket})
                break;
            }
            case 'managingTicket': {
                this.setState({displayManagingTicket: !this.state.displayManagingTicket})
                break;
            }
            case 'archiveTicket': {
                this.setState({displayArchiveTicket: !this.state.displayArchiveTicket})
                break;
            }
            case 'managingUsers': {
                this.setState({displayManagingUsers: !this.state.displayManagingUsers})
                break;
            }
            case 'notifications': {
                this.setState({displayNotifications: !this.state.displayNotifications})
                break;
            }
        }
    }

    scrollToAtAGlance = () => {
        this.state.atAGlanceRef.current.scrollIntoView({
            block: 'start',
            behavior: 'smooth'
        })
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
                    <h3 className='header-1'>
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
                <h1 ref={this.state.atAGlanceRef} className='main-title' onClick={this.scrollToAtAGlance}>
                    Requestr at a Glance
                </h1>
                <div className='glance-container'>
                    <h1 className='glance-1-title'>
                        Create or join groups to use this simple request and approval ticketing service. Groups are great for Team Projects, Business Workflows, and many more applications!
                    </h1>
                    <img className='glance-1-img' src={glance1}></img>
                </div>
                <div className='glance-container'>
                    <img className='glance-2-img' src={glance2}></img>
                    <h1 className='glance-2-title'>
                        View tickets created in a group. Easy to interpret system with color coding for approved, denied, and pending tickets.
                    </h1>
                </div>
                <div className='glance-container'>
                    <h1 className='glance-2-2-title'>
                        Easily add and view other's comments on tickets for a quick flow of information!
                    </h1>
                    <img className='glance-2-2-img' src={glance2_2}></img>
                </div>
                <div>
                    <img className='glance-3-img' src={glance3}></img>
                    <h1 className='glance-3-title'>
                        Comment and review tickets. Once they are approved or denied (as shown above) they can only be archived by an administrator of the group.
                    </h1>
                </div>
                <div>
                    <img className='glance-4-img' src={glance4}></img>
                    <h1 className='glance-4-title'>
                        Create new tickets that can be commented on and interacted with. When new tickets are made, group administrators are notified by email.
                    </h1>
                </div>
                <div>
                    <img className='glance-5-img' src={glance5}></img>
                    <h1 className='glance-5-title'>
                        You can view archived tickets that administrators moved to the archive section. This prevents clutter of the main ticket table and keeps track of what is finished!
                    </h1>
                </div>
                <div className='glance-container'>
                    <img className='glance-6-img' src={glance6}></img>
                    <h1 className='glance-6-title'>
                        Administrators can keep track of the members of their group, while being able to promote and demote them with ease!
                    </h1>
                </div>
                <div className='divider-special'>

                </div>
                <h1 className='main-title'>
                    Requestr Features Demo & How To's
                </h1>
                <div className='header-container'>
                    <h3 className='header-1'>
                        {"Creating a group:"}
                    </h3>
                    <button onClick={() => this.changeTutorialDisplay('createGroup')} className='display-tutorial-button'>{this.state.displayCreateGroup ? 'v' : '>'}</button>
                </div>
                {this.state.displayCreateGroup && <div className='tutorial-container'>
                    <div className='step1'>
                        <img src={createGroup1}></img>
                        <div>Click on the Create a Group button.</div>
                    </div>
                    <div className='step2'>
                        <img src={createGroup2}></img>
                        <div>Pick a group name, and choose if your group will be public or private. Remember these things cannot be changed after the group is created.</div>
                    </div>
                </div>}
                {this.state.displayCreateGroup && <div className='tutorial-container'>
                    <div className='step3'>
                        <img src={createGroup3}></img>
                        <div>Once the group is created it will show up under your 'My Groups' list. You can then click on the group tile.</div>
                    </div>
                    <div className='step4'>
                        <img src={createGroup4}></img>
                        <div>Here you find yourself in that specific group. You have a display for tickets created in the group, a display for archived tickets,
                            and a display for information. The information tabs tell you about the group,
                            and provides the unique group hash that you can share to allow others to join. Since you created the group, you are the owner and have full permissions</div>
                    </div>
                </div>}
                <div className='header-container'>
                    <h3 className='header-1'>
                        {"Joining a group:"}
                    </h3>
                    <button onClick={() => this.changeTutorialDisplay('joinGroup')} className='display-tutorial-button'>{this.state.displayJoinGroup ? 'v' : '>'}</button>
                </div>
                { this.state.displayJoinGroup && <div className='tutorial-container'>
                    <div className='step1'>
                        <img src={joinGroup1}></img>
                        <div>Click on the Join a Group button.</div>
                    </div>
                    <div className='step2'>
                        <img src={joinGroup2}></img>
                        <div>Provide the unique code of the group. This can only be found in the side bar of the group by anyone that is already a member of the group.</div>
                    </div>
                </div>}
                {this.state.displayJoinGroup && <div className='tutorial-container'>
                    <div className='step3'>
                        <img src={joinGroup3}></img>
                        <div>Once the group is joined it will show up under your 'My Groups' list. You can then click on the group tile.</div>
                    </div>
                    <div className='step4'>
                        <img src={joinGroup4}></img>
                        <div>Again this is the group display. Since you just joined the group your role is only 'Member'. Since you are not the owner of the group, you also have the ability to leave it.</div>
                    </div>
                </div>}
                <div className='header-container'>
                    <h3 className='header-1'>
                        {"Creating a ticket:"}
                    </h3>
                    <button onClick={() => this.changeTutorialDisplay('createTicket')} className='display-tutorial-button'>{this.state.displayCreateTicket ? 'v' : '>'}</button>
                </div>
                { this.state.displayCreateTicket && <div className='tutorial-container'>
                    <div className='step1'>
                        <img src={createTicket1}></img>
                        <div>Click on the New Ticket button from within the group you want the ticket to be made in.</div>
                    </div>
                    <div className='step2'>
                        <img src={createTicket2}></img>
                        <div>Provide a subject and description for the ticket depending on what it is you are requesting. Then click the Create Ticket button.</div>
                    </div>
                </div>}
                {this.state.displayCreateTicket && <div className='tutorial-container'>
                    <div className='step3'>
                        <img src={createTicket3}></img>
                        <div>After the new ticket is created you will be loaded back at the main table for the group, with the new ticket at the top of the table. You can click on
                        any row in this table to see more about that individual ticket, as each row represents one ticket in the group.</div>
                    </div>
                    <div className='step4'>
                        <img src={createTicket4}></img>
                        <div>This is what the ticket window will display. If it is a public group then every member of the group will be able to view this ticket. If it is a private group
                        then only you (the requestor), the admins, and the owner of the group can view the ticket. Members, admins, and the owner can leave comments on the ticket, while just admins,
                        and the owner can approve, deny, or archive the ticket.</div>
                    </div>
                </div>}
                <div className='header-container'>
                    <h3 className='header-1'>
                        {"Managing a ticket:"}
                    </h3>
                    <button onClick={() => this.changeTutorialDisplay('managingTicket')} className='display-tutorial-button'>{this.state.displayManagingTicket ? 'v' : '>'}</button>
                </div>
                { this.state.displayManagingTicket && <div className='tutorial-container'>
                    <div className='step1'>
                        <img src={managingTicket1}></img>
                        <div>As an admin or owner of a group the approve and deny button will show up at the bottom of any ticket. Click on either to begin the approve/deny process. We will follow the approval process here.</div>
                    </div>
                    <div className='step2'>
                        <img src={managingTicket2}></img>
                        <div>By clicking approve (or deny) this will send you back to the main ticket table, now with the approved ticket updated to a new green color indicating its approval.</div>
                    </div>
                </div>}
                {this.state.displayManagingTicket && <div className='tutorial-container'>
                    <div className='step3'>
                        <img src={managingTicket3}></img>
                        <div>When you view this ticket there is an automated message added that described the information on its approval (or denial) and a new button that allows admins or the
                        owner to archive the ticket.</div>
                    </div>
                </div>}
                <div className='header-container'>
                    <h3 className='header-1'>
                        {"Archiving a ticket:"}
                    </h3>
                    <button onClick={() => this.changeTutorialDisplay('archiveTicket')} className='display-tutorial-button'>{this.state.displayArchiveTicket ? 'v' : '>'}</button>
                </div>
                { this.state.displayArchiveTicket && <div className='tutorial-container'>
                    <div className='step1'>
                        <img src={archiveTicket1}></img>
                        <div>As an admin or owner of a group the archive button will appear at the bottom of any approved/denied ticket. Click on it to archive the ticket.</div>
                    </div>
                    <div className='step2'>
                        <img src={archiveTicket2}></img>
                        <div>This will send you back to the groups main ticket window which will no longer show the archived ticket. To view it, along with all other
                        archived tickets, click the Archived Tickets button above the table.</div>
                    </div>
                </div>}
                {this.state.displayArchiveTicket && <div className='tutorial-container'>
                    <div className='step3'>
                        <img src={archiveTicket3}></img>
                        <div>This table now has all tickets that have been archived in this group. Click on the specific ticket you would like to view.</div>
                    </div>
                    <div className='step4'>
                        <img src={archiveTicket4}></img>
                        <div>Here you can view archived ticket's data but no further action can be taken on the ticket since it is archived.</div>
                    </div>
                </div>}
                <div className='header-container'>
                    <h3 className='header-1'>
                        {"Managing members:"}
                    </h3>
                    <button onClick={() => this.changeTutorialDisplay('managingUsers')} className='display-tutorial-button'>{this.state.displayManagingUsers ? 'v' : '>'}</button>
                </div>
                { this.state.displayManagingUsers && <div className='tutorial-container'>
                    <div className='step1'>
                        <img src={managingUsers1}></img>
                        <div>Using the Member List side bar you can click the promote button to make a Member an Admin. Owners can promote Members to Admins and demote Admins to Members. Admins can only promote Members to Admins.</div>
                    </div>
                    <div className='step2'>
                        <img src={managingUsers2}></img>
                        <div>As a power user you can also kick out group members. If you are the owner you can kick out Members and Admins. If you are an Admin you can only kick out Members</div>
                    </div>
                </div>}
                {this.state.displayManagingUsers && <div className='tutorial-container'>
                    <div className='step3'>
                        <img src={managingUsers3}></img>
                        <div>When a member is kicked out they lose access to the group and are not longer displayed.</div>
                    </div>
                </div>}
                <div className='header-container'>
                    <h3 className='header-1'>
                        {"Notifications:"}
                    </h3>
                    <button onClick={() => this.changeTutorialDisplay('notifications')} className='display-tutorial-button'>{this.state.displayNotifications ? 'v' : '>'}</button>
                </div>
                { this.state.displayNotifications && <div className='tutorial-container'>
                    <div className='step1'>
                        <img src={notifications1}></img>
                        <div>If you are an admin or owner of a group and a ticket is created in that group, you will receive an email notification about that tickets creation. In the email there is a direct link to the ticket.</div>
                    </div>
                    <div className='step2'>
                        <img src={notifications2}></img>
                        <div>If you click the direct link to the ticket, it will load that specific ticket.</div>
                    </div>
                </div>}
                {this.state.displayNotifications && <div className='tutorial-container'>
                    <div className='step3'>
                        <img src={notifications3}></img>
                        <div>The email notification also contains a direct link to the group that ticket was created in.</div>
                    </div>
                    <div className='step4'>
                        <img src={notifications4}></img>
                        <div>Following this link just brings you to the overall group the ticket was created in.</div>
                    </div>
                </div>}
                <div className='divider-special'>

                </div>
                <div className='bottom-section'>
                    Found a bug? Want to request a feature? Email support@requestr.org
                </div>
                <div className='bottom-section-2'>
                    Interested in this project or tech stack? Check out the project on my personal website <a href='https://www.richardappen.com/requestr'>richardappen.com/requestr</a>
                </div>
            </div>
        )
    }
}

export default Home