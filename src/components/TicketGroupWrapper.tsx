import React from "react";
import TicketGroup from "./TicketGroup";
import {useParams} from "react-router-dom";

const TickerGroupWrapper = () => {
    const params = useParams();

    return <TicketGroup hash={params.hash ? params.hash : "url invalid"}></TicketGroup>
}

export default TickerGroupWrapper