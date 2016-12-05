//2011-11 Proyectos Equis Ka, s.l., jorge@jorgechamorro.com
//WebWorkerThreads.cc


#include <v8.h>
#include <node.h>
#include <uv.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <string>
#include "nan.h"
#include "nan_isolate_data_accessor.h"


#include "queues_a_gogo.cc"
#include "bson.cc"
#include "jslib.cc"

#if NODE_MODULE_VERSION > 45
#include "ArrayBufferAllocator.h"
#endif

using namespace v8;

static Nan::Persistent<String> id_symbol;
static Nan::Persistent<ObjectTemplate> threadTemplate;
static bool useLocker;

static typeQueue* freeJobsQueue= NULL;
static typeQueue* freeThreadsQueue= NULL;

#define kThreadMagicCookie 0x99c0ffee
typedef struct {
  uv_async_t async_watcher; //MUST be the first one

  long int id;
  uv_thread_t thread;
  volatile int sigkill;

  typeQueue inQueue;  //Jobs to run
  typeQueue outQueue; //Jobs done

  volatile int IDLE;
  uv_cond_t IDLE_cv;
  uv_mutex_t IDLE_mutex;

  Isolate* isolate;
  Nan::Persistent<Context> context;
  Nan::Persistent<Object> JSObject;
  Nan::Persistent<Object> threadJSObject;
  Nan::Persistent<Object> dispatchEvents;

  unsigned long threadMagicCookie;
} typeThread;

enum jobTypes {
  kJobTypeEval,
  kJobTypeEvent,
  kJobTypeEventSerialized
};

typedef struct {
  int jobType;
  Nan::Persistent<Object> cb;
  union {
    struct {
      int length;
      String::Utf8Value* eventName;
      String::Utf8Value** argumentos;
    } typeEvent;
    struct {
      int length;
      String::Utf8Value* eventName;
      char* buffer;
      size_t bufferSize;
    } typeEventSerialized;
    struct {
      int error;
      int tiene_callBack;
      int useStringObject;
      String::Utf8Value* resultado;
      union {
        char* scriptText_CharPtr;
        String::Utf8Value* scriptText_StringObject;
      };
    } typeEval;
  };
} typeJob;

/*

cd deps/minifier/src
gcc minify.c -o minify
cat ../../../src/events.js | ./minify kEvents_js > ../../../src/kEvents_js
cat ../../../src/load.js | ./minify kLoad_js > ../../../src/kLoad_js
cat ../../../src/createPool.js | ./minify kCreatePool_js > ../../../src/kCreatePool_js
cat ../../../src/worker.js | ./minify kWorker_js > ../../../src/kWorker_js
cat ../../../src/thread_nextTick.js | ./minify kThread_nextTick_js > ../../../src/kThread_nextTick_js

*/

#include "events.js.c"
#include "load.js.c"
#include "createPool.js.c"
#include "worker.js.c"
#include "thread_nextTick.js.c"

//node-waf configure uninstall distclean configure build install








static typeQueueItem* nuJobQueueItem (void) {
  typeQueueItem* qitem= queue_pull(freeJobsQueue);
  if (!qitem) {
    qitem= nuItem(kItemTypePointer, calloc(1, sizeof(typeJob)));
  }
  return qitem;
}






static typeThread* isAThread (Local<Object> receiver) {
  typeThread* thread;

  if (receiver->IsObject()) {
    if (receiver->InternalFieldCount() == 1) {
      thread= (typeThread*) Nan::GetInternalFieldPointer(receiver, 0);
      if (thread && (thread->threadMagicCookie == kThreadMagicCookie)) {
        return thread;
      }
    }
  }

  return NULL;
}






static void pushToInQueue (typeQueueItem* qitem, typeThread* thread) {
  uv_mutex_lock(&thread->IDLE_mutex);
  queue_push(qitem, &thread->inQueue);
  if (thread->IDLE) {
    uv_cond_signal(&thread->IDLE_cv);
  }
  uv_mutex_unlock(&thread->IDLE_mutex);
}






