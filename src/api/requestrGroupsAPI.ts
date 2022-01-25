import {
    ADD_UPDATE_GROUP_ENTRY_ENDPOINT,
    DELETE_BY_HASH_AND_USERNAME_ENDPOINT,
    GET_ENTRIES_BY_HASH_ENDPOINT,
    GET_ENTRIES_BY_USERNAME_ENDPOINT
} from "../utils/apiEndpoints";
import axios from "axios";

export module requestrGroupsAPI {
    export function deleteEntryByHashAndUsername(groupHash: string, username: string) {
        return axios.delete(DELETE_BY_HASH_AND_USERNAME_ENDPOINT,
            {
                params: {
                    groupHash: groupHash,
                    username: username
                }
            })
    }

    export function addUpdateGroupEntry(data: object) {
        return axios.post(
            ADD_UPDATE_GROUP_ENTRY_ENDPOINT,
            data,
            {

            })
    }

    export function getEntriesByUsername(username: string) {
        return axios.get(
            GET_ENTRIES_BY_USERNAME_ENDPOINT,
            {
                params: {
                    username: username
                }
            })
    }

    export function getEntriesByHash(groupHash: string) {
        return axios.get(
            GET_ENTRIES_BY_HASH_ENDPOINT,
            {
                params: {
                    groupHash: groupHash
                }
            })
    }
}