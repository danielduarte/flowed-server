import {Entity, model, property} from '@loopback/repository';

@model()
export class Instance extends Entity {
  @property({
    type: 'string',
    id: true,
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
    required: true,
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
