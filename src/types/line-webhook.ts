export interface LineWebhookPayload {
  destination: string;
  events: Event[];
}

export interface Event {
  type: string;
  message: Message;
  webhookEventId: string;
  deliveryContext: DeliveryContext;
  timestamp: number;
  source: Source;
  replyToken: string;
  mode: string;
}

export interface Message {
  type: string;
  id: string;
  quoteToken: string;
  text: string;
}

export interface DeliveryContext {
  isRedelivery: boolean;
}

export interface Source {
  type: string;
  userId: string;
}

export interface LineProfileResponse {
  userId: string;
  displayName: string;
  pictureUrl: string;
  language: string;
  statusMessage: string;
}

export interface LineSendPushMessageRequest {
  to: string;
  messages: PushMessageContent[];
}

export interface PushMessageContent {
  type: string;
  text: string;
}