NAN_METHOD(Puts) {
  Nan::HandleScope scope;
  int i= 0;
  while (i < info.Length()) {
    String::Utf8Value c_str(info[i]);
    fputs(*c_str, stdout);
    i++;
  }
  fflush(stdout);

  //fprintf(stdout, "*** Puts END\n");
  info.GetReturnValue().SetUndefined();
}

NAN_METHOD(Print) {
    Nan::HandleScope scope;
	int i= 0;
    while (i < info.Length()) {
        String::Utf8Value c_str(info[i]);
		fputs(*c_str, stdout);
		i++;
	}
	static char end = '\n';
	fputs(&end, stdout);
	fflush(stdout);

	//fprintf(stdout, "*** Puts END\n");
    info.GetReturnValue().SetUndefined();
}




static void eventLoop (typeThread* thread);

// A background thread
static void aThread (void* arg) {
  typeThread* thread= (typeThread*) arg;

#if NODE_MODULE_VERSION > 45
  // ref: https://developers.google.com/v8/get_started
  ArrayBufferAllocator a;
  v8::Isolate::CreateParams cp;
  cp.array_buffer_allocator = &a;
  thread->isolate= Isolate::New(cp);
#else
  thread->isolate= Isolate::New();
#endif

  NanSetIsolateData(thread->isolate, thread);

  if (useLocker) {
	#if (NODE_MODULE_VERSION > 0x000B)
		v8::Locker myLocker(thread->isolate);
	#else
		v8::Locker myLocker(thread->isolate);
	#endif
    // I think it's not ok to create a isolate scope here,
    // because it will call Isolate::Exit automatically.
    //v8::Isolate::Scope isolate_scope(thread->isolate);
    eventLoop(thread);
  }
  else {
    eventLoop(thread);
  }
  thread->isolate->Dispose();

  // wake up callback
  if (!(thread->inQueue.length)) uv_async_send(&thread->async_watcher);
}



NAN_METHOD(threadEmit);
NAN_METHOD(postMessage);
NAN_METHOD(postError);



