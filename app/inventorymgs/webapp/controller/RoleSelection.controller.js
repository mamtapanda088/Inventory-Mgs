sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/Fragment",
  "sap/m/MessageToast"
], function (Controller, JSONModel, Fragment, MessageToast) {
  "use strict";

  return Controller.extend("inventorymgs.controller.RoleSelection", {

    onInit: function () {
      // Set models for signup and login dialogs
      const signupModel = new JSONModel({ username: "", email: "", password: "", role: "" });
      const loginModel = new JSONModel({ username: "", password: "" });

      this.getView().setModel(signupModel, "signupModel");
      this.getView().setModel(loginModel, "loginModel");
    },

    // Open Signup Dialog
    onOpenSignup: function () {
      if (!this.signupDialog) {
        Fragment.load({
          name: "inventorymgs.fragment.SignupDialog",
          controller: this
        }).then(dialog => {
          this.signupDialog = dialog;
          this.getView().addDependent(dialog);
          dialog.open();
        });
      } else {
        this.signupDialog.open();
      }
    },

    // Open Login Dialog
    onOpenLogin: function () {
      if (!this.loginDialog) {
        Fragment.load({
          name: "inventorymgs.fragment.LoginDialog",
          controller: this
        }).then(dialog => {
          this.loginDialog = dialog;
          this.getView().addDependent(dialog);
          dialog.open();
        });
      } else {
        this.loginDialog.open();
      }
    },

    // Signup Submission Logic
    onSignupSubmit: async function () {
      const data = this.getView().getModel("signupModel").getData();
    
      // ✅ 1. Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        MessageToast.show("Please enter a valid email address.");
        return;
      }
    
      // ✅ 2. Check for duplicate email
      try {
        const checkRes = await fetch(`/odata/v4/inventory/Users?$filter=email eq '${data.email}'`);
        const checkData = await checkRes.json();
        if (checkData.value.length > 0) {
          MessageToast.show("An account with this email already exists.");
          return;
        }
      } catch (err) {
        MessageToast.show("Email validation failed: " + err.message);
        return;
      }
    
      // Proceed with signup
      try {
        const res = await fetch("/odata/v4/inventory/Users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
    
        if (!res.ok) throw new Error("Signup failed");
        MessageToast.show("Signup Successful!");
    
        // ✅ Reset model after success
        this.getView().getModel("signupModel").setData({ username: "", email: "", password: "", role: "" });
    
        this.signupDialog.close();
      } catch (err) {
        MessageToast.show("Error: " + err.message);
      }
    },

    // Login Submission Logic
    onLoginSubmit: async function () {
      const data = this.getView().getModel("loginModel").getData();
    
      try {
        const res = await fetch(`/odata/v4/inventory/Users?$filter=username eq '${data.username}' and password eq '${data.password}'`);
        const result = await res.json();
    
        if (result.value && result.value.length > 0) {
          const user = result.value[0];
          // MessageToast.show("Welcome " + user.role);
          this.loginDialog.close();
    
          // 🔁 Navigate based on role          
          const oRouter = this.getOwnerComponent().getRouter();
          if (user.role === "Manager") {
            oRouter.navTo("RouteHome");  // Home view for Manager
          } else if (user.role === "Employee") {
            oRouter.navTo("RouteEmployeeDashboard");  // Dashboard for Employee
          }
        } else {
          MessageToast.show("Invalid Credentials");
          // ✅ Reset login model
          this.getView().getModel("loginModel").setData({ username: "", password: "" });
        }
      } catch (err) {
        MessageToast.show("Login error: " + err.message);
      }
    }
    ,    

    // Close Dialogs
    onSignupClose: function () {
      this.signupDialog.close();
    },

    onLoginClose: function () {
      this.loginDialog.close();
    }

  });
});
