#ifndef NAN_ISOLATE_DATA_ACCESSOR_H_
#define NAN_ISOLATE_DATA_ACCESSOR_H_

// v8 deprecated Isolate::SetData and GetData at
// version 3.23.11 and removed them at version 3.24.4,
// but NODE_MODULE_VERSION will not change after until
// next stable release.

NAN_INLINE void NanSetIsolateData(
    v8::Isolate *isolate
  , void *data
) {
#if NODE_VERSION_AT_LEAST(0, 11, 13)
    isolate->SetData(0, data);
#else
    isolate->SetData(data);
#endif
}

NAN_INLINE void *NanGetIsolateData(
    v8::Isolate *isolate
) {
#if NODE_VERSION_AT_LEAST(0, 11, 13)
    return isolate->GetData(0);
#else
    return isolate->GetData();
#endif
}

#endif // NAN_ISOLATE_DATA_ACCESSOR_H_
