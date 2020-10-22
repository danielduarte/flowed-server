import {AnyObject} from '@loopback/repository';

export enum IncomingMessageType {
  FlowOpened = 'FlowOpened',
}

export enum OutgoingMessageType {
  FlowOpened = 'FlowOpened',
  FlowChanged = 'FlowChanged',
}

export interface AbstractMessage {
  payload: AnyObject;
}

export interface IncomingMessage extends AbstractMessage {
  type: IncomingMessageType;
}

export interface OutgoingMessage extends AbstractMessage {
  type: OutgoingMessageType;
}

export interface WebSocketServerConfig {
  port: number;
}
