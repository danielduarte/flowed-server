import {DefaultCrudRepository} from '@loopback/repository';
import {FlowVersion, FlowVersionRelations} from '../models';
import {FlowVersionDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class FlowVersionRepository extends DefaultCrudRepository<
  FlowVersion,
  typeof FlowVersion.prototype.id,
  FlowVersionRelations
> {
  constructor(@inject('datasources.FlowVersion') dataSource: FlowVersionDataSource) {
    super(FlowVersion, dataSource);
  }
}