static void eventLoop (typeThread* thread) {
  Isolate::Scope isolate_scope(thread->isolate);

  {
    Nan::HandleScope scope;
    ExtensionConfiguration extensions(0, NULL);

    Local<FunctionTemplate> ftmpl = Nan::New<FunctionTemplate>();
	Local<ObjectTemplate> otmpl = ftmpl->InstanceTemplate();
    Local<Context> ctx =  Nan::New<Context>(&extensions, otmpl);

	//thread->context= Context::New();
    thread->context.Reset(ctx);
	ctx->Enter();


    Local<Object> global= Nan::New(thread->context)->Global();

    Local<Object> fs_obj = Nan::New<Object>();
    JSObjFn(fs_obj, "readFileSync", readFileSync_);
    global->ForceSet(Nan::New<String>("native_fs_").ToLocalChecked(), fs_obj, attribute_ro_dd);

    Local<Object> console_obj = Nan::New<Object>();
    JSObjFn(console_obj, "log", console_log);
    JSObjFn(console_obj, "error", console_error);
    global->ForceSet(Nan::New<String>("console").ToLocalChecked(), console_obj, attribute_ro_dd);

    global->ForceSet(Nan::New<String>("self").ToLocalChecked(), global);
    global->ForceSet(Nan::New<String>("global").ToLocalChecked(), global);

    global->ForceSet(Nan::New<String>("puts").ToLocalChecked(), Nan::New<FunctionTemplate>(Puts)->GetFunction());
    global->ForceSet(Nan::New<String>("print").ToLocalChecked(), Nan::New<FunctionTemplate>(Print)->GetFunction());

    global->ForceSet(Nan::New<String>("postMessage").ToLocalChecked(), Nan::New<FunctionTemplate>(postMessage)->GetFunction());
    global->ForceSet(Nan::New<String>("__postError").ToLocalChecked(), Nan::New<FunctionTemplate>(postError)->GetFunction());

    Local<Object> threadObject= Nan::New<Object>();
    global->ForceSet(Nan::New<String>("thread").ToLocalChecked(), threadObject);

    threadObject->Set(Nan::New<String>("id").ToLocalChecked(), Nan::New<Number>(thread->id));
    threadObject->Set(Nan::New<String>("emit").ToLocalChecked(), Nan::New<FunctionTemplate>(threadEmit)->GetFunction());
    Local<Object> dispatchEvents= Script::Compile(Nan::New<String>(kEvents_js).ToLocalChecked())->Run()->ToObject()->CallAsFunction(threadObject, 0, NULL)->ToObject();
    Local<Object> dispatchNextTicks= Script::Compile(Nan::New<String>(kThread_nextTick_js).ToLocalChecked())->Run()->ToObject();

    Array* _ntq = Array::Cast(*threadObject->Get(Nan::New<String>("_ntq").ToLocalChecked()));

    Script::Compile(Nan::New<String>(kLoad_js).ToLocalChecked())->Run();

    double nextTickQueueLength= 0;
    long int ctr= 0;

    while (!thread->sigkill) {
      typeJob* job;
      typeQueueItem* qitem;

      {
        Nan::HandleScope scope;
        TryCatch onError;
        String::Utf8Value* str;
        Local<String> source;
        Local<Value> resultado;


        while ((qitem= queue_pull(&thread->inQueue))) {

          job= (typeJob*) qitem->asPtr;

          if ((++ctr) > 2e3) {
            ctr= 0;
            Nan::IdleNotification(1000);

          }

          if (job->jobType == kJobTypeEval) {
            //Ejecutar un texto

            if (job->typeEval.useStringObject) {
              str= job->typeEval.scriptText_StringObject;
              source= Nan::New<String>(**str, (*str).length()).ToLocalChecked();
              delete str;
            }
            else {
              source= Nan::New<String>(job->typeEval.scriptText_CharPtr).ToLocalChecked();
              free(job->typeEval.scriptText_CharPtr);
            }

            Nan::MaybeLocal<Script> script = Nan::CompileScript(source);

            if (!onError.HasCaught()) {
              Nan::MaybeLocal<Value> result = Nan::RunScript(script.ToLocalChecked());
              if (!onError.HasCaught()) resultado = result.ToLocalChecked();
            }

            if (job->typeEval.tiene_callBack) {
              job->typeEval.error= onError.HasCaught() ? 1 : 0;
              job->typeEval.resultado= new String::Utf8Value(job->typeEval.error ? onError.Exception() : resultado);
              queue_push(qitem, &thread->outQueue);
              // wake up callback
              if (!(thread->inQueue.length)) uv_async_send(&thread->async_watcher);
            }
            else {
              queue_push(qitem, freeJobsQueue);
            }

            if (onError.HasCaught()) onError.Reset();
          }
          else if (job->jobType == kJobTypeEvent) {
            //Emitir evento.

            Local<Value> info[2];
            str= job->typeEvent.eventName;
            info[0]= Nan::New<String>(**str, (*str).length()).ToLocalChecked();
            delete str;

            Local<Array> array= Nan::New<Array>(job->typeEvent.length);
            info[1]= array;

            int i= 0;
            while (i < job->typeEvent.length) {
              str= job->typeEvent.argumentos[i];
              array->Set(i, Nan::New<String>(**str, (*str).length()).ToLocalChecked());
              delete str;
              i++;
            }

            free(job->typeEvent.argumentos);
            queue_push(qitem, freeJobsQueue);
            dispatchEvents->CallAsFunction(global, 2, info);
          }
          else if (job->jobType == kJobTypeEventSerialized) {
            Local<Value> info[2];
            str= job->typeEventSerialized.eventName;
            info[0]= Nan::New<String>(**str, (*str).length()).ToLocalChecked();
            delete str;

      int len = job->typeEventSerialized.length;
      Local<Array> array= Nan::New<Array>(len);
      info[1]= array;

        {
          BSON *bson = new BSON();
          char* data = job->typeEventSerialized.buffer;
          size_t size = job->typeEventSerialized.bufferSize;
          BSONDeserializer deserializer(bson, data, size);
          Local<Object> result = deserializer.DeserializeDocument(true)->ToObject();
          int i = 0; do { array->Set(i, result->Get(i)); } while (++i < len);
          free(data);
          delete bson;
        }

            queue_push(qitem, freeJobsQueue);
            dispatchEvents->CallAsFunction(global, 2, info);
          }
        }

        if (_ntq->Length()) {

          if ((++ctr) > 2e3) {
            ctr= 0;
            Nan::IdleNotification(1000);
          }

          resultado= dispatchNextTicks->CallAsFunction(global, 0, NULL);
          if (onError.HasCaught()) {
            nextTickQueueLength= 1;
            onError.Reset();
          }
          else {
            nextTickQueueLength= resultado->NumberValue();
          }
        }
      }

      if (nextTickQueueLength || thread->inQueue.length) continue;
      if (thread->sigkill) break;

      uv_mutex_lock(&thread->IDLE_mutex);
      if (!thread->inQueue.length) {
        thread->IDLE= 1;
        uv_cond_wait(&thread->IDLE_cv, &thread->IDLE_mutex);
        thread->IDLE= 0;
      }
      uv_mutex_unlock(&thread->IDLE_mutex);
    }

  }

  thread->context.Reset();
}






