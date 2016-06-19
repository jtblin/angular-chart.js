/**
*  Type definitions for thunks
*  https://github.com/thunks/thunks
*  Definitions by: zensh <https://github.com/zensh>
*/

interface IThunks {
  (): Ithunk
}

interface IThunks {
  (options?: IThunksOptions): Ithunk
}

interface IThunks {
  (errorHandler: (error: Error) => any): Ithunk
}

interface Ithunk extends IThunk {
  all(...args: Array<Ithunk | any>): Ithunk,
  all(ThunkSequence: Array<Ithunk | any>): Ithunk,
  all(Object: any): Ithunk,
  seq(...args: Array<any>): Ithunk,
  seq(ThunkSequence: Array<Ithunk | any>): Ithunk,
  race(ThunkSequence: Array<Ithunk>): Ithunk,
  race(...args: Array<Ithunk | any>): Ithunk,
  digest(error: Error, ...args: any[]): Ithunk,
  thunkify(FunctionWithCallback: IFunctionWithCallback): Ithunk,
  lift(thunkable: Ithunk): Ithunk,
  persist(thunkable: Ithunk): Ithunk,
  delay(Time: number): Ithunk,
  stop(message?: string): void
}

interface IThunk {
  (thunkable: Ithunk): Ithunk
}

interface IThunk {
  (thunkable: IThunkFn): Ithunk
}

interface IThunk {
  (thunkable: IPromise<any>): Ithunk
}

interface IThunk {
  (thunkable: IToThunkFn): Ithunk
}

interface IThunk {
  (thunkable: IIterator<any>): Ithunk
}

interface IThunk {
  (thunkable?: any): Ithunk
}

interface IThunkFn {
  (callback: (error?: Error, value?: any) => any): any
}

interface IToThunkFn {
  (...params: any[]): any
  toThunk:() => Ithunk
}

interface IThunksOptions {
  onstop: (sig: ISigStop) => any,
  onerror: (error: Error) => any,
  debug: (value: any) => any
}

interface ISigStop {
  (message: string): void
  status: number,
  code: string
}
// https://github.com/Microsoft/TypeScript/issues/1360
interface IFunctionWithCallback {
  (callback: (...args: any[]) => any): any
}

interface IFunctionWithCallback {
  (arg: any, callback: (...args: any[]) => any): any
}

interface IFunctionWithCallback {
  (arg1: any, arg2: any, callback: (...args: any[]) => any): any
}

interface IFunctionWithCallback {
  (arg1: any, arg2: any, arg3: any, callback: (...args: any[]) => any): any
}

interface IFunctionWithCallback {
  (arg1: any, arg2: any, arg3: any, arg4: any, callback: (...args: any[]) => any): any
}

interface IFunctionWithCallback {
  (arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, callback: (...args: any[]) => any): any
}

interface IFunctionWithCallback {
  (arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, arg6: any, callback: (...args: any[]) => any): any
}

interface IFunctionWithCallback {
  (arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, arg6: any, arg7: any, callback: (...args: any[]) => any): any
}

interface IFunctionWithCallback {
  (arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, arg6: any, arg7: any, arg8: any, callback: (...args: any[]) => any): any
}

interface IFunctionWithCallback {
  (arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, arg6: any, arg7: any, arg8: any, arg9: any, callback: (...args: any[]) => any): any
}

interface IPromiseLike<T> {
 /**
  * Attaches callbacks for the resolution and/or rejection of the Promise.
  * @param onfulfilled The callback to execute when the Promise is resolved.
  * @param onrejected The callback to execute when the Promise is rejected.
  * @returns A Promise for the completion of which ever callback is executed.
  */
  then<TResult>(onfulfilled?: (value: T) => TResult | IPromiseLike<TResult>, onrejected?: (reason: any) => TResult | IPromiseLike<TResult>): IPromiseLike<TResult>
  then<TResult>(onfulfilled?: (value: T) => TResult | IPromiseLike<TResult>, onrejected?: (reason: any) => void): IPromiseLike<TResult>
}

/**
* Represents the completion of an asynchronous operation
*/
interface IPromise<T> {
 /**
  * Attaches callbacks for the resolution and/or rejection of the Promise.
  * @param onfulfilled The callback to execute when the Promise is resolved.
  * @param onrejected The callback to execute when the Promise is rejected.
  * @returns A Promise for the completion of which ever callback is executed.
  */
  then<TResult>(onfulfilled?: (value: T) => TResult | IPromiseLike<TResult>, onrejected?: (reason: any) => TResult | IPromiseLike<TResult>): IPromise<TResult>
  then<TResult>(onfulfilled?: (value: T) => TResult | IPromiseLike<TResult>, onrejected?: (reason: any) => void): IPromise<TResult>

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch(onrejected?: (reason: any) => T | IPromiseLike<T>): IPromise<T>
}

interface IIteratorResult<T> {
  done: boolean
  value?: T
}

interface IIterator<T> {
  next(value?: any): IIteratorResult<T>
  return?(value?: any): IIteratorResult<T>
  throw?(e?: any): IIteratorResult<T>
}

declare var Thunk: IThunks

export default Thunk
