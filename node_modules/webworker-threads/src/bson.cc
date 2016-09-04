//===========================================================================

#include <stdarg.h>
#include <cstdlib>
#include <cstring>
#include <string.h>
#include <stdlib.h>

#ifdef __clang__
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunused-parameter"
#endif

#include <v8.h>

// this and the above block must be around the v8.h header otherwise
// v8 is not happy
#ifdef __clang__
#pragma clang diagnostic pop
#endif

#include <node.h>
#include <node_version.h>
#include <node_buffer.h>

#include <cmath>
#include <iostream>
#include <limits>
#include <vector>

#if defined(__sun) || defined(_AIX)
	#include <alloca.h>
#endif

#include "bson.h"

using namespace v8;
using namespace node;

//===========================================================================

void DataStream::WriteObjectId(const Local<Object>& object, const Local<String>& key)
{
	uint16_t buffer[12];
	object->Get(key)->ToString()->Write(buffer, 0, 12);
	for(uint32_t i = 0; i < 12; ++i)
	{
		*p++ = (char) buffer[i];
	}
}

void ThrowAllocatedStringException(size_t allocationSize, const char* format, ...)
{
    va_list info;
    va_start(info, format);
	char* string = (char*) malloc(allocationSize);
    vsprintf(string, format, info);
    va_end(info);

	throw string;
}

void DataStream::CheckKey(const Local<String>& keyName)
{
	size_t keyLength = keyName->Utf8Length();
	if(keyLength == 0) return;

	// Allocate space for the key, do not need to zero terminate as WriteUtf8 does it
	char* keyStringBuffer = (char*) alloca(keyLength + 1);
	// Write the key to the allocated buffer
	keyName->WriteUtf8(keyStringBuffer);
	// Check for the zero terminator
	char* terminator = strchr(keyStringBuffer, 0x00);

	// If the location is not at the end of the string we've got an illegal 0x00 byte somewhere
	if(terminator != &keyStringBuffer[keyLength]) {
		ThrowAllocatedStringException(64+keyLength, "key %s must not contain null bytes", keyStringBuffer);
	}

	if(keyStringBuffer[0] == '$')
	{
		ThrowAllocatedStringException(64+keyLength, "key %s must not start with '$'", keyStringBuffer);
	}

	if(strchr(keyStringBuffer, '.') != NULL)
	{
		ThrowAllocatedStringException(64+keyLength, "key %s must not contain '.'", keyStringBuffer);
	}
}

template<typename T> void BSONSerializer<T>::SerializeDocument(const Local<Value>& value)
{
	void* documentSize = this->BeginWriteSize();
	Local<Object> object = bson->GetSerializeObject(value);

	// Get the object property names
  Local<Array> propertyNames = object->GetPropertyNames();

	// Length of the property
	int propertyLength = propertyNames->Length();
	for(int i = 0;  i < propertyLength; ++i)
	{
		const Local<String>& propertyName = propertyNames->Get(i)->ToString();
		if(checkKeys) this->CheckKey(propertyName);

		const Local<Value>& propertyValue = object->Get(propertyName);

		if(serializeFunctions || !propertyValue->IsFunction())
		{
			void* typeLocation = this->BeginWriteType();
			this->WriteString(propertyName);
			SerializeValue(typeLocation, propertyValue);
		}
	}

	this->WriteByte(0);
	this->CommitSize(documentSize);
}

template<typename T> void BSONSerializer<T>::SerializeArray(const Local<Value>& value)
{
	void* documentSize = this->BeginWriteSize();

	Local<Array> array = Local<Array>::Cast(value->ToObject());
	uint32_t arrayLength = array->Length();

	for(uint32_t i = 0;  i < arrayLength; ++i)
	{
		void* typeLocation = this->BeginWriteType();
		this->WriteUInt32String(i);
		SerializeValue(typeLocation, array->Get(i));
	}

	this->WriteByte(0);
	this->CommitSize(documentSize);
}

