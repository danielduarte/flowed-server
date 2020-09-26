import {Entity, model, property, AnyObject} from '@loopback/repository';

@model({settings: {strict: false}})
export class Flow extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'date',
    default: '$now',
  })
  createdAt: Date;

  @property({
    type: 'date',
  })
  updatedAt: Date;

  @property({
    type: 'string',
  })
  notes: string;

  // Indexer property to allow additional data
  @property({
    type: 'object',
  })
  extra: AnyObject;

  @property({
    type: 'string',
  })
  title: string;

  @property({
    type: 'string',
  })
  description: string;

  @property({
    type: 'string',
    default: 'disabled',
  })
  status: string;

  @property({
    type: 'string',
  })
  activeVersion: string;

  @property({
    type: 'object',
    required: true,
  })
  spec: object;

  constructor(data?: Partial<Flow>) {
    super(data);
  }
}

export interface FlowRelations {
  // describe navigational properties here
}

export type FlowWithRelations = Flow & FlowRelations;
