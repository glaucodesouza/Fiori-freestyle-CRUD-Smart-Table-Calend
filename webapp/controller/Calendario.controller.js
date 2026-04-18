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

                // teste 2
                // // Criamos um delegate para capturar o evento toda vez que a view aparecer
                // this.getView().addEventDelegate({
                //     onBeforeShow: function (oEvent) {
                //         this._onViewShow(oEvent);
                //     }.bind(this)
                // });
                // this.preencherCalendario();
            },

            /**
             * Binds the view to the object path.
             * @function
             * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
             * @private
             */

            _onViewShow: function (oEvent) {
            
                //teste 2
                // const oContext = this.getView().getBindingContext();
                // if (oContext) {
                //     let sBukrs = oContext.getProperty("Bukrs");
                //     let sMatnr = oContext.getProperty("Matnr");
                    
                //     this._carregarDadosMaterial(sBukrs, sMatnr);
                // }
                //teste 1
                const oRouter = this.getOwnerComponent().getRouter();
                const sHash = oRouter.getHashChanger().getHash();
                
                // O Roteador consegue parsear o hash atual para você
                const oRouteInfo = oRouter.getRouteInfoByHash(sHash);
                
                if (oRouteInfo && oRouteInfo.arguments) {
                    let sBukrs = oRouteInfo.arguments.Bukrs;
                    let sMatnr = oRouteInfo.arguments.Matnr;
                    
                    this._carregarDadosMaterial(sBukrs, sMatnr);
                }

                //original
                // // O oEvent.data contém os parâmetros que foram passados na rota
                // if (oEvent.data && oEvent.data.Bukrs && oEvent.data.Matnr) {
                //     let sBukrs = oEvent.data.Bukrs;
                //     let sMatnr = oEvent.data.Matnr;
                //     this._carregarDadosMaterial(sBukrs, sMatnr);
                // }
            },

            _carregarDadosMaterial: function (sBukrs, sMatnr) {
                let oView = this.getView();
                
                let sPath = `/MaterialSet(Bukrs='${sBukrs}',Matnr='${sMatnr}')`;

                // Limpa o modelo para garantir que não mostre o dado antigo
                oView.setModel(new JSONModel({ rows: [] }), "calendar");

                oView.bindElement({
                    path: `/MaterialSet(Bukrs='${sBukrs}',Matnr='${sMatnr}')`,
                    events: {
                        dataRequested: function () {
                            oView.setBusy(true);
                        },
                        dataReceived: (oData) => {
                            oView.setBusy(false);
                            // oView.getElementBinding().refresh();
                            this._montarCalendarioLocal(oData.getParameter("data"));
                        }
                    }
                });

                // 4. Caso o registro já esteja no cache e o 'dataReceived' não dispare, 
                // buscamos o dado manualmente do model
                let oContext = oView.getModel().getContext(sPath);
                if (oContext && oContext.getObject()) {
                    this._montarCalendarioLocal(oContext.getObject());
                }
            },
            _onObjectMatched: function (oEvent) {

                let sBukrs = oEvent.getParameter("arguments").Bukrs;
                let sMatnr = oEvent.getParameter("arguments").Matnr;
                let oView = this.getView();
                let sPath = `/MaterialSet(Bukrs='${sBukrs}',Matnr='${sMatnr}')`;
                let bPreencheuCalendario;
                //Limpar o  anterior para não mostrar lixo anterior na tela
                this.limparCalendario();
                
                //Binding da página com o material
                oView.bindElement({
                    path: "/MaterialSet(Bukrs='" + sBukrs + "',Matnr='" + sMatnr + "')",
                    events: {
                        dataRequested: function () {
                            oView.setBusy(true);

                        },
                        dataReceived: (oData) => {
                            // oView.getElementBinding().refresh();
                            this._montarCalendarioLocal(oData.getParameter("data"));
                            bPreencheuCalendario = true;
                            oView.setBusy(false);
                        }
                    }
                });

                // 4. Caso o registro já esteja no cache e o 'dataReceived' não dispare, 
                // buscamos o dado manualmente do model
                if (!bPreencheuCalendario) {
                  let oContext = oView.getModel().getContext(sPath);
                    if (oContext && oContext.getObject()) {
                        this._montarCalendarioLocal(oContext.getObject());
                    }                  
                }
            },

            _montarCalendarioLocal: function (oData) {

                //Guardar formatador p/ data SAP
                this._FormatoDataCalend = sap.ui.core.format.DateFormat.getInstance({
                    pattern: "yyyyMMdd"
                });

                if (!oData) return;

                // Formatador para converter string AAAAMMDD para Objeto Date
                //let oSapFormat = this._FormatoDataCalend.getInstance({ pattern: "yyyyMMdd" });
                
                let dStart = oData.Datapromoini !== '00000000' ? this._FormatoDataCalend.parse(oData.Datapromoini) : null;
                let dEnd   = oData.Datapromofim !== '00000000' ? this._FormatoDataCalend.parse(oData.Datapromofim) : null;

                // Garantir que a data fim cubra o dia inteiro
                if (dStart) dStart.setHours(0, 0, 0);
                if (dEnd) dEnd.setHours(23, 59, 59);

                let oCalendarData = {
                    startDate: dStart || new Date(),
                    myRows: [{
                        start: dStart,
                        end: dEnd,
                        pic: '',
                        name: `${oData.Matnr}`,
                        role:`${oData.Maktx}`,
                        title: ``,
                        type: `Nones`,
                        tentative: false,
                        appointments: [{
                            start: dStart,
                            end: dEnd
                        }]
                    }]
                };

                this.getView().setModel(new JSONModel(oCalendarData), "calendar");
            },

            limparCalendario: function(){
                let oCalendarData = {
                    startDate: new Date(),
                    myRows: [{
                        start: null,
                        end: null,
                        pic: '',
                        name: '',
                        role: ``,
                        title: ``,
                        type: `None`,
                        tentative: false,
                        appointments: [{
                            start: null,
                            end: null
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
