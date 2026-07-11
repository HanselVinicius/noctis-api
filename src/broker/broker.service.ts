import { BrokerMessage } from "./BrokerMessage";

export interface BrokerService{
    send(message:BrokerMessage):Promise<void>;
}