import React from "react";
import TicketGroup from "./TicketGroup";
import {useParams} from "react-router-dom";

const TickerGroupWrapper = () => {
    const params = useParams();

    return <TicketGroup hash={params.hash ? params.hash : "url invalid"} archived={params.archived!} ticketId={params.ticketId}></TicketGroup>
}

export default TickerGroupWrapper