// This is templated so that we can use this function to both count the number of bytes, and to serialize those bytes.
// The template approach eliminates almost all of the inspection of values unless they're required (eg. string lengths)
// and ensures that there is always consistency between bytes counted and bytes written by design.
template<typename T> void BSONSerializer<T>::SerializeValue(void* typeLocation, const Local<Value>& value)
{
	if(value->IsNumber())
	{
		double doubleValue = value->NumberValue();
		int intValue = (int) doubleValue;
		if(intValue == doubleValue)
		{
			this->CommitType(typeLocation, BSON_TYPE_INT);
			this->WriteInt32(intValue);
		}
		else
		{
			this->CommitType(typeLocation, BSON_TYPE_NUMBER);
			this->WriteDouble(doubleValue);
		}
	}
	else if(value->IsString())
	{
		this->CommitType(typeLocation, BSON_TYPE_STRING);
		this->WriteLengthPrefixedString(value->ToString());
	}
	else if(value->IsBoolean())
	{
		this->CommitType(typeLocation, BSON_TYPE_BOOLEAN);
		this->WriteBool(value);
	}
	else if(value->IsArray())
	{
		this->CommitType(typeLocation, BSON_TYPE_ARRAY);
		SerializeArray(value);
	}
	else if(value->IsDate())
	{
		this->CommitType(typeLocation, BSON_TYPE_DATE);
		this->WriteInt64(value);
	}
	else if(value->IsRegExp())
	{
		this->CommitType(typeLocation, BSON_TYPE_REGEXP);
        const Local<RegExp>& regExp = Local<RegExp>::Cast(value);

		this->WriteString(regExp->GetSource());

		int flags = regExp->GetFlags();
		if(flags & RegExp::kGlobal) this->WriteByte('s');
		if(flags & RegExp::kIgnoreCase) this->WriteByte('i');
		if(flags & RegExp::kMultiline) this->WriteByte('m');
		this->WriteByte(0);
	}
	else if(value->IsFunction())
	{
		this->CommitType(typeLocation, BSON_TYPE_CODE);
		this->WriteLengthPrefixedString(value->ToString());
	}
	else if(value->IsObject())
	{
		const Local<Object>& object = value->ToObject();
        if(object->Has(Nan::New(bson->_bsontypeString)))
		{
			const Local<String>& constructorString = object->GetConstructorName();
            if(Nan::New(bson->longString)->StrictEquals(constructorString))
			{
				this->CommitType(typeLocation, BSON_TYPE_LONG);
                this->WriteInt32(object, Nan::New(bson->_longLowString));
                this->WriteInt32(object, Nan::New(bson->_longHighString));
			}
            else if(Nan::New(bson->timestampString)->StrictEquals(constructorString))
			{
				this->CommitType(typeLocation, BSON_TYPE_TIMESTAMP);
                this->WriteInt32(object, Nan::New(bson->_longLowString));
                this->WriteInt32(object, Nan::New(bson->_longHighString));
			}
            else if(Nan::New(bson->objectIDString)->StrictEquals(constructorString))
			{
				this->CommitType(typeLocation, BSON_TYPE_OID);
                this->WriteObjectId(object, Nan::New(bson->_objectIDidString));
			}
            else if(Nan::New(bson->binaryString)->StrictEquals(constructorString))
			{
				this->CommitType(typeLocation, BSON_TYPE_BINARY);

                uint32_t length = object->Get(Nan::New(bson->_binaryPositionString))->Uint32Value();
                Local<Object> bufferObj = object->Get(Nan::New(bson->_binaryBufferString))->ToObject();

				this->WriteInt32(length);
                this->WriteByte(object, Nan::New(bson->_binarySubTypeString));	// write subtype
				// If type 0x02 write the array length aswell
                if(object->Get(Nan::New(bson->_binarySubTypeString))->Int32Value() == 0x02) {
					this->WriteInt32(length);
				}
				// Write the actual data
				this->WriteData(Buffer::Data(bufferObj), length);
			}
            else if(Nan::New(bson->doubleString)->StrictEquals(constructorString))
			{
				this->CommitType(typeLocation, BSON_TYPE_NUMBER);
                this->WriteDouble(object, Nan::New(bson->_doubleValueString));
			}
            else if(Nan::New(bson->symbolString)->StrictEquals(constructorString))
			{
				this->CommitType(typeLocation, BSON_TYPE_SYMBOL);
                this->WriteLengthPrefixedString(object->Get(Nan::New(bson->_symbolValueString))->ToString());
			}
            else if(Nan::New(bson->codeString)->StrictEquals(constructorString))
			{
                const Local<String>& function = object->Get(Nan::New(bson->_codeCodeString))->ToString();
                const Local<Object>& scope = object->Get(Nan::New(bson->_codeScopeString))->ToObject();

				// For Node < 0.6.X use the GetPropertyNames
	      #if NODE_MAJOR_VERSION == 0 && NODE_MINOR_VERSION < 6
	        uint32_t propertyNameLength = scope->GetPropertyNames()->Length();
	      #else
	        uint32_t propertyNameLength = scope->GetOwnPropertyNames()->Length();
	      #endif

				if(propertyNameLength > 0)
				{
					this->CommitType(typeLocation, BSON_TYPE_CODE_W_SCOPE);
					void* codeWidthScopeSize = this->BeginWriteSize();
					this->WriteLengthPrefixedString(function->ToString());
					SerializeDocument(scope);
					this->CommitSize(codeWidthScopeSize);
				}
				else
				{
					this->CommitType(typeLocation, BSON_TYPE_CODE);
					this->WriteLengthPrefixedString(function->ToString());
				}
			}
            else if(Nan::New(bson->dbrefString)->StrictEquals(constructorString))
			{
				this->CommitType(typeLocation, BSON_TYPE_OBJECT);

				void* dbRefSize = this->BeginWriteSize();

				void* refType = this->BeginWriteType();
				this->WriteData("$ref", 5);
                SerializeValue(refType, object->Get(Nan::New(bson->_dbRefNamespaceString)));

				void* idType = this->BeginWriteType();
				this->WriteData("$id", 4);
                SerializeValue(idType, object->Get(Nan::New(bson->_dbRefOidString)));

                const Local<Value>& refDbValue = object->Get(Nan::New(bson->_dbRefDbString));
				if(!refDbValue->IsUndefined())
				{
					void* dbType = this->BeginWriteType();
					this->WriteData("$db", 4);
					SerializeValue(dbType, refDbValue);
				}

				this->WriteByte(0);
				this->CommitSize(dbRefSize);
			}
            else if(Nan::New(bson->minKeyString)->StrictEquals(constructorString))
			{
				this->CommitType(typeLocation, BSON_TYPE_MIN_KEY);
			}
            else if(Nan::New(bson->maxKeyString)->StrictEquals(constructorString))
			{
				this->CommitType(typeLocation, BSON_TYPE_MAX_KEY);
			}
		}
		else if(Buffer::HasInstance(value))
		{
			this->CommitType(typeLocation, BSON_TYPE_BINARY);

	    #if NODE_MAJOR_VERSION == 0 && NODE_MINOR_VERSION < 3
       Local<Object> buffer = ObjectWrap::Unwrap<Buffer>(value->ToObject());
			 uint32_t length = object->length();
	    #else
			 uint32_t length = Buffer::Length(value->ToObject());
	    #endif

			this->WriteInt32(length);
			this->WriteByte(0);
			this->WriteData(Buffer::Data(value->ToObject()), length);
		}
		else
		{
			this->CommitType(typeLocation, BSON_TYPE_OBJECT);
			SerializeDocument(value);
		}
	}
	else if(value->IsNull() || value->IsUndefined())
	{
		this->CommitType(typeLocation, BSON_TYPE_NULL);
	}
}

