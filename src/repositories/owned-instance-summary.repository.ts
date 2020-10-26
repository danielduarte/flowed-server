import {repository} from '@loopback/repository';
import {InstanceSummary, InstanceSummaryRelations} from '../models';
import {OwnedCrudRepository} from './abstract/owned-crud.repository';
import {InstanceSummaryRepository} from './instance-summary.repository';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {inject} from '@loopback/core';

export class OwnedInstanceSummaryRepository extends OwnedCrudRepository<InstanceSummary, typeof InstanceSummary.prototype.id, InstanceSummaryRelations> {
  constructor(
    @repository(InstanceSummaryRepository) protected instanceSummaryRepository: InstanceSummaryRepository,
    @inject(SecurityBindings.USER) protected owner: UserProfile,
  ) {
    super(instanceSummaryRepository, owner);
  }
}
