import {Ticket} from "./Ticket";

export interface Execution {
    request: Ticket,
    token: string
}