static void destroyaThread (typeThread* thread) {
  Nan::HandleScope scope;

  thread->sigkill= 0;
  //TODO: hay que vaciar las colas y destruir los trabajos antes de ponerlas a NULL
  thread->inQueue.first= thread->inQueue.last= NULL;
  thread->outQueue.first= thread->outQueue.last= NULL;
  Nan::SetInternalFieldPointer(Nan::New(thread->JSObject), 0, NULL);
  thread->JSObject.Reset();

  uv_unref((uv_handle_t*)&thread->async_watcher);

#ifdef WIN32
  TerminateThread(thread->thread, 1);
#else
  pthread_cancel(thread->thread);
#endif
}






// C callback that runs in the main nodejs thread. This is the one responsible for
// calling the thread's JS callback.
static void Callback (uv_async_t *watcher, int revents) {
  typeThread* thread= (typeThread*) watcher;

  if (thread->sigkill) {
    destroyaThread(thread);
    return;
  }

  Nan::HandleScope scope;
  typeJob* job;
  Local<Value> argv[2];
  Local<Value> null = Nan::Null();
  typeQueueItem* qitem;
  String::Utf8Value* str;

  TryCatch onError;
  while ((qitem= queue_pull(&thread->outQueue))) {
    job= (typeJob*) qitem->asPtr;

    if (job->jobType == kJobTypeEval) {

      if (job->typeEval.tiene_callBack) {
        str= job->typeEval.resultado;

        if (job->typeEval.error) {
          argv[0]= Exception::Error(Nan::New<String>(**str, (*str).length()).ToLocalChecked());
          argv[1]= null;
        } else {
          argv[0]= null;
          argv[1]= Nan::New<String>(**str, (*str).length()).ToLocalChecked();
        }
        Nan::New(job->cb)->CallAsFunction(Nan::New(thread->JSObject), 2, argv);
        job->cb.Reset();
        job->typeEval.tiene_callBack= 0;

        delete str;
        job->typeEval.resultado= NULL;
      }

      queue_push(qitem, freeJobsQueue);

      if (onError.HasCaught()) {
        if (thread->outQueue.first) {
          uv_async_send(&thread->async_watcher); // wake up callback again
        }
#if NODE_MODULE_VERSION >= 0x000E
        node::FatalException(thread->isolate, onError);
#else
        node::FatalException(onError);
#endif
        return;
      }
    }
    else if (job->jobType == kJobTypeEvent) {

      //fprintf(stdout, "*** Callback\n");

      Local<Value> info[2];

      str= job->typeEvent.eventName;
      info[0]= Nan::New<String>(**str, (*str).length()).ToLocalChecked();
      delete str;

      Local<Array> array= Nan::New<Array>(job->typeEvent.length);
      info[1]= array;

      int i= 0;
      while (i < job->typeEvent.length) {
        str= job->typeEvent.argumentos[i];
        array->Set(i, Nan::New<String>(**str, (*str).length()).ToLocalChecked());
        delete str;
        i++;
      }

      free(job->typeEvent.argumentos);
      queue_push(qitem, freeJobsQueue);
      Nan::New(thread->dispatchEvents)->CallAsFunction(Nan::New(thread->JSObject), 2, info);
    }
    else if (job->jobType == kJobTypeEventSerialized) {
      Local<Value> info[2];

      str= job->typeEventSerialized.eventName;
      info[0]= Nan::New<String>(**str, (*str).length()).ToLocalChecked();
      delete str;

      int len = job->typeEventSerialized.length;
      Local<Array> array= Nan::New<Array>(len);
      info[1]= array;

        {
          BSON *bson = new BSON();
          char* data = job->typeEventSerialized.buffer;
          size_t size = job->typeEventSerialized.bufferSize;
          BSONDeserializer deserializer(bson, data, size);
          Local<Object> result = deserializer.DeserializeDocument(true)->ToObject();
          int i = 0; do { array->Set(i, result->Get(i)); } while (++i < len);
          free(data);
          delete bson;
        }

      queue_push(qitem, freeJobsQueue);
      Nan::New(thread->dispatchEvents)->CallAsFunction(Nan::New(thread->JSObject), 2, info);
    }
  }
}






