import {DefaultCrudRepository} from '@loopback/repository';
import {LogEntry, LogEntryRelations} from '../models';
import {LogEntryDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class LogEntryRepository extends DefaultCrudRepository<
  LogEntry,
  typeof LogEntry.prototype.id,
  LogEntryRelations
> {
  constructor(@inject('datasources.LogEntry') dataSource: LogEntryDataSource) {
    super(LogEntry, dataSource);
  }
}
