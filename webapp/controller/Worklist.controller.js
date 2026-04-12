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
                let oBindingParams = oEvent.getParameter("bindingParams");
                let sBukrs = this.getView().byId("inputBukrs").getValue();
                let sMatnr = this.getView().byId("inputMatnr").getValue();

                if (sBukrs) {
                    oBindingParams.filters.push(new Filter("Bukrs", FilterOperator.EQ, sBukrs));
                }
                if (sMatnr) {
                    oBindingParams.filters.push(new Filter("Matnr", FilterOperator.EQ, sMatnr));
                }

                // Força o OData a trazer esses campos, mesmo que a SmartTable não os "veja"
                if (oBindingParams.parameters.select) {
                    let sSelect = oBindingParams.parameters.select;
                    if (sSelect.indexOf("Datapromoini") === -1) {
                        oBindingParams.parameters.select += ",Datapromoini";
                    }
                    if (sSelect.indexOf("Datapromofim") === -1) {
                        oBindingParams.parameters.select += ",Datapromofim";
                    }
                }
            },

            // Função de formatação de datas no Table antes de carregar o Table
            formatarDataVindoDoSAP: function (vDate) {
                if (!vDate || vDate === "" || vDate === "00000000") {
                    return "00/00/0000";
                }
                
                //------------------------------------------------------------
                // O SAP manda a data como string AAAAMMDD (8 caracteres), 
                // Então precisamos converter para Date primeiro
                // Por que? A tabela transparente está format DATS corretamente
                // MAS o OData (SEGW) está como EDM.String (sem formato).
                //------------------------------------------------------------
                if (typeof vDate === "string" && vDate.length === 8) {
                    let sYear = vDate.substring(0, 4);
                    let sMonth = vDate.substring(4, 6);
                    let sDay = vDate.substring(6, 8);
                    vDate = new Date(sYear, sMonth - 1, sDay);
                }

                let oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "dd/MM/yyyy" });
                return oDateFormat.format(new Date(vDate));
            },
           
            onDeletar: function() {
                
                let oModel = this.getView().getModel();
                let oTable = this.byId("table");
                let aSelectedItems = oTable.getSelectedItems();
                let sPath = ``;

                if (!aSelectedItems || aSelectedItems.length == 0) {
                    sap.m.MessageToast.show('Nenhuma linha selecionada!');
                    return;
                } else if (!!aSelectedItems && aSelectedItems.length > 1) {
                    sap.m.MessageToast.show('Selecionar apenas uma linha!');
                    return;
                } else {

                    aSelectedItems.forEach(function(oItem){
                        let oData = oItem.getBindingContext().getObject();
                        sPath = `/MaterialSet(Bukrs='${oData.Bukrs}',Matnr='${oData.Matnr}')`;
                    });

                    oModel.remove(sPath, {
                        success: function(oData){
                            sap.m.MessageToast.show('Material Deletado com sucesso!');
                        },
                        error: function(oError){
                            sap.m.MessageToast.show('Erro ao deletar Material!');
                        }
                    });
                }
            },

            onTableLinePress: function(oEvent) {
                // NAVIGATE: 
                // The source is the table item that got pressed
                let oItem = oEvent.getSource();

                this.getOwnerComponent().getRouter().navTo("object", {
                    Bukrs: oItem.getBindingContext().getProperty("Bukrs"),
                    Matnr: oItem.getBindingContext().getProperty("Matnr")
                });
            },

            onCriar: function(oEvent) {
                // NAVIGATE:
                this.getOwnerComponent().getRouter().navTo("create", {
                });
            },

            onEditar: function(oEvent) {

                let oTable = this.byId("table");
                let aSelectedItems = oTable.getSelectedItems();
                let sBukrs = '';
                let sMatnr = '';

                //Ler campos da linha selecionada
                aSelectedItems.forEach(function(oItem){
                    let oData = oItem.getBindingContext().getObject();
                    sBukrs = oData.Bukrs;
                    sMatnr = oData.Matnr;
                });

                this.getOwnerComponent().getRouter().navTo("update", {
                    Bukrs: sBukrs,
                    Matnr: sMatnr
                });
            }
        });
    });
