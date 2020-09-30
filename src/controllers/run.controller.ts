import {AnyObject, repository} from '@loopback/repository';
import {post, getModelSchemaRef, param, requestBody, HttpErrors} from '@loopback/rest';
import {FlowRepository, InstanceRepository} from '../repositories';
import {Flow, Instance} from '../models';
import {FlowManager, ValueMap} from 'flowed';

export class RunController {
  constructor(
    @repository(FlowRepository) public flowRepository: FlowRepository,
    @repository(InstanceRepository) public instanceRepository: InstanceRepository,
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

    if (flow.status !== 'enabled') {
      throw new HttpErrors.Conflict(`Flow with id '${flow.id}' cannot be executed because it is not enabled.`);
    }

    const instanceInfo = new Instance({
      versionId: flow.activeVersion,
      params: executionParams.params,
      expectedResults: executionParams.expectedResults,
    });

    const newInstance = await this.instanceRepository.create(instanceInfo);

    try {
      const results = await FlowManager.run(
        flow.spec || {},
        executionParams.params,
        executionParams.expectedResults,
        undefined,
        undefined,
        {instanceId: newInstance.id},
      );

      await this.instanceRepository.updateById(newInstance.id, {
        state: 'finished',
        finishedCond: 'ok',
        extra: {...newInstance.extra, results},
      });

      return results;
    } catch (err) {
      await this.instanceRepository.updateById(newInstance.id, {
        state: 'finished',
        finishedCond: 'error',
      });

      throw new HttpErrors.BadRequest(err.message);
    }
  }
}
