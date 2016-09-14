# salesforce-schema-reader

This tool will help you in reading a salesforce database schema. You can read the entire schema using a visitor. A visitor is a function which takes context information as parameters. Specifically a visitor in this too will be given the current field being visited, the object that the field belongs to, the path that was followed to get to that field and the reader instance itself.
Hence a visitor definition would look something like this:
```
function visitor(field, object, path, reader)
```
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
reader = new SchemaReader(connection, success, failure, batchSize);
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
reader = new SchemaReader(connection, success, failure, batchSize);
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
reader = new SchemaReader(connection, success, failure, batchSize);
```

## Reading the schema
Once the reader is instantiated - To read the schema you can use a variety of methods and techniques and you might find it beneficial to have a look at the tests to see how to use the tool. Here are a few examples:

### Shallow walk fields
Shallow walking means no relationships are followed up, which means each field in each object gets visited exactly once


