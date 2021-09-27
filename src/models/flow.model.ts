import {model, property, AnyObject} from '@loopback/repository';
import {OwnedEntity} from './abstract/owned-entity';

@model({settings: {strict: true}})
export class Flow extends OwnedEntity {
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

  // @todo deprecated field
  @property({
    type: 'object',
  })
  spec?: object;

  @property({
    type: 'string',
  })
  specStr?: string;

  constructor(data?: Partial<Flow>) {
    super(data);
  }
}

export interface FlowRelations {
  // describe navigational properties here
}

export type FlowWithRelations = Flow & FlowRelations;
