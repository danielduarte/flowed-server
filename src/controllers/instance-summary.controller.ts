import {Filter, repository} from '@loopback/repository';
import {param, get, getModelSchemaRef} from '@loopback/rest';
import {InstanceSummary} from '../models';
import {InstanceSummaryRepository} from '../repositories';

export class InstanceSummaryController {
  constructor(
    @repository(InstanceSummaryRepository)
    public instanceSummaryRepository: InstanceSummaryRepository,
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
