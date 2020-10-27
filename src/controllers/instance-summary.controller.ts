import {Filter, repository} from '@loopback/repository';
import {param, get, getModelSchemaRef} from '@loopback/rest';
import {InstanceSummary} from '../models';
import {OwnedInstanceSummaryRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';

@authenticate('jwt')
export class InstanceSummaryController {
  constructor(
    @repository(OwnedInstanceSummaryRepository) public instanceSummaryRepository: OwnedInstanceSummaryRepository,
  ) {}

  @get('/instances/summary', {
    responses: {
      '200': {
        description: 'Array of InstanceSummary model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(InstanceSummary, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(InstanceSummary) filter?: Filter<InstanceSummary>): Promise<InstanceSummary[]> {
    return this.instanceSummaryRepository.find(filter);
  }
}
