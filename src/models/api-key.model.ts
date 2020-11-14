import {model, property, AnyObject} from '@loopback/repository';
import {OwnedEntity} from './abstract/owned-entity';

@model({settings: {strict: true}})
export class ApiKey extends OwnedEntity {
  @property({
    type: 'string',
    id: true,
    defaultFn: 'uuidv4',
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
    type: 'date',
  })
  expiresAt: Date;

  @property({
    type: 'string',
    required: true,
  })
  key: string;

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
    default: 'disabled',
  })
  status: string;

  constructor(data?: Partial<ApiKey>) {
    super(data);
  }
}

export interface ApiKeyRelations {
  // describe navigational properties here
}

export type ApiKeyWithRelations = ApiKey & ApiKeyRelations;
