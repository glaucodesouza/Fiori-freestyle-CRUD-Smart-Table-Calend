sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("cadmatv2.controller.Worklist", {
            onInit: function () {

            },

            onFilterBarInitialise: function (oEvent) {
                let oSmartFilter = oEvent.getSource();
                // Agora é seguro usar oSmartFilter.getFilters()
                console.log("SmartFilterBar pronto para uso!");
            },
            
            onSearch: function () {
                // 1. Captura os valores dos inputs definidos no XML
                var sBukrs = this.getView().byId("inputBukrs").getValue();
                var sMatnr = this.getView().byId("inputMatnr").getValue();
                
                var aFilters = [];

                // 2. Monta os filtros (Usando EQ para valores exatos de chave)
                if (sBukrs) {
                    aFilters.push(new Filter("Bukrs", FilterOperator.EQ, sBukrs));
                }
                if (sMatnr) {
                    aFilters.push(new Filter("Matnr", FilterOperator.EQ, sMatnr));
                }

                // // 3. Aplica o filtro na tabela interna da SmartTable
                // // O ID "_IDGenTable" é o ID que você definiu para a sap.m.Table dentro da SmartTable
                // var oTable = this.getView().byId("_IDGenTable");
                // var oBinding = oTable.getBinding("items");
                
                // if (oBinding) {
                //     oBinding.filter(aFilters);
                // }

                // Tente acessar a tabela desta forma:
                var oSmartTable = this.getView().byId("smartTable");
                var oInnerTable = oSmartTable.getTable(); // Pega a tabela interna (sap.m.Table)
                var oBinding = oInnerTable.getBinding("items");

                oBinding.filter(aFilters);

                // Agora o onSearch apenas dispara o refresh da SmartTable
                // this.getView().byId("smartTable").rebindTable();

            },

            onBeforeRebindTable: function (oEvent) {
                var mBindingParams = oEvent.getParameter("bindingParams");
                var sBukrs = this.getView().byId("inputBukrs").getValue();
                var sMatnr = this.getView().byId("inputMatnr").getValue();

                if (sBukrs) {
                    mBindingParams.filters.push(new Filter("Bukrs", FilterOperator.EQ, sBukrs));
                }
                if (sMatnr) {
                    mBindingParams.filters.push(new Filter("Matnr", FilterOperator.EQ, sMatnr));
                }
            },

            onDeletar: function() {
                // Sua lógica de delete aqui
            },

            onTableLinePress: function(oEvent) {
                // NAVIGATE: 
                // The source is the table item that got pressed
                let oItem = oEvent.getSource();

                this.getOwnerComponent().getRouter().navTo("object", {
                    Bukrs: oItem.getBindingContext().getProperty("Bukrs"),
                    Matnr: oItem.getBindingContext().getProperty("Matnr")
                });
            }
        });
    });