// unconditionally destroys a thread by brute force.
NAN_METHOD(Destroy) {
  Nan::HandleScope scope;
  //TODO: Hay que comprobar que this en un objeto y que tiene hiddenRefTotypeThread_symbol y que no es nil
  //TODO: Aquí habría que usar static void TerminateExecution(int thread_id);
  //TODO: static void v8::V8::TerminateExecution  ( Isolate *   isolate= NULL   )   [static]

  typeThread* thread= isAThread(info.This());
  if (!thread) {
    return Nan::ThrowTypeError("thread.destroy(): the receiver must be a thread object");
  }

  if (!thread->sigkill) {
    thread->sigkill= 1;
    destroyaThread(thread);
  }

  info.GetReturnValue().SetUndefined();
}






// Eval: Pushes a job into the thread's ->inQueue.
NAN_METHOD(Eval){
  Nan::HandleScope scope;

  if (!info.Length()) {
    return Nan::ThrowTypeError("thread.eval(program [,callback]): missing arguments");
  }

  typeThread* thread= isAThread(info.This());
  if (!thread) {
    return Nan::ThrowTypeError("thread.eval(): the receiver must be a thread object");
  }

  typeQueueItem* qitem= nuJobQueueItem();
  typeJob* job= (typeJob*) qitem->asPtr;

  job->typeEval.tiene_callBack= ((info.Length() > 1) && (info[1]->IsFunction()));
  if (job->typeEval.tiene_callBack) {
    Local<Object> local_cb = info[1]->ToObject();
    job->cb.Reset(local_cb);
  }
  job->typeEval.scriptText_StringObject= new String::Utf8Value(info[0]);
  job->typeEval.useStringObject= 1;
  job->jobType= kJobTypeEval;

  pushToInQueue(qitem, thread);
  info.GetReturnValue().Set(info.This());
}





