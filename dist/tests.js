"use strict";

var _module = {};
'use strict';

module.exports = function (test, SchemaReader) {

	// the schema fixture data
	var schema = {
		windowObj__c: {
			name: 'windowObj__c',
			fields: [{ name: 'Id', type: 'string', updateable: 'false' }, { name: 'Name', type: 'string', updateable: 'true' }, { name: 'isDoubleGlazed__c', type: 'boolean', updateable: 'true' }, { name: 'parent__c', type: 'reference', updateable: 'true',
				custom: 'true', referenceTo: ['houseObj__c', 'doorObj__c'] }]
		},
		doorObj__c: {
			name: 'doorObj__c',
			fields: [{ name: 'Id', type: 'string', updateable: 'false' }, { name: 'Name', type: 'string', updateable: 'true' }, { name: 'knobType__c', type: 'string', updateable: 'true' }, { name: 'house__c', type: 'reference', updateable: 'true',
				custom: 'true', referenceTo: 'houseObj__c' }],
			childRelationships: [{ relationshipName: 'windows__r', childSObject: 'windowObj__c', field: 'parent__c' }]
		},
		houseObj__c: {
			name: 'houseObj__c',
			fields: [{ name: 'Id', type: 'string', updateable: 'false' }, { name: 'Name', type: 'string', updateable: 'true' }, { name: 'isBigHouse__c', type: 'boolean', updateable: 'false' }, { name: 'housePartyTime__c', type: 'datetime', updateable: 'true' }, { name: 'cost__c', type: 'currency', updateable: 'true' }, { name: 'readyByDate__c', type: 'date', updateable: 'true' }, { name: 'ownerContact__c', type: 'email', updateable: 'false' }, { name: 'height__c', type: 'double', updateable: 'true' }, { name: 'address__c', type: 'location', updateable: 'true' }, { name: 'contactPhone__c', type: 'phone', updateable: 'true' }, { name: 'floorPlan__c', type: 'picklist', updateable: 'true' }, { name: 'insurances__c', type: 'multipicklist', updateable: 'false' }, { name: 'description__c', type: 'textarea', updateable: 'true' }, { name: 'alarmPin__c', type: 'encryptedstring', updateable: 'true' }, { name: 'website__c', type: 'url', updateable: 'true' }, { name: 'floors__c', type: 'double', updateable: 'true' }],
			childRelationships: [{ relationshipName: 'doors__r', childSObject: 'doorObj__c', field: 'house__c' }, { relationshipName: 'windows__r', childSObject: 'windowObj__c', field: 'parent__c' }]
		}
	};

	var setup = function setup() {
		var reader = new SchemaReader();
		reader.completeMetas = schema;
		reader.isFetching = false;
		return reader;
	};

	test("shallow read all objects and fields", function (t) {
		var reader = setup();
		var objectNameCounts = { windowObj__c: 0, doorObj__c: 0, houseObj__c: 0 };
		var fieldCount = 0;

		var fieldsVisited = {};
		var fieldsVisitedTwice = {};

		reader.shallowReadFields(function (field, object, path, reader) {
			objectNameCounts[object.name] += 1;
			if (fieldsVisited[field.name]) fieldsVisitedTwice[field.name] = true;
			fieldsVisited[field.name] = true;
			fieldCount++;
		});

		t.equal(objectNameCounts.windowObj__c, 4, 'windowObj__c visit count');
		t.equal(objectNameCounts.doorObj__c, 4, 'doorObj__c visit count');
		t.equal(objectNameCounts.houseObj__c, 16, 'houseObj__c visit count');
		t.equal(fieldCount, 24, 'total field visit count');
		t.deepEqual(fieldsVisitedTwice, { Id: true, Name: true }, 'fields visited multiple times');

		if (typeof t.end === 'function') t.end();
	});

	test("deep read all objects and fields", function (t) {
		var reader = setup();
		var objectNameCounts = { windowObj__c: 0, doorObj__c: 0, houseObj__c: 0 };
		var fieldCount = 0;

		var fieldsVisited = {};
		var fieldsVisitedTwice = {};

		reader.deepReadFields(function (field, object, path, reader) {
			objectNameCounts[object.name] += 1;
			if (fieldsVisited[field.name]) fieldsVisitedTwice[field.name] = true;
			fieldsVisited[field.name] = true;
			fieldCount++;
		});

		t.equal(objectNameCounts.windowObj__c, 4, 'windowObj__c visit count');
		t.equal(objectNameCounts.doorObj__c, 8, 'doorObj__c visit count');
		t.equal(objectNameCounts.houseObj__c, 48, 'houseObj__c visit count');
		t.equal(fieldCount, 60, 'total field visit count');
		t.deepEqual(fieldsVisitedTwice, { Id: true,
			Name: true,
			knobType__c: true,
			house__c: true,
			isBigHouse__c: true,
			housePartyTime__c: true,
			cost__c: true,
			readyByDate__c: true,
			ownerContact__c: true,
			height__c: true,
			address__c: true,
			contactPhone__c: true,
			floorPlan__c: true,
			insurances__c: true,
			description__c: true,
			alarmPin__c: true,
			website__c: true,
			floors__c: true }, 'fields visited multiple times');

		if (typeof t.end === 'function') t.end();
	});

	test("shallow read all objects and child relationships", function (t) {
		var reader = setup();
		var objectNameCounts = { windowObj__c: 0, doorObj__c: 0, houseObj__c: 0 };
		var relationshipCount = 0;

		var relationsipsVisited = {};
		var relationsipsVisitedTwice = {};

		reader.shallowReadChildRelationships(function (rel, object, path, reader) {
			objectNameCounts[object.name] += 1;
			if (relationsipsVisited[rel.relationshipName]) relationsipsVisitedTwice[rel.relationshipName] = true;
			relationsipsVisited[rel.relationshipName] = true;
			relationshipCount++;
		});

		t.equal(objectNameCounts.windowObj__c, 0, 'windowObj__c visit count');
		t.equal(objectNameCounts.doorObj__c, 1, 'doorObj__c visit count');
		t.equal(objectNameCounts.houseObj__c, 2, 'houseObj__c visit count');
		t.equal(relationshipCount, 3, 'total relationship visit count');
		t.deepEqual(relationsipsVisitedTwice, { windows__r: true }, 'relationships visited multiple times');

		if (typeof t.end === 'function') t.end();
	});

	test("deep read all objects and child relationships", function (t) {
		var reader = setup();
		var objectNameCounts = { windowObj__c: 0, doorObj__c: 0, houseObj__c: 0 };
		var relationshipCount = 0;

		var relationsipsVisited = {};
		var relationsipsVisitedTwice = {};

		reader.deepReadChildRelationships(function (rel, object, path, reader) {
			objectNameCounts[object.name] += 1;
			if (relationsipsVisited[rel.relationshipName]) relationsipsVisitedTwice[rel.relationshipName] = true;
			relationsipsVisited[rel.relationshipName] = true;
			relationshipCount++;
		});

		t.equal(objectNameCounts.windowObj__c, 0, 'windowObj__c visit count');
		t.equal(objectNameCounts.doorObj__c, 2, 'doorObj__c visit count');
		t.equal(objectNameCounts.houseObj__c, 2, 'houseObj__c visit count');
		t.equal(relationshipCount, 4, 'total relationship visit count');
		t.deepEqual(relationsipsVisitedTwice, { windows__r: true }, 'relationships visited multiple times');

		if (typeof t.end === 'function') t.end();
	});
};
"use strict";

module.exports(QUnit.test, SchemaReader);//# sourceMappingURL=tests.map