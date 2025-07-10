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
      },

      onLogoutPress: function () {
        // Optional: clear any session or model data
        sap.m.MessageToast.show("Logged out successfully");
      
        // Navigate to login/role selection screen
        this.getOwnerComponent().getRouter().navTo("RouteRoleSelection");
      }
    });
  });
  