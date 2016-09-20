!function(){var e={},t={};Object.defineProperty(t,"__esModule",{value:!0});var i=function(e){if(null==e||"object"!=typeof e)return e;var t=e.constructor();for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i]);return t},a=function(e,t,i,a,n){this.type="SchemaReader",this.connection=e,this.isFetching=!0,this.batchSize="undefined"==typeof t?100:t,this.skipErrors="undefined"==typeof a,this.readRelWithUdefNames=!1,"function"==typeof i&&this.populate(i,a,n)};a.prototype={populate:function(e,t,i){this.isFetching=!0,this.preMetas=[],this.completeMetas={},this.nameBatches=[];var a=0;if(i)this.preMetas=i;else{var n=this.connection.describeGlobal();this.preMetas=n.getArray("sobjects")}for(var s=0;s<this.preMetas.length;){for(var r=[],o=0;s<this.preMetas.length&&o<this.batchSize;s++,o++)r.push(this.preMetas[s].name);this.nameBatches.push(r)}for(var h=!1,l=!1,d=this,f=function(i){if(!l){if(h)return console.log(i),t(i),void(l=!0);a--,console.log(a),a<=0&&(d.isFetching=!1,e())}},c=function(e){d.skipErrors?console.log(e):(h=!0,t(e)),f(e)},s=0;s<this.nameBatches.length;s++)a++,console.log("Batch : "+this.nameBatches[s]),this.fetchCompleteMeta(this.nameBatches[s],f,c)},fetchCompleteMeta:function(e,t,i){var a=this,n=function(e){try{for(var n=0;n<e.length;n++)a.registerMeta(e[n])}catch(e){i(e)}finally{t()}};this.connection.describeSObjects(e,n,i)},registerMeta:function(e){this.completeMetas[e.name]=e},shallowReadFields:function(e){this.validateState();for(var t in this.completeMetas)if("term"===this.shallowReadMetaFieldsAbr(this.completeMetas[t],e))return"term"},shallowReadMetaFields:function(e,t,i,a){if(this.validateState(),"undefined"!=typeof e.fields)for(var n=0;n<e.fields.length;n++){var s=e.fields[n];if("undefined"!=typeof s){var r=i.concat(s);if("term"===a(s,e,r,this))return"term"}}},shallowReadMetaFieldsAbr:function(e,t){return this.shallowReadMetaFields(e,{},[],t)},deepReadFields:function(e){this.validateState();for(var t in this.completeMetas)if("term"===this.deepReadMetaFieldsAbr(this.completeMetas[t],e))return"term"},deepReadMetaFields:function(e,t,a,n){if(this.validateState(),1!=t[e.name]&&"undefined"!=typeof e.fields){t[e.name]=!0,0==a.length&&a.push(e);for(var s=0;s<e.fields.length;s++){var r=e.fields[s];if("undefined"!=typeof r){var o=a.concat(r);if("term"===n(r,e,o,this))return"term";if("reference"===r.type)if(Array.isArray(r.referenceTo)){for(var h=0;h<r.referenceTo.length;h++)if("term"===this.deepReadMetaFields(this.completeMetas[r.referenceTo[h]],i(t),o,n))return"term"}else if("term"===this.deepReadMetaFields(this.completeMetas[r.referenceTo],i(t),o,n))return"term"}}}},deepReadMetaFieldsAbr:function(e,t){return this.deepReadMetaFields(e,[],[],t)},shallowReadChildRelationships:function(e){this.validateState();for(var t in this.completeMetas)if("term"===this.shallowReadMetaChildRelationshipsAbr(this.completeMetas[t],e))return"term"},shallowReadMetaChildRelationships:function(e,t,i,a){if(this.validateState(),"undefined"!=typeof e.childRelationships)for(var n=0;n<e.childRelationships.length;n++){var s=e.childRelationships[n];if("undefined"!=typeof s){var r=i.concat(s);if("term"===a(s,e,r,this))return"term"}}},shallowReadMetaChildRelationshipsAbr:function(e,t){return this.shallowReadMetaChildRelationships(e,{},[],t)},deepReadChildRelationships:function(e){this.validateState();for(var t in this.completeMetas)if("term"===this.deepReadMetaChildRelationshipsAbr(this.completeMetas[t],e))return"term"},deepReadMetaChildRelationships:function(e,t,a,n){if(this.validateState(),1!=t[e.name]&&"undefined"!=typeof e.childRelationships){t[e.name]=!0,0==a.length&&a.push(e);for(var s=0;s<e.childRelationships.length;s++){var r=e.childRelationships[s];if("undefined"!=typeof r){var o=a.concat(r);if("term"===n(r,e,o,this))return"term";if(Array.isArray(r.childSObject)){for(var h=0;h<r.childSObject.length;h++)if("term"===this.deepReadMetaChildRelationships(this.completeMetas[r.childSObject[h]],i(t),o,n))return"term"}else if("term"===this.deepReadMetaChildRelationships(this.completeMetas[r.childSObject],i(t),o,n))return"term"}}}},deepReadMetaChildRelationshipsAbr:function(e,t){return this.deepReadMetaChildRelationships(e,{},[],t)},validateState:function(){if(this.isFetching)throw this.type+" hasn't finished fetching metadata from the server"}},a.createFilterVisitor=function(e,t){return function(i,a,n,s){e(i,a,n,s)&&t(i,a,n,s)}},a.newObjectNameFilter=function(e,t,i){return function(a,n,s,r){(!i&&e.toLowerCase()===n.name.toLowerCase()||i&&e===n.name)&&t(a,n,s,r)}},a.newFieldNameFilter=function(e,t,i){return function(a,n,s,r){(!i&&e.toLowerCase()===a.name.toLowerCase()||i&&e===a.name)&&t(a,n,s,r)}},a.newFieldAndObjectNameFilter=function(e,t,i,a){return function(n,s,r,o){(!a&&e.toLowerCase()===n.name.toLowerCase()||a&&e===n.name)&&(!a&&t.toLowerCase()===s.name.toLowerCase()||a&&t===s.name)&&i(n,s,r,o)}},a.concatPath=function(e){for(var t="",i=0;i<e.length;i++)t+=(i>0?".":"")+(e[i].name?e[i].name:e[i].relationshipName);return t},t.default=a,e.exports=t.default,window.SchemaReader=a}();
//# sourceMappingURL=schema-reader-min.map