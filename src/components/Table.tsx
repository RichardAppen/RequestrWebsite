import React, {useEffect} from "react";
import './Table.css'
import {Group} from "../utils/Group";
import {CognitoUser} from "amazon-cognito-identity-js";
import {Ticket} from "../utils/Ticket";
import IndividualTicket from "./IndividualTicket";
import {isNull} from "util";
import {RecentlyViewedTicket} from "../utils/RecentlyViewedTicket"

interface State {
    ticketSelected?: Ticket
    renderTable: boolean
    headerRef: React.RefObject<any>
}

interface Props {
    tickets: Ticket[]
    group: Group
    archived: boolean
    ticketFromURL?: Ticket
    handleIndividualTicketWasSelected: () => void
}

class Table extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            renderTable: true,
            headerRef: React.createRef()
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (this.props.ticketFromURL !== prevProps.ticketFromURL) {
            this.setState({ticketSelected: this.props.ticketFromURL, renderTable: false})
        }
    }

    handleRowClick = (ticket: Ticket) => {
        this.props.handleIndividualTicketWasSelected()
        this.setState({ticketSelected: ticket, renderTable: false})
        const ticketURL = `/Groups/${this.props.group.groupHash}/${this.props.archived ? 'archived' : 'active'}/${ticket.ticketData.ticketId}`
        window.history.replaceState(null, "", ticketURL)

        // Deal with 'Recently Viewed Tickets'
        const ticketAboutToBeViewed : RecentlyViewedTicket = {
            url: ticketURL,
            subject: ticket.ticketData.subject,
            requestor: ticket.ticketData.requestor,
            group: this.props.group.groupName
        }
        const recentlyViewedTicketsString = localStorage.getItem('recentlyViewedTickets')
        if (recentlyViewedTicketsString) {
            let recentlyViewedTickets: RecentlyViewedTicket[] = JSON.parse(recentlyViewedTicketsString)
            // check if its already listed
            let listed = false
            recentlyViewedTickets.forEach((recentlyViewedTicket) => {
                if (recentlyViewedTicket.url === ticketAboutToBeViewed.url) {
                    listed = true
                }
            })
            if (!listed) {
                recentlyViewedTickets.unshift(ticketAboutToBeViewed)
                if (recentlyViewedTickets.length > 3) {
                    recentlyViewedTickets = recentlyViewedTickets.slice(0, 3)
                }
                localStorage.setItem('recentlyViewedTickets', JSON.stringify(recentlyViewedTickets))
            }
        } else {
            localStorage.setItem('recentlyViewedTickets', JSON.stringify([ticketAboutToBeViewed]))
        }
        this.state.headerRef.current.scrollIntoView()
    }

    backButtonPressed = () => {
        this.setState({ticketSelected: undefined, renderTable: true})
        window.history.replaceState(null, "", `/Groups/${this.props.group.groupHash}/${this.props.archived ? 'archived' : 'active'}`)
    }

    scrollToTopOfTable = () => {
        this.state.headerRef.current.scrollIntoView()
    }

    determineRowClass = (currentTicket: Ticket) : string => {
        if (this.props.archived) {
            return 'regular-row-archived'
        } else {
            switch (currentTicket.ticketData.status) {
                case 'Approved': {
                    return 'regular-row-approved'
                }
                case 'Denied': {
                    return 'regular-row-denied'
                }
                default: {
                    return 'regular-row-pending'
                }
            }
        }
    }

    determineHeaderClass = () : string => {
        if (this.props.archived) {
            return 'flex-header-archived'
        } else {
            switch (this.state.ticketSelected?.ticketData.status) {
                case 'Approved': {
                    return 'flex-header-approved'
                }
                case 'Denied': {
                    return 'flex-header-denied'
                }
                default: {
                    return 'flex-header-pending'
                }
            }
        }
    }

    render() {
        return (
            <div ref={this.state.headerRef} >
                {this.state.renderTable && <div>
                <div className='column-headers-row'>
                    <div className='ticketID-header'>
                        Ticket ID
                    </div>
                    <div className='requestor-header'>
                        Requestor
                    </div>
                    <div className='subject-header'>
                        Subject
                    </div>
                    <div className='date-header'>
                        Date
                    </div>
                    <div className='status-header'>
                        Status
                    </div>
                </div>
                {this.props.tickets.map(ticket =>
                    <div className={this.determineRowClass(ticket)} onClick={() => {this.handleRowClick(ticket)}}>
                        <div className='ticketID-entry'>
                            {ticket.ticketData.ticketId}
                        </div>
                        <div className='requestor-entry'>
                            {ticket.ticketData.requestor}
                        </div>
                        <div className='subject-entry'>
                            {ticket.ticketData.subject}
                        </div>
                        <div className='date-entry'>
                            {ticket.ticketData.date}
                        </div>
                        <div className='status-entry'>
                            {ticket.ticketData.status}
                        </div>
                    </div>
                )}
                </div>}
                {(this.state.ticketSelected) && <div>
                    <div className={this.determineHeaderClass()}>
                        <div className='ticket-selected-id'>Ticket ID: {this.state.ticketSelected.ticketData.ticketId}</div>
                    </div>
                    <div className='ticket-selected-div'></div>
                    <IndividualTicket ticket={this.state.ticketSelected} group={this.props.group} archived={this.props.archived}> </IndividualTicket>
                </div>}
            </div>
        )
    }
}

export default Table