// Data points to start of element list, length is length of entire document including '\0' but excluding initial size
BSONDeserializer::BSONDeserializer(BSON* aBson, char* data, size_t length)
: bson(aBson),
  pStart(data),
  p(data),
  pEnd(data + length - 1)
{
	if(*pEnd != '\0') ThrowAllocatedStringException(64, "Missing end of document marker '\\0'");
}

BSONDeserializer::BSONDeserializer(BSONDeserializer& parentSerializer, size_t length)
: bson(parentSerializer.bson),
  pStart(parentSerializer.p),
  p(parentSerializer.p),
  pEnd(parentSerializer.p + length - 1)
{
	parentSerializer.p += length;
	if(pEnd > parentSerializer.pEnd) ThrowAllocatedStringException(64, "Child document exceeds parent's bounds");
	if(*pEnd != '\0') ThrowAllocatedStringException(64, "Missing end of document marker '\\0'");
}

Local<Value> BSONDeserializer::ReadCString()
{
	char* start = p;
	while(*p++ && (p < pEnd)) { }
	if(p > pEnd) {
        return Nan::Null();
	}
    return Nan::New<String>(start, (int32_t) (p-start-1) ).ToLocalChecked();
}

int32_t BSONDeserializer::ReadRegexOptions()
{
	int32_t options = 0;
	for(;;)
	{
		switch(*p++)
		{
		case '\0': return options;
		case 's': options |= RegExp::kGlobal; break;
		case 'i': options |= RegExp::kIgnoreCase; break;
		case 'm': options |= RegExp::kMultiline; break;
		}
	}
}

uint32_t BSONDeserializer::ReadIntegerString()
{
	uint32_t value = 0;
	while(*p)
	{
		if(*p < '0' || *p > '9') ThrowAllocatedStringException(64, "Invalid key for array");
		value = value * 10 + *p++ - '0';
	}
	++p;
	return value;
}

Local<String> BSONDeserializer::ReadString()
{
	uint32_t length = ReadUInt32();
	char* start = p;
	p += length;
    return Nan::New<String>(start, length-1).ToLocalChecked();
}

Local<String> BSONDeserializer::ReadObjectId()
{
	uint16_t objectId[12];
	for(size_t i = 0; i < 12; ++i)
	{
		objectId[i] = *reinterpret_cast<unsigned char*>(p++);
	}
    return Nan::New<String>(objectId, 12).ToLocalChecked();
}

Local<Value> BSONDeserializer::DeserializeDocument(bool promoteLongs)
{
	uint32_t length = ReadUInt32();
	if(length < 5) ThrowAllocatedStringException(64, "Bad BSON: Document is less than 5 bytes");

	BSONDeserializer documentDeserializer(*this, length-4);
	return documentDeserializer.DeserializeDocumentInternal(promoteLongs);
}

Local<Value> BSONDeserializer::DeserializeDocumentInternal(bool promoteLongs)
{
    Local<Object> returnObject = Nan::New<Object>();

	while(HasMoreData())
	{
		BsonType type = (BsonType) ReadByte();
        const Local<Value>& name = ReadCString();
		if(name->IsNull()) ThrowAllocatedStringException(64, "Bad BSON Document: illegal CString");
		// name->Is
        const Local<Value>& value = DeserializeValue(type, promoteLongs);
		returnObject->ForceSet(name, value);
	}
	if(p != pEnd) ThrowAllocatedStringException(64, "Bad BSON Document: Serialize consumed unexpected number of bytes");

	// From JavaScript:
	// if(object['$id'] != null) object = new DBRef(object['$ref'], object['$id'], object['$db']);
    if(returnObject->Has(Nan::New(bson->_dbRefIdRefString)))
	{
        Local<Value> argv[] = { returnObject->Get(Nan::New(bson->_dbRefRefString)), returnObject->Get(Nan::New(bson->_dbRefIdRefString)), returnObject->Get(Nan::New(bson->_dbRefDbRefString)) };
        return Nan::New(bson->dbrefConstructor)->NewInstance(3, argv);
	}
	else
	{
		return returnObject;
	}
}

