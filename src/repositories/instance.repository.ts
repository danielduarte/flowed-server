import {DefaultCrudRepository} from '@loopback/repository';
import {Instance, InstanceRelations} from '../models';
import {InstancesDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class InstanceRepository extends DefaultCrudRepository<
  Instance,
  typeof Instance.prototype.id,
  InstanceRelations
> {
  constructor(
    @inject('datasources.Instances') dataSource: InstancesDataSource,
  ) {
    super(Instance, dataSource);
  }
}
