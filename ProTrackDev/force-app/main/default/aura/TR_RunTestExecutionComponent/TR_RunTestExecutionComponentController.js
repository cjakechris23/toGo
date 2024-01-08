({
    doInit: function (component, event, helper) {
        component.set(
          "v.srecordId",
          component.get("v.pageReference").state.c__recordId
        );
     }
})