static char* readFile (Local<String> path) {
  v8::String::Utf8Value c_str(path);
  FILE* fp= fopen(*c_str, "rb");
  if (!fp) {
    fprintf(stderr, "Error opening the file %s\n", *c_str);
    //@bruno: Shouldn't we throw, here ?
    return NULL;
  }
  fseek(fp, 0, SEEK_END);
  size_t len= ftell(fp);
  rewind(fp); //fseek(fp, 0, SEEK_SET);
  char *buf= (char*)malloc((len+1) * sizeof(char)); // +1 to get null terminated string
  if (fread(buf, sizeof(char), len, fp) < len) {
    fprintf(stderr, "Error reading the file %s\n", *c_str);
    return NULL;
  }
  buf[len] = 0;
  fclose(fp);
  /*
  printf("SOURCE:\n%s\n", buf);
  fflush(stdout);
  */
  return buf;
}






// Load: Loads from file and passes to Eval
NAN_METHOD(Load) {
  Nan::HandleScope scope;

  if (!info.Length()) {
    return Nan::ThrowTypeError("thread.load(filename [,callback]): missing arguments");
  }

  typeThread* thread= isAThread(info.This());
  if (!thread) {
    return Nan::ThrowTypeError("thread.load(): the receiver must be a thread object");
  }

  char* source= readFile(info[0]->ToString());  //@Bruno: here we don't know if the file was not found or if it was an empty file
  if (!source) info.GetReturnValue().Set(info.This()); //@Bruno: even if source is empty, we should call the callback ?

  typeQueueItem* qitem= nuJobQueueItem();
  typeJob* job= (typeJob*) qitem->asPtr;

  job->typeEval.tiene_callBack= ((info.Length() > 1) && (info[1]->IsFunction()));
  if (job->typeEval.tiene_callBack) {
    Local<Object> local_cb = info[1]->ToObject();
    job->cb.Reset(local_cb);
  }
  job->typeEval.scriptText_CharPtr= source;
  job->typeEval.useStringObject= 0;
  job->jobType= kJobTypeEval;

  pushToInQueue(qitem, thread);

  info.GetReturnValue().Set(info.This());
}






