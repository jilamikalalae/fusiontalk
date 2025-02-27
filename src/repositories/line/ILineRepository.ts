import { ILineContact, ILineMessage } from '@/domain/LineMessage';
import { MessageType } from '@/enum/enum';

export interface ILineRepository {
  addMessageToContact(
    line: ILineContact,
    type: MessageType,
    content: string
  ): Promise<void>;

  // create(lineMessage: ILineMessage): Promise<void>;

  getContactByLineId(
    outgoingLineId: string,
    incomingLineId: string | null
  ): Promise<ILineContact[]>;
}
