import {
    CREATE_TICKET_ENDPOINT,
    GET_TICKET_EXECUTIONS_BY_STATE_MACHINE_ARN,
    INTERACT_WITH_TICKET
} from "../utils/apiEndpoints";
import axios from "axios";

export module requestrTicketsAPI {
    export function createTicket(data: object, stateMachineARN: string) {
        return axios.post(
            CREATE_TICKET_ENDPOINT,
            data,
            {
                params: {
                    stateMachineARN: stateMachineARN
                }
            })
    }

    export function interactWithTicket(taskToken: string, updateType: string, comment: string) {
        return axios.post(
            INTERACT_WITH_TICKET,
            {},
            {
                params: {
                    taskToken: taskToken,
                    updateType: updateType,
                    comment: comment
                }
            })
    }

    export function getTicketExecutionsByStateMachineARN(stateMachineARN: string, statusFilter: string, username: string, usersRole: string, publicFlag: boolean) {
        return axios.get(
            GET_TICKET_EXECUTIONS_BY_STATE_MACHINE_ARN,
            {
                params: {
                    stateMachineARN: stateMachineARN,
                    statusFilter: statusFilter,
                    username: username,
                    usersRole: usersRole,
                    groupType: publicFlag ? "public" : "private"
                }
            })
    }
}