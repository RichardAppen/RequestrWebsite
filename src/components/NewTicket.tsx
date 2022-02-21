import React, {ChangeEvent} from "react";
import './Groups.css'
import {Md5} from "ts-md5";
import {Ticket} from "../utils/Ticket";
import './NewTicket.css'
import IndividualTicket from "./IndividualTicket";
import newTicket from "./NewTicket";
import UserPool from "../UserPool";
import {requestrTicketsAPI} from "../api/requestrTicketsAPI";
import {requestrGroupsAPI} from "../api/requestrGroupsAPI";
import {Group} from "../utils/Group";

interface State {
    newTicketSubject: string;
    newTicketDescription: string;
    requestor: string
    date: string
    statusMessage: string
}

interface Props {
    addTicket: () => void;
    stateMachineARN: string;
    group: Group
}

class NewTicket extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            newTicketDescription: "",
            newTicketSubject: "",
            requestor: this.props.group.username,
            date: new Date().toLocaleString(),
            statusMessage: ""
        }

        setInterval(this.updateTime, 1000)

    }

    subjectChanged = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({newTicketSubject: event.target.value})
    }

    descriptionChanged = (event: ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({newTicketDescription: event.target.value})
    }

    createTicketPressed = async () => {
        if (this.state.newTicketDescription != "" && this.state.newTicketSubject != "") {
            this.setState({statusMessage: "Loading..."})

            // Make sure user is still a member of the group
            this.userIsStillPartOfTheGroup().then(async (userInGroup) => {
                if (userInGroup) {
                    let newTicketMd5 = new Md5()
                    newTicketMd5.appendStr(this.state.requestor)
                    newTicketMd5.appendStr(this.state.newTicketSubject)
                    newTicketMd5.appendStr(this.state.newTicketDescription)
                    const finalHash = newTicketMd5.end() as string

                    const finalTicketToAdd: Ticket = {
                        ticketData: {
                            ticketId: finalHash,
                            requestor: this.state.requestor,
                            subject: this.state.newTicketSubject,
                            date: new Date().toLocaleString(),
                            status: "Pending",
                            description: this.state.newTicketDescription
                        },
                        comments: []
                    }

                    await requestrTicketsAPI.createTicket(finalTicketToAdd.ticketData, this.props.stateMachineARN).then((response) => {
                        console.log(response)
                        this.setState({statusMessage: "Ticket created successfully!"})
                        this.props.addTicket()
                    }).catch((error) => {
                        console.log(error)
                        this.setState({statusMessage: "Error: " + error})
                    })
                } else {
                    this.setState({statusMessage: ""})
                    window.location.href = `/Groups/${this.props.group.groupHash!}`
                }
            })
        }
    }

    userIsStillPartOfTheGroup = async () : Promise<boolean> => {
        let isMember = false
        await requestrGroupsAPI.getEntriesByUsername(this.props.group.username)
            .then( (response) => {
                response.data.forEach((group: Group) => {
                    if (this.props.group.groupHash! === group.groupHash) {
                        isMember = true
                    }
                })
            }).catch((error) => {
            })
        return new Promise<boolean>((resolve, reject) => {
            resolve(isMember)
        })
    }

    updateTime = () => {
        this.setState({date: new Date().toLocaleString()})
    }

    render() {
        return (
            <div>
                <div className="status-message">
                    {this.state.statusMessage}
                </div>
                <div className='flex-header'>
                    <div className='individual-ticket-header-requestor'>
                        {this.state.requestor}
                    </div>
                    <div id='timeDiv' className='individual-ticket-header-date'>
                        {this.state.date}
                    </div>
                </div>
                <div className='individual-ticket-header-subject'>
                    <input className={'subject-input'} placeholder={'Subject'} onChange={this.subjectChanged}></input>
                </div>
                <div className='individual-ticket-header-status'>
                    Pending
                </div>
                <div className='divider-special'>

                </div>
                <div className='individual-ticket-header-entries'>
                    Description:
                </div>
                <div className='individual-ticket-description'>
                    <textarea className={'description-input'} placeholder={'Description'} onChange={this.descriptionChanged}></textarea>
                </div>
                <button className='create-ticket-button' onClick={this.createTicketPressed}>Create Ticket</button>
            </div>
        )
    }

}

export default NewTicket;