Local<Value> BSONDeserializer::DeserializeArray(bool promoteLongs)
{
	uint32_t length = ReadUInt32();
	if(length < 5) ThrowAllocatedStringException(64, "Bad BSON: Array Document is less than 5 bytes");

	BSONDeserializer documentDeserializer(*this, length-4);
	return documentDeserializer.DeserializeArrayInternal(promoteLongs);
}

Local<Value> BSONDeserializer::DeserializeArrayInternal(bool promoteLongs)
{
    Local<Array> returnArray = Nan::New<Array>();

	while(HasMoreData())
	{
		BsonType type = (BsonType) ReadByte();
		uint32_t index = ReadIntegerString();
        const Local<Value>& value = DeserializeValue(type, promoteLongs);
		returnArray->Set(index, value);
	}
	if(p != pEnd) ThrowAllocatedStringException(64, "Bad BSON Array: Serialize consumed unexpected number of bytes");

	return returnArray;
}

Local<Value> BSONDeserializer::DeserializeValue(BsonType type, bool promoteLongs)
{
	switch(type)
	{
	case BSON_TYPE_STRING:
		return ReadString();

	case BSON_TYPE_INT:
        return Nan::New<Integer>(ReadInt32());

	case BSON_TYPE_NUMBER:
        return Nan::New<Number>(ReadDouble());

	case BSON_TYPE_NULL:
        return Nan::Null();

	case BSON_TYPE_UNDEFINED:
        return Nan::Undefined();

	case BSON_TYPE_TIMESTAMP:
		{
			int32_t lowBits = ReadInt32();
			int32_t highBits = ReadInt32();
            Local<Value> argv[] = { Nan::New<Int32>(lowBits), Nan::New<Int32>(highBits) };
            return Nan::New(bson->timestampConstructor)->NewInstance(2, argv);
		}

	case BSON_TYPE_BOOLEAN:
        return (ReadByte() != 0) ? Nan::True() : Nan::False();

	case BSON_TYPE_REGEXP:
		{
            const Local<Value>& regex = ReadCString();
			if(regex->IsNull()) ThrowAllocatedStringException(64, "Bad BSON Document: illegal CString");
			int32_t options = ReadRegexOptions();
			return RegExp::New(regex->ToString(), (RegExp::Flags) options);
		}

	case BSON_TYPE_CODE:
		{
			const Local<Value>& code = ReadString();
            const Local<Value>& scope = Nan::New<Object>();
			Local<Value> argv[] = { code, scope };
            return Nan::New(bson->codeConstructor)->NewInstance(2, argv);
		}

	case BSON_TYPE_CODE_W_SCOPE:
		{
			ReadUInt32();
			const Local<Value>& code = ReadString();
            const Local<Value>& scope = DeserializeDocument(promoteLongs);
			Local<Value> argv[] = { code, scope->ToObject() };
            return Nan::New(bson->codeConstructor)->NewInstance(2, argv);
		}

	case BSON_TYPE_OID:
		{
			Local<Value> argv[] = { ReadObjectId() };
            return Nan::New(bson->objectIDConstructor)->NewInstance(1, argv);
		}

	case BSON_TYPE_BINARY:
		{
			uint32_t length = ReadUInt32();
			uint32_t subType = ReadByte();
			if(subType == 0x02) {
				length = ReadInt32();
			}

            Local<Object> buffer = Nan::NewBuffer(p, length).ToLocalChecked();
			p += length;

            Local<Value> argv[] = { buffer, Nan::New<Uint32>(subType) };
            return Nan::New(bson->binaryConstructor)->NewInstance(2, argv);
		}

	case BSON_TYPE_LONG:
		{
			// Read 32 bit integers
			int32_t lowBits = (int32_t) ReadInt32();
			int32_t highBits = (int32_t) ReadInt32();

			// Promote long is enabled
			if(promoteLongs) {
				// If value is < 2^53 and >-2^53
				if((highBits < 0x200000 || (highBits == 0x200000 && lowBits == 0)) && highBits >= -0x200000) {
					// Adjust the pointer and read as 64 bit value
					p -= 8;
					// Read the 64 bit value
					int64_t finalValue = (int64_t) ReadInt64();
                    return Nan::New<Number>(finalValue);
				}
			}

			// Decode the Long value
            Local<Value> argv[] = { Nan::New<Int32>(lowBits), Nan::New<Int32>(highBits) };
            return Nan::New(bson->longConstructor)->NewInstance(2, argv);
		}

	case BSON_TYPE_DATE:
        return Nan::New<Date>((double) ReadInt64()).ToLocalChecked();

	case BSON_TYPE_ARRAY:
		return DeserializeArray(promoteLongs);

	case BSON_TYPE_OBJECT:
		return DeserializeDocument(promoteLongs);

	case BSON_TYPE_SYMBOL:
		{
			const Local<String>& string = ReadString();
			Local<Value> argv[] = { string };
            return Nan::New(bson->symbolConstructor)->NewInstance(1, argv);
		}

	case BSON_TYPE_MIN_KEY:
        return Nan::New(bson->minKeyConstructor)->NewInstance();

	case BSON_TYPE_MAX_KEY:
        return Nan::New(bson->maxKeyConstructor)->NewInstance();

	default:
		ThrowAllocatedStringException(64, "Unhandled BSON Type: %d", type);
	}

    return Nan::Null();
}

