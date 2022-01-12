import React from "react";
import './Table.css'
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
}

class Table extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            renderTable: true
        }
    }

    handleRowClick = (ticket: Ticket) => {
        this.setState({ticketSelected: ticket, renderTable: false})
    }

    backButtonPressed = () => {
        this.setState({ticketSelected: undefined, renderTable: true})
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
                    <div className='regular-row' onClick={() => {this.handleRowClick(ticket)}}>
                        <div className='requestID-entry'>
                            {ticket.ticketId}
                        </div>
                        <div className='requestor-entry'>
                            {ticket.requestor}
                        </div>
                        <div className='subject-entry'>
                            {ticket.subject}
                        </div>
                        <div className='date-entry'>
                            {ticket.date}
                        </div>
                        <div className='status-entry'>
                            {ticket.status}
                        </div>
                    </div>
                )}
                </div>}
                {this.state.ticketSelected && <div>
                    <div className='flex-header-grey'>
                        <button className='ticket-selected-back-button' onClick={this.backButtonPressed}>Back</button>
                        <div className='ticket-selected-id'>Ticket ID: {this.state.ticketSelected.ticketId}</div>
                    </div>
                    <div className='ticket-selected-div'></div>
                    <IndividualTicket ticket={this.state.ticketSelected}> </IndividualTicket>
                </div>}
            </div>
        )
    }
}

export default Table