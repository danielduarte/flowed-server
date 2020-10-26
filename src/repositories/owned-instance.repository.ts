import {AnyObject, repository} from '@loopback/repository';
import {Instance, InstanceRelations} from '../models';
import {OwnedCrudRepository} from './abstract/owned-crud.repository';
import {InstanceRepository} from './instance.repository';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {inject} from '@loopback/core';

export class OwnedInstanceRepository extends OwnedCrudRepository<Instance, typeof Instance.prototype.id, InstanceRelations> {
  constructor(
    @repository(InstanceRepository) protected instanceRepository: InstanceRepository,
    @inject(SecurityBindings.USER) protected owner: UserProfile,
  ) {
    super(instanceRepository, owner);
  }

  async countByFlow(): Promise<AnyObject> {
    // @todo add filter by owner
    return this.instanceRepository.countByFlow();
  }
}
