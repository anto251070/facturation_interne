sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/m/PDFViewer",
    "sap/ui/core/Fragment",
    "sap/ui/export/Spreadsheet",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/ui/core/format/NumberFormat"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, PDFViewer, Fragment, Spreadsheet, Sorter, MessageBox,NumberFormat) {
        "use strict";


        return Controller.extend("ch.unige.facturationinterne.controller.CreateView", {

            _keyfragment1: null,
            _keyfragment2: null,          
            _keyfragment3: null,

            onInit: function () {
                
                // keys for the fragments in case are already bounded
                const d = new Date();
 
                let minutes = d.getMinutes();
                let ms = d.getMilliseconds();
 
                this._keyfragment1 = "a" + minutes + ms ;
                this._keyfragment2 = "b" + minutes + ms ;
                this._keyfragment3 = "c" + minutes + ms ;
                 
                // Model pour Posting
                this.oPosting =  sap.ui.getCore().getModel("Posting");
                

                var ouserInfo = sap.ui.getCore().getModel("userInfo");
                this.getView().setModel( ouserInfo ) ;

                // Model des propriétés de la vue
                var viewProperties = {
                    PreviewEnabled: true
                };
                var viewModel = new sap.ui.model.json.JSONModel(viewProperties);
                this.getView().setModel( viewModel, "Create");

                //PDF viewer
                this._pdfViewer = new PDFViewer();

                // Set the Total ...
                this._set_total(this.oPosting.getProperty("/toItems")); 

                /*if (!this.oPosting.getProperty("/toItems").at(0).Belnr){
                    this.oCreateModel = this.getView().getModel("Create");
                    this.oCreateModel.setProperty("/PreviewEnabled", false);
                } else {
                    this.oCreateModel = this.getView().getModel("Create");
                    this.oCreateModel.setProperty("/PreviewEnabled", true);
                }*/

 

            },



            /**
              * Calculate Totals in number format et Devise CHF
              * @param {toItems} Array of the ITEMS 
              * @public
            **/
            _set_total: function (toItems)  {

                   // Total de la Demande -> Defaul = valuer de la pièce
                var oTotal = sap.ui.getCore().getModel("Total");
  
                // calculate TOTAL des ITEMS
                var sTotal = 0.00;
                var Charnumber = 0.00;

                for (var r = 0; r < toItems.length; r++) {

                    Charnumber = toItems[r].Montant;
                    var number = Number.parseFloat(Charnumber);

                      sTotal = sTotal + number;           
            
                  }

                  var oCurrencyFormat = NumberFormat.getCurrencyInstance({
                      currencyCode: false
                  });
                
                var tot_format = oCurrencyFormat.format(sTotal, 'CHF'); // returns ¥1,235
          

                oTotal.setProperty("/Total",  tot_format);

                oTotal.setProperty("/Total_Reg", tot_format );

            },


            onBeforeRendering: function() {

 
                this.byId('_IDGenTable1k').setModel( this.oPosting ) ;
            },
 
          /**
             * Get Base URL for the APP
             * @param { }  
             * @param { }   
             * @return {appModulePath}  base URL 
             * @private
           * */

            getBaseURL: function () {
                var appId = "ch.unige.facturationinterne";  
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                return appModulePath;
            },




                         /**
                         * Create  new  Record
                         * @param {e}         
                         **/
                        addRow: function (e) {
                  
                            //var owf_context = this.getView().getModel("Posting");
                            //get JSON Model 
                      
                            var oRegularizeLines = this.oPosting.getProperty("/toItems");
                            var oRegularizeLine = {};
          
       
                            oRegularizeLine.Bukrs = this.oPosting.getProperty("/Bukrs");
                            oRegularizeLine.Belnr = this.oPosting.getProperty("/Belnr");
                            oRegularizeLine.Gjahr = this.oPosting.getProperty("/Gjahr");
          
                            oRegularizeLine.Wbselement = '';
                            oRegularizeLine.Compte = '';
                            oRegularizeLine.Divise = 'CHF';
                            oRegularizeLine.Montant = '0.00';
                            oRegularizeLine.Compte = '';
                            oRegularizeLine.Txt = '';
          
          
                            oRegularizeLines.push(oRegularizeLine);
          
                      
                            this.oPosting.refresh();
          
                        }, 
          
           
                      
                        /**
                        * Delete Record
                        * @param {e}         
                        **/
                        deleteRow: function (e) {
                            let oContexte = e.getSource().getBindingContext();
          
                            let path = oContexte.sPath;
                            const myArray = path .split("/");
                            
                           
                            let t = Number(myArray[2]);
          
                            var oRegularizeLines = this.oPosting.getProperty("/toItems");   
          
                            oRegularizeLines.splice(t, 1); // 2nd parameter means remove one item only

                            this.oPosting.refresh();
                            this.refreshTotal();
          
                        
                        }, 
                        
                    /**
                       * refresh the Total of the table
                       * @param {}        
                      **/
            
                    refreshTotal: function () {
            

                        var oRegularizeLines = this.oPosting.getProperty("/toItems");   

                        // calculate TOTAL
                        var sTotal = 0.00;
                        var sDivise = "";
                        var Charnumber = 0.00;

                        var oCurrencyFormat = NumberFormat.getCurrencyInstance({
                          currencyCode: false
                        });

                          for (var r = 0; r < oRegularizeLines.length; r++) {

                              Charnumber = oRegularizeLines[r].Montant;
                              var number = Number.parseFloat(Charnumber);
                           
                                sTotal = sTotal + number;
 
                          }
                    
                          var tot_format = oCurrencyFormat.format(sTotal, Devise); // returns ¥1,235
                              
                          // Total de la Demande -> Defaul = valuer de la pièce + Total Items
                          var oTotal = sap.ui.getCore().getModel("Total");

              
                          oTotal.setProperty("/Total",  tot_format);

                          this.oPosting.refresh();

                      },


              /**
                * This Method calculate the total amount of the Items
                * @param   {oEvent}
                * @param  
                * @return    {token}
                * @private
              * */
                onCalculateTotalItems: function (oEvent) {

                  var total1 = 0;
                  var total1nd = 0;

                  var t = oEvent.getSource().getBindingContext().getPath();
                  this._index = t.substr(t.length - 1);
      
                  total1 = oEvent.getParameter("value");
                  total1nd = oEvent.getParameter("value");

                  //replace comma with .
                  total1 =  total1.replace(',', '.');
                  total1nd  =  total1nd.replace(',', '.');

                  // to avoid NaN on the screen 
                  if (total1 === "") {total1 = "0"}

                  var result = (total1 - Math.floor(total1)) !== 0;
                  if (!result) {
                      total1 = parseFloat(total1).toFixed(2);
                  }
  
                  //get JSON Model 
                  var oRegularizeLines = this.oPosting.getProperty("/toItems");
      
                  //set value selected for the Line selected in the Json model  
                  oRegularizeLines[this._index].Montant = total1;

                  // calculate TOTAL
                  var sTotal = 0.00;
                  var Charnumber = 0.00;
      
                  for (var r = 0; r < oRegularizeLines.length; r++) {
      
                      Charnumber = oRegularizeLines[r].Montant;
                      var number = Number.parseFloat(Charnumber);

                        sTotal = sTotal + number;
                  }

                  var oCurrencyFormat = NumberFormat.getCurrencyInstance({
                      currencyCode: false
                  });
                  
                  var tot_format = oCurrencyFormat.format(sTotal, oRegularizeLines[this._index].Divise); // returns ¥1,235    
        
                  // put the number without decimals
                  oRegularizeLines[this._index].Montant = total1nd;
        
                  // Total de la Demande -> Defaul = valuer de la pièce + Total Items
                  var oTotal = sap.ui.getCore().getModel("Total");

        
                  oTotal.setProperty("/Total",  tot_format);
               
                  this.oPosting.setProperty("/Amount", sTotal );

                  this.oPosting.refresh();


                },


                        onInvoicePreview: function(e) {
                            
                            this.oItem = this.oPosting.getProperty("/toItems").at(0);
                            var sSource = "/sap/opu/odata/sap/Z_FI_FACTURATION_INT_SRV/PDFPreviews(Societe='" + this.oItem.Bukrs + "',Documentnumber='" + this.oItem.Belnr + "',Gjahr='" + this.oItem.Gjahr + "')/$value";
                            this._pdfViewer.setSource(sSource);
                            this._pdfViewer.setTitle("Prévisualisation de la facture " + this.oItem.Belnr);
                            this._pdfViewer.open();
                            
                        },


                        onCONFilterSelect: function (e) {
 
                            var t = e.getSource().getBindingContext().getPath();
                            this._index = t.substr(t.length - 1);
           
           
                            if (!this.dialogACC) {
           
           
           
           
                                this.dialogACC = sap.ui.xmlfragment( this._keyfragment3 , //  "idFragment_CON",
                                                                   "ch.unige.facturationinterne.view.fragment.CON", this);
           
                                if(Array.isArray(this.dialogACC)){
           
                                  this.dialogACC = sap.ui.getCore().byId("ch.unige.facturationinterne.view.fragment.CON");
                                  this.dialogACC = this.getView().byId("ch.unige.facturationinterne.view.fragment.CON");                      
                                 
                                }
           
           
                                this.getView().addDependent(this.dialogACC);
                               
                            }
                             this.dialogACC.open();
           
           
           
                     /*       this.loadFragment({
                              name: "ch.unige.fi.view.fragment.CON"
                            }).then(function(myView) {
                              myView.open();
                            }.bind(this)); */
           
           
                            return this.dialogACC;
                       
                           
           
                           
                      },

                      onCONCancelButtonPress: function () {
 
                        // this.dialogACC.invalidate();
                         this.dialogACC.close();   // First: close fragment
                       //  this.dialogACC.destroy(); //Second: destoy fragment
                       //  this.dialogACC=null;      // Third: null name/pointer
                       },
            
            
                     onCONSearch: function (e) {
                         var fragmentID =    this._keyfragment3 +      "--ch.unige.fi.CONSelectDialog"; //"idFragment_CON
                         var array_filter = ["Saknr", "Sakan", "Txt50"]; //'Saknr, Sakan, Txt50'
                         this._onCompteSearch(e, fragmentID, array_filter)
                     },
            
            
                       _onCompteSearch: function (e, fragmentID, array_filter) {
                         var r = sap.ui.getCore().byId(fragmentID);
            
            
                         var i = r.getBindingInfo("items");
            
                         var s = e.getParameter("query") || e.getParameter("newValue");
                         var n = [];
                         var l = [];
            
                         if (s && s.length > 0) {
                             for (var d = 0; d < array_filter.length; d++) {
                                 l.push(new sap.ui.model.Filter(array_filter[d], sap.ui.model.FilterOperator.Contains, s))
                             }
                         }
            
                         n = l.length > 0 ? [new sap.ui.model.Filter(l, false)] : [];
            
                         r.bindAggregation("items", { model: i.model, path: i.path, parameters: i.parameters, template: i.template, filters: n });
                       },
            
            
                    onCONOkButtonPress: function (e) {
            
            
                         var t = sap.ui.getCore().byId(this._keyfragment3 + "--ch.unige.fi.CONSelectDialog"); //"idFragment_CON
            
            
                         // get Compte Selected    
                         var oCON = t.getSelectedItem().getBindingContext("Z_ACCOUNTS_SRV").getObject();
            
                         //get JSON Model
                    
                         var owf_context = sap.ui.getCore().getModel("Posting");
                      
                         var oRegularizeLines = owf_context.getProperty("/toItems");
            
                         //set value selected for the Line selected in the Json model  
                         oRegularizeLines[this._index].Compte = oCON.Saknr;
                         oRegularizeLines[this._index].Txt    = oCON.Txt50;
            
                         this.dialogACC.close();
            
                         //   syncronize XML View with  Json model  
                         owf_context.refresh();
                     },



                      ////////////////////////Element OTP Filter ///////////////////////
                    onODPFilterSelect: function (oEvent) {
                        var t = oEvent.getSource().getBindingContext().getPath();
                        this._index = t.substr(t.length - 1);

                        if (!this.dialog) {
                            this.dialog = sap.ui.xmlfragment(this._keyfragment1, "ch.unige.facturationinterne.view.fragment.OTP", this);
                            this.getView().addDependent(this.dialog);
                        }


                        this.dialog.open();
                        return this.dialog;
                    },

                    onOTPCancelButtonPress: function () {
                        this.dialog.close();     // First: close fragment
                    },

                    onOTPSearch: function (e) {
                        var fragmentID = this._keyfragment1 +    "--ch.unige.fi.OTPSelectDialog";
                        var array_filter = ["WBSElementExternalID", "WBSDescription",
                                            "ProjectDescription", "Fund_Desc", "PGrant_Desc"];
                        this._onOTPSearch(e, fragmentID, array_filter)
                    },

                    _onOTPSearch: function (e, fragmentID, array_filter) {
                        var r = sap.ui.getCore().byId(fragmentID);

                        var i = r.getBindingInfo("items");

                        var s = e.getParameter("query") || e.getParameter("newValue");
                        var n = [];
                        var l = [];

                        if (s && s.length > 0) {
                            for (var d = 0; d < array_filter.length; d++) {
                                l.push(new sap.ui.model.Filter(array_filter[d], sap.ui.model.FilterOperator.Contains, s))
                            }
                        }
                        n = l.length > 0 ? [new sap.ui.model.Filter(l, false)] : [];
                        r.bindAggregation("items", {
                        model: i.model, path: i.path, parameters: i.parameters,
                        template: i.template, filters: n
                        })
                    },


                    onOTPOkButtonPress: function (e) {
                        var t = sap.ui.getCore().byId(this._keyfragment1 +  "--ch.unige.fi.OTPSelectDialog");

                        // get WBE Selected    
                        var oWBE = t.getSelectedItem().getBindingContext("Z_WBS_ELEMENT_SBIND").getObject();

                        //get JSON Model
                        var owf_context = sap.ui.getCore().getModel("Posting");
         
                        var oRegularizeLines = owf_context.getProperty("/toItems");

                        //set value selected for the Line selected in the Json model  
                        oRegularizeLines[this._index].Wbselement = oWBE.WBSElementExternalID + " " + '-' + " " + oWBE.WBSDescription;

                        //  yncronize with  Json model  
     
                        this.dialog.close();

                        //   syncronize XML View with  Json model  
                        owf_context.refresh();
             
                    },


                    //// Fonctions du tableau pour les postes ////
               /** Overflow Toolbar begin */
              /**
              * Sort Table records
              * @param {}        
              **/
 
              onSort: function (oEvent) {
                this.bDescending = !this.bDescending;
                this.fnApplyFiltersAndOrdering();
              },
 
              /**
              * Filter Table
              * @param {}        
              **/
              onFilter: function (oEvent) {
                this.sSearchQuery = oEvent.getSource().getValue();
                this.fnApplyFiltersAndOrdering();
              },
         
              /**
              * Group Table
              * @param {}        
              **/
              onGroup: function (oEvent){
                this.bGrouped = !this.bGrouped;
                this.fnApplyFiltersAndOrdering();
              },
 
 
 
              fnApplyFiltersAndOrdering: function (oEvent){
                var aFilters = [],
                  aSorters = [];
         
                if (this.bGrouped) {
                  aSorters.push(new Sorter("Compte", this.bDescending, this._fnGroup));
                } else {
                  aSorters.push(new Sorter("Wbselement", this.bDescending));
                }
         
                if (this.sSearchQuery) {
                  var oFilter = new Filter("Wbselement", FilterOperator.Contains, this.sSearchQuery);
                  aFilters.push(oFilter);
                }
         
                this.byId("ch.unige.fi.Items.Table").getBinding("items").filter(aFilters).sort(aSorters);
              },
 
              /**
              * Export data into Spreadsheet
              * @param {object} oEvent The event
              * @public
              **/
 
              onExport: function() {
                var aCols, oRowBinding, oSettings, oSheet, oTable;
         
                if (!this._oTable) {
                  this._oTable = this.byId('ch.unige.fi.Items.Table');
                }
         
                oTable = this._oTable;
                oRowBinding = oTable.getBinding('items');
                aCols = this.createColumnConfig();
         
                oSettings = {
                  workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                  },
                  dataSource: oRowBinding,
                  fileName: 'Table.xlsx',
                  worker: false // We need to disable worker because we are using a MockServer as OData Service
                };
         
                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function() {
                  oSheet.destroy();
                });
              },
 
              /**
              * Create Table columns
              * @public
              **/
              createColumnConfig: function() {
                var aCols = [];
 
         
                aCols.push({
                  label: 'Document',
                  type: EdmType.String,
                  property: 'Belnr'
             
                });
 
 
                aCols.push({
                  label: 'Exercise',
                  type: EdmType.String,
                  property: 'Gjahr'
             
                });
 
 
                aCols.push({
                  label: 'Compte général',
                  type: EdmType.String,
                  property: 'Compte'
             
                });
         
 
                aCols.push({          //OK
                  property: 'Montant',
                  type: EdmType.Number,
                  scale: 0
                });
         
                aCols.push({          //OK
                  label: 'Divise',
                  property: 'Divise',
                  type: EdmType.String
                   
                });
 
 
                aCols.push({
                  label: 'Compte général Txt ',
                  property: 'Txt',
                  type: EdmType.String
                });
         
                aCols.push({   //ok
                  label: 'El. OTP',
                  property: 'Wbselement',
                  type: EdmType.String,
                });
         
   
                return aCols;
              },
 
 
               /** Overflow Toolbar END */
               //// Fin Fonctions du tableau pour les postes ////


             /***********************************************************************************************************/
             /*                                    ↓ ATTACHMENTS-RELATED FUNCTIONS ↓                                    */
             /***********************************************************************************************************/

             onBeforeUploadStarts: function (oEvent) {
                const  oUploadSet = oEvent.getSource();
                const fileName = oEvent.getParameter("item").getFileName();
                const slug =    fileName;
      
                const  crsfToken =  this.getOwnerComponent().getModel().getSecurityToken();
      
      
                oUploadSet.removeAllHeaderFields();
      
                oUploadSet.addHeaderField(
                    new sap.ui.core.Item({
                    key: "slug",
                    text: slug
                  }));
      
                oUploadSet.addHeaderField(
                  new sap.ui.core.Item({
                      key: "x-csrf-token",
                      text: crsfToken
                  }));
                      
                },
        
        
               onUploadCompleted: function (oEvent) {
                     var oStatus = oEvent.getParameter("status"),
                         oItem = oEvent.getParameter("item"),
                         oUploadSet = this.getView().byId("UploadSet");
        
       
                         this.oFileUploadComponent = oEvent.getParameters("items").item.getFileObject();
        
        
                         if (this.oFileUploadComponent) {
        
              
                            
                             // needed to bind data to the Promise/Then function
        
                                 debugger;
        
                                  this._getBase64File(this.oFileUploadComponent).then(function(data) {
                                  var my_file = data.replace('data:application/pdf;base64,','');
                                  var owf_context = sap.ui.getCore().getModel("Posting");
                                 
                                var oPostingFiles =    owf_context.getProperty("/toFiles");   //oPosting.getProperty("/toFiles");
                          
                                var now = new Date();    
                                var that = this;
                                var oAttachment = {
                                    "Attachmentid":    now.getHours().toString() + now.getMinutes().toString() + now.getSeconds().toString() + now.getMilliseconds().toString(),
                                    "Bukrs":     owf_context.getProperty("/Bukrs"),
                                    "Belnr":     owf_context.getProperty("/Belnr")  ,
                                    "Gjahr":     owf_context.getProperty("/Gjahr"),
                                    "Filename": this.oFileUploadComponent.name,
                                    "Mimetype": 'application/pdf' , //this.oFileUploadComponent.mimetype,
                                    "Url": "",
                                    "Description": "",
                                    "Filecontent": my_file // data
                                };
  


                                oPostingFiles.push(oAttachment);
                                owf_context.refresh();
                                
                             }.bind(this));
        
                
                         }
          
        
                   },
        
                           /**
                           * Read a file and get its BASE64 content
                           * @param {object} oFile The file as been uploaded
                           * @param {oController The result of the reading as a Promise
                         * @private
                         * */
                      _handleRawFile: function (oFile, oController) {
                           //handle file data
                           var oFileRaw = {
                               name: oFile.name,
                               mimetype: oFile.type,
                               size: oFile.size,
                               data: []
                           };
                           //reader
                           // var aUploadFiles = [];
                           var reader = new FileReader();
                           reader.onload = function (e) {
                               oFileRaw.data = e.target.result; //set buffer data
                               oController.uploadFileRaw = oFileRaw;
                           }.bind(oController);
                           reader.readAsArrayBuffer(oFile);
                     },
        
                     /**
                     * Read a file and get its BASE64 content
                     * @param {object} iFile The file as sent by an HTML file input
                     * @return {Promise} The result of the reading as a Promise
                     * @private
                     * */
        
        
                     _getBase64File: function(iFile) {
                       return new Promise(function(resolve, reject) {
                         var reader = new FileReader();
                         reader.readAsDataURL(iFile);
                         reader.onload = function() {
                           resolve(reader.result);
                         };
                         reader.onerror = function(error) {
                           reject(error);
                         };
                       });
                     },

                     //// Fin Upload file ////


             /***********************************************************************************************************/
             /*                                    ↓ SAVE / POST FUNCTIONS ↓                                            */
             /***********************************************************************************************************/

              /// Comptabilisation - Sauvegarde///
              onInvoiceAccounting: function (e){

                  this._save_parked_document("P", this.getView().getModel("Posting"));

              },

              onInvoiceSave: function (e){
              
                  this._save_parked_document("S", this.getView().getModel("Posting"));

              },


             /**
              * Post data to Backend : S = Save / P = Post
              * @param {Action} 
              * @param {Model}    
              **/
            _save_parked_document: function(Action, Model) {
                var that = this;

 
                var JModel_Posting =   this._JModel_Load(Model, Action);
 

                var su =  this._getCPIRuntimeBaseURL() ;
                var oODataModel = new sap.ui.model.odata.ODataModel(su, true);

                sap.ui.core.BusyIndicator.show();

                oODataModel.create("/FacInterneHeaderSet", JModel_Posting.oData, {

                    method:"POST",  

                    success: function(oData, response) {
                        sap.ui.core.BusyIndicator.hide();

                        // response header
                        var hdrMessage = response.headers["sap-message"];
                        var hdrMessageObject = JSON.parse(hdrMessage);

                        if(hdrMessageObject.severity === "error") {

                            that._showServiceError(hdrMessageObject.message);
                        
                        } else {

                            if(Action === 'S'){   // when i save the data
                                let str_msg = "La facture Préenregistréé " + my_pos.Belnr + " enregistré"
 
                                MessageToast.show(str_msg );
                            } else {
                                let str_msg = "La facture " + my_pos.Belnr + " est comptabilisée"
 
                                MessageToast.show(str_msg );
                            }

                        }
                    },
                    
                    error: function(oData, response){
                      sap.ui.core.BusyIndicator.hide();
                    }
                        
                })

            },


             /**
              * Preparation du JSON pour le Post
                  * @param {responseText}  
                  * oPostingModel - JSON avec les donnés
                  * Action S = SAVE / P = Post
                  * @retur
                  * oPostingModel
                  * @public
                  **/


            _JModel_Load: function(oPostingModel , Action ) {
 
              let ODATAPosting  =  this.getOwnerComponent().getModel("OPosting");                              
          
            
    
                ODATAPosting.setProperty("/Bukrs",   oPostingModel.getProperty("/Bukrs"));
                ODATAPosting.setProperty("/Belnr",   oPostingModel.getProperty("/Belnr"));
                ODATAPosting.setProperty("/Gjahr",   oPostingModel.getProperty("/Gjahr"));
                ODATAPosting.setProperty("/Action",  Action);
                    
                     // date Bldat formatted for Posting to Backend 
                     var oDateBldat = oPostingModel.oData.Bldat + "T00:00:00";
                     oPostingModel.setProperty("/Bldat", oDateBldat );

                    // date Budat formatted for Posting to Backend 
                    var  oDateBudat = oPostingModel.oData.Budat + "T00:00:00";
                    oPostingModel.setProperty("/Budat",  oDateBudat);
                      
                     
                  let  toFiles = [{}];
                  
                  toFiles =  oPostingModel.getProperty("/toFiles") ; 

      
               //   ODATAPosting.oData.toFiles = [];
                 //     if (toFiles.length > 0) {
           // 
                //      for (var d = 0; d < toFiles.length; d++) {
            // 
                //       ODATAPosting.oData.toFiles.push(toFiles[d]);
               //       }
               //      } else {
               //      ODATAPosting.oData.toFiles = [{}];
               //      }
 
                var toItems = oPostingModel.getProperty("/toItems") ; 
             
                  ODATAPosting.oData.toItems = [];
                  if (toItems.length > 0) {
           
                    for (var d = 0; d < toItems.length; d++) {
                      
                        if( toItems[d].__metadata !== undefined ){
                            delete toItems[d].__metadata;
                        }
        
                        ODATAPosting.oData.toItems.push(toItems[d]);
                    }
                  } else {
               
                    ODATAPosting.oData.toItems = [{}];
                  }
                 
          


               return ODATAPosting
           
            },




               /**
                  * Error POPUP
                  * @param {responseText}  
                  * @public
                  **/
             _showServiceError: function(responseText) {
 
                MessageBox.information(
                    responseText, {
   
                        id: "serviceErrorsMessageBoxCR",
                      //  title: "Erreur",
                       
                        textAlignment: "Center",
   
                        actions: [sap.m.MessageBox.Action.OK],
                        onClose: function() {
                    
                        }.bind(this)
                    }
                );
   
            },

            _getCPIRuntimeBaseURL: function () {
                var appId = "ch.unige.facturationinterne";
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
 
                return appModulePath + "/sap/opu/odata/sap/Z_FI_FACTURATION_INT_SRV" ;
   
            }
            
            /// Fin Comptabilisation - Sauvegarde ///


        });
    });
