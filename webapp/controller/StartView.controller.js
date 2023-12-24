sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/format/NumberFormat"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, Fragment, MessageToast, MessageBox, NumberFormat) {
        "use strict";

        return Controller.extend("ch.unige.facturationinterne.controller.StartView", {

          _keyfragmenrt1: null,
          _sapuser:  null,
          _sapuniqueID: null,


            onInit: function () {

                  // keis for the fragments in case are aready bounded
                  const d = new Date();

                  let minutes = d.getMinutes();
                  let ms = d.getMilliseconds();

                  this._keyfragmenrt1 = "a" + minutes + ms ;
 
                  var that = this;
                
                  // Get BTP USER - Begin 
                  const url_user = this.getBaseURL() + "/user-api/currentUser";

                    var oUserModel = {
                            firstname: "",
                            lastname: "",
                            email: "",
                            name: "",
                            displayName: "",
                            sapuser: ""
                    };
        

                    var that = this;
                    $.ajax({
                        method: "GET",
                        url: url_user,
                        async: false,
                        success: function (result, xhr, data) {
              
                            oUserModel = result ;

                            var ouserInfo =  that.getOwnerComponent().getModel("userInfo");

                            ouserInfo.setProperty("/firstname", oUserModel.firstname );
                            ouserInfo.setProperty("/lastname", oUserModel.lastname);
                            ouserInfo.setProperty("/email", oUserModel.email);
                            ouserInfo.setProperty("/name", oUserModel.name);
                            ouserInfo.setProperty("/displayName", that._sapuser);

                            that._sapuniqueID =  oUserModel.name;

                        } // AJAX Function OK
                        
                    });



                     // Step 2:
                     // Retrieves the SAP user from the UNIQUE ID
                      //?$filter=Name eq 'Milk'
                      const Url_User = this.getBaseURL() + "/sap/opu/odata/sap/Z_SB_USREFUS";

                      var oODataModel = new sap.ui.model.odata.ODataModel(Url_User, true);
                     
                      var aFilters = [];
                      aFilters.push(new sap.ui.model.Filter("Useralias", 
                      sap.ui.model.FilterOperator.Contains, oUserModel.name ));
                          
                         oODataModel.read("/ZI_WB_USREFUS" ,{
                         filters: aFilters,
                           success: 
                                   function (oData, oResponse) {
                                       var oModel = new sap.ui.model.json.JSONModel(oData); // Only set data here.
                                       that._sapuser = oModel.oData.results[0].Bname ;
                        
                                     }
                           });



                // Access Controle --> OTP
                 var su = this.getOwnerComponent().getModel("ZSB_GESTION_ACCES").sServiceUrl  ;
                 this.oODataModel = new sap.ui.model.odata.ODataModel(su, true);
               
                 var oODataJSONModelOTP = new sap.ui.model.json.JSONModel();
                 su = su + "/ZI_GEST_ACCES_OTP";
               
                  
                 var aFilters = [];
                 aFilters.push(new Filter("UniqueId", sap.ui.model.FilterOperator.EQ, oUserModel.name));

                 this.oODataModel.read("/ZI_GEST_ACCES_OTP" ,{
                        filters: aFilters,
                        success: 
                                function (oData, oResponse) {
                                    //  set the odata JSON as data of JSON model
                                    oODataJSONModelOTP.setData(oData);
                                    var oOTP = JSON.parse(JSON.stringify(oODataJSONModelOTP.getData()));
                                    that._set_OTP_Filter(oOTP);
                               
 
                                }
                    });

                 // Access Controle --> OTP --> END


                 //	Détermination des ateliers pertinents pour utilisateur
         
                   var oODataJSONModelAteliers = new sap.ui.model.json.JSONModel();
 

                   this.oODataModel.read("/ZI_GEST_ACCES_Atelier" ,{
                    filters: aFilters,
                    success: 
                            function (oData, oResponse) {
                                //  set the odata JSON as data of JSON model
                                oODataJSONModelAteliers.setData(oData);
                                var oAteliers = JSON.parse(JSON.stringify(oODataJSONModelAteliers.getData()));
                                that._get_Ateliers(oAteliers);
                     
                            }
                    });




                //	Détermination des ateliers pertinents pour utilisateur--> END

 
             //Model pour Posting
              sap.ui.getCore().setModel(this.getOwnerComponent().getModel("Posting"), "Posting");

              //Model pour Total
              sap.ui.getCore().setModel(this.getOwnerComponent().getModel("Total"), "Total");


              //Model pour Ateliers
            //  var oAteliers =  this.getOwnerComponent().getModel("Ateliers");
            //  sap.ui.getCore().setModel(oAteliers, "Ateliers");
            //  this.getView().setModel(oAteliers, "Ateliers");
            },
 



                onExit: function() {
                  if (this.dialog) {
                  
                        this.dialog = undefined;

                  }

            } ,  




        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Triggered by the table's 'updateFinished' event: after new table
         * data is available, this handler method updates the table counter.
         * This should only happen if the update was successful, which is
         * why this handler is attached to 'updateFinished' and not to the
         * table's list binding's 'dataReceived' method.
         * @param {sap.ui.base.Event} oEvent the update finished event
         * @public
         */
        onBeforeRendering: function() {
 
            var oControl = this.getView().byId("ch.unige.tabella");
            var oBindingInfo = oControl.getBindingInfo("items");     
 
             var aFilters = [];
               aFilters.push(new Filter("Owneruser", sap.ui.model.FilterOperator.EQ, this._sapuniqueID));
               
              // this._sapuser));
       

               /// Filtre pour visualiser seulement mes factures ...
              
              //   oControl.bindAggregation("items", {
              //      model: oBindingInfo.model,
              //        path: oBindingInfo.path,
              //       parameters: oBindingInfo.parameters,
              //      template: oBindingInfo.template,
              //        filters: aFilters
              //                 });
              ///
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
             * Create [] Filter for OTP
             * @param {object} oOTP
             * @public
            **/
            _get_Ateliers: function (oAteliers) {

                var aFilters = [];
                for (var d = 0; d < oAteliers.results.length; d++) {
                    aFilters.push(new Filter("Serv", sap.ui.model.FilterOperator.EQ, oAteliers.results[d].Objet));
                 }
     
      
                const url = this.getBaseURL() + "/sap/opu/odata/sap/Z_FI_FACTURATION_INT_SRV";

                var oODataModel = new sap.ui.model.odata.ODataModel(url , true);
             
                var oODataJSONModelAteliers = new sap.ui.model.json.JSONModel();
           
                var that = this;
           
                 oODataModel.read("/AtelierFacturantSet" ,{
                    filters: aFilters,
                    success: 
                            function (oData, oResponse) {
                                //  set the odata JSON as data of JSON model
                                oODataJSONModelAteliers.setData(oData);
                               
                                var oModel = new sap.ui.model.json.JSONModel(oData); // Only set data here.
                           
                                var oAteliers =  that.getOwnerComponent().getModel("Ateliers");

                                var Collection =   oAteliers.getProperty("/Collection");
                                for (var d = 0; d < oData.results.length; d++) {
                                 

                                var Atelier =  {
                                    "Serv":    oData.results[d].Serv,
                                    "Descr":   oData.results[d].Descr,
                                    "Faculte": oData.results[d].Faculte,
                                    "Atelier": oData.results[d].Atelier,
                                    "Rue":   oData.results[d].Rue,
                                    "Npa":   oData.results[d].Npa,
                                    "City":  oData.results[d].City,
                                    "Resp":  oData.results[d].Resp,
                                    "Emailresp": oData.results[d].Emailresp
                                };

                                Collection.push(Atelier);
                                }
                            }
                    });

            },


                /**
                  * Create [] Filter for OTP
                  * @param {object} oOTP
                  * @public
                **/

                _set_OTP_Filter: function (oOTP) {

                      var aFilters = [];
                      if ( oOTP.results.length > 0 ) {
    
                            for (var d = 0; d < oOTP.results.length; d++) {
                                aFilters.push(new sap.ui.model.Filter('WBSElementExternalID', sap.ui.model.FilterOperator.EQ, oOTP.results[d].Objet))
                            }
            
                        this._OTP_Filter =  [new sap.ui.model.Filter(aFilters, false)] ;
        
                      } else {
            
                        this._OTP_Filter =  [];
    
                          
                      };
    
    
                  },

        ///////////////////ON PRESS Buttons//////////////////////////////////////

          /**
             * Event hendler Button "New Invoice"
             * @param {oEvent}  
           * */

           onPressNewInvoice: function(oEvent) {
 
                var oView = this.getView();
                // Open Atelier's Fragment
   	 
                if (!this.dialog) {
                                  
                  this.dialog = sap.ui.xmlfragment(this._keyfragmenrt1, "ch.unige.facturationinterne.view.fragment.Atelier", this);
                  this.getView().addDependent(this.dialog);
                }
                                //  Fragment.load({
                               //          id: oView.getId(),
                               //          name: "ch.unige.facturationinterne.view.fragment.Atelier",
                               //          controller: this

                                //         }).then(function(oFragment){
                               //              console.log(oFragment);
                               //              oView.addDependent(oFragment);
                                //             oFragment.open();
                                //             that.fragments = oFragment;
                                //             that.fragmentsopen =true;
                                 //        });
                              
                  //  } else { 
                   //             that.fragments.open();
                 //   } 
                 this.dialog.open();
                 return this.dialog;
       
             },

            /**
             * Event hendler Button "Change Invoice"
             * @param {oEvent}  
            * */

            onPressChange: function(oEvent) {
 
              let oContext = oEvent.getSource().getBindingContext();
              let oData = oContext.getObject();
              let path = oContext.sPath;
              const myArray = path.split("/");
 
	            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	            var that = this;
 
	            var oItems = path + '/toItems';
	            var oFiles = path + '/toFiles';
 
	            var oODataItems = new sap.ui.model.json.JSONModel();
	            var oODataFiles = new sap.ui.model.json.JSONModel();

              var oPosting = sap.ui.getCore().getModel("Posting");

              oPosting.setProperty("/Action", oData.Action);
              oPosting.setProperty("/Atelier", oData.Atelier);
              oPosting.setProperty("/Bukrs", oData.Bukrs);
              oPosting.setProperty("/Belnr", oData.Belnr);
              oPosting.setProperty("/City", oData.City);
              oPosting.setProperty("/Descr", oData.Descr);
              oPosting.setProperty("/Emailresp", oData.Emailresp);
              oPosting.setProperty("/Faculte", oData.Faculte);
              oPosting.setProperty("/Gjahr", oData.Gjahr);
              oPosting.setProperty("/Npa", oData.Npa);
              oPosting.setProperty("/Resp", oData.Resp);
              oPosting.setProperty("/Street", oData.Street);
              oPosting.setProperty("/Budat", oData.Budat);
              oPosting.setProperty("/Bldat", oData.Bldat);
              oPosting.setProperty("/Xblnr", oData.Xblnr);


	            var su = this.getOwnerComponent().getModel().sServiceUrl  ; // "/sap/opu/odata/sap/Z_FI_FACTURATION_INT_SRV/",
	           
              this.oODataModel
               = new sap.ui.model.odata.ODataModel(su, true);

                this.oODataModel.read(oItems ,{
                  success: 
                    function (oData, oResponse) {

                      // je vais remplir le toItems[] 
                      // return le total 
                      var total = that._set_oItems(oResponse.data.results);
                      oPosting.setProperty("/Amount", total);

                      that.oODataModel.read(oFiles ,{
                        success: 
                          function (oData, oResponse) {

                          // je vais remplir le toFiles[]
                            that._set_oFiles(oResponse.data.results);

                            oRouter.navTo("createview");
                          }
                      });
                    }
                });
                
      

            },

              /**
              * Event hendler Button "Delete Invoice"
              * @param {oEvent}  
              * */
              onPressDelete: function(oEvent) {
                let oContext = oEvent.getSource().getBindingContext();
                let oData = oContext.getObject(); // Object data of the line selected ....
   
                this._delete_parked_document("D", oData );
 
              },

             /**
             * Event Method   Delete Parked Invoice
             * @param {Action}   - "D" = Delete
             * @param {oLine}  - Odata Object of the selected line 
             * */
              _delete_parked_document: function(Action, oLine ) {
 
                var JModel_Posting =   this._JModel_Load(oLine, Action);
                var su = this.getBaseURL() + "/sap/opu/odata/sap/Z_FI_FACTURATION_INT_SRV";
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
                              that._showServiceMessage(hdrMessageObject.message);
                          } else {
                               let str_msg = "La facture Préenregistréé " + my_pos.Belnr + " a été annullée"
                              that._showServiceMessage(str_msg);
                          }
                    },
                    error: function(oData, response){
                      sap.ui.core.BusyIndicator.hide();
                      MessageToast.show("Error dans la Suppression");
                    }
                        
                 })
 
              },
 

            /**
             * Event hendler OK Button Atelier
             * @param {oEvent}  
             * */
            onAtelierOkButtonPress: function(oEvent) {
       
              var t = sap.ui.getCore().byId(this._keyfragmenrt1 + "--ch.unige.fi.AtelierSelectDialog");

              // get the Atelier Selected 
              var oAtelier = t.getSelectedItem().getBindingContext("Ateliers").getObject();


             // Store the data of the Atelier into Posting.json
             var oPosting = sap.ui.getCore().getModel("Posting");
           
     
              oPosting.setProperty("/Serv", oAtelier.Serv); 
              oPosting.setProperty("/Descr", oAtelier.Descr); 
              oPosting.setProperty("/Faculte", oAtelier.Faculte); 
              oPosting.setProperty("/Atelier", oAtelier.Atelier); 
              oPosting.setProperty("/Rue", oAtelier.Rue); 
              oPosting.setProperty("/Npa", oAtelier.Npa); 
              oPosting.setProperty("/City", oAtelier.City); 
              oPosting.setProperty("/Resp", oAtelier.Resp); 
              oPosting.setProperty("/Emailresp", oAtelier.Emailresp); 
              oPosting.setProperty("/Budat", "");
              oPosting.setProperty("/Bldat", "");
              oPosting.setProperty("/Amount", "0.00");
  
               var item = [{}];
               oPosting.setProperty("/toItems", item);

            //    var files = [{}];
            //    oPosting.setProperty("/toFiles", files);


              var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
              const component = sap.ui.getCore().getComponent(sComponentId);
  
              // set my  Posting JSON
              component.setModel(oPosting, "Posting");
              oPosting.refresh();

              // Navigate to CreateView
              var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
              oRouter.navTo("createview");

              // Close Fragment
              this.dialog.close();
         
              
            }, 


          /**
           * Event hendler Button Delete Invoice
           * @param {oEvent}  
           * */
           onAtelierCancelButtonPress: function(oEvent) {
        
            oEvent.getSource().getParent().close();
           }, 


               /**
                  * Error POPUP
                  * @param {responseText}  
                  * @public
                  **/
               _showServiceMessage: function(responseText) {
 
                MessageBox.information(
                    responseText, {
   
                        id: "serviceErrorsMessageBoxC8R",
                      //  title: "Erreur",
                       
                        textAlignment: "Center",
   
                        actions: [sap.m.MessageBox.Action.OK],
                        onClose: function() {
                    
                        }.bind(this)
                    }
                );
   
            },


             /**
              * Calculate Totals in number format et Devise CHF
              * @param {toItems} Array of the ITEMS 
              * @returns(total)
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

                return sTotal;

              },




                /**
                * Preparation du JSON pour le Post
                  * @param {oModel} - JSON Object avec les donnés
                  * @param {Action} D = Delete
                  * @retur {oPostingModel} Json to Post
                  * @public
                **/


              _JModel_Load: function(oModel , Action ) {
            
                let ODATAPosting  =  this.getOwnerComponent().getModel("OPosting");                              

                  ODATAPosting.setProperty("/Bukrs",   oModel.Bukrs);
                  ODATAPosting.setProperty("/Belnr",   oModel.Belnr);
                  ODATAPosting.setProperty("/Gjahr",   oModel.Gjahr);
                  ODATAPosting.setProperty("/Action",  Action);
   
                  ODATAPosting.oData.toItems = [{}];

                return ODATAPosting
            
              },

             /**
              * Calculate Totals 
              * pOPULATE itemS array
              * @param {oItems} Array of the ITEMS 
              * @return {total}
              * @public
              **/


            _set_oItems: function (oItems) {
                var items = [];
                var oPosting = sap.ui.getCore().getModel("Posting");

                if ( oItems.length > 0 ) {
                  for (var d = 0; d < oItems.length; d++) {
                    items.push(oItems[d]);
                    //items.push(oItems);
                  }
                };
                oPosting.setProperty("/toItems", items);


                // Calculate the Totals
                var total = this._set_total(oPosting.getProperty("/toItems")); 

                oPosting.refresh();

                return total;
            },

 
          _set_oFiles: function (oFiles) {
            var files = [];
            var oPosting = sap.ui.getCore().getModel("Posting");

            if ( oFiles.length > 0 ) {
              for (var d = 0; d < oFiles.length; d++) {
                delete oFiles[d].__metadata;
                files.push(oFiles[d]);
              }
            } else {



            };



            oPosting.setProperty("/toFiles", files);
            oPosting.refresh();
          }


        });
    });
