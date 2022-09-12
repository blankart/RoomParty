import PgBoss from "pg-boss"

type UnqueuedWork =
    | {
        method: 'send',
        params:
        | [
            string,
            ((...args: any[]) => any),
            Record<string, any>,
            Record<string, any>,
            string
        ]
    }

class Queue {
    private initialized?: boolean
    private unqueuedWorks: UnqueuedWork[] = []

    constructor(public pgBossInstance: PgBoss) {
        this.initialize()
    }

    private static instance?: Queue
    static getInstance() {
        if (!Queue.instance) {
            const pgBossInstance = new PgBoss(process.env.DATABASE_URL!)
            Queue.instance = new Queue(pgBossInstance)
        }

        return Queue.instance
    }

    private onStart() {
        this.initialized = true
        for (const eq of this.unqueuedWorks) {
            if (eq.method === 'send') {
                this.queue(...eq.params)
            }
        }

        this.unqueuedWorks = []
    }

    private addToUnqueuedWork(data: UnqueuedWork) {
        this.unqueuedWorks.push(data)
    }

    private getQueueCallback(id: string) {
        const self = this
        return {
            with(func: ((...args: any) => any)) {
                self.pgBossInstance.work(id, func)
            },
        }
    }

    private removeUnqueuedWork(id: string) {
        this.unqueuedWorks = this.unqueuedWorks.filter(uw => uw.params[0] !== id)
    }

    queue<T extends Parameters<PgBoss['sendOnce']>, F extends (...args: any) => any>(
        name: T[0],
        func: F,
        data: Parameters<F>[0]['data'],
        options: T[2],
        key: string
    ) {
        while (!this.initialized) {
            return this.addToUnqueuedWork({ method: 'send', params: [name, func, data, options, key] })
        }

        this.removeUnqueuedWork(name)
        this.pgBossInstance.sendOnce(name, data, options, key)
        this.pgBossInstance.work(name, func)
    }

    private initialize() {
        this.pgBossInstance.addListener('onStart', this.onStart.bind(this))
        this.pgBossInstance.start().then(() => this.pgBossInstance.emit('onStart'))
    }
}

const QueueService = Queue.getInstance()

export default QueueService