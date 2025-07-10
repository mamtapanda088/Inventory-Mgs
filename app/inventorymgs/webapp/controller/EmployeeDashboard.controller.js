sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment"
  ], function (Controller, Fragment) {
    "use strict";
  
    return Controller.extend("inventorymgs.controller.EmployeeDashboard", {
  
      onInit: function () {
        // Optional initialization logic
      },
  
      // Tile 1: Create PR
      onCreatePRPress: function () {
        if (!this._oCreateDialog) {
          Fragment.load({
            name: "inventorymgs.view.fragments.CreatePRDialog",
            controller: this
          }).then(function (oDialog) {
            this._oCreateDialog = oDialog;
            this.getView().addDependent(this._oCreateDialog);
            this._oCreateDialog.open();
          }.bind(this));
        } else {
          this._oCreateDialog.open();
        }
      },
      
    onCancelPR: function () {
      if (this._oCreateDialog) {
        this._oCreateDialog.close();
      }
    },

    onResetForm: function () {
      try {
        // Reset form fields
        sap.ui.getCore().byId("itemSelect").setSelectedKey("");
        sap.ui.getCore().byId("quantityInput").setValue("");
        sap.ui.getCore().byId("purposeInput").setValue("");
    
        // Success Message
        sap.m.MessageToast.show("Form reset successfully.");
      } catch (error) {
        // Error fallback
        sap.m.MessageToast.show("Failed to reset the form.");
        console.error("Reset error:", error);
      }
    },
    
    onSubmitPR: async function () {
      const oItemId = sap.ui.getCore().byId("itemSelect").getSelectedKey();
      const oQuantity = sap.ui.getCore().byId("quantityInput").getValue();
      const oPurpose = sap.ui.getCore().byId("purposeInput").getValue();
    
      if (!oItemId || !oQuantity) {
        sap.m.MessageToast.show("Please fill in all required fields.");
        return;
      }
    
      try {
        const response = await fetch("/odata/v4/inventory/submitRequisitions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            itemID: oItemId,
            quantity: parseInt(oQuantity),
            purpose: oPurpose
          })
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Unknown Error");
        }
    
        const result = await response.json();
        sap.m.MessageToast.show(result.value); // shows returned string from CAP
    
        // Reset fields
        sap.ui.getCore().byId("itemSelect").setSelectedKey("");
        sap.ui.getCore().byId("quantityInput").setValue("");
        sap.ui.getCore().byId("purposeInput").setValue("");
    
        this._oCreateDialog.close();
    
      } catch (err) {
        sap.m.MessageBox.error("Submission failed: " + err.message);
      }
    },    
  
      // Tile 2: My Requests
      onViewMyPRsPress: function () {
        this.getOwnerComponent().getRouter().navTo("RouteMyRequisitions");
        location.reload();
      },
  
      // Tile 3: View Inventory
      onViewInventoryPress: function () {
        this.getOwnerComponent().getRouter().navTo("RouteViewInventory");
        location.reload();
      }
  
    });
  });
  