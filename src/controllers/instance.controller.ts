import {AnyObject, Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {post, param, get, getModelSchemaRef, patch, del, requestBody} from '@loopback/rest';
import {Instance, LogEntry} from '../models';
import {OwnedInstanceRepository, OwnedLogEntryRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';

@authenticate('jwt')
export class InstanceController {
  constructor(
    @repository(OwnedInstanceRepository) public instanceRepository: OwnedInstanceRepository,
    @repository(OwnedLogEntryRepository) public logEntryRepository: OwnedLogEntryRepository,
  ) {}

  @post('/instances', {
    responses: {
      '200': {
        description: 'Instance model instance',
        content: {'application/json': {schema: getModelSchemaRef(Instance)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Instance, {
            title: 'NewInstance',
            exclude: ['id'],
          }),
        },
      },
    })
    instance: Omit<Instance, 'id'>,
  ): Promise<Instance> {
    return this.instanceRepository.create(instance);
  }

  @get('/instances/count', {
    responses: {
      '200': {
        description: 'Instance model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(Instance) where?: Where<Instance>): Promise<Count> {
    return this.instanceRepository.count(where);
  }

  @get('/instances', {
    responses: {
      '200': {
        description: 'Array of Instance model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Instance, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(Instance) filter?: Filter<Instance>): Promise<Instance[]> {
    return this.instanceRepository.find(filter);
  }

  @get('/instances/{id}', {
    responses: {
      '200': {
        description: 'Instance model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Instance, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Instance, {exclude: 'where'})
    filter?: FilterExcludingWhere<Instance>,
  ): Promise<Instance> {
    return this.instanceRepository.findById(id, filter);
  }

  @patch('/instances/{id}', {
    responses: {
      '204': {
        description: 'Instance PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Instance, {partial: true}),
        },
      },
    })
    instance: Instance,
  ): Promise<void> {
    instance.updatedAt = new Date();
    await this.instanceRepository.updateById(id, instance);
  }

  @del('/instances/{id}', {
    responses: {
      '204': {
        description: 'Instance DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.instanceRepository.deleteById(id);
  }

  @get('/instances/{id}/log', {
    responses: {
      '200': {
        description: 'Array of Instance model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Instance, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async getInstanceLog(@param.path.string('id') id: string): Promise<LogEntry[]> {
    return this.logEntryRepository.find({where: {objectId: id}});
  }

  @get('/instances/{id}/gantt', {
    responses: {
      '200': {
        description: 'Log Gantt data',
      },
    },
  })
  async getInstanceGantt(@param.path.string('id') id: string): Promise<AnyObject[]> {
    const log = await this.logEntryRepository.find({
      fields: {
        timestamp: true,
        eventType: true,
        extra: true,
      },
      where: {
        objectId: id,
        eventType: {inq: ['Task.Started', 'Task.Finished']},
      },
    } as Filter<LogEntry>);

    const eventsByPid: AnyObject = {};
    for (const entry of log) {
      const pid = (entry?.extra as AnyObject)?.pid;
      if (!Object.prototype.hasOwnProperty.call(eventsByPid, pid)) {
        eventsByPid[pid] = {};
      }
      eventsByPid[pid][entry.eventType as string] = entry;
    }

    const gantt = Object.entries(eventsByPid).map(([pid, data]) => {
      const taskStarted = data['Task.Started'];
      const taskFinished = data['Task.Finished'];

      const task = taskStarted?.extra?.task ?? {};

      return [
        pid,
        task.title ?? task.code ?? 'Unknown Task',
        task.type ?? 'UnknownTaskType',
        taskStarted?.timestamp ?? new Date(),
        taskFinished?.timestamp ?? new Date(),
        null,
        100,
        null,
      ];
    });

    return (gantt as unknown) as AnyObject[];
  }
}