NAN_METHOD(processEmit) {
  Nan::HandleScope scope;

  if (!info.Length()) info.GetReturnValue().Set(info.This());

  typeThread* thread= isAThread(info.This());
  if (!thread) {
    Nan::ThrowTypeError("thread.emit(): the receiver must be a thread object");
  }

  typeQueueItem* qitem= nuJobQueueItem();
  typeJob* job= (typeJob*) qitem->asPtr;

  job->jobType= kJobTypeEvent;
  job->typeEvent.length= info.Length()- 1;
  job->typeEvent.eventName= new String::Utf8Value(info[0]);
  job->typeEvent.argumentos= (v8::String::Utf8Value**) malloc(job->typeEvent.length* sizeof(void*));

  int i= 1;
  do {
    job->typeEvent.argumentos[i-1]= new String::Utf8Value(info[i]);
  } while (++i <= job->typeEvent.length);

  pushToInQueue(qitem, thread);

  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(processEmitSerialized) {
  Nan::HandleScope scope;

  int len = info.Length();

  if (!len) info.GetReturnValue().Set(info.This());

  typeThread* thread= isAThread(info.This());
  if (!thread) {
    return Nan::ThrowTypeError("thread.emit(): the receiver must be a thread object");
  }

  typeQueueItem* qitem= nuJobQueueItem();
  typeJob* job= (typeJob*) qitem->asPtr;

  job->jobType= kJobTypeEventSerialized;
  job->typeEventSerialized.length= len-1;
  job->typeEventSerialized.eventName= new String::Utf8Value(info[0]);
  Local<Array> array= Nan::New<Array>(len-1);
  int i = 1; do { array->Set(i-1, info[i]); } while (++i < len);

    {
      char* buffer;
      BSON *bson = new BSON();
      size_t object_size;
      Local<Object> object = bson->GetSerializeObject(array);
      BSONSerializer<CountStream> counter(bson, false, false);
      counter.SerializeDocument(object);
      object_size = counter.GetSerializeSize();
      buffer = (char *)malloc(object_size);
      BSONSerializer<DataStream> data(bson, false, false, buffer);
      data.SerializeDocument(object);
      job->typeEventSerialized.buffer= buffer;
      job->typeEventSerialized.bufferSize= object_size;
      delete bson;
    }

  pushToInQueue(qitem, thread);

  info.GetReturnValue().Set(info.This());
}

#define POST_EVENT(eventname) { \
  Nan::HandleScope scope; \
  int len = info.Length(); \
 \
  if (!len) info.GetReturnValue().Set(info.This()); \
 \
  typeThread* thread= (typeThread*) NanGetIsolateData(Isolate::GetCurrent()); \
 \
  typeQueueItem* qitem= nuJobQueueItem(); \
  typeJob* job= (typeJob*) qitem->asPtr; \
 \
  job->jobType= kJobTypeEventSerialized; \
  job->typeEventSerialized.eventName= new String::Utf8Value(Nan::New<String>(eventname).ToLocalChecked()); \
  job->typeEventSerialized.length= len; \
 \
  Local<Array> array= Nan::New<Array>(len); \
  int i = 0; do { array->Set(i, info[i]); } while (++i < len); \
 \
    { \
      char* buffer; \
      BSON *bson = new BSON(); \
      size_t object_size; \
      Local<Object> object = bson->GetSerializeObject(array); \
      BSONSerializer<CountStream> counter(bson, false, false); \
      counter.SerializeDocument(object); \
      object_size = counter.GetSerializeSize(); \
      buffer = (char *)malloc(object_size); \
      BSONSerializer<DataStream> data(bson, false, false, buffer); \
      data.SerializeDocument(object); \
      job->typeEventSerialized.buffer= buffer; \
      job->typeEventSerialized.bufferSize= object_size; \
      delete bson; \
    } \
 \
  queue_push(qitem, &thread->outQueue); \
  if (!(thread->inQueue.length)) uv_async_send(&thread->async_watcher); \
 \
  info.GetReturnValue().Set(info.This());   \
}

NAN_METHOD(postMessage) {
  POST_EVENT("message");
}

NAN_METHOD(postError) {
  POST_EVENT("error");
}

NAN_METHOD(threadEmit) {
  Nan::HandleScope scope;

  if (!info.Length()) info.GetReturnValue().Set(info.This());

  int i;
  typeThread* thread= (typeThread*) NanGetIsolateData(Isolate::GetCurrent());

  typeQueueItem* qitem= nuJobQueueItem();
  typeJob* job= (typeJob*) qitem->asPtr;

  job->jobType= kJobTypeEvent;
  job->typeEvent.length= info.Length()- 1;
  job->typeEvent.eventName= new String::Utf8Value(info[0]);
  job->typeEvent.argumentos= (v8::String::Utf8Value**) malloc(job->typeEvent.length* sizeof(void*));

  i= 1;
  do {
    job->typeEvent.argumentos[i-1]= new String::Utf8Value(info[i]);
  } while (++i <= job->typeEvent.length);

  queue_push(qitem, &thread->outQueue);
  if (!(thread->inQueue.length)) uv_async_send(&thread->async_watcher); // wake up callback

  info.GetReturnValue().Set(info.This());
}