Nan::Persistent<FunctionTemplate> BSON::constructor_template;

BSON::BSON() : ObjectWrap()
{
	// Setup pre-allocated comparision objects
        _bsontypeString.Reset(Nan::New<String>("_bsontype").ToLocalChecked());
        _longLowString.Reset(Nan::New<String>("low_").ToLocalChecked());
        _longHighString.Reset(Nan::New<String>("high_").ToLocalChecked());
        _objectIDidString.Reset(Nan::New<String>("id").ToLocalChecked());
        _binaryPositionString.Reset(Nan::New<String>("position").ToLocalChecked());
        _binarySubTypeString.Reset(Nan::New<String>("sub_type").ToLocalChecked());
        _binaryBufferString.Reset(Nan::New<String>("buffer").ToLocalChecked());
        _doubleValueString.Reset(Nan::New<String>("value").ToLocalChecked());
        _symbolValueString.Reset(Nan::New<String>("value").ToLocalChecked());
        _dbRefRefString.Reset(Nan::New<String>("$ref").ToLocalChecked());
        _dbRefIdRefString.Reset(Nan::New<String>("$id").ToLocalChecked());
        _dbRefDbRefString.Reset(Nan::New<String>("$db").ToLocalChecked());
        _dbRefNamespaceString.Reset(Nan::New<String>("namespace").ToLocalChecked());
        _dbRefDbString.Reset(Nan::New<String>("db").ToLocalChecked());
        _dbRefOidString.Reset(Nan::New<String>("oid").ToLocalChecked());
        _codeCodeString.Reset(Nan::New<String>("code").ToLocalChecked());
        _codeScopeString.Reset(Nan::New<String>("scope").ToLocalChecked());
        _toBSONString.Reset(Nan::New<String>("toBSON").ToLocalChecked());

        longString.Reset(Nan::New<String>("Long").ToLocalChecked());
        objectIDString.Reset(Nan::New<String>("ObjectID").ToLocalChecked());
        binaryString.Reset(Nan::New<String>("Binary").ToLocalChecked());
        codeString.Reset(Nan::New<String>("Code").ToLocalChecked());
        dbrefString.Reset(Nan::New<String>("DBRef").ToLocalChecked());
        symbolString.Reset(Nan::New<String>("Symbol").ToLocalChecked());
        doubleString.Reset(Nan::New<String>("Double").ToLocalChecked());
        timestampString.Reset(Nan::New<String>("Timestamp").ToLocalChecked());
        minKeyString.Reset(Nan::New<String>("MinKey").ToLocalChecked());
        maxKeyString.Reset(Nan::New<String>("MaxKey").ToLocalChecked());
}

void BSON::Initialize(v8::Local<v8::Object> target)
{
	// Grab the scope of the call from Node
    Nan::HandleScope scope;
	// Define a new function template
    Local<FunctionTemplate> t = Nan::New<FunctionTemplate>();
	t->InstanceTemplate()->SetInternalFieldCount(1);
    t->SetClassName(Nan::New<String>("BSON").ToLocalChecked());

	// Instance methods
    Nan::SetPrototypeMethod(t, "calculateObjectSize", CalculateObjectSize);
    Nan::SetPrototypeMethod(t, "serialize", BSONSerialize);
    Nan::SetPrototypeMethod(t, "serializeWithBufferAndIndex", SerializeWithBufferAndIndex);
    Nan::SetPrototypeMethod(t, "deserialize", BSONDeserialize);
    Nan::SetPrototypeMethod(t, "deserializeStream", BSONDeserializeStream);

    constructor_template.Reset(t);

    target->ForceSet(Nan::New<String>("BSON").ToLocalChecked(), t->GetFunction());
}

