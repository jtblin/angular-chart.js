// Copyright(C) 2012 by RobertL
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

#include <errno.h>

static const PropertyAttribute attribute_ro_dd = (PropertyAttribute)(ReadOnly | DontDelete);
static const PropertyAttribute attribute_ro_de_dd = (PropertyAttribute)(ReadOnly | DontEnum | DontDelete);
#define JSObjFn(obj, name, fnname) \
    obj->ForceSet(Nan::New<String>(name).ToLocalChecked(), Nan::New<FunctionTemplate>(fnname)->GetFunction(), attribute_ro_dd);

static void ReportException(TryCatch* try_catch) {
    Nan::HandleScope scope;

	String::Utf8Value exception(try_catch->Exception());
    Local<Message> message = try_catch->Message();

	if (message.IsEmpty()) {
		printf("%s\n", *exception);

	} else {
		// Print (filename):(line number): (message).
		String::Utf8Value filename(message->GetScriptResourceName());
		int linenum = message->GetLineNumber();
		printf("%s:%i: %s\n", *filename, linenum, *exception);

		String::Utf8Value sourceline(message->GetSourceLine());
		char *tmpbuf = *sourceline;
		for (int i=0, n=sourceline.length(); i<n; ++i) {
			if (tmpbuf[i] == '\t') {
				putchar(' ');
			} else {
				putchar(tmpbuf[i]);
			}
		}
		putchar('\n');


		int start = message->GetStartColumn();
		for (int i = 0; i < start; i++) {
			putchar(' ');
		}
		int end = message->GetEndColumn();
		for (int i = start; i < end; i++) {
			putchar('^');
		}
		putchar('\n');

		String::Utf8Value stack_trace(try_catch->StackTrace());
		if (stack_trace.length() > 0) {
			printf("%s\n", *stack_trace);
		}
	}
}

//static Local<Value> readFileSync_(const Arguments &info) {
NAN_METHOD(readFileSync_) {
    Nan::HandleScope scope;

    FILE *f = fopen(*String::Utf8Value(Local<String>::Cast(info[0])), "rb");
	if (f == NULL) {
		char str[256];
		sprintf(str, "Error: readfile open failed. %d %s\n", errno, strerror(errno));
        return Nan::ThrowError(Nan::New<String>(str).ToLocalChecked());
	}
	fseek(f, 0, SEEK_END);
	size_t s = ftell(f);
	rewind(f);

	char *buf = (char*)malloc((s+1)*sizeof(char));
	size_t r = fread(buf, sizeof(char), s, f);
	if (r < s) {
		char str[256];
		sprintf(str, "Error: readfile read failed. %d %s\n", ferror(f), strerror(ferror(f)));
		delete[] buf;
		fclose(f);
        Nan::ThrowError(str);
	}
	buf[s] = 0;
    Local<String> str = Nan::New<String>(buf).ToLocalChecked();
	free(buf);
	fclose(f);

    info.GetReturnValue().Set(str);
}



//  console section
static inline void console_common_1(const Local<Value> &v, FILE* fd, const int deep) {
	char indent[36] = {};
	int i, n;
	int mark = 0;
	for (i=0; i<deep; ++i) {
		indent[mark++] = 0x20;
		indent[mark++] = 0x20;
	}

    Local<Value> lv;
	if (v->IsFunction()) {
		fprintf(fd, "%s[Function]\n", indent);
	} else if (v->IsObject()) {
        Local<Object> obj = Local<Object>::Cast(v);
        Local<Array> ar = obj->GetPropertyNames();
		fprintf(fd, "%s{Object}\n", indent);
		for (i=0, n=ar->Length(); i<n; ++i) {
			lv = obj->Get(ar->Get(i));
            fprintf(fd, "%s%s: ", indent, *(String::Utf8Value(Local<String>::Cast(ar->Get(i)))));
			if (lv->IsFunction()) {
				fprintf(fd, "%s[Function]\n", indent);
			} else if (lv->IsObject() || lv->IsArray()) {
				//fprintf(fd, "\n");
				console_common_1(lv, fd, deep+1);
			} else {
                fprintf(fd, "%s%s\n", indent, *(String::Utf8Value(Local<String>::Cast(lv))));
			}
		}
		fprintf(fd, "%s{/Object}\n", indent);

	} else if (v->IsArray()) {
        Local<Array> obj = Local<Array>::Cast(v);
		fprintf(fd, "%s[Array]\n", indent);
		for (i=0, n=obj->Length(); i<n; ++i) {
			lv = obj->Get(i);
			fprintf(fd, "%s%d: ", indent, i);
			if (lv->IsFunction()) {
				fprintf(fd, "%s[Function]\n", indent);
			} else if (lv->IsObject() || lv->IsArray()) {
				fprintf(fd, "\n");
				console_common_1(lv, fd, deep+1);
			} else {
                fprintf(fd, "%s%s\n", indent, *(String::Utf8Value(Local<String>::Cast(lv))));
			}
		}
		fprintf(fd, "%s[/Array]\n", indent);
	} else {
        fprintf(fd, "%s%s\n", indent, *(String::Utf8Value(Local<String>::Cast(v))));
	}
}

NAN_METHOD(console_log) {
    Nan::HandleScope scope;
	
	TryCatch trycatch;
	
    for (int i=0, n=info.Length(); i<n; ++i) {
        console_common_1(info[i], stdout, 0);
	}

	if (trycatch.HasCaught()) {
		ReportException(&trycatch);
	}
	
    info.GetReturnValue().SetUndefined();
}

NAN_METHOD(console_error) {
    Nan::HandleScope scope;
	
	TryCatch trycatch;
	
    for (int i=0, n=info.Length(); i<n; ++i) {
        console_common_1(info[i], stderr, 0);
	}

	if (trycatch.HasCaught()) {
		ReportException(&trycatch);
	}
	
    info.GetReturnValue().SetUndefined();
}
