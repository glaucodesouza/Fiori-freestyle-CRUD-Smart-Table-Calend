sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageToast) {
        "use strict";

        return Controller.extend("cadmatv2.controller.Calendario", {
            onInit: function () {
                let oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("calendario").attachPatternMatched(this._onObjectMatched, this);

                this.preencherCalendario();
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
                        dataReceived: (oData) => {
                            this._montarCalendarioLocal(oData.getParameter("data"));
                            oView.setBusy(false);
                        }
                    }
                });
            },

            _montarCalendarioLocal: function (oData) {

                //Guardar formatador p/ data SAP
                this._FormatoDataCalend = sap.ui.core.format.DateFormat.getInstance({
                    pattern: "yyyyMMdd"
                });

                if (!oData) return;

                // Formatador para converter string AAAAMMDD para Objeto Date
                //let oSapFormat = this._FormatoDataCalend.getInstance({ pattern: "yyyyMMdd" });
                
                let dStart = this._FormatoDataCalend.parse(oData.Datapromoini);
                let dEnd = this._FormatoDataCalend.parse(oData.Datapromofim);

                // Garantir que a data fim cubra o dia inteiro
                if (dEnd) dEnd.setHours(23, 59, 59);

                let oCalendarData = {
                    startDate: dStart || new Date(),
                    rows: [{
                        Matnr: oData.Matnr,
                        Maktx: oData.Maktx,
                        appointments: [{
                            startDate: dStart,
                            endDate: dEnd
                        }]
                    }]
                };

                this.getView().setModel(new JSONModel(oCalendarData), "calendar");
            },

            onCancelar: function () {
                history.go(-1);
            },

            preencherCalendario: function(){

                // let oContext = this.getView().getBindingContext();
                // let sBukrs          = oContext.getProperty("Bukrs");
                // let sMatnr          = oContext.getProperty("Matnr");
                // let sDatapromoini   = oContext.getProperty("Datapromoini");
                // let sDatapromofim   = oContext.getProperty("Datapromofim");


                // // // //Read value
                // // // let sSelectedKey = this.byId("_IDGenSelect").getSelectedKey();

                // // // // read the Key of planing calendar, will be used to read OData (CDS view), for values: Day, 1 week, 1 month
                // // // let tipoCalend = this.readTipoCalend(sSelectedKey);

                // // let aPromo = [];
                // let oMatnr = {};
                
                // oMatnr[sMatnr] = {
                //     pic: "sap-icon://tags",
                //     name: sMatnr,
                //     role: '',
                //     appointments: []
                // };

                // let start = this._FormatoDataCalend.parse(sDatapromoini);
                // let end = this._FormatoDataCalend.parse(sDatapromofim);
                // start.setHours(0,0,0);
                // end.setHours(23,59,59,999);
                // start.toISOString();
                // end.toISOString();
                // oMatnr[sMatnr].appointments.push({
                //     start: start,
                //     end: end,
                //     title: sMatnr,
                //     type: "None",
                //     tentative: false
                // });

                // let oJSONModel = new JSONModel({
                //     startDate: new Date(),
                //     matnr: oMatnr
                // });
                // this.getView().setModel(oJSONModel, "calendar");

            }
        });
    });
