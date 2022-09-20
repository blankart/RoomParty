import { injectable } from 'inversify'
import PgBoss from "pg-boss";

type UnqueuedWork = {
  method: "send";
  params:
  | [
    string,
    (...args: any[]) => any,
    Record<string, any>,
    Record<string, any>,
    string
  ];
};

@injectable()
class QueueService {
  private initialized?: boolean;
  private unqueuedWorks: UnqueuedWork[] = [];
  private pgBossInstance: PgBoss

  constructor() {
    this.pgBossInstance = new PgBoss(process.env.DATABASE_URL!);
    this.initialize();
  }


  private onStart() {
    this.initialized = true;
    for (const eq of this.unqueuedWorks) {
      if (eq.method === "send") {
        this.queue(...eq.params);
      }
    }

    this.unqueuedWorks = [];
  }

  private addToUnqueuedWork(data: UnqueuedWork) {
    this.unqueuedWorks.push(data);
  }

  private removeUnqueuedWork(id: string) {
    this.unqueuedWorks = this.unqueuedWorks.filter((uw) => uw.params[0] !== id);
  }

  queue<
    T extends Parameters<PgBoss["sendOnce"]>,
    F extends (params: { data: any }) => any,
    P extends Parameters<F>[0]["data"]
  >(name: T[0], func: F, data: P, options: T[2], key: string) {
    while (!this.initialized) {
      return this.addToUnqueuedWork({
        method: "send",
        params: [name, func, data, options, key],
      });
    }

    this.removeUnqueuedWork(name);
    this.pgBossInstance.sendOnce(name, data, options, key);
    this.pgBossInstance.work(name, func);
  }

  private initialize() {
    const onStartCallback = this.onStart.bind(this);
    this.pgBossInstance.addListener("onStart", onStartCallback);
    this.pgBossInstance.start().then(() => {
      this.pgBossInstance.emit("onStart");
      setTimeout(() => {
        this.pgBossInstance.removeListener("onStart", onStartCallback);
      }, 1_000);
    });
  }
}

export default QueueService;
