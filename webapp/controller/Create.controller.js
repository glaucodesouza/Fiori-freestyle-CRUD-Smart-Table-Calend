sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("cadmatv2.controller.Create", {
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

                let oView = this.getView();

                //Binding da página com o material
                oView.bindElement({
                    path: "/MaterialSet",
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
            }
        });
    });
