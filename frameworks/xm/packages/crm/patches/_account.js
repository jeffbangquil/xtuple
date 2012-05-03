// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @patch

  This code is automatically generated and will be over-written. Do not edit directly.
*/
SC.Patch.create( /** @scope XM.Account.prototype */ { 
  
  target: 'XM.Account',

  body: {
  
    /**
      @type XM.IncidentInfo
    */
    incidentRelations: SC.Record.toMany('XM.IncidentInfo', {
      isNested: true,
      inverse: 'account'
    }),
  
    /**
      @type XM.OpportunityInfo
    */
    opportunityRelations: SC.Record.toMany('XM.OpportunityInfo', {
      isNested: true,
      inverse: 'account'
    }),
  
    /**
      @type XM.ToDoInfo
    */
    toDoRelations: SC.Record.toMany('XM.ToDoInfo', {
      isNested: true,
      inverse: 'account'
    })

  }

});
