import {Member} from "./Member";

export interface Group {
    username: string
    groupName: string,
    owner: string,
    usersRole: string,
    numberMembers: number,
    public: boolean,
    stateMachineARN?: string,
    groupHash?: string,
    members?: Member[]
}