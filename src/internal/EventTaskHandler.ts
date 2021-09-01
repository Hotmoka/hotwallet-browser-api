import {EventTask} from "./EventTask";

/**
 * The handler of the event promise task.
 */
export class EventTaskHandler {
    /**
     * The queue of the event tasks.
     */
    private readonly queue: Map<string, EventTask> = new Map<string, EventTask>()

    /**
     * Adds a new task to the queue of the tasks.
     * The task will be rejected after the given timeout.
     * @param eventName the event name
     * @param eventNameResult the event name result
     * @param taskId the id of the current task
     * @param resolve the resolve function of the promise task
     * @param reject the reject function of the promise task
     * @param timeout the optional timeout of the rejection timer. It defaults to 30 seconds
     */
    public addTask(eventName: string, eventNameResult: string, taskId: string, resolve: any, reject: any, timeout: number): void {
        const timeoutRejectionTimer = setTimeout(() => this.handleTimeoutRejection(eventNameResult, taskId), timeout)
        this.queue.set(eventNameResult + ':' + taskId, new EventTask(taskId, eventNameResult, resolve, reject, timeoutRejectionTimer))
    }

    /**
     * It handles the task of an event from the queue.
     * The task gets consumed and removed from the queue.
     * @param data the data
     */
    public handleResult(data: Record<string, any>): void {
        const eventName = data.eventName
        const taskId = data.taskId
        const result = data.result
        const error = result.error

        const task = this.queue.get(eventName + ':' + taskId)
        if (task) {
            if (error) {
                task.sendError(error)
            } else {
                task.send(result)
            }
            this.queue.delete(eventName + ':' + taskId)
        }
    }

    /**
     * It handles the task timeout rejection of an event from the queue.
     * The task gets consumed and removed from the queue.
     * @param eventNameResult
     * @param taskId
     * @private
     */
    private handleTimeoutRejection(eventNameResult: string, taskId: string): void {
        const task = this.queue.get(eventNameResult + ':' + taskId)
        if (task) {
            task.sendError('rejected for timeout')
            this.queue.delete(eventNameResult + ':' + taskId)
        }
    }
}