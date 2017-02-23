# salesforce-schema-reader

## quick example

Upload the file ```dist/schema-reader.js``` as a staticresource called ```schema-reader``` and this should work:

 ```
<apex:page docType="html-5.0" showHeader="false"> 
  <apex:includeScript value="{!URLFOR($Resource.JSforce)}" />
  <apex:includeScript value="{!URLFOR($Resource.schema-reader)}" />
    
  <script>
  // setup a connection instance
  var connection = new jsforce.Connection({ accessToken: '{!$API.Session_Id}' });
    
  // callbacks and batch size for loading the schema
  function success() { console.log('Schema loaded successfully'); };
  function failure() { console.log('An error occured while trying to load the schema'); };
  var batchSize = 50;
    
  // load the schema into the schema reader
  var reader = new SchemaReader(connection, success, failure, batchSize);
    
  // visit the id field of each type and log the metadata
  reader.shallowReadFields(function(field, object, path, reader){
    if(field.name === 'Id') {
      console.log(object);
    }
  });
  </script>
</apex:page>
```
Now if you load the page and look at the browser console you should see a load of schema data displayed.
    
## introduction

This tool will help you in reading a salesforce database schema. You can read the entire schema using a visitor. A visitor is a function which takes context information as parameters. Specifically a visitor in this too will be given the current field being visited, the object that the field belongs to, the path that was followed to get to that field and the reader instance itself.
Hence a field visitor definition looks like this:
```
function visitor(field, object, path, reader)
```
where the path is an array with the object that the read started from as its first element, the relationship objects that the reader used to find it's way to referenced objects as it's intermediate elements and the visited field object as it's last element.

And a child relationship visitor definition looks like this:
```
function visitor(rel, object, path, reader)
```
Where the path is an array with the object that the read started from as its first element and the child relationship objects that the reader used to find it's way to referenced objects as it's concecutive elements. 

The child relationship read is the opposite of a field read. Crudely in database terms, if an object has a reference to another object, it is the child of that object and that makes the other object the parent object. In salesforce the parent object is specifically given a child relationship definition and you can walk these relationships whith a child relationship visitor in this tool.

The reader takes care of not traversing circular dpendencies i.e. if there is an object called Human with a reference to an object called Pet with a reference back to Human, that would be a circular dependency and if not handled will cause an infinite loop. The reader handles these scenarios simply by keeping track of all the traversed objects and making sure no object gets traversed twice.

## Obtaining a salesforce connection instance
To put your visitor into use you need a salesforce connection which you can aquire for example in a visualforce page like so:
```
<apex:page docType="html-5.0" showHeader="false">
  <apex:includeScript value="{!URLFOR($Resource.JSforce)}" />
  <script>
var connection = new jsforce.Connection({ accessToken: '{!$API.Session_Id}' });
  </script>
</apex:page>
```
for more details, about the jsforce library and it's use, visit http://jsforce.github.io/ .

## Instatiating the reader in a standard html page
If you have saved your schema reader file in ./js/schema-reader.js you can initialise it like so:
```
<script src="schema-reader.js" ></script>
<script>
function success() { console.log('Schema loaded successfully'); };
function failure() { console.log('An error occured while trying to load the schema'); };
var batchSize = 50; // the higher the number the less requests made, but the larger the payload
var reader = new SchemaReader(connection, success, failure, batchSize);
</script>
```
## Instatiating the reader in a visualforce page
Do the same as above but to reference the schema-reader.js file you will need to have a static resource like for instance shema-reader.resource in your salesforce org and you'll need to reference it like so:
```
<apex:includeScript value="{!URLFOR($Resource.schema-reader)}" /> <!-- the same as<script src="schema-reader.js" ></script>  in a normal html page-->
<script>
function success() { console.log('Schema loaded successfully'); };
function failure() { console.log('An error occured while trying to load the schema'); };
var batchSize = 50; // the higher the number the less requests made, but the larger the payload
var reader = new SchemaReader(connection, success, failure, batchSize);
</script>
```
## Instatiating the reader in node
To install the schema reader in a node project do:
```
$> npm install salesforce-schema-reader
```
And to instantiate:
```
var SchemaReader = require('salesforce-schema-reader');
function success() { console.log('Schema loaded successfully'); };
function failure() { console.log('An error occured while trying to load the schema'); };
var batchSize = 50; // the higher the number the less requests made, but the larger the payload
var reader = new SchemaReader(connection, success, failure, batchSize);
```

## Reading the schema
Once the reader is instantiated - To read the schema you can use a variety of methods and techniques and you might find it beneficial to have a look at the tests to see how to use the tool. Here are a few examples:

### Shallow read fields
Shallow reading fields means no relationships are followed up, which means each field in each object gets visited exactly once. And it's done like this:
```
reader.shallowReadFields(visitor);
```

### Deep read fields
Deep reading fields means all relationships are followed up, which means each field in each object gets visited at least once plus as many times as there are paths to that object from other objects. And it's done like this:
```
reader.deepReadFields(visitor);
```

### Shallow read child relationships
Shallow reading child relationships means no relationships are followed up, which means each child relationship definition in each object gets visited exactly once. And it's done like this:
```
reader.shallowReadChildRelationships(visitor);
```

### Deep read child relationships
Deep reading child relationships means all relationships are followed up, which means each child relationships in each object gets visited at least once plus as many times as there are paths to that object from other objects. And it's done like this:
```
reader.deepReadChildRelationships(visitor);
```

## Filters
Just walking all fields or child relationships isn't necessarily vary useful. Most of the time you would probably like to be able to visit specific fields. Maybe you want to find all the objects that have a reference to another object, or all the objects that have a valid path to another object, or just all the fields with a particular name.

For this you would use filters like so:

### Reference to another object
```
function filter(field, object, path, reader) {
	return field.referenceTo === 'someObject__c' ||
	    (Array.isArray(field.referenceTo) && field.referenceTo.indexOf('someObject__c') >= 0); // a field can refer to multiple types of objects
};

reader.deepReadFields(SchemaReader.createFilterVisitor(filter, function(field, object, path, reader) {
  console.log('The object: ' + path[0].name + ' references someObject__c');
}));

```

### All objects with a path to another object
```
function filter(field, object, path, reader) {
	return field.type === 'reference' && 
	  (field.referenceTo === 'someObject__c' ||
	    (Array.isArray(field.referenceTo) && field.referenceTo.indexOf('someObject__c') >= 0)); // a field can refer to multiple types of objects
};

reader.deepReadFields(SchemaReader.createFilterVisitor(filter, function(field, object, path, reader) {
  console.log('The object: ' + path[0].name + ' has the following path to object: someObject__c');
	console.log(ShemaReader.concatPath(path));
}));
```

### All fields by name
```
reader.shallowReadFields(SchemaReader.newFieldNameFilter('id', function(field, object, path, reader) {
	console.log('The object: ' + object.name + ' has an id field! What a supprise!');
}));
```

## Thanks for reading!
And let me know if you have issues and/or you want to fix them




