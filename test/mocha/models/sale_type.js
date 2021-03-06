/*jshint trailing:true, white:true, indent:2, strict:true, curly:true,
  immed:true, eqeqeq:true, forin:true, latedef:true,
  newcap:true, noarg:true, undef:true */
/*global XT:true, XM:true, XV:true, exports:true, describe:true, it:true, require:true */

(function () {
  "use strict";

  var crud = require('../lib/crud'),
    data = {
      recordType : "XM.SaleType",
      autoTestAttributes : true,
      createHash : {
        code: "TESTSALE" + Math.random(),
        description: "Test Sale Type"
      },
      updateHash : {
        description: "Changed Descrip"
      }
    };

  describe('SaleType CRUD Test', function () {
    crud.runAllCrud(data);
  });
}());
