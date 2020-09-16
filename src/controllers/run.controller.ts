import {repository} from '@loopback/repository';
import {post, getModelSchemaRef, param} from '@loopback/rest';
import {FlowRepository} from '../repositories';
import {Flow} from '../models';
import {FlowManager, ValueMap} from 'flowed';

export class RunController {
  constructor(
    @repository(FlowRepository) public flowRepository: FlowRepository,
  ) {}

  @post('/start/{id}', {
    responses: {
      '200': {
        description: 'Flow model instance started',
        content: {'application/json': {schema: getModelSchemaRef(Flow)}},
      },
    },
  })
  async start(@param.path.string('id') id: string): Promise<ValueMap> {
    const flow = await this.flowRepository.findById(id);
    return FlowManager.run(flow.spec);
  }
}
