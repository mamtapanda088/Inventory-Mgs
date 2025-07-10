sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
  "use strict";

  return Controller.extend("inventorymgs.controller.ViewRequests", {

    onInit: function () {
      console.log("View Requests Controller Loaded");
    
      // Attach route listener
      const oRouter = this.getOwnerComponent().getRouter();
      const oRoute = oRouter.getRoute("RouteViewRequests");  // Replace with your actual route name
    
      if (oRoute) {
        oRoute.attachPatternMatched(this.onRouteMatched, this);
      }
    
      // Initial load
      this._loadRequests();
    },
    
    onRouteMatched: function () {
      console.log("ViewRequests route matched - refreshing data");
      this._loadRequests();
    },
    

    _loadRequests: function () {
      fetch("/odata/v4/inventory/Requisitions?$expand=item_ID")
        .then(res => res.json())
        .then(data => {
          const oModel = new JSONModel({ requests: data.value });
          this.getView().setModel(oModel, "requests");
        })
        .catch(err => {
          MessageBox.error("Failed to load requests.\n" + err.message);
        });
    },

    onApprovePress: function (oEvent) {
      const reqID = oEvent.getSource().getBindingContext("requests").getObject().ID;

      fetch("/odata/v4/inventory/approveRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ID: reqID })
      })
        .then(res => {
          if (res.ok) {
            MessageToast.show("Request approved");
            this._loadRequests();
          } else {
            res.json().then(err => {
              MessageBox.error("Approval failed:\n" + err.error.message);
            });
          }
        });
    },

    onRejectPress: function (oEvent) {
      const reqID = oEvent.getSource().getBindingContext("requests").getObject().ID;

      fetch("/odata/v4/inventory/rejectRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ID: reqID })
      })
        .then(res => {
          if (res.ok) {
            MessageToast.show("Request rejected");
            this._loadRequests();
          } else {
            res.json().then(err => {
              MessageBox.error("Rejection failed:\n" + err.error.message);
            });            
          }
        });
    },
    
    onSearch: function (oEvent) {
      const sQuery = oEvent.getSource().getValue().toLowerCase();
      const oModel = this.getView().getModel("requests");
      const aAllRequests = oModel.getProperty("/requests");
    
      if (!sQuery) {
        // Reload full list if search is empty
        this._loadRequests();
        return;
      }
    
      // Filter by item name (item_ID.name)
      const aFiltered = aAllRequests.filter(function (oReq) {
        return oReq.item_ID && oReq.item_ID.name.toLowerCase().includes(sQuery);
      });
    
      // Set filtered results to the model
      oModel.setProperty("/requests", aFiltered);
    }
    

  });
});