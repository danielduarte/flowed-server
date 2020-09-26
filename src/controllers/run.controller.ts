import {AnyObject, repository} from '@loopback/repository';
import {
  post,
  getModelSchemaRef,
  param,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
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
  async start(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {},
      },
    })
    executionParams: AnyObject,
  ): Promise<ValueMap> {
    const flow = await this.flowRepository.findById(id);
    try {
      return await FlowManager.run(
        flow.spec,
        executionParams.params,
        executionParams.expectedResults,
      );
    } catch (err) {
      throw new HttpErrors.BadRequest(err.message);
    }
  }
}
