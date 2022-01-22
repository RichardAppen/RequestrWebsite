import {Member} from "./Member";

export interface Group {
    username: string
    groupName: string,
    owner: string,
    usersRole: string,
    numberMembers: number,
    public: boolean,
    groupHash?: string,
    members?: Member[]
}