import connectMongoDB from '@/lib/mongodb';
import { LineContact, LineMessage } from '@/models/lineMessage';
import { ILineRepository } from './ILineRepository';
import { ILineContact, ILineMessage } from '@/domain/LineMessage';
import mongoose from 'mongoose';
import { MessageType } from '@/enum/enum';

export class LineRepository implements ILineRepository {
  async addMessageToContact(
    line: ILineContact,
    type: MessageType,
    content: string
  ): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await connectMongoDB();

      await LineContact.findOneAndUpdate(
        {
          incomingLineId: line.incomingLineId,
          outgoingLineId: line.outgoingLineId
        },
        {
          $setOnInsert: {
            incomingLineId: line.incomingLineId,
            outgoingLineId: line.outgoingLineId
          },
          $set: {
            profileUrl: line.profileUrl,
            displayName: line.displayName,
            statusMessage: line.statusMessage,
            lastMessage: content,
            lastMessageAt: new Date()
          },
          $push: {
            messages: {
              messageType: type,
              content: content,
              createdAt: new Date()
            }
          },
          $inc: { unreadCount: 1 },
          $currentDate: { updatedAt: true }
        },
        { upsert: true, new: true }
      );
    } catch (e: any) {
      console.error('Error create messages:', e.message);
      throw new Error('Failed to create line message into line contact');
    }
  }

  async getContactByLineId(
    outgoingLineId: string,
    incomingLineId: string | null
  ): Promise<ILineContact[]> {
    try {
      await connectMongoDB();

      const query: any = { outgoingLineId };
      if (incomingLineId) {
        query.incomingLineId = incomingLineId;
      }

      return await LineContact.find(query).sort({ lastMessageAt: -1 }).exec();
    } catch (e) {
      console.error('Error fetching line contacts:', e);
      throw new Error('Failed to fetch contacts');
    }
  }
}
