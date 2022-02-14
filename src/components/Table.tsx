import React, {useEffect} from "react";
import './Table.css'
import {Group} from "../utils/Group";
import {CognitoUser} from "amazon-cognito-identity-js";
import {Ticket} from "../utils/Ticket";
import IndividualTicket from "./IndividualTicket";
import {isNull} from "util";

interface State {
    ticketSelected?: Ticket
    renderTable: boolean
}

interface Props {
    tickets: Ticket[]
    group: Group
    archived: boolean
    ticketFromURL?: Ticket
    setBelowTableStatusMessageToEmpty: () => void
}

class Table extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            renderTable: true
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (this.props.ticketFromURL !== prevProps.ticketFromURL) {
            this.setState({ticketSelected: this.props.ticketFromURL, renderTable: false})
        }
    }

    handleRowClick = (ticket: Ticket) => {
        this.props.setBelowTableStatusMessageToEmpty()
        this.setState({ticketSelected: ticket, renderTable: false})
        window.history.replaceState(null, "", `/Groups/${this.props.group.groupHash}/${this.props.archived ? 'archived' : 'active'}/${ticket.ticketData.ticketId}`)
    }

    backButtonPressed = () => {
        this.setState({ticketSelected: undefined, renderTable: true})
        window.history.replaceState(null, "", `/Groups/${this.props.group.groupHash}/${this.props.archived ? 'archived' : 'active'}`)
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
            <div>
                {this.state.renderTable && <div>
                <div className='column-headers-row'>
                    <div className='requestID-header'>
                        Request ID
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
                        <div className='requestID-entry'>
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
                        <button className='ticket-selected-back-button' onClick={this.backButtonPressed}>Back</button>
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