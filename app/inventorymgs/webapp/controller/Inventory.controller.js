sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
  ], function (Controller, JSONModel, Fragment, MessageToast, MessageBox) {
    "use strict";
  
    return Controller.extend("inventorymgs.controller.Inventory", {
      onInit: function () {
        this._loadItems();
      },
  
      // Load items from backend
      _loadItems: function () {
        fetch("/odata/v4/inventoryservice/Items")
          .then(res => {
            if (!res.ok) {
              throw new Error("HTTP error: " + res.status);
            }
            return res.json();
          })
          .then(data => {
            console.log("Fetched data:", data); //  Add this line
      
            const oModel = new JSONModel(data.value);
            this.getView().setModel(oModel);
          })
       //   .catch(err => {
         //   MessageBox.error("Failed to load items.\n" + err.message);
          //});
      },      
  
      // Open Add Item dialog
      onAddPress: function () {
        const view = this.getView();
        const addModel = new JSONModel({
          name: "",
          description: "",
          currentStock: 0,
          category: ""
        });
        view.setModel(addModel, "addItemModel");
  
        if (!this.addDialog) {
          Fragment.load({
            name: "inventorymgs.fragment.AddItemDialog",
            controller: this
          }).then(dialog => {
            this.addDialog = dialog;
            view.addDependent(this.addDialog);
            this.addDialog.open();
          });
        } else {
          this.addDialog.open();
        }
      },
  
      // Add item to backend
      onAddItem: function () {
        const data = this.getView().getModel("addItemModel").getData();
      
        // ✅ Field validation: All fields must be filled
        if (!data.name || !data.description || !data.currentStock || !data.category) {
          MessageBox.warning("All fields are required.");
          return;
        }
      
        fetch("/odata/v4/inventory/Items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            currentStock: parseInt(data.currentStock, 10),
            category: data.category
          })
        }).then(res => {
          if (res.ok) {
            MessageToast.show("Item added successfully");
            this.addDialog.close();
            //this._loadItems();
            this.getView().getModel().refresh();
          } else {
            res.text().then(msg => MessageBox.error("Add failed:\n" + msg));
          }
        });
      },
  
      onCloseAddDialog: function () {
        this.addDialog.close();
      },
  
      // Open Edit Dialog with selected item
      onEditPress: function (oEvent) {
        const context = oEvent.getSource().getParent().getBindingContext();
        const data = context.getObject();
  
        const view = this.getView();
        const editModel = new JSONModel(Object.assign({}, data));
        view.setModel(editModel, "editItemModel");
  
        if (!this.editDialog) {
          Fragment.load({
            name: "inventorymgs.fragment.EditItemDialog",
            controller: this
          }).then(dialog => {
            this.editDialog = dialog;
            view.addDependent(this.editDialog);
            this.editDialog.open();
          });
        } else {
          this.editDialog.open();
        }
      },
  
      // Submit update to backend
      onUpdateItem: function () {
        const data = this.getView().getModel("editItemModel").getData();
      
        // ✅ Validation: Ensure all fields are filled
        if (!data.name || !data.description || !data.currentStock || !data.category) {
          MessageBox.warning("All fields are required.");
          return;
        }
      
        fetch(`/odata/v4/inventory/Items(${data.ID})`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            currentStock: parseInt(data.currentStock, 10),
            category: data.category
          })
        }).then(res => {
          if (res.ok) {
            MessageToast.show("Item updated");
            this.editDialog.close();
            //this._loadItems();
            this.getView().getModel().refresh();
          } else {
            res.text().then(msg => MessageBox.error("Update failed:\n" + msg));
          }
        });
      }
      ,
  
      onCloseEditDialog: function () {
        this.editDialog.close();
      },
  
      // Delete item
      onDeletePress: function (oEvent) {
        const data = oEvent.getSource().getParent().getBindingContext().getObject();
        const id = data.ID;
  
        MessageBox.confirm("Are you sure you want to delete this item?", {
          onClose: (oAction) => {
            if (oAction === "OK") {
              fetch(`/odata/v4/inventory/Items(${id})`, {
                method: "DELETE"
              }).then(res => {
                if (res.ok) {
                  MessageToast.show("Item deleted");
                  //this._loadItems();
                  this.getView().getModel().refresh();
                } else {
                  res.text().then(msg => MessageBox.error("Delete failed:\n" + msg));
                }
              });
            }
          }
        });
      }
    });
  });
  