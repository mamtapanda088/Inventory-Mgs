sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
  ], function (Controller, Filter, FilterOperator) {
    "use strict";
 
    return Controller.extend("inventorymgs.controller.MyRequisitions", {
      onInit: function () {
        // Additional logic if required
      },
 
      onSearch: function (oEvent) {
        const query = oEvent.getSource().getValue();
        const filters = [];
      
        if (query) {
          filters.push(new Filter("item_ID/name", FilterOperator.Contains, query)); // ✅ Item name search
        }
      
        const table = this.getView().byId("requisitionTable");
        const binding = table.getBinding("items");
        binding.filter(filters.length ? new Filter({ filters, and: false }) : []);
      }
    });
  });