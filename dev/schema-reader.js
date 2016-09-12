// Requires a salesforce connection object, unless the metadata is passed directly
// to the reader.
// Leave onSuccess out if you don't want to populate metadata on construction
SchemaReader = function(connection, batchSize, onSuccess, onFailure) {
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
	populate : function(onSuccess, onFailure) {
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
		var cb = function(err) {
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
		var fail = function(err) {
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
	fetchCompleteMeta : function(objs, success, fail) {
		var that = this;
		var fetchSuccess = function(metas) {
			try {
				for(var i = 0; i < metas.length; i++)
					that.registerMeta(metas[i]);
			} 
			catch(e) { fail(e); }
			finally{ success(); } // call the callback
		}
		this.connection.describeSObjects(objs, fetchSuccess, fail);
	},
	registerMeta : function(obj) {
		this.completeMetas[obj.name] = obj;
	},
	// see deepread fields for the visitor definition
	shallowReadFields : function(visitor) {
		this.validateState();
		for(var objName in this.completeMetas)
			if(this.shallowReadMetaFieldsAbr(this.completeMetas[objName], visitor) === 'term') return 'term';
	},
	// see deepread fields for the visitor definition
	shallowReadMetaFields : function(obj, visited, path, visitor) {
		this.validateState();
		if(typeof obj.fields === 'undefined') {
			console.log('The object has no fields defined');
			return;
		}
		for(var i = 0; i < obj.fields.length; i++) {
			var f = obj.fields[i];
			if(typeof f === 'undefined')
				continue;
			var subPath = path.slice(0);
			subPath.push(f);
			if(visitor.visit(f, obj, subPath, this) === 'term') return 'term';
		}
	},
	// An abbreviation (Abr) method to shallow read beginning with the passed object
	// see deepread fields for the visitor definition
	shallowReadMetaFieldsAbr : function(obj, visitor) {
		var visited = {};
		visited[obj.name] = true;
		return this.shallowReadMetaFields(obj, visited, [obj], visitor);
	},
	// visitor definition: visitor.visit(field, object, path, reader) {
	// 		// return 'term' // if you want to terminate the schema read
	// }
	// field : {} - the field description under read,
	// object : {} - the sobject description under read 
	// path : [] - a list of descriptions starting with the sobject description, trailed by 
	//				relationship descriptions and ending with a field description
	// reader : the reader which is currently used to read the schema
	deepReadFields : function(visitor) {
		this.validateState();
		for(var objName in this.completeMetas)
			if(this.deepReadMetaFieldsAbr(this.completeMetas[objName], visitor) === 'term') return 'term';
	},
	// see deepread fields for the visitor definition
	deepReadMetaFields : function(obj, visited, path, visitor) {
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
			var subPath = path.slice(0);
			subPath.push(f);
			if(visitor.visit(f, obj, subPath, this) === 'term') return 'term';
			if(t.type === 'reference')
				if(this.deepReadMetaFields(this.completeMetas[f.referenceTo], visited, subPath, visitor) === 'term') return 'term';
		}
		if(typeof obj.childRelationships == 'undefined')
			return;
		for(var i = 0; i < obj.childRelationships.length; i++) {
			var rel = obj.childRelationships[i];
			if(!this.readRelWithUdefNames && typeof rel.relationshipName === 'undefined')
				continue;
			var subPath = path.slice(0);
			subPath.push(rel);
			if(this.deepReadMetaFields(this.completeMetas[rel.childSObject], visited, subPath, visitor) === 'term') return 'term';
		}
	},
	// An abbreviation (Abr) method to deep read starting with the passed object
	// see deepread fields for the visitor definition
	deepReadMetaFieldsAbr : function(obj, visitor) {
		return this.deepReadMetaFields(obj, [], [], visitor);
	},
	// visitor definition: visitor.visit(field, object, path, reader) {
	// 		// return 'term' // if you want to terminate the schema read
	// }
	// rel : {} - the relationship description under read,
	// object : {} - the sobject description under read 
	// path : [] - a list of descriptions starting with the sobject description, trailed by 
	//				relationship descriptions
	// reader : the reader which is currently used to read the schema
	shallowReadChildRelationships : function(visitor) {
		this.validateState();
		for(var objName in this.completeMetas)
			if(this.shallowReadMetaChildRelationshipsAbr(this.completeMetas[objName], visitor) === 'term') return 'term';
	},
	// see shallowReadChildRelationships fields for the visitor definition
	shallowReadMetaChildRelationships : function(obj, visited, path, visitor) {
		this.validateState();
		if(typeof obj.childRelationships === 'undefined') {
			console.log('The object has no child relationships defined');
			return;
		}
		for(var i = 0; i < obj.childRelationships.length; i++) {
			var r = obj.childRelationships[i];
			if(typeof r === 'undefined')
				continue;
			var subPath = path.slice(0);
			subPath.push(r);
			if(visitor.visit(r, obj, subPath, this) === 'term') return 'term';
		}
	},
	// An abbreviation (Abr) method to shallow read starting with the passed object
	// see shallowReadChildRelationships fields for the visitor definition
	shallowReadMetaChildRelationshipsAbr : function(obj, visitor) {
		var visited = {};
		visited[obj.name] = true;
		return this.shallowReadMetaChildRelationships(obj, visited, [obj], visitor);
	},
	validateState : function() {
		if(this.isFetching)
			throw this.type + " hasn't finished fetching metadata from the server";
	},
};

module.exports = SchemaReader;