// Create a new instance of BSON and passing it the existing context
NAN_METHOD(BSON::New)
{
    Nan::HandleScope scope;

	// Check that we have an array
    if(info.Length() == 1 && info[0]->IsArray())
	{
		// Cast the array to a local reference
        Local<Array> array = Local<Array>::Cast(info[0]);

		if(array->Length() > 0)
		{
			// Create a bson object instance and return it
			BSON *bson = new BSON();

			uint32_t foundClassesMask = 0;

			// Iterate over all entries to save the instantiate funtions
			for(uint32_t i = 0; i < array->Length(); i++) {
				// Let's get a reference to the function
				Local<Function> func = Local<Function>::Cast(array->Get(i));
				Local<String> functionName = func->GetName()->ToString();

				// Save the functions making them persistant handles (they don't get collected)
                if(functionName->StrictEquals(Nan::New(bson->longString))) {
                    bson->longConstructor.Reset(func);
					foundClassesMask |= 1;
                } else if(functionName->StrictEquals(Nan::New(bson->objectIDString))) {
                    bson->objectIDConstructor.Reset(func);
					foundClassesMask |= 2;
                } else if(functionName->StrictEquals(Nan::New(bson->binaryString))) {
                    bson->binaryConstructor.Reset(func);
					foundClassesMask |= 4;
                } else if(functionName->StrictEquals(Nan::New(bson->codeString))) {
                    bson->codeConstructor.Reset(func);
					foundClassesMask |= 8;
                } else if(functionName->StrictEquals(Nan::New(bson->dbrefString))) {
                    bson->dbrefConstructor.Reset(func);
					foundClassesMask |= 0x10;
                } else if(functionName->StrictEquals(Nan::New(bson->symbolString))) {
                    bson->symbolConstructor.Reset(func);
					foundClassesMask |= 0x20;
                } else if(functionName->StrictEquals(Nan::New(bson->doubleString))) {
                    bson->doubleConstructor.Reset(func);
					foundClassesMask |= 0x40;
                } else if(functionName->StrictEquals(Nan::New(bson->timestampString))) {
                    bson->timestampConstructor.Reset(func);
					foundClassesMask |= 0x80;
                } else if(functionName->StrictEquals(Nan::New(bson->minKeyString))) {
                    bson->minKeyConstructor.Reset(func);
					foundClassesMask |= 0x100;
                } else if(functionName->StrictEquals(Nan::New(bson->maxKeyString))) {
                    bson->maxKeyConstructor.Reset(func);
					foundClassesMask |= 0x200;
				}
			}

			// Check if we have the right number of constructors otherwise throw an error
			if(foundClassesMask != 0x3ff) {
				delete bson;
                return Nan::ThrowError("Missing function constructor for either [Long/ObjectID/Binary/Code/DbRef/Symbol/Double/Timestamp/MinKey/MaxKey]");
			} else {
                bson->Wrap(info.This());
                info.GetReturnValue().Set(info.This());
			}
		}
		else
		{
            return Nan::ThrowError("No types passed in");
		}
	}
	else
	{
        return Nan::ThrowTypeError("Argument passed in must be an array of types");
	}
}

//------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------

NAN_METHOD(BSON::BSONDeserialize)
{
    Nan::HandleScope scope;

	// Fail if the first argument is not a string or a buffer
    if(info.Length() > 1 && !info[0]->IsString() && !Buffer::HasInstance(info[0]))
        return Nan::ThrowError("First Argument must be a Buffer or String.");

	// Promote longs
	bool promoteLongs = true;

	// If we have an options object
    if(info.Length() == 2 && info[1]->IsObject()) {
        Local<Object> options = info[1]->ToObject();

        if(options->Has(Nan::New<String>("promoteLongs").ToLocalChecked())) {
            promoteLongs = options->Get(Nan::New<String>("promoteLongs").ToLocalChecked())->ToBoolean()->Value();
		}
	}

	// Define pointer to data
    Local<Object> obj = info[0]->ToObject();

	// Unpack the BSON parser instance
    BSON *bson = ObjectWrap::Unwrap<BSON>(info.This());

	// If we passed in a buffer, let's unpack it, otherwise let's unpack the string
	if(Buffer::HasInstance(obj))
	{
#if NODE_MAJOR_VERSION == 0 && NODE_MINOR_VERSION < 3
		Local<Object> buffer = ObjectWrap::Unwrap<Buffer>(obj);
		char* data = buffer->data();
		size_t length = buffer->length();
#else
		char* data = Buffer::Data(obj);
		size_t length = Buffer::Length(obj);
#endif

		// Validate that we have at least 5 bytes
        if(length < 5) return Nan::ThrowError("corrupt bson message < 5 bytes long");

		try
		{
			BSONDeserializer deserializer(bson, data, length);
			// deserializer.promoteLongs = promoteLongs;
            info.GetReturnValue().Set(deserializer.DeserializeDocument(promoteLongs));
		}
		catch(char* exception)
		{
            Local<String> error = Nan::New<String>(exception).ToLocalChecked();
			free(exception);
            return Nan::ThrowError(error);
		}

	}
	else
	{
		// The length of the data for this encoding
        intptr_t len = DecodeBytes(info[0], BINARY);

		// Validate that we have at least 5 bytes
        if(len < 5) return Nan::ThrowError("corrupt bson message < 5 bytes long");

		// Let's define the buffer size
		char* data = (char *)malloc(len);
        DecodeWrite(data, len, info[0], BINARY);

		try
		{
			BSONDeserializer deserializer(bson, data, len);
			// deserializer.promoteLongs = promoteLongs;
            Local<Value> result = deserializer.DeserializeDocument(promoteLongs);
			free(data);
            info.GetReturnValue().Set(result);

		}
		catch(char* exception)
		{
            Local<String> error = Nan::New<String>(exception).ToLocalChecked();
			free(exception);
			free(data);
            return Nan::ThrowError(error);
		}
	}
}

