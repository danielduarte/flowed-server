import {Entity, model, property} from '@loopback/repository';

@model()
export abstract class OwnedEntity extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  ownerId: string;
}
