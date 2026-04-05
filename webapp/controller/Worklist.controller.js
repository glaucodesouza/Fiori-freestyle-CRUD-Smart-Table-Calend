sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("cadmatv2.controller.Worklist", {
            onInit: function () {

            },
            onFilterBarInitialise: function (oEvent) {
                let oSmartFilter = oEvent.getSource();
                // Agora é seguro usar oSmartFilter.getFilters()
                console.log("SmartFilterBar pronto para uso!");
            }
        });
    });