Local<Object> BSON::GetSerializeObject(const Local<Value>& argValue)
{
	Local<Object> object = argValue->ToObject();
    if(object->Has(Nan::New(_toBSONString)))
	{
        const Local<Value>& toBSON = object->Get(Nan::New(_toBSONString));
		if(!toBSON->IsFunction()) ThrowAllocatedStringException(64, "toBSON is not a function");

		Local<Value> result = Local<Function>::Cast(toBSON)->Call(object, 0, NULL);
		if(!result->IsObject()) ThrowAllocatedStringException(64, "toBSON function did not return an object");
		return result->ToObject();
	}
	else
	{
		return object;
	}
}

NAN_METHOD(BSON::BSONSerialize)
{
    Nan::HandleScope scope;

    if(info.Length() == 1 && !info[0]->IsObject()) return Nan::ThrowError("One, two or tree arguments required - [object] or [object, boolean] or [object, boolean, boolean]");
    if(info.Length() == 2 && !info[0]->IsObject() && !info[1]->IsBoolean()) return Nan::ThrowError("One, two or tree arguments required - [object] or [object, boolean] or [object, boolean, boolean]");
    if(info.Length() == 3 && !info[0]->IsObject() && !info[1]->IsBoolean() && !info[2]->IsBoolean()) return Nan::ThrowError("One, two or tree arguments required - [object] or [object, boolean] or [object, boolean, boolean]");
    if(info.Length() == 4 && !info[0]->IsObject() && !info[1]->IsBoolean() && !info[2]->IsBoolean() && !info[3]->IsBoolean()) return Nan::ThrowError("One, two or tree arguments required - [object] or [object, boolean] or [object, boolean, boolean] or [object, boolean, boolean, boolean]");
    if(info.Length() > 4) return Nan::ThrowError("One, two, tree or four arguments required - [object] or [object, boolean] or [object, boolean, boolean] or [object, boolean, boolean, boolean]");

	// Check if we have an array as the object
    if(info[0]->IsArray()) return Nan::ThrowError("Only javascript objects supported");

	// Unpack the BSON parser instance
    BSON *bson = ObjectWrap::Unwrap<BSON>(info.This());

	// Calculate the total size of the document in binary form to ensure we only allocate memory once
	// With serialize function
    bool serializeFunctions = (info.Length() >= 4) && info[3]->BooleanValue();

	char *serialized_object = NULL;
	size_t object_size;
	try
	{
        Local<Object> object = bson->GetSerializeObject(info[0]);

		BSONSerializer<CountStream> counter(bson, false, serializeFunctions);
		counter.SerializeDocument(object);
		object_size = counter.GetSerializeSize();

		// Allocate the memory needed for the serialization
		serialized_object = (char *)malloc(object_size);

		// Check if we have a boolean value
        bool checkKeys = info.Length() >= 3 && info[1]->IsBoolean() && info[1]->BooleanValue();
		BSONSerializer<DataStream> data(bson, checkKeys, serializeFunctions, serialized_object);
		data.SerializeDocument(object);
	}
	catch(char *err_msg)
	{
		free(serialized_object);
        Local<String> error = Nan::New<String>(err_msg).ToLocalChecked();
		free(err_msg);
        return Nan::ThrowError(error);
	}

	// If we have 3 arguments
    if(info.Length() == 3 || info.Length() == 4)
	{
        Local<Object> buffer = Nan::NewBuffer(serialized_object, object_size).ToLocalChecked();
		free(serialized_object);
        info.GetReturnValue().Set(buffer);
	}
	else
	{
		Local<Value> bin_value = Encode(serialized_object, object_size, BINARY)->ToString();
		free(serialized_object);
        info.GetReturnValue().Set(bin_value);
	}
}

NAN_METHOD(BSON::CalculateObjectSize)
{
    Nan::HandleScope scope;
	// Ensure we have a valid object
    if(info.Length() == 1 && !info[0]->IsObject()) return Nan::ThrowError("One argument required - [object]");
    if(info.Length() == 2 && !info[0]->IsObject() && !info[1]->IsBoolean())  return Nan::ThrowError("Two arguments required - [object, boolean]");
    if(info.Length() > 3) return Nan::ThrowError("One or two arguments required - [object] or [object, boolean]");

	// Unpack the BSON parser instance
    BSON *bson = ObjectWrap::Unwrap<BSON>(info.This());
    bool serializeFunctions = (info.Length() >= 2) && info[1]->BooleanValue();
	BSONSerializer<CountStream> countSerializer(bson, false, serializeFunctions);
    countSerializer.SerializeDocument(info[0]);

	// Return the object size
    info.GetReturnValue().Set(Nan::New<Uint32>((uint32_t) countSerializer.GetSerializeSize()));
}

