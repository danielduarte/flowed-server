import {model, property} from '@loopback/repository';
import {OwnedEntity} from './abstract/owned-entity';

@model()
export class InstanceSummary extends OwnedEntity {
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
