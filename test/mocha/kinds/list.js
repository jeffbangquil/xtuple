/*jshint trailing:true, white:true, indent:2, strict:true, curly:true,
  immed:true, eqeqeq:true, forin:true, latedef:true,
  newcap:true, noarg:true, undef:true */
/*global XT:true, XM:true, XV:true, process:true, module:true, require:true,
  describe:true, before:true, enyo:true, it:true, _:true, console:true */


// NOTE! This test will fail in an extensionless build. This failure represents
// a low-burning bug in the app, that many kinds are defined but not instantiable
// in the core itself, usually because they rely on pickers that rely on caches
// that don't exist. We don't see this problem in the app because those kinds
// are hidden without the pertinent extension.

(function () {
  "use strict";

  var zombieAuth = require("../lib/zombie_auth"),
    _ = require("underscore"),
    assert = require("chai").assert;

  describe('Lists', function () {
    this.timeout(45 * 1000);

    before(function (done) {
      // setup for the date widget
      var appLoaded = function () {
        done();
      };

      zombieAuth.loadApp(appLoaded);
    });

    describe('XV lists', function () {
      it('should have their attrs set up right', function () {
        var child,
          collName,
          Coll,
          coll,
          recordType,
          relations,
          master = new enyo.Control();
        // look at all the lists in XV
        _.each(XV, function (value, key) {
          if (XV.inheritsFrom(value.prototype, "XV.List") &&
              // don't test abstract kinds
              !_.contains(['List', 'ConfigurationsList', 'AbbreviationList', 'NameDescriptionList'], key)) {

            // create the list
            child = master.createComponent({
              kind: "XV." + key,
              name: key
            });
            assert.equal(master.$[key].kind, 'XV.' + key, "Error instantiating XV." + key);

            // get the relations for the backing model
            collName = child.getCollection();
            assert.isNotNull(collName, 'XV.' + key + ' has no collection behind it');
            Coll = XM.Model.getObjectByName(collName);
            coll = new Coll();
            recordType = coll.model.prototype.recordType;
            relations = XT.session.schemas.XM.get(XT.String.suffix(recordType)).relations;

            // get the attributes
            var attrs = _.map(child.$, function (component) {
              return component.attr;
            });
            attrs = _.filter(attrs, function (attr) {
              return attr;
            });

            // the query attribute counts as an attribute
            attrs.push(child.getQuery().orderBy[0].attribute);

            // make sure that attrs with paths are for nested relations
            _.each(attrs, function (attr) {
              var prefix, suffix, relation, cacheName, relatedModelPrototype;

              prefix = XT.String.prefix(attr) || attr;
              relation = _.find(relations, function (rel) {
                return rel.key === prefix;
              });
              if (relation) {
                cacheName = XV.getCache(relation.relatedModel);
              }

              if (attr.indexOf('.') >= 0) {
                // there's a dot in the attribute: we're recursing down another model

                // TODO: we could do more checking if there are two dots

                assert.isDefined(relation, "The " + recordType +
                  " schema needs the relation " + prefix);

                if (!cacheName && !relation.isNested) {
                  suffix = XT.String.suffix(attr);
                  relatedModelPrototype = XM[XT.String.suffix(relation.relatedModel)].prototype;
                  assert.equal(typeof relatedModelPrototype[suffix], "function", "The " + recordType +
                    " schema needs the relation " + prefix + " to be nested or the model " +
                    relation.relatedModel + " needs to be cached, or " + suffix + " needs to be a " +
                    "function on " + relation.relatedModel);
                }

                if (attr === child.getQuery().orderBy[0].attribute && !relation.isNested) {
                  assert.fail(1, 0, "The " + recordType +
                    " schema needs the relation " + prefix + " to be nested to be used in the XV." +
                    key + " list query");
                }


              } else if (attr !== child.getQuery().orderBy[0].attribute) {
                // there is no dot in the attribute: we're not recursing down another model
                if ((relation && relation.isNested) || cacheName) {
                  assert.fail(1, 0, "The nested/cached relation " + prefix +
                    " will render unhelpfully as [Object object] in the XV." +
                    key + " list without specifying a particular field");
                }
              }
            });

          }
        });

      });
    });

  });

}());
