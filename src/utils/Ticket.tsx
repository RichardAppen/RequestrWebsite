export interface Ticket {
    ticketData: {
        ticketId: string
        requestor: string
        subject: string
        date: string
        status: string
        description: string
    },
    comments: string[][],
    token?: string
}