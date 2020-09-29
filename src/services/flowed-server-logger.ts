import {FlowedLogEntry} from 'flowed';
import {LogEntryRepository} from '../repositories';

export default class FlowedServerLogger {
  public constructor(public logEntryRepository: LogEntryRepository) {}

  public log(entry: FlowedLogEntry): void {
    // eslint-disable-next-line no-void
    void this.logEntryRepository.create(entry);
  }
}
