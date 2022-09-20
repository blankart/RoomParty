import _EventEmitter2 from "eventemitter2";
import { injectable } from "inversify";

class EventEmitter2 extends _EventEmitter2 {
  emit(type: any, ...args: any[]) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`${type} emitted: ${JSON.stringify(args)}`);
    }
    return super.emit(type, ...args);
  }
}

@injectable()
class EmitterService {
  emitter: EventEmitter2;
  constructor() {
    this.emitter = new EventEmitter2({
      wildcard: true,
      delimiter: '.'
    });
  }

  private generateKeyWithChannel<T>(
    module: string,
    channel: keyof T,
    key: string
  ) {
    return `${module}.${String(channel)}.${key}`;
  }

  for<ChannelTypes extends Record<string, any>>(module: string) {
    const self = this;
    return {
      channel<Key extends keyof ChannelTypes>(channelKey: Key) {
        return {
          on(key: string, cb: (args: ChannelTypes[Key]) => any) {
            self.emitter.on(
              self.generateKeyWithChannel<ChannelTypes>(
                module,
                channelKey,
                key
              ),
              cb
            );
          },

          off(key: string, cb: (args: ChannelTypes[Key]) => any) {
            self.emitter.off(
              self.generateKeyWithChannel<ChannelTypes>(
                module,
                channelKey,
                key
              ),
              cb
            );
          },

          emit(key: string, value: ChannelTypes[Key]) {
            self.emitter.emit([module, String(channelKey), key], value);
          },
        };
      },
    };
  }

  on(...args: Parameters<EventEmitter2["on"]>) {
    return this.emitter.on(...args);
  }
}

export default EmitterService;
