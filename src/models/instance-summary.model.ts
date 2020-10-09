import {Entity, model, property} from '@loopback/repository';

@model()
export class InstanceSummary extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'number',
    required: true,
  })
  count: number;

  constructor(data?: Partial<InstanceSummary>) {
    super(data);
  }
}

export interface InstanceSummaryRelations {
  // describe navigational properties here
}

export type InstanceSummaryWithRelations = InstanceSummary & InstanceSummaryRelations;
