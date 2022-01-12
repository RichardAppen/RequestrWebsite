export interface Ticket {
    ticketId: string
    requestor: string
    subject: string
    date: string
    status: string
    description: string
    comments: string[][]
}