sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Filter, FilterOperator) {
  "use strict";

  return Controller.extend("inventorymgs.controller.ViewInventory", {
    onInit: function () {
        fetch("/odata/v4/inventory/Items")
          .then(res => res.json())
          .then(data => {
            const model = new JSONModel({ Items: data.value });
            this.getView().setModel(model);
          });
      },

    // _loadInventory: function () {
    //   fetch("/odata/v4/inventory/Items")
    //     .then(res => res.json())
    //     .then(data => {
    //       const model = new JSONModel(data.value);
    //       this.getView().setModel(model);
    //     })
    //     .catch(err => {
    //       console.error("Failed to load inventory:", err);
    //     });
    // },

    onSearch: function (oEvent) {
      const query = oEvent.getSource().getValue();
      const filters = [];

      if (query) {
        filters.push(new Filter("name", FilterOperator.Contains, query));
      }

      const list = this.getView().byId("inventoryTable");
      const binding = list.getBinding("items");
      binding.filter(filters);
    }
  });
});
