sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("cadmatv2.controller.Object", {
            onInit: function () {
                let oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("object").attachPatternMatched(this._onObjectMatched, this);
            },

            /**
             * Binds the view to the object path.
             * @function
             * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
             * @private
             */
            _onObjectMatched: function (oEvent) {

                let sBukrs = oEvent.getParameter("arguments").Bukrs;
                let sMatnr = oEvent.getParameter("arguments").Matnr;
                let oView = this.getView();

                //Binding da página com o material
                oView.bindElement({
                    path: "/MaterialSet(Bukrs='" + sBukrs + "',Matnr='" + sMatnr + "')",
                    events: {
                        dataRequested: function () {
                            oView.setBusy(true);

                        },
                        dataReceived: function () {
                            oView.setBusy(false);
                        }
                    }
                });
            },

            onCancelar: function () {
                history.go(-1);
            },

            onEdit: function() {
                let oContext = this.getView().getBindingContext();
                this.getOwnerComponent().getRouter().navTo("update", {
                    Bukrs: oContext.getProperty("Bukrs"),
                    Matnr: oContext.getProperty("Matnr")
                });
            }
        });
    });