// Creates and launches a new isolate in a new background thread.
NAN_METHOD(Create) {
    Nan::HandleScope scope;

    typeThread* thread;
    typeQueueItem* qitem= NULL;
    qitem= queue_pull(freeThreadsQueue);
    if (qitem) {
      thread= (typeThread*) qitem->asPtr;
      destroyItem(qitem);
    }
    else {
      thread= (typeThread*) calloc(1, sizeof(typeThread));
      thread->threadMagicCookie= kThreadMagicCookie;
    }

    static long int threadsCtr= 0;
    thread->id= threadsCtr++;

    Local<Object> local_JSObject = Nan::New(threadTemplate)->NewInstance();
    local_JSObject->Set(Nan::New(id_symbol), Nan::New<Integer>((int32_t)thread->id));
    Nan::SetInternalFieldPointer(local_JSObject, 0, thread);
    thread->JSObject.Reset(local_JSObject);

    Local<Value> dispatchEvents= Script::Compile(Nan::New<String>(kEvents_js).ToLocalChecked())->Run()->ToObject()->CallAsFunction(local_JSObject, 0, NULL);
	Local<Object> local_dispatchEvents = dispatchEvents->ToObject();
    thread->dispatchEvents.Reset(local_dispatchEvents);

    uv_async_init(uv_default_loop(), &thread->async_watcher, reinterpret_cast<uv_async_cb>(Callback));
    uv_ref((uv_handle_t*)&thread->async_watcher);

    uv_cond_init(&thread->IDLE_cv);
    uv_mutex_init(&thread->IDLE_mutex);
    uv_mutex_init(&thread->inQueue.queueLock);
    uv_mutex_init(&thread->outQueue.queueLock);

    int err= uv_thread_create(&thread->thread, aThread, thread);
    if (err) {
      //Ha habido un error no se ha arrancado esta thread
      destroyaThread(thread);
      return Nan::ThrowTypeError("create(): error in pthread_create()");
    }

    Nan::AdjustExternalMemory(sizeof(typeThread));
    info.GetReturnValue().Set(Nan::New(thread->JSObject));
}


#if NODE_MODULE_VERSION >= 0x000E
void Init (Handle<Object> target, Handle<Value> module, void *) {
#elif NODE_MODULE_VERSION >= 0x000B
void Init (Handle<Object> target, Handle<Value> module) {
#else
void Init (Handle<Object> target) {
#endif

  initQueues();
  freeThreadsQueue= nuQueue(-3);
  freeJobsQueue= nuQueue(-4);

  Nan::HandleScope scope;

  useLocker= v8::Locker::IsActive();

  target->Set(Nan::New<String>("create").ToLocalChecked(), Nan::New<FunctionTemplate>(Create)->GetFunction());
  target->Set(Nan::New<String>("createPool").ToLocalChecked(), Script::Compile(Nan::New<String>(kCreatePool_js).ToLocalChecked())->Run()->ToObject());
  target->Set(Nan::New<String>("Worker").ToLocalChecked(), Script::Compile(Nan::New<String>(kWorker_js).ToLocalChecked())->Run()->ToObject()->CallAsFunction(target, 0, NULL)->ToObject());

  Local<String> local_id_symbol = Nan::New<String>("id").ToLocalChecked();

  Local<ObjectTemplate> local_threadTemplate = ObjectTemplate::New();
  local_threadTemplate->SetInternalFieldCount(1);
  local_threadTemplate->Set(local_id_symbol, Nan::New<Integer>(0));
  id_symbol.Reset(local_id_symbol);
  local_threadTemplate->Set(Nan::New<String>("eval").ToLocalChecked(), Nan::New<FunctionTemplate>(Eval));
  local_threadTemplate->Set(Nan::New<String>("load").ToLocalChecked(), Nan::New<FunctionTemplate>(Load));
  local_threadTemplate->Set(Nan::New<String>("emit").ToLocalChecked(), Nan::New<FunctionTemplate>(processEmit));
  local_threadTemplate->Set(Nan::New<String>("emitSerialized").ToLocalChecked(), Nan::New<FunctionTemplate>(processEmitSerialized));
  local_threadTemplate->Set(Nan::New<String>("destroy").ToLocalChecked(), Nan::New<FunctionTemplate>(Destroy));
  threadTemplate.Reset(local_threadTemplate);
}




NODE_MODULE(WebWorkerThreads, Init)

/*
gcc -E -I /Users/jorge/JAVASCRIPT/binarios/include/node -o /o.c /Users/jorge/JAVASCRIPT/threads_a_gogo/src/threads_a_gogo.cc && mate /o.c
*/
