sap.ui.define([
    "sap/ui/core/mvc/Controller"
  ], function (Controller) {
    "use strict";
  
    return Controller.extend("inventorymgs.controller.Home", {
  
      onNavigateToInventory: function () {
        this.getOwnerComponent().getRouter().navTo("RouteInventory");
      },
  
      onNavigateToRequests: function () {
        this.getOwnerComponent().getRouter().navTo("RouteViewRequests");
      }
  
    });
  });
  