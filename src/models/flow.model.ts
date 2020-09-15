import {Entity, model, property} from '@loopback/repository';

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
    type: 'object',
    required: true,
  })
  spec: object;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Flow>) {
    super(data);
  }
}

export interface FlowRelations {
  // describe navigational properties here
}

export type FlowWithRelations = Flow & FlowRelations;
