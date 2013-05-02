/// <reference path="q.d.ts" />

declare module angular { 
    interface TimeoutService {
        (fn: Function, delay: number, invokeApply: bool): Promise;
        cancel(promise: Promise): bool;
    }
}