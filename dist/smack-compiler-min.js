"use strict";var _module={};window.SchemaReader=require("./schema-reader.js"),SchemaReader=function(e,t,i,s){this.type="SchemaReader",this.connection=e,this.isFetching=!0,this.batchSize="undefined"==typeof t?100:t,this.skipErrors="undefined"==typeof s,this.readRelWithUdefNames=!1,"function"==typeof i&&this.populate(i,s)},SchemaReader.prototype={populate:function(e,t){this.preMetas=[],this.completeMetas={},this.nameBatches=[];var i=0,s=this.connection.describeGlobal();this.preMetas=s.getArray("sobjects");for(var a=0;a<this.preMetas.length;){for(var h=[],n=0;a<this.preMetas.length&&n<this.batchSize;a++,n++)h.push(this.preMetas[a].name);this.nameBatches.push(h)}for(var r=!1,o=!1,l=this,d=function(s){if(!o){if(r)return console.log(s),t(s),void(o=!0);i--,console.log(i),i<=0&&(l.isFetching=!1,e())}},f=function(e){l.skipErrors?console.log(e):(r=!0,t(e)),d(e)},a=0;a<this.nameBatches.length;a++)console.log("Batch : "+this.nameBatches[a]),i++,this.fetchCompleteMeta(this.nameBatches[a],d,f)},fetchCompleteMeta:function(e,t,i){var s=this,a=function(e){try{for(var a=0;a<e.length;a++)s.registerMeta(e[a])}catch(e){i(e)}finally{t()}};this.connection.describeSObjects(e,a,i)},registerMeta:function(e){this.completeMetas[e.name]=e},shallowReadFields:function(e){this.validateState();for(var t in this.completeMetas)if("term"===this.shallowReadMetaFieldsAbr(this.completeMetas[t],e))return"term"},shallowReadMetaFields:function(e,t,i,s){if(this.validateState(),"undefined"==typeof e.fields)return void console.log("The object has no fields defined");for(var a=0;a<e.fields.length;a++){var h=e.fields[a];if("undefined"!=typeof h){var n=i.slice(0);if(n.push(h),"term"===s.visit(h,e,n,this))return"term"}}},shallowReadMetaFieldsAbr:function(e,t){var i={};return i[e.name]=!0,this.shallowReadMetaFields(e,i,[e],t)},deepReadFields:function(e){this.validateState();for(var t in this.completeMetas)if("term"===this.deepReadMetaFieldsAbr(this.completeMetas[t],e))return"term"},deepReadMetaFields:function(e,i,s,a){if(this.validateState(),1!=i[e.name]&&"undefined"!=typeof e.fields){i[e.name]=!0,0==s.length&&s.push(e);for(var h=0;h<e.fields.length;h++){var n=e.fields[h];if("undefined"!=typeof n){var r=s.slice(0);if(r.push(n),"term"===a.visit(n,e,r,this))return"term";if("reference"===t.type&&"term"===this.deepReadMetaFields(this.completeMetas[n.referenceTo],i,r,a))return"term"}}if("undefined"!=typeof e.childRelationships)for(var h=0;h<e.childRelationships.length;h++){var o=e.childRelationships[h];if(this.readRelWithUdefNames||"undefined"!=typeof o.relationshipName){var r=s.slice(0);if(r.push(o),"term"===this.deepReadMetaFields(this.completeMetas[o.childSObject],i,r,a))return"term"}}}},deepReadMetaFieldsAbr:function(e,t){return this.deepReadMetaFields(e,[],[],t)},shallowReadChildRelationships:function(e){this.validateState();for(var t in this.completeMetas)if("term"===this.shallowReadMetaChildRelationshipsAbr(this.completeMetas[t],e))return"term"},shallowReadMetaChildRelationships:function(e,t,i,s){if(this.validateState(),"undefined"==typeof e.childRelationships)return void console.log("The object has no child relationships defined");for(var a=0;a<e.childRelationships.length;a++){var h=e.childRelationships[a];if("undefined"!=typeof h){var n=i.slice(0);if(n.push(h),"term"===s.visit(h,e,n,this))return"term"}}},shallowReadMetaChildRelationshipsAbr:function(e,t){var i={};return i[e.name]=!0,this.shallowReadMetaChildRelationships(e,i,[e],t)},validateState:function(){if(this.isFetching)throw this.type+" hasn't finished fetching metadata from the server"}},module.exports=SchemaReader,module.exports(QUnit.test,SchemaReader);
//# sourceMappingURL=smack-compiler-min.map