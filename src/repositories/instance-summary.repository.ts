import {DefaultCrudRepository} from '@loopback/repository';
import {InstanceSummary, InstanceSummaryRelations} from '../models';
import {InstanceSummaryDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class InstanceSummaryRepository extends DefaultCrudRepository<
  InstanceSummary,
  typeof InstanceSummary.prototype.id,
  InstanceSummaryRelations
> {
  constructor(
    @inject('datasources.InstanceSummary') dataSource: InstanceSummaryDataSource,
  ) {
    super(InstanceSummary, dataSource);
  }
}
