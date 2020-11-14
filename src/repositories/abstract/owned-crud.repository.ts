import {DefaultCrudRepository, DataObject, Options, Entity, EntityNotFoundError} from '@loopback/repository';
import {FilterExcludingWhere, Filter, Where, AndClause, Condition} from '@loopback/filter';
import {EntityCrudRepository} from '@loopback/repository/src/repositories/repository';
import {ensurePromise, juggler} from '@loopback/repository/src/repositories/legacy-juggler-bridge';
import {InclusionResolver} from '@loopback/repository/src/relations/relation.types';
import {AnyObject, Command, Count, NamedParameters, PositionalParameters} from '@loopback/repository/src/common-types';
import {OwnedEntity} from '../../models/abstract/owned-entity';
import {securityId, UserProfile} from '@loopback/security';

export abstract class OwnedCrudRepository<T extends OwnedEntity, ID, Relations extends object = {}>
  implements EntityCrudRepository<T, ID, Relations> {
  public readonly entityClass: typeof Entity & {prototype: T};

  public readonly dataSource: juggler.DataSource;

  public readonly inclusionResolvers: Map<string, InclusionResolver<T, Entity>>;

  public readonly ownerId: string;

  protected constructor(protected proxy: DefaultCrudRepository<T, ID, Relations>, owner: UserProfile) {
    this.entityClass = proxy.entityClass;
    this.dataSource = proxy.dataSource;
    this.inclusionResolvers = proxy.inclusionResolvers;

    this.ownerId = owner[securityId];
  }

  async create(entity: DataObject<T>, options?: Options): Promise<T> {
    entity.ownerId = this.ownerId;
    return this.proxy.create(entity, options);
  }

  async createAll(entities: DataObject<T>[], options?: Options): Promise<T[]> {
    entities.forEach(entity => (entity.ownerId = this.ownerId));
    return this.proxy.createAll(entities, options);
  }

  async save(entity: T, options?: Options): Promise<T> {
    entity.ownerId = this.ownerId;
    return this.proxy.save(entity, options);
  }

  async find(filter?: Filter<T>, options?: Options): Promise<(T & Relations)[]> {
    const ownerFilter = this.applyOwnerToFilter(filter);
    return this.proxy.find(ownerFilter, options);
  }

  async findOne(filter?: Filter<T>, options?: Options): Promise<(T & Relations) | null> {
    // @todo review this method
    const ownerFilter = this.applyOwnerToFilter(filter);
    return this.proxy.findOne(ownerFilter, options);
  }

  update(entity: T, options?: Options): Promise<void> {
    entity.ownerId = this.ownerId;
    return this.proxy.update(entity, options);
  }

  async updateAll(data: DataObject<T>, where?: Where<T>, options?: Options): Promise<Count> {
    if (typeof data.ownerId !== 'undefined') {
      data.ownerId = this.ownerId;
    }
    const ownerWhere = this.applyOwnerToWhere(where);
    return this.proxy.updateAll(data, ownerWhere, options);
  }

  async delete(entity: T, options?: Options): Promise<void> {
    if (entity.ownerId !== this.ownerId) {
      throw new EntityNotFoundError(this.entityClass, entity.getId());
    }
    return this.proxy.delete(entity, options);
  }

  async deleteAll(where?: Where<T>, options?: Options): Promise<Count> {
    const ownerWhere = this.applyOwnerToWhere(where);
    return this.proxy.deleteAll(ownerWhere, options);
  }

  async findById(id: ID, filter?: FilterExcludingWhere<T>, options?: Options): Promise<T & Relations> {
    const entity = await this.proxy.findById(id, filter, options);
    if (entity.ownerId !== this.ownerId) {
      throw new EntityNotFoundError(this.entityClass, id);
    }
    return entity;
  }

  async updateById(id: ID, data: DataObject<T>, options?: Options): Promise<void> {
    const entity = await this.proxy.findById(id, undefined, options);
    if (entity.ownerId !== this.ownerId) {
      throw new EntityNotFoundError(this.entityClass, id);
    }
    // @todo consider to optimize using updateAll (see implementation of updateById in juggler implementation).
    //  Con of this option: the solution would not use proxy.updateById, making the owned repository not so transparent.
    return this.proxy.updateById(id, data, options);
  }

  async replaceById(id: ID, data: DataObject<T>, options?: Options): Promise<void> {
    const entity = await this.proxy.findById(id, undefined, options);
    if (entity.ownerId !== this.ownerId) {
      throw new EntityNotFoundError(this.entityClass, id);
    }
    data.ownerId = this.ownerId;
    return this.proxy.replaceById(id, data, options);
  }

  async deleteById(id: ID, options?: Options): Promise<void> {
    const entity = await this.proxy.findById(id, undefined, options);
    if (entity.ownerId !== this.ownerId) {
      throw new EntityNotFoundError(this.entityClass, id);
    }
    return this.proxy.deleteById(id, options);
  }

  async count(where?: Where<T>, options?: Options): Promise<Count> {
    const ownerWhere = this.applyOwnerToWhere(where);
    return this.proxy.count(ownerWhere, options);
  }

  async exists(id: ID, options?: Options): Promise<boolean> {
    try {
      const entity = await this.proxy.findById(id, undefined, options);
      return entity.ownerId === this.ownerId;
    } catch (err) {
      if (err.statusCode === 404) {
        // @todo test this condition
        return false;
      }
      throw err;
    }
  }

  execute(command: Command, parameters: NamedParameters | PositionalParameters, options?: Options): Promise<AnyObject>;
  execute(collectionName: string, command: string, ...parameters: PositionalParameters): Promise<AnyObject>;
  execute(...args: PositionalParameters): Promise<AnyObject>;
  async execute(...args: PositionalParameters): Promise<AnyObject> {
    throw Error(
      'Method not supported on owned repositories.' +
        ` Please use the not owned repository "${this.proxy.constructor.name}" instead.`,
    );
  }

  protected applyOwnerToFilter(filter?: Filter<T>) {
    const ownerFilter = filter ?? {};
    ownerFilter.where = this.applyOwnerToWhere(ownerFilter.where);

    return ownerFilter;
  }

  protected applyOwnerToWhere(where?: Where<T>) {
    let ownerWhere = where ?? {};

    if (Object.prototype.hasOwnProperty.call(ownerWhere, 'or')) {
      ownerWhere = {
        and: [{ownerId: this.ownerId}, ownerWhere],
      } as AndClause<T>;
    } else if (Object.prototype.hasOwnProperty.call(ownerWhere, 'and')) {
      (ownerWhere as AndClause<T>).and.unshift({ownerId: this.ownerId} as Where<T>);
    } else {
      (ownerWhere as Condition<T>).ownerId = this.ownerId;
    }

    return ownerWhere;
  }
}
