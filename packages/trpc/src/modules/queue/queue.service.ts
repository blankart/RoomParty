import PgBoss from "pg-boss"

type UnqueuedWork =
    | { method: 'send', params: Parameters<PgBoss['sendOnce']>, func?: (...args: any) => any }

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
            if (eq.method === 'send' && eq.func) {
                this.queue(...eq.params).with(eq.func)
            }
        }

        this.unqueuedWorks = []
    }

    private addToUnqueuedWork(data: UnqueuedWork) {
        this.unqueuedWorks.push(data)

        return {
            with(func: ((...args: any) => any)) {
                data.func = func
            },
        }
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

    queue(...args: Parameters<PgBoss['sendOnce']>) {
        while (!this.initialized) {
            return this.addToUnqueuedWork({ method: 'send', params: args })
        }

        this.removeUnqueuedWork(args[0])
        this.pgBossInstance.sendOnce(...args)

        return this.getQueueCallback(args[0])
    }

    private initialize() {
        this.pgBossInstance.addListener('onStart', this.onStart.bind(this))
        this.pgBossInstance.start().then(() => this.pgBossInstance.emit('onStart'))
    }
}

const QueueService = Queue.getInstance()

export default QueueService