import {model, property} from '@loopback/repository';
import {OwnedEntity} from './abstract/owned-entity';

@model()
export class LogEntry extends OwnedEntity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    defaultFn: 'uuidv4',
  })
  id?: string;

  @property({
    type: 'date',
    default: '$now',
  })
  timestamp: Date;

  @property({
    type: 'string',
    default: 'info',
  })
  level?: string;

  @property({
    type: 'string',
    default: 'general',
  })
  eventType?: string;

  @property({
    type: 'string',
  })
  message?: string;

  @property({
    type: 'string',
  })
  objectId?: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  tags?: string[];

  @property({
    type: 'object',
  })
  extra?: object;

  constructor(data?: Partial<LogEntry>) {
    super(data);
  }
}

export interface LogEntryRelations {
  // describe navigational properties here
}

export type LogEntryWithRelations = LogEntry & LogEntryRelations;
