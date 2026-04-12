sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast) {
        "use strict";

        return Controller.extend("cadmatv2.controller.Update", {
            onInit: function () {
                let oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("update").attachPatternMatched(this._onObjectMatched, this);

                //Guardar formatador p/ data SAP
                this._oSAPFormatoData = sap.ui.core.format.DateFormat.getInstance({
                    pattern: "yyyyMMdd"
                });
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

            onGravar: function (oEvent) {

                let oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZGCAD_MAT270_SRV/");

                //coletar valores do elemento da tela usando metodos get de propriedades
                let sBukrs = this.byId('txtUpdateBukrs').getValue();
                let sMatnr = this.byId('txtUpdateMatnr').getValue();
                let sMaktx = this.byId('txtUpdateMaktx').getValue();
                let sMenge = this.byId('txtUpdateMenge').getValue();
                let sMeins = this.byId('txtUpdateMeins').getValue();

                //Ler datas
                let oDatapromoini = this.byId('txtUpdateDatapromoini').getDateValue();
                let oDatapromofim = this.byId('txtUpdateDatapromofim').getDateValue();

                let sDatapromoini = '';
                let sDatapromofim = '';

                if (oDatapromoini) {
                    sDatapromoini = this._oSAPFormatoData.format(oDatapromoini); // Retorna "20260411"
                }
                
                if (oDatapromofim) {
                    sDatapromofim = this._oSAPFormatoData.format(oDatapromofim);
                }
                //Fim ler datas

                let sPath = `/MaterialSet(Bukrs='` + sBukrs + `',Matnr='` + sMatnr + `')`;

                let oDadosGravar = {
                    Bukrs: sBukrs,
                    Matnr: sMatnr,
                    Maktx: sMaktx,
                    Menge: sMenge,
                    Meins: sMeins,
                    Datapromoini: sDatapromoini,
                    Datapromofim: sDatapromofim
                };

                oModel.update(sPath, oDadosGravar, {
                    success: function (oDadosRetorno, resposta) {
                        // Força o refresh de todas as agregações ligadas a este modelo OData
                        this.getView().getModel().refresh(true);
                        MessageToast.show('Material foi modificado com sucesso!');
                        history.go(-1);
                    }.bind(this),
                    error: function (oError) {
                        this.limparTodosCamposTela();
                        MessageToast.show(`Erro ao gravar ` + oError.message);
                    }.bind(this),
                });
		    },

            limparTodosCamposTela: function () {
                //limpar valores
                this.byId('txtCreateBukrs').setValue('');
                this.byId('txtCreateMatnr').setValue('');
                this.byId('txtCreateMaktx').setValue('');
                this.byId('txtCreateMenge').setValue('');
                this.byId('txtCreateMeins').setValue('');
                this.byId('txtCreateDatapromoini').setValue(null);
                this.byId('txtCreateDatapromofim').setValue(null);
            }
        });
    });
