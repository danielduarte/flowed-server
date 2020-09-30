import {AnyObject, Entity, model, property} from '@loopback/repository';

@model()
export class FlowVersion extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
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
  notes: string;

  // Indexer property to allow additional data
  @property({
    type: 'object',
  })
  extra: AnyObject;

  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'number',
  })
  inc?: number;

  @property({
    type: 'string',
    default: 'disabled',
  })
  status: string;

  @property({
    type: 'object',
    required: true,
  })
  spec: object;

  @property({
    type: 'string',
    required: true,
  })
  flowId: string;

  constructor(data?: Partial<FlowVersion>) {
    super(data);
  }
}

export interface FlowVersionRelations {
  // describe navigational properties here
}

export type FlowVersionWithRelations = FlowVersion & FlowVersionRelations;
