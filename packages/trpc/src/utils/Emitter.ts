import _EventEmitter3 from "eventemitter3";

class EventEmitter3 extends _EventEmitter3 {
  emit(type: any, ...args: any[]) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`${type} emitted: ${JSON.stringify(args)}`);
    }
    return super.emit(type, ...args);
  }
}

class Emitter {
  constructor(private emitter: EventEmitter3) {}
  static instance: Emitter;

  static getInstance() {
    if (!Emitter.instance) {
      Emitter.instance = new Emitter(new EventEmitter3());
    }

    return Emitter.instance;
  }

  private generateKeyWithChannel<T>(
    module: string,
    channel: keyof T,
    key: string
  ) {
    return `[${module}-${String(channel)}-${key}]`;
  }

  private test() {}

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
            self.emitter.emit(
              self.generateKeyWithChannel<ChannelTypes>(
                module,
                channelKey,
                key
              ),
              value
            );
          },
        };
      },
    };
  }
}

const EmitterInstance = Emitter.getInstance();

export default EmitterInstance;
