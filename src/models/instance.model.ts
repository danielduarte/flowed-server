import {model, property} from '@loopback/repository';
import {OwnedEntity} from './abstract/owned-entity';

@model()
export class Instance extends OwnedEntity {
  @property({
    type: 'string',
    id: true,
    defaultFn: 'uuidv4',
  })
  id?: string;

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
  notes?: string;

  @property({
    type: 'object',
  })
  extra?: object;

  @property({
    type: 'string',
  })
  versionId: string;

  @property({
    type: 'string',
    default: 'ready',
  })
  state?: string;

  @property({
    type: 'string',
  })
  finishedCond?: string;

  @property({
    type: 'object',
  })
  params?: object;

  @property({
    type: 'array',
    itemType: 'string',
  })
  expectedResults?: string[];

  @property({
    type: 'object',
  })
  resolvers?: object;

  constructor(data?: Partial<Instance>) {
    super(data);
  }
}

export interface InstanceRelations {
  // describe navigational properties here
}

export type InstanceWithRelations = Instance & InstanceRelations;
