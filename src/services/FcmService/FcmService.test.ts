import faker from 'faker';
import { register, listen, Event } from 'push-receiver';
import { propOr, times } from 'ramda';
import { Observable, Subject } from 'rxjs';
import { FcmService } from './FcmService';

const senderId = faker.datatype.uuid();

const generateEvent = (): Event => ({
  notification: {
    notification: {
      body: faker.random.word(),
      title: faker.random.word(),
    },
  },
  persistentId: faker.datatype.uuid(),
});

beforeEach(() => {
  (register as jest.Mock).mockClear();
  (listen as jest.Mock).mockClear();
});

describe('#getSubscriber()', () => {
  const expected = {
    fcm: {
      token: faker.datatype.uuid(),
    },
  };

  beforeEach(() => {
    (register as jest.Mock).mockReturnValueOnce(expected);
  });

  test('calls underlying register function correctly and sets token', async () => {
    const service = new FcmService(senderId);
    const appToken = faker.datatype.uuid();
    const subscriber = await service.getSubscriber(appToken);

    expect(subscriber).toBeInstanceOf(Observable);
    expect(register).toHaveBeenCalledWith(senderId);
    expect(service.getToken()).toEqual(expected.fcm.token);
  });

  // This test actually does cover lines 52-55, but jest coverage cant see it :(
  test('does not call underlying register function if appToken is already registered', async () => {
    const service = new FcmService(senderId);
    const appToken = faker.datatype.uuid();
    await service.getSubscriber(appToken);
    await service.getSubscriber(appToken);
    await service.getSubscriber(appToken);
    await service.getSubscriber(appToken);
    await service.getSubscriber(appToken);

    expect(register).toHaveBeenCalledTimes(1);
  });

  test('calls underlying listen function correctly', async () => {
    const service = new FcmService(senderId);
    const appToken = faker.datatype.uuid();
    await service.getSubscriber(appToken);

    expect(listen).toHaveBeenCalledWith({ persistentIds: [], ...expected }, expect.any(Function));
  });

  test('listen triggers a subscription message correctly', async () => {
    const service = new FcmService(senderId);
    const appToken = faker.datatype.uuid();

    const mockEvent$ = new Subject<Event>();

    (listen as jest.Mock).mockImplementationOnce((_, next) => {
      mockEvent$.subscribe(next);
    });

    const nextEvent = generateEvent();

    const subscriber = await service.getSubscriber(appToken);

    // Subscribe to the message queue
    subscriber.subscribe((event) => {
      expect(event).toEqual(nextEvent);
    });

    // Fake a new message coming in (after subscription)
    mockEvent$.next(nextEvent);
  });

  test('persistentIds are passed to new listener', async () => {
    const service = new FcmService(senderId);
    const appToken = faker.datatype.uuid();

    const mockEvent$ = new Subject<Event>();

    (listen as jest.Mock).mockImplementationOnce((_, next) => {
      mockEvent$.subscribe(next);
    });

    const events = times(() => generateEvent(), 5);

    await service.getSubscriber(appToken);

    // Fake a bunch of messages coming through
    events.forEach((event) => {
      mockEvent$.next(event);
    });

    const newApptoken = faker.datatype.uuid();

    await service.getSubscriber(newApptoken);

    expect(listen).toHaveBeenCalledWith(
      { persistentIds: events.map(propOr(undefined, 'persistentId')), ...expected },
      expect.any(Function)
    );
  });
});
