// http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
var clone = function(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

// Requires a salesforce connection object, unless the metadata is passed directly
// to the reader.
// Leave onSuccess out if you don't want to populate metadata on construction
var SchemaReader = function(connection, batchSize, onSuccess, onFailure) {
	this.type = 'SchemaReader';
	this.connection = connection;
	this.isFetching = true;
	this.batchSize = (typeof batchSize == 'undefined') ? 100 : batchSize;
	this.skipErrors = (typeof onFailure == 'undefined') ? true : false;
	this.readRelWithUdefNames = false;

	if(typeof onSuccess === 'function')
		this.populate(onSuccess, onFailure);
};

SchemaReader.prototype = {
	populate(onSuccess, onFailure) {
		this.preMetas = [];
		this.completeMetas = {};
		this.nameBatches = [];

		var threadCount = 0;
		var res = this.connection.describeGlobal();
		this.preMetas = res.getArray("sobjects");

		// Push batches
		for(var i = 0; i < this.preMetas.length;) {
			var batch = [];
			for(var j = 0; i < this.preMetas.length && j < this.batchSize; i++, j++)
				batch.push(this.preMetas[i].name);
			this.nameBatches.push(batch);
		}
		
		var failed = false;
		var handledFailure = false;
		var that = this;
		var cb =(err) => {
			if(handledFailure) 
				return;
			if(failed) {
				console.log(err);
				onFailure(err);
				handledFailure = true;
				return;
			}
			threadCount--;
			console.log(threadCount);
			if(threadCount <= 0) {
				that.isFetching = false;
				onSuccess();
			}
		};
		var fail = (err) => {
			if(!that.skipErrors) {
				failed = true;
				onFailure(err);
			}
			else
				console.log(err); // Currently only logging the error
			cb(err);
		};
		
		// Get complete metas
		for (var i = 0; i < this.nameBatches.length; i++) {
			console.log('Batch : ' + this.nameBatches[i]);
			threadCount++;
			this.fetchCompleteMeta(this.nameBatches[i], cb, fail);
		}
	},
	// Read the array of pre metas and populate completeMetas
	fetchCompleteMeta(objs, success, fail) {
		var that = this;
		var fetchSuccess = (metas) => {
			try {
				for(var i = 0; i < metas.length; i++)
					that.registerMeta(metas[i]);
			} 
			catch(e) { fail(e); }
			finally{ success(); } // call the callback
		}
		this.connection.describeSObjects(objs, fetchSuccess, fail);
	},
	registerMeta(obj) {
		this.completeMetas[obj.name] = obj;
	},
	// see deepread fields for the visitor definition
	shallowReadFields(visitor) {
		this.validateState();
		for(var objName in this.completeMetas)
			if(this.shallowReadMetaFieldsAbr(this.completeMetas[objName], visitor) === 'term') return 'term';
	},
	// see deepread fields for the visitor definition
	shallowReadMetaFields(obj, visited, path, visitor) {
		this.validateState();
		if(typeof obj.fields === 'undefined') {
			return;
		}
		for(var i = 0; i < obj.fields.length; i++) {
			var f = obj.fields[i];
			if(typeof f === 'undefined')
				continue;
			var subPath = path.concat(f);
			// subPath.push(f);
			if(visitor(f, obj, subPath, this) === 'term') return 'term';
		}
	},
	// An abbreviation (Abr) method to shallow read beginning with the passed object
	// see deepread fields for the visitor definition
	shallowReadMetaFieldsAbr(obj, visitor) {
		return this.shallowReadMetaFields(obj, {}, [], visitor);
	},
	// visitor definition: function(field, object, path, reader) {
	// 		// return 'term' // if you want to terminate the schema read
	// }
	// field : {} - the field description under read,
	// object : {} - the sobject description under read 
	// path : [] - a list of descriptions starting with the sobject description, trailed by 
	//				relationship descriptions and ending with a field description
	// reader : the reader which is currently used to read the schema
	deepReadFields(visitor) {
		this.validateState();
		for(var objName in this.completeMetas)
			if(this.deepReadMetaFieldsAbr(this.completeMetas[objName], visitor) === 'term') return 'term';
	},
	// see deepread fields for the visitor definition
	deepReadMetaFields(obj, visited, path, visitor) {
		this.validateState();
		if(visited[obj.name] == true)
			return;
		if(typeof obj.fields === 'undefined')
			return;
		visited[obj.name] = true;

		if(path.length == 0)
			path.push(obj);

		for(var i = 0; i < obj.fields.length; i++) {
			var f = obj.fields[i];
			if(typeof f === 'undefined')
				continue;
			var subPath = path.concat(f);
			if(visitor(f, obj, subPath, this) === 'term') return 'term';
			if(f.type === 'reference') {
				if(!Array.isArray(f.referenceTo)) {
					if(this.deepReadMetaFields(this.completeMetas[f.referenceTo], clone(visited), subPath, visitor) === 'term') return 'term';
				}
				else {
					for(var j = 0; j < f.referenceTo.length; j++)
						if(this.deepReadMetaFields(this.completeMetas[f.referenceTo[j]], clone(visited), subPath, visitor) === 'term') return 'term';
				}
			}
		}
	},
	// An abbreviation (Abr) method to deep read starting with the passed object
	// see deepread fields for the visitor definition
	deepReadMetaFieldsAbr(obj, visitor) {
		return this.deepReadMetaFields(obj, [], [], visitor);
	},
	// visitor definition: function(rel, object, path, reader) {
	// 		// return 'term' // if you want to terminate the schema read
	// }
	// rel : {} - the relationship description under read,
	// object : {} - the sobject description under read 
	// path : [] - a list of descriptions starting with the sobject description, trailed by 
	//				relationship descriptions
	// reader : the reader which is currently used to read the schema
	shallowReadChildRelationships(visitor) {
		this.validateState();
		for(var objName in this.completeMetas)
			if(this.shallowReadMetaChildRelationshipsAbr(this.completeMetas[objName], visitor) === 'term') return 'term';
	},
	// see shallowReadChildRelationships fields for the visitor definition
	shallowReadMetaChildRelationships(obj, visited, path, visitor) {
		this.validateState();
		if(typeof obj.childRelationships === 'undefined') {
			return;
		}
		for(var i = 0; i < obj.childRelationships.length; i++) {
			var r = obj.childRelationships[i];
			if(typeof r === 'undefined')
				continue;
			var subPath = path.concat(r);
			if(visitor(r, obj, subPath, this) === 'term') return 'term';
		}
	},
	// An abbreviation (Abr) method to shallow read starting with the passed object
	// see shallowReadChildRelationships fields for the visitor definition
	shallowReadMetaChildRelationshipsAbr(obj, visitor) {
		return this.shallowReadMetaChildRelationships(obj, {}, [], visitor);
	},

	// see shallowReadChildRelationships for the visitor definition
	deepReadChildRelationships(visitor) {
		this.validateState();
		for(var objName in this.completeMetas)
			if(this.deepReadMetaChildRelationshipsAbr(this.completeMetas[objName], visitor) === 'term') return 'term';
	},
	// see deepread fields for the visitor definition
	deepReadMetaChildRelationships(obj, visited, path, visitor) {
		this.validateState();
		if(visited[obj.name] == true)
			return;
		if(typeof obj.childRelationships === 'undefined')
			return;
		visited[obj.name] = true;

		if(path.length == 0)
			path.push(obj);

		for(var i = 0; i < obj.childRelationships.length; i++) {
			var r = obj.childRelationships[i];
			if(typeof r === 'undefined')
				continue;
			var subPath = path.concat(r);
			if(visitor(r, obj, subPath, this) === 'term') return 'term';
			if(!Array.isArray(r.childSObject)) {
				if(this.deepReadMetaChildRelationships(this.completeMetas[r.childSObject], clone(visited), subPath, visitor) === 'term') return 'term';
			}
			else {
				for(var j = 0; j < r.childSObject.length; j++)
					if(this.deepReadMetaChildRelationships(this.completeMetas[r.childSObject[j]], clone(visited), subPath, visitor) === 'term') return 'term';
			}
		}
	},
	// An abbreviation (Abr) method to deep read starting with the passed object
	// see deepread fields for the visitor definition
	deepReadMetaChildRelationshipsAbr(obj, visitor) {
		return this.deepReadMetaChildRelationships(obj, {}, [], visitor);
	},


	validateState() {
		if(this.isFetching)
			throw this.type + " hasn't finished fetching metadata from the server";
	},

};

	// filters
SchemaReader.createFilterVisitor = function(filter, visitor) {
	return (field, object, path, reader) => {
		if(filter(field, object, path, reader))
			visitor(field, object, path, reader);
	};
};
SchemaReader.newObjectNameFilter = function(objName, visitor, caseSensitive) {
	return (field, object, path, reader) => {
		if((!caseSensitive && objName.toLowerCase() === object.name.toLowerCase()) 
			|| (caseSensitive && objName === object.name))
			visitor(field, object, path, reader);
	}
};
SchemaReader.newFieldNameFilter = function(fieldName, visitor, caseSensitive) {
	return (field, object, path, reader) => {
		if((!caseSensitive && fieldName.toLowerCase() === field.name.toLowerCase()) 
			|| (caseSensitive && fieldName === field.name))
			visitor(field, object, path, reader);
	}
};
SchemaReader.newFieldAndObjectNameFilter = function(fieldName, objName, visitor, caseSensitive) {
	return (field, object, path, reader) => {
		if(((!caseSensitive && fieldName.toLowerCase() === field.name.toLowerCase()) 
			|| (caseSensitive && fieldName === field.name)) &&
			((!caseSensitive && objName.toLowerCase() === object.name.toLowerCase()) 
			|| (caseSensitive && objName === object.name)))
			visitor(field, object, path, reader);
	}
};

// miscalleneous
SchemaReader.concatPath = function(path) {
	var str = '';
	for(var i = 0; i < path.length; i++)
		str += (i > 0 ? '.' : '') + (path[i].name ? path[i].name : path[i].relationshipName);
	return str;
};

export default SchemaReader;