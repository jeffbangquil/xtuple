/*jshint trailing:true, white:true, indent:2, strict:true, curly:true,
  immed:true, eqeqeq:true, forin:true, latedef:true,
  newcap:true, noarg:true, undef:true */
/*global XT:true, XM:true, XV:true, exports:true, require:true */

(function () {
  "use strict";

  var _ = require("underscore"),
    assert = require("chai").assert;

  /**
    Finds the list in the panels and opens up a new workspace from that list.
  */
  exports.navigateToNewWorkspace = function (app, listKind) {
    var navigator = app.$.postbooks.$.navigator,
      myModuleIndex,
      myPanelIndex,
      workspace;

    //
    // Drill down into the appropriate module
    //
    _.each(navigator.modules, function (module, moduleIndex) {
      _.each(module.panels, function (panel, panelIndex) {
        if (panel.kind === listKind) {
          myModuleIndex = moduleIndex;
          myPanelIndex = panelIndex;
        }
      });
    });
    assert.isDefined(myPanelIndex, "Cannot find " + listKind + " in any module panels");
    navigator.setModule(myModuleIndex);
    navigator.setContentPanel(myPanelIndex);

    //
    // Create a new record
    //
    navigator.newRecord({}, {originator: {}});
    assert.isDefined(app.$.postbooks.getActive());
    workspace = app.$.postbooks.getActive().$.workspace;
    assert.isDefined(workspace);
    return workspace;
  };

  /**
    Applies the attributes to the model by bubbling up the values
    from the widgets in the workspace.
   */
  exports.setWorkspaceAttributes = function (workspace, createHash) {
    _.each(createHash, function (value, key) {
      var widgetFound = false;
      _.each(workspace.$, function (widget) {
        if (widget.attr === key) {
          widgetFound = true;
          widget.doValueChange({value: value});
        }
      });
      assert.isTrue(widgetFound, "Cannot find widget for attr " + key + " in workspace " + workspace.kind);
      assert.equal(workspace.value.get(key), value);
    });
  };

  /**
    Save the model through the workspace and make sure it saved ok.
   */
  exports.saveWorkspace = function (workspace, done) {
    var validation = workspace.value.validate(workspace.value.attributes);
    assert.isUndefined(validation, "Failed validation with error: " + JSON.stringify(validation));

    workspace.value.on('invalid', function (model, err) {
      done(err);
    });
    workspace.save({
      // wait until the list has been refreshed with this model before we return control
      // TODO: this is probably where we'd want to insert a callback to be notified when
      // the lock has been released.
      modelChangeDone: function () {
        done(null, workspace.value);
      }
    });
  };

  exports.deleteFromList = function (app, id, done) {
    // back up to list
    app.$.postbooks.previous();

    // here's the list
    var list = app.$.postbooks.getActive().$.contentPanels.getActive(),
      // find the new model by id
      // TODO: what if the new model is off the page and cannot be found?
      newModel = _.find(list.value.models, function (model) {
        return model.get(model.idAttribute) === id;
      });

    // For heavy models, this new model will be the lightweight version, which
    // itself is not going to get destroyed, so this will only work for lightweight
    // editable models. The ideal strategy is to make all async processes in the
    // app have a callback so we can know when they finish. Until we get there,
    // you have to set up a listener on the heavyweight model in your implementation
    // test to done() when it is destroyed.
    newModel.on("statusChange", function (model, status) {
      if (status === XM.Model.DESTROYED_DIRTY) {
        done();
      }
    });

    // delete it, by calling the function that gets called when the user ok's the delete popup
    list.deleteItem({model: newModel
    // The ideal strategy would look something like this:
    //,
    //done: function () {
    //  done();
    //}
    });
  };

}());
