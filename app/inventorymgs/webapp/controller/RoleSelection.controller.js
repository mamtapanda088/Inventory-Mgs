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
    
      // ✅ 0. Check all fields are filled
      if (!data.username || !data.email || !data.password || !data.role || data.role === "Select") {
        MessageToast.show("All fields are required.");
        return;
      }
    
      // ✅ 1. Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        MessageToast.show("Please enter a valid email address.");
        return;
      }
    
      // ✅ 2. Password strength validation (optional: add if needed)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(data.password)) {
        MessageToast.show("Password must be 8+ characters and include upper, lower, number, and special character.");
        return;
      }
    
      // ✅ 3. Check for duplicate email
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
    
      // ✅ 4. Proceed with signup (send only clean payload)
      try {
        const payload = {
          username: data.username,
          email: data.email,
          password: data.password,
          role: data.role
        };
    
        const res = await fetch("/odata/v4/inventory/Users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
    
        if (!res.ok) {
          const errMsg = await res.text();
          throw new Error(errMsg);
        }
    
        MessageToast.show("Signup Successful!");
        this.getView().getModel("signupModel").setData({
          username: "",
          email: "",
          password: "",
          role: "",
          showPassword: false
        });
        this.signupDialog.close();
      } catch (err) {
        MessageToast.show("Error: " + err.message);
      }
    },

    onTogglePasswordVisibility: function (oEvent) {
      const oButton = oEvent.getSource();
      const oModel = oButton.getBindingContext("loginModel")
        ? this.getView().getModel("loginModel")
        : this.getView().getModel("signupModel");

      const current = oModel.getProperty("/showPassword");
      oModel.setProperty("/showPassword", !current);
    },
    
    
    // Login Submission Logic
    onLoginSubmit: async function () {
      const data = this.getView().getModel("loginModel").getData();
    
      try {
        const res = await fetch(`/odata/v4/inventory/Users?$filter=email eq '${data.email}' and password eq '${data.password}'`);
        const result = await res.json();
    
        if (result.value && result.value.length > 0) {
          const user = result.value[0];
          this.loginDialog.close();
    
          const oRouter = this.getOwnerComponent().getRouter();
          if (user.role === "Manager") {
            oRouter.navTo("RouteHome");
          } else if (user.role === "Employee") {
            oRouter.navTo("RouteEmployeeDashboard");
          }
        } else {
          MessageToast.show("Invalid Credentials");
          this.getView().getModel("loginModel").setData({ email: "", password: "", showPassword: false });
        }
      } catch (err) {
        MessageToast.show("Login error: " + err.message);
      }
    },
    
    onToggleLoginPasswordVisibility: function () {
      const oModel = this.getView().getModel("loginModel");
      const bCurrent = oModel.getProperty("/showPassword");
      oModel.setProperty("/showPassword", !bCurrent);
    },
    

    // Close Dialogs
    onSignupClose: function () {
      // Reset the signup model
      this.getView().getModel("signupModel").setData({
        username: "",
        email: "",
        password: "",
        role: "",
        showPassword: false
      });
    
      // Close the dialog
      this.signupDialog.close();
    }
    ,

    onLoginClose: function () {
      // Reset the login model
      this.getView().getModel("loginModel").setData({
        email: "",
        password: "",
        showPassword: false
      });
    
      // Close the dialog
      this.loginDialog.close();
    }    
  });
});
