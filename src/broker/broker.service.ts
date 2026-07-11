import { BrokerMessage } from './BrokerMessage';

export const BrokerServiceToken = 'BrokerService';

export interface BrokerService {
  send(message: BrokerMessage): Promise<void>;
}
