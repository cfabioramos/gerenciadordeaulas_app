import { AppLogger } from './app-logger';

describe('AppLogger', () => {
  it('error delega ao console.error', () => {
    const spy = spyOn(console, 'error');
    AppLogger.error('a', 1);
    expect(spy).toHaveBeenCalledWith('a', 1);
  });

  it('warn delega ao console.warn', () => {
    const spy = spyOn(console, 'warn');
    AppLogger.warn('w');
    expect(spy).toHaveBeenCalledWith('w');
  });

  it('log delega ao console.log', () => {
    const spy = spyOn(console, 'log');
    AppLogger.log('l');
    expect(spy).toHaveBeenCalledWith('l');
  });

  it('info delega ao console.info', () => {
    const spy = spyOn(console, 'info');
    AppLogger.info('i');
    expect(spy).toHaveBeenCalledWith('i');
  });
});
