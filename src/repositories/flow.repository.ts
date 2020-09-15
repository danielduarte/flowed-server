import {DefaultCrudRepository} from '@loopback/repository';
import {Flow, FlowRelations} from '../models';
import {FlowDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class FlowRepository extends DefaultCrudRepository<
  Flow,
  typeof Flow.prototype.id,
  FlowRelations
> {
  constructor(@inject('datasources.Flow') dataSource: FlowDataSource) {
    super(Flow, dataSource);
  }
}
