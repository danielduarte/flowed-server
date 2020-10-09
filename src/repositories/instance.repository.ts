import {AnyObject, DefaultCrudRepository} from '@loopback/repository';
import {Instance, InstanceRelations} from '../models';
import {InstancesDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class InstanceRepository extends DefaultCrudRepository<
  Instance,
  typeof Instance.prototype.id,
  InstanceRelations
> {
  constructor(@inject('datasources.Instances') dataSource: InstancesDataSource) {
    super(Instance, dataSource);
  }

  async countByFlow(): Promise<AnyObject> {
    const pipeline = [
      {
        $group: {
          _id: '$versionId',
          count: {
            $sum: 1,
          },
        },
      },
      {
        $lookup: {
          from: 'FlowVersion',
          localField: '_id',
          foreignField: '_id',
          as: 'version',
        },
      },
      {
        $unwind: {
          path: '$version',
        },
      },
      {
        $group: {
          _id: '$version.flowId',
          count: {
            $sum: '$count',
          },
        },
      },
      {
        $addFields: {
          flowId: '$_id',
        },
      },
      {
        $project: {
          _id: false,
        },
      },
    ];

    const collection = (this.dataSource.connector as AnyObject).collection('Instance');

    return collection.aggregate(pipeline).get();
  }
}
