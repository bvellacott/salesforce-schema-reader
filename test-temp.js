module.exports = function(test, getFileContents, Smack) {

	test( "Papu.SF.hasCustomSfRelationExtension()", function( t ) {
		t.strictEqual( Papu.SF.hasCustomSfRelationExtension('someName__r'), true, "Expecting true with ending '__r'" );
		t.strictEqual( Papu.SF.hasCustomSfRelationExtension('someName__r_'), false, "Expecting false with ending '__r_'" );
		t.strictEqual( Papu.SF.hasCustomSfRelationExtension('someName'), false, "Expecting false with no ending" );
	});

	test( "Papu.SF.hasCustomSfRelationExtension()", function( t ) {
		t.strictEqual( Papu.SF.hasCustomSfNameExtension('someName__c'), true, "Expecting true with ending '__c'" );
		t.strictEqual( Papu.SF.hasCustomSfNameExtension('someName__c_'), false, "Expecting false with ending '__c_'" );
		t.strictEqual( Papu.SF.hasCustomSfNameExtension('someName'), false, "Expecting false with no ending" );
	});

	test( "Papu.SF.hasCustomEmberRelationExtension()", function( t ) {
		t.strictEqual( Papu.SF.hasCustomEmberRelationExtension('someNamerrr'), true, "Expecting true with ending 'rrr'" );
		t.strictEqual( Papu.SF.hasCustomEmberRelationExtension('someNamerrr_'), false, "Expecting false with ending 'rrr_'" );
		t.strictEqual( Papu.SF.hasCustomEmberRelationExtension('someName'), false, "Expecting false with no ending" );
	});

	test( "Papu.SF.hasCustomEmberNameExtension()", function( t ) {
		t.strictEqual( Papu.SF.hasCustomEmberNameExtension('someNameccc'), true, "Expecting true with ending 'ccc'" );
		t.strictEqual( Papu.SF.hasCustomEmberNameExtension('someNameccc_'), false, "Expecting false with ending 'ccc_'" );
		t.strictEqual( Papu.SF.hasCustomEmberNameExtension('someName'), false, "Expecting false with no ending" );
	});

	test( "Papu.SF.emberiseExtension()", function( t ) {
		t.equal( Papu.SF.emberiseExtension('someName__c'), 'someNameccc', "Ending '__c' should be converted to 'ccc'" );
		t.equal( Papu.SF.emberiseExtension('someName__r'), 'someNamerrr', "Ending '__r' should be converted to 'rrr'" );
		t.equal( Papu.SF.emberiseExtension('someName__a'), 'someName__a', "Any other ending shouldn't be converted" );
	});

	test( "Papu.SF.sfriseExtension()", function( t ) {
		t.equal( Papu.SF.sfriseExtension('someNameccc'), 'someName__c', "Ending 'ccc' should be converted to '__c'" );
		t.equal( Papu.SF.sfriseExtension('someNamerrr'), 'someName__r', "Ending 'rrr' should be converted to '__r'" );
		t.equal( Papu.SF.sfriseExtension('someNameaaa'), 'someNameaaa', "Any other ending shouldn't be converted" );
	});

	test( "Papu.SF.emberiseRefs()", function( t ) {
		t.equal( Papu.SF.emberiseRefs('someName__c'), 'someNameccc', "Ending '__c' should be converted to 'ccc'" );
		t.equal( Papu.SF.emberiseRefs('someName__r'), 'someNamerrr', "Ending '__r' should be converted to 'rrr'" );
		t.equal( Papu.SF.emberiseRefs('someName__a'), 'someName__a', "Any other ending shouldn't be converted" );
	});

	test( "Papu.SF.sfriseRefs()", function( t ) {
		t.equal( Papu.SF.sfriseRefs('someNameccc'), 'someName__c', "Ending 'ccc' should be converted to '__c'" );
		t.equal( Papu.SF.sfriseRefs('someNamerrr'), 'someName__r', "Ending 'rrr' should be converted to '__r'" );
		t.equal( Papu.SF.sfriseRefs('someNameaaa'), 'someNameaaa', "Any other ending shouldn't be converted" );
	});

	test( "Papu.SF.emberiseRefs()", function( t ) {
		t.deepEqual( Papu.SF.emberiseRefs(['someName__c', 'someName__r', 'someName__a']), ['someNameccc', 'someNamerrr', 'someName__a'], "Ending '__c' should be converted to 'ccc' and '__r' should be converted to 'rrr'" );
		t.deepEqual( Papu.SF.emberiseRefs(['someName__r', 'someName__a', 'someName__c']), ['someNamerrr', 'someName__a', 'someNameccc'], "Ending '__c' should be converted to 'ccc' and '__r' should be converted to 'rrr'" );
		t.deepEqual( Papu.SF.emberiseRefs(['someName__a', 'someName__c', 'someName__r']), ['someName__a', 'someNameccc', 'someNamerrr'], "Ending '__c' should be converted to 'ccc' and '__r' should be converted to 'rrr'" );
	});

	test( "Papu.SF.sfriseRefs()", function( t ) {
		t.deepEqual( Papu.SF.sfriseRefs(['someNameccc', 'someNamerrr', 'someNameaaa']), ['someName__c', 'someName__r', 'someNameaaa'], "Ending 'ccc' should be converted to '__c' and 'rrr' should be converted to '__r'" );
		t.deepEqual( Papu.SF.sfriseRefs(['someNamerrr', 'someNameaaa', 'someNameccc']), ['someName__r', 'someNameaaa', 'someName__c'], "Ending 'ccc' should be converted to '__c' and 'rrr' should be converted to '__r'" );
		t.deepEqual( Papu.SF.sfriseRefs(['someNameaaa', 'someNameccc', 'someNamerrr']), ['someNameaaa', 'someName__c', 'someName__r'], "Ending 'ccc' should be converted to '__c' and 'rrr' should be converted to '__r'" );
	});
	var mockSchemaReader = new Papu.SF.SchemaReader(100);
	var testSchema = function(mockSchema) {
		var runTests = function(mockApp) {
			test( "Model creation", function( t ) {
				for(var sfModelName in mockSchema.modelNameMap) {
					var sfModel = mockSchema.sfSchema[sfModelName];
					var emberModelName = mockSchema.modelNameMap[sfModelName];
					var emberModel = mockApp[emberModelName];
					
					t.notEqual(typeof mockSchema.emberMetas[emberModelName], 'undefined', 'The model name: ' + emberModelName + ' has been incorrectly converted from the salesforce object name: ' + sfModelName);
					
					var mockMeta = mockSchema.emberMetas[emberModelName];
					
					var attrMetas = {};
					var relMetas = {};
					
					emberModel.eachAttribute(function(name, meta) { attrMetas[name] = meta; });
					
					emberModel.eachRelationship(function(name, meta) { relMetas[name] = meta; });
					
					var sfFields = {};
					for(var i = 0; i < sfModel.fields.length; i++) {
						var f = sfModel.fields[i];
						sfFields[f.name] = f;
					}
					
					for(var name in mockMeta.attributes) {
						var mockAttrMeta = mockMeta.attributes[name];
						var meta = attrMetas[name];
						t.notEqual(typeof meta, 'undefined', 'The attributes: ' + name + ' meta object wasn\'t found in the model: ' + emberModelName);
						for(var key in mockAttrMeta)
							t.deepEqual(meta[key], mockAttrMeta[key], 'Meta ' + key + ' mismatch for attribute : ' + name + ' in object: ' + emberModelName);
					}
					
					for(var name in mockMeta.relationships) {
						var mockRelMeta = mockMeta.relationships[name];
						var meta = relMetas[name];
						t.notEqual(typeof meta, 'undefined', 'The relationships: ' + name + ' meta object wasn\'t found in the model: ' + emberModelName);
						for(var key in mockRelMeta)
							t.deepEqual(meta[key], mockRelMeta[key], 'Meta ' + key + ' mismatch for relationship : ' + name + ' in object: ' + emberModelName);
					}
					
					for(var name in mockMeta.relationshipsThatShouldntExist)
						t.equal(typeof relMetas[name], 'undefined', 'The relationship: ' + name + ' shouldn\'t exist in the model: ' + emberModelName);
				}
			});
			
			test( "Select statements", function( t ) {
				for(var sfModelName in mockSchema.modelNameMap) {
					var sfModel = mockSchema.sfSchema[sfModelName];
					var emberModelName = mockSchema.modelNameMap[sfModelName];
					var emberModel = mockApp[emberModelName];
					
					var selectString = Papu.SF.createRootSoqlSelect(emberModel, sfModelName, 'some condition').trim().toLowerCase();
					t.equal(selectString.substring(0, 6), 'select', 'The select query doesn\'t start with a select statement');
					
					var whereSplit = selectString.substring(6, selectString.length).split(/\swhere\s/gim);
					
					t.notOk(whereSplit.length < 2, 'No where clause was found in: ' + selectString);
					t.notOk(whereSplit.length > 2, 'Multiple where clauses were found in: ' + selectString);
					
					var beforeWhere = whereSplit[0];
					var afterWhere = whereSplit[1];
					
					var lastFromIndex = beforeWhere.lastIndexOf('from');
					t.ok(lastFromIndex > 0, 'No from clause was found in: ' + selectString);
					
					var beforeFrom = beforeWhere.substring(0, lastFromIndex);
					var afterFrom = beforeWhere.substring(lastFromIndex + 4, beforeWhere.length);
					
					var fields = beforeFrom.split(/,/gim);
					
					var expectedParts = mockSchema.selectParts[emberModelName];
					
					t.equal(fields.length, expectedParts.fields.length, 'The field part count is wrong in the select statement: ' + selectString);
					
					for(var i = 0; i < fields.length; i++)
						fields[i] = fields[i].replace(/\s/gim, '');
					for(var i = 0; i < fields.length; i++)
						t.ok(fields.indexOf(expectedParts.fields[i].toLowerCase().replace(/\s/gim, '')) >= 0, 'The field element: ' + expectedParts.fields[i] + ' couldn\'t be found in: ' + selectString);
					
					t.equal(afterFrom.replace(/\s/gim, ''), expectedParts.from.toLowerCase(), 'The from object: ' + expectedParts.from + ' couldn\'t be found in: ' + selectString);
					t.equal(afterWhere.trim(), 'some condition', 'The where clause is invalid in: ' + selectString);
					
					var selectString = Papu.SF.createRootSoqlSelect(emberModel, sfModelName).toLowerCase() + ' ';
					t.ok(selectString.indexOf(/\swhere\s/gim) < 0, 'The query string contains a where clause though it shouldn\'t: ' + selectString);
				}
			});
			
			test( "Snapshot formatting", function( t ) {
				for(var emberModelName in mockSchema.snapshots) {
					var emberModel = mockApp[emberModelName];
					emberModel.modelName = emberModelName;
				
					var modelSSs = mockSchema.snapshots[emberModelName];
					var expectedSOs = mockSchema.formattedSObjects[emberModelName];
					for(var i = 0; i < modelSSs.length; i++) {
						var mockInstance = $.extend({ _model : emberModel }, modelSSs[i]);
						var snapshot = new Snapshot(mockInstance);
						var sfObject = Papu.SF.sfFormatSnapshot(snapshot, emberModel);
						
						var expectedSfObject = expectedSOs[i];
						t.deepEqual(expectedSfObject, sfObject, 'The snapshot formatting into an sobject failed');
					}
				}
			});
			
			test( 'Papu.SF.Adapter.createRecord', function( t ) {
				// Setup
				sforce.db.clear();
				sforce.db.useGivenIds = true;
				sforce.db.schema = houseSchema.sfSchema;
				var fa = new Papu.SF.Adapter();
				var store = new Store();
				
				for(var emberModelName in mockSchema.snapshots) {
					var emberModel = mockApp[emberModelName];
					emberModel.modelName = emberModelName;
				
					var modelSSs = mockSchema.snapshots[emberModelName];
					var payloads = mockSchema.payloads[emberModelName];
					for(var i = 0; i < modelSSs.length; i++) {
						var mockInstance = $.extend({ _model : emberModel }, modelSSs[i]);
						var snapshot = new Snapshot(mockInstance);
						fa.createRecord(store, emberModel, snapshot);
						for(var key in payloads[i]) {
							for(var field in payloads[i][key][0]) {
								if(typeof payloads[i][key][0][field] !== 'object')
									t.equal(store.payload[key][0][field], payloads[i][key][0][field], 'Object creation failed on the field: ' + field + ' in object list: ' + key);
								else
									t.deepEqual(store.payload[key][0][field], payloads[i][key][0][field], 'Object creation failed on the field: ' + field + ' in object list: ' + key);
							}
						}
					}
				}
			});
			
			test( 'Papu.SF.Adapter.findRecord', function( t ) {
				// Setup
				sforce.db.clear();
				sforce.db.useGivenIds = true;
				sforce.db.schema = houseSchema.sfSchema;
				var fa = new Papu.SF.Adapter();
				var store = new Store();
				
				for(var emberModelName in mockSchema.snapshots) {
					var emberModel = mockApp[emberModelName];
					emberModel.modelName = emberModelName;
				
					var modelSSs = mockSchema.snapshots[emberModelName];
					var payloads = mockSchema.payloads[emberModelName];
					for(var i = 0; i < modelSSs.length; i++) {
						var mockInstance = $.extend({ _model : emberModel }, modelSSs[i]);
						var snapshot = new Snapshot(mockInstance);
						fa.createRecord(store, emberModel, snapshot);
						fa.findRecord(store, emberModel, snapshot.id);
						for(var key in payloads[i]) {
							for(var field in payloads[i][key][0]) {
								if(typeof payloads[i][key][0][field] !== 'object')
									t.equal(store.payload[key][0][field], payloads[i][key][0][field], 'Object creation failed on the field: ' + field + ' in object list: ' + key);
								else
									t.deepEqual(store.payload[key][0][field], payloads[i][key][0][field], 'Object creation failed on the field: ' + field + ' in object list: ' + key);
							}
						}
					}
				}
			});
			
			test( 'Papu.SF.Adapter.updateRecord', function( t ) {
				// Setup
				sforce.db.clear();
				sforce.db.useGivenIds = true;
				sforce.db.schema = houseSchema.sfSchema;
				var fa = new Papu.SF.Adapter();
				var store = new Store();
				
				for(var emberModelName in mockSchema.snapshots) {
					var emberModel = mockApp[emberModelName];
					emberModel.modelName = emberModelName;
				
					var modelSSs = mockSchema.snapshots[emberModelName];
					var payloads = mockSchema.payloads[emberModelName];
					for(var i = 0; i < modelSSs.length; i++) {
						var mockInstance = $.extend({ _model : emberModel }, modelSSs[i]);
						var snapshot = new Snapshot(mockInstance);
						fa.createRecord(store, emberModel, snapshot);
						mockInstance = $.extend({ _model : emberModel }, modelSSs[i], { Name : 'updated' });
						snapshot = new Snapshot(mockInstance);
						fa.updateRecord(store, emberModel, snapshot);
						fa.findRecord(store, emberModel, snapshot.id);
						for(var key in payloads[i])
							t.equal(store.payload[key][0]['Name'], 'updated', 'Name field didn\'t get updated');
					}
				}
			});
			
			test( 'Papu.SF.Adapter.deleteRecord', function( t ) {
				// Setup
				sforce.db.clear();
				sforce.db.useGivenIds = true;
				sforce.db.schema = houseSchema.sfSchema;
				var fa = new Papu.SF.Adapter();
				var store = new Store();
				
				for(var emberModelName in mockSchema.snapshots) {
					var emberModel = mockApp[emberModelName];
					emberModel.modelName = emberModelName;
				
					var modelSSs = mockSchema.snapshots[emberModelName];
					var payloads = mockSchema.payloads[emberModelName];
					for(var i = 0; i < modelSSs.length; i++) {
						var mockInstance = $.extend({ _model : emberModel }, modelSSs[i]);
						var snapshot = new Snapshot(mockInstance);
						fa.createRecord(store, emberModel, snapshot);
						fa.deleteRecord(store, emberModel, snapshot);
						store.payload = null;
						fa.findRecord(store, emberModel, snapshot.id);
						t.deepEqual(store.payload, null, 'Delete failed');
					}
				}
			});
			
			test( 'Papu.SF.Adapter.findAll', function( t ) {
				// Setup
				sforce.db.clear();
				sforce.db.useGivenIds = true;
				sforce.db.schema = houseSchema.sfSchema;
				var fa = new Papu.SF.Adapter();
				var store = new Store();
				
				for(var emberModelName in mockSchema.snapshots) {
					var emberModel = mockApp[emberModelName];
					emberModel.modelName = emberModelName;
				
					var modelSSs = mockSchema.snapshots[emberModelName];
					var payloads = mockSchema.payloads[emberModelName];
					for(var i = 0; i < modelSSs.length; i++) {
						var mockInstance = $.extend({ _model : emberModel }, modelSSs[i]);
						var snapshot = new Snapshot(mockInstance);
						fa.createRecord(store, emberModel, snapshot);
					}
					Ember.run(function(){
					fa.findAll(store, emberModel).then(function(result){
						for(var key in result) {
							for(var i = 0; i < result[key].length; i++) {
								Ember.run(function(){
								fa.findRecord(store, mockApp[emberModelName], result[key][i]['id']).then(function(singleRes) {
									t.deepEqual(result[key][i], singleRes[key][0], 'findAll failed');
								});
								});
							}
						}
					});
					});
				}
			});
			
			test( 'Papu.SF.Adapter.findMany', function( t ) {
				// Setup
				sforce.db.clear();
				sforce.db.useGivenIds = true;
				sforce.db.schema = houseSchema.sfSchema;
				var fa = new Papu.SF.Adapter();
				var store = new Store();
				
				for(var emberModelName in mockSchema.snapshots) {
					var emberModel = mockApp[emberModelName];
					emberModel.modelName = emberModelName;
				
					var modelSSs = mockSchema.snapshots[emberModelName];
					var payloads = mockSchema.payloads[emberModelName];
					var ids = [];
					for(var i = 0; i < modelSSs.length; i++) {
						var mockInstance = $.extend({ _model : emberModel }, modelSSs[i]);
						var snapshot = new Snapshot(mockInstance);
						ids.push(snapshot.id);
						fa.createRecord(store, emberModel, snapshot);
					}
					Ember.run(function(){
					fa.findMany(store, emberModel, ids).then(function(result){
						for(var key in result) {
							for(var i = 0; i < result[key].length; i++) {
								Ember.run(function(){
								fa.findRecord(store, mockApp[emberModelName], result[key][i]['id']).then(function(singleRes) {
									t.deepEqual(result[key][i], singleRes[key][0], 'findAll failed');
								});
								});
							}
						}
					});
					});
				}
			});
		};
		
		mockSchemaReader.completeMetas = mockSchema.sfSchema;
		mockSchemaReader.isFetching = false;
		var mockApp = {};
		
		Papu.SF.createModelsForSObjects(mockApp, mockSchemaReader.completeMetas, mockSchemaReader, mockSchema.typeFilter);
		runTests(mockApp);

		mockApp = {};
		var modelDefinitions = Papu.SF.createEmberModelDefinitions(mockSchemaReader.completeMetas, mockSchemaReader, mockSchema.typeFilter);
		var serialisedModelDefinitions = JSON.stringify(modelDefinitions);
		Papu.SF.createModelsFromExtensionMap(mockApp, JSON.parse(serialisedModelDefinitions));
		runTests(mockApp);
	};

	testSchema(houseSchema);

	test( 'Papu.SF.createIdSoqlSelect()', function( t ) {
		var idSelect = Papu.SF.createIdSoqlSelect(null, 'anyObjName__c', 'anyWhereClause');
		t.equal(idSelect.replace(/\s+/gim, ' ').toLowerCase().trim(), 'select id from anyobjname__c where anywhereclause', 'The id select query is invalid: ' + idSelect);
		idSelect = Papu.SF.createIdSoqlSelect(null, 'anyObjName__c');
		t.equal(idSelect.replace(/\s+/gim, ' ').toLowerCase().trim(), 'select id from anyobjname__c', 'The id select query is invalid: ' + idSelect);
	});

	test( 'Papu.SF.toSoqlArray()', function( t ) {
		var soqlArray = Papu.SF.toSoqlArray(['somethingA', 'somethingB', true, null, 123, 213.456]);
		t.equal(soqlArray.trim(), "('somethingA','somethingB','true','null','123','213.456')", 'The soql array is invalid: ' + soqlArray);
	});

	test( 'Papu.SF.formatPayload()', function( t ) {
		Em.Inflector.inflector.irregular('someObjccc', 'someObjsccc')
		var type = { modelName : 'someObjccc'};
		var payload = {
			records : {
				Id : 'AbC000000000001XyZ',
				relationshipA : {
					records : [
						{ Id : '1', rubbish : 'rubbish'},
						{ Id : '2', rubbish : 'rubbish'},
						{ Id : '3', rubbish : 'rubbish'},
					]
				},
				relationshipB : {
					records : { Id : '4', rubbish : 'rubbish'}
				},
				fieldA : 'somethingA',
				Fieldb : true,
				fiEldC : null,
				fieldD : 123,
				fieldE : 123.456,
			}
		};
		var expectedPl = {
			someObjsccc : [
			    {
			    	id : 'AbC000000000001XyZ',
			    	relationshipA : ['1', '2', '3'],
			    	relationshipB : ['4'],
					fieldA : 'somethingA',
					Fieldb : true,
					fiEldC : null,
					fieldD : 123,
					fieldE : 123.456,
			    }
			]
		};
		
		var formattedPl = Papu.SF.formatPayload(type, payload);
		
		t.deepEqual(formattedPl, expectedPl, 'The payload wasn\'t formatted correctly');
		

		type = { modelName : 'StandardObj'};
		payload = {
			records : [
			    {
					Id : 'AbC000000000001XyZ',
					relationshipA : {
						records : [
							{ Id : '1', rubbish : 'rubbish'},
							{ Id : '2', rubbish : 'rubbish'},
							{ Id : '3', rubbish : 'rubbish'},
						]
					},
					relationshipB : {
						records : { Id : '4', rubbish : 'rubbish'}
					},
					fieldA : 'somethingA',
					Fieldb : true,
					fiEldC : null,
					fieldD : 123,
					fieldE : 123.456,
				},
			    {
					Id : 'AbC000000000002XyZ',
					relationshipA : {
						records : [
							{ Id : '5', rubbish : 'rubbish'},
							{ Id : '6', rubbish : 'rubbish'},
						]
					},
					relationshipB : {
						records : { Id : '7', rubbish : 'rubbish'}
					},
					fieldA : 'somethingA',
					Fieldb : true,
					fiEldC : null,
					fieldD : 123,
					fieldE : 123.456,
				},
			]
		};
		expectedPl = {
			StandardObjs : [
	   		    {
			    	id : 'AbC000000000001XyZ', 
			    	relationshipA : ['1', '2', '3'],
			    	relationshipB : ['4'],
					fieldA : 'somethingA',
					Fieldb : true,
					fiEldC : null,
					fieldD : 123,
					fieldE : 123.456,
			    },
			    {
			    	id : 'AbC000000000002XyZ',
			    	relationshipA : ['5', '6'],
			    	relationshipB : ['7'],
					fieldA : 'somethingA',
					Fieldb : true,
					fiEldC : null,
					fieldD : 123,
					fieldE : 123.456,
			    },
			]
		};
		
		formattedPl = Papu.SF.formatPayload(type, payload);
		
		t.deepEqual(formattedPl, expectedPl, 'The payload wasn\'t formatted correctly');
	});


	test( 'Papu.SF.factory.Cache', function( t ) {
		var cache = new Papu.SF.factory.Cache();
		cache.logNonUpdateableField('updateObj', 'updateField');
		cache.logMultitypedReferenceField('multirefObj', 'multirefField');
		
		t.notOk(cache.isUpdateableField('updateObj', 'updateField'), 'The field : updateObj.updateField wasn\'t logged as non-updateable');
		t.ok(cache.isUpdateableField('multirefObj', 'multirefField'), 'The non logged field multirefObj.multirefField should be presented as updateable');
		
		t.ok(cache.isMultitypedReferenceField('multirefObj', 'multirefField'), 'The field multirefObj.multirefField wasn\'t logged as a multityped reference field');
		t.notOk(cache.isMultitypedReferenceField('updateObj', 'updateField'), 'The field updateObj.updateField was falsely logged as a multityped reference field');
		
		t.ok(cache.isReferencedByMultitypedReference({ childSObject : 'multirefObj', field : 'multirefField'}), 'The multityped relationship wasn\'t resolved');
		t.notOk(cache.isReferencedByMultitypedReference({ childSObject : 'updateObj', field : 'updateField'}), 'A multityped relationship was falsely resolved');
	});

	sforce.db.schema = houseSchema.sfSchema;
}

