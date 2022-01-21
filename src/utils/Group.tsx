export interface Group {
    groupName: string,
    owner: string,
    usersRole: string,
    numberMembers: number,
    public: boolean,
    groupHash?: string
}