NAN_METHOD(BSON::SerializeWithBufferAndIndex)
{
    Nan::HandleScope scope;

	//BSON.serializeWithBufferAndIndex = function serializeWithBufferAndIndex(object, ->, buffer, index) {
	// Ensure we have the correct values
    if(info.Length() > 5) return Nan::ThrowError("Four or five parameters required [object, boolean, Buffer, int] or [object, boolean, Buffer, int, boolean]");
    if(info.Length() == 4 && !info[0]->IsObject() && !info[1]->IsBoolean() && !Buffer::HasInstance(info[2]) && !info[3]->IsUint32()) return Nan::ThrowError("Four parameters required [object, boolean, Buffer, int]");
    if(info.Length() == 5 && !info[0]->IsObject() && !info[1]->IsBoolean() && !Buffer::HasInstance(info[2]) && !info[3]->IsUint32() && !info[4]->IsBoolean()) return Nan::ThrowError("Four parameters required [object, boolean, Buffer, int, boolean]");

	uint32_t index;
	size_t object_size;

	try
	{
        BSON *bson = ObjectWrap::Unwrap<BSON>(info.This());

        Local<Object> obj = info[2]->ToObject();
		char* data = Buffer::Data(obj);
		size_t length = Buffer::Length(obj);

        index = info[3]->Uint32Value();
        bool checkKeys = info.Length() >= 4 && info[1]->IsBoolean() && info[1]->BooleanValue();
        bool serializeFunctions = (info.Length() == 5) && info[4]->BooleanValue();

		BSONSerializer<DataStream> dataSerializer(bson, checkKeys, serializeFunctions, data+index);
        dataSerializer.SerializeDocument(bson->GetSerializeObject(info[0]));
		object_size = dataSerializer.GetSerializeSize();

        if(object_size + index > length) return Nan::ThrowError("Serious error - overflowed buffer!!");
	}
	catch(char *exception)
	{
        Local<String> error = Nan::New<String>(exception).ToLocalChecked();
		free(exception);
                return Nan::ThrowError(error);
	}

    info.GetReturnValue().Set(Nan::New<Uint32>((uint32_t) (index + object_size - 1)));
}

NAN_METHOD(BSON::BSONDeserializeStream)
{
    Nan::HandleScope scope;

	// At least 3 arguments required
    if(info.Length() < 5) return Nan::ThrowError("Arguments required (Buffer(data), Number(index in data), Number(number of documents to deserialize), Array(results), Number(index in the array), Object(optional))");

	// If the number of argumets equals 3
    if(info.Length() >= 5)
	{
        if(!Buffer::HasInstance(info[0])) return Nan::ThrowError("First argument must be Buffer instance");
        if(!info[1]->IsUint32()) return Nan::ThrowError("Second argument must be a positive index number");
        if(!info[2]->IsUint32()) return Nan::ThrowError("Third argument must be a positive number of documents to deserialize");
        if(!info[3]->IsArray()) return Nan::ThrowError("Fourth argument must be an array the size of documents to deserialize");
        if(!info[4]->IsUint32()) return Nan::ThrowError("Sixth argument must be a positive index number");
	}

	// If we have 4 arguments
    if(info.Length() == 6 && !info[5]->IsObject()) return Nan::ThrowError("Fifth argument must be an object with options");

	// Define pointer to data
    Local<Object> obj = info[0]->ToObject();
    uint32_t numberOfDocuments = info[2]->Uint32Value();
    uint32_t index = info[1]->Uint32Value();
    uint32_t resultIndex = info[4]->Uint32Value();
	bool promoteLongs = true;

	// Check for the value promoteLongs in the options object
    if(info.Length() == 6) {
        Local<Object> options = info[5]->ToObject();

		// Check if we have the promoteLong variable
        if(options->Has(Nan::New<String>("promoteLongs").ToLocalChecked())) {
            promoteLongs = options->Get(Nan::New<String>("promoteLongs").ToLocalChecked())->ToBoolean()->Value();
		}
	}

	// Unpack the BSON parser instance
    BSON *bson = ObjectWrap::Unwrap<BSON>(info.This());

	// Unpack the buffer variable
#if NODE_MAJOR_VERSION == 0 && NODE_MINOR_VERSION < 3
	Local<Object> buffer = ObjectWrap::Unwrap<Buffer>(obj);
	char* data = buffer->data();
	size_t length = buffer->length();
#else
	char* data = Buffer::Data(obj);
	size_t length = Buffer::Length(obj);
#endif

	// Fetch the documents
    Local<Object> documents = info[3]->ToObject();

	BSONDeserializer deserializer(bson, data+index, length-index);
	for(uint32_t i = 0; i < numberOfDocuments; i++)
	{
		try
		{
			documents->Set(i + resultIndex, deserializer.DeserializeDocument(promoteLongs));
		}
		catch (char* exception)
		{
                Local<String> error = Nan::New<String>(exception).ToLocalChecked();
			free(exception);
            return Nan::ThrowError(error);
		}
	}

	// Return new index of parsing
    info.GetReturnValue().Set(Nan::New<Uint32>((uint32_t) (index + deserializer.GetSerializeSize())));
}

// Exporting function
extern "C" void init(Local<Object> target)
{
    Nan::HandleScope scope;
	BSON::Initialize(target);
}

//NODE_MODULE(bson, BSON::Initialize);
