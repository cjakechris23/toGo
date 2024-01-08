/**
 * @FileName            : surveySendModule.js
 * @Description         : LWC Module of Survey App that manages the send configuration
 * @Author              : Cleo Perez
 * ==================================================================================================
 * @History
 * Version      Date                Author                                      Description
 * 1.0          10/11/2022          Cleo Perez (cleperez@deloitte.com)          Initial Version
**/


import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import SURVEY_VERSION_STATUS_FIELD from '@salesforce/schema/SurveyVersion__c.SurveyStatus__c';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';

import searchFromEmail from '@salesforce/apex/SurveySendController.searchFromEmail';
import searchRecipient from '@salesforce/apex/SurveySendController.searchRecipient';
import searchEmlTemplate from '@salesforce/apex/SurveySendController.searchEmlTemplate';
import getEmailTemplateContent from '@salesforce/apex/SurveySendController.getEmailTemplateContent';
import sendSurveyInvitation from '@salesforce/apex/SurveySendController.sendSurveyInvitation';

export default class SurveySendModule extends LightningElement {

    sendLookupFields = [
        {
            id: 'fromaddr',
            label: 'From Address:',
            placeholder: 'Select From Address...'
        },
        {
            id: 'recipient',
            label: 'Recipient/s:',
            placeholder: 'Select Recipient/s...'
        },
        {
            id: 'emltemplate',
            label: 'Email Template:',
            placeholder: 'Select Email Template...'
        }
    ];
    
    @api surveyVersionId = 'a0I3J000001ActeUAC';
    @api surveyId = 'a0H3J000002hwlkUAA';

    @track lookupSearchData = {};
    @track lookupSearchError = {};
    @track lookupSelection = {};
    @track addCustomerRecipientFlag = false; 

    searchKeyfromaddr;
    searchKeyrecipient;
    searchKeyemltemplate;
    emailTemplateRecordId;
    isActive;
    isLoading = false;
    @track customRecipientVal; 

    get surveyVersionRecord() {
        return {
            Id: this.surveyVersionId,
            SurveyId__c: this.surveyId
        };
    }
    


    connectedCallback() {

    }

    renderedCallback() {
        const fields = this.template.querySelectorAll('c-survey-lookup');
        if(fields) {
            fields.forEach( field => {
                this[`searchKey${field.dataset.id}`] = '';
            })
        }
    }


    @wire(getRecord, {recordId: '$surveyVersionId', fields:[SURVEY_VERSION_STATUS_FIELD]})
    getSurveyVersionStatus({data, error}){
        if(data) {
            const svStatus = getFieldValue(data, SURVEY_VERSION_STATUS_FIELD);
            
            if (svStatus === 'Active') {
                this.isActive = true;
            }
        } else if (error) {
            console.log(error);
        }
    }

    @wire(searchFromEmail, { searchKey: '$searchKeyfromaddr' })
    searchFromAddrResponse ({data, error}) {
        if (data) {
            this.lookupSearchData.fromaddr = data;
            this.lookupSearchError.fromaddr = undefined;

            this.setLookupSearchResult('fromaddr');
        } else if (error) {
            this.lookupSearchError.fromaddr = error;
            this.lookupSearchData.fromaddr = undefined;
        }
    }

    @wire(searchRecipient, { searchKey: '$searchKeyrecipient', surveyVersionRecord: '$surveyVersionRecord' })
    searchRecipientResponse ({data, error}) {
        if (data) {
            this.lookupSearchData.recipient = data;
            this.lookupSearchError.recipient = undefined;

            this.setLookupSearchResult('recipient');
        } else if (error) {
            this.lookupSearchError.recipient = error;
            this.lookupSearchData.recipient = undefined;
        }
    }

    @wire(searchEmlTemplate, { searchKey: '$searchKeyemltemplate' })
    searchEmlTemplateResponse ({data, error}) {
        if (data) {
            this.lookupSearchData.emltemplate = data;
            this.lookupSearchError.emltemplate = undefined;

            this.setLookupSearchResult('emltemplate');
        } else if (error) {
            this.lookupSearchError.emltemplate = error;
            this.lookupSearchData.emltemplate = undefined;
        }
    }
    
    @wire(getEmailTemplateContent, { recordId: '$emailTemplateRecordId' } )
    emlTemplteInfos ({data, error}) {
        if (data) {
            console.log(data);
            this.lookupSelection.emltemplate.subject = data.Subject;
            this.lookupSelection.emltemplate.body = data.HtmlValue;
        } else if (error) {
            console.log(error);
        }
    }
    

    handleSearch(event) {
        let lookupId = JSON.parse(JSON.stringify(event.target.dataset.id));
        this[`searchKey${lookupId}`] = event.detail.searchTerm;
    }
    
    setLookupSearchResult(lookupId) {
        console.log(lookupId);
        const lookup = this.template.querySelector(`c-survey-lookup[data-id="${lookupId}"]`);
        if (lookup) {
            console.log(this.lookupSearchData[lookupId]);
            lookup.setSearchResults(this.lookupSearchData[lookupId]);
        }
    }

    handleSelection(event) {
        let lookupId = JSON.parse(JSON.stringify(event.target.dataset.id));

        console.log(JSON.parse(JSON.stringify(event.detail)));
        console.log(JSON.parse(JSON.stringify(event.target.getSelection())));

        this.lookupSelection[lookupId] = {id : event.detail[0]};
        
        if (lookupId === 'emltemplate') {
            this.emailTemplateRecordId = this.lookupSelection.emltemplate.id;
        }

        this.checkRequired(lookupId);
    }

    handleCustomRecipientValue(event){
        this.customRecipientVal = event.target.value; 
        this.lookupSelection.customEmail = this.customRecipientVal; 
    }

    handleAddCustomerRecipientVal(event){
        this.addCustomerRecipientFlag = event.target.checked; 
    }

    checkRequired(lookupId) {
        const lookupCmp = this.template.querySelector(`c-survey-lookup[data-id="${lookupId}"]`);
        
        lookupCmp.errors = [];
        
        if (lookupCmp.getSelection().length === 0) {
            lookupCmp.errors = [{message: 'Complete this field.'}];
        }
    }

    isValidSubmit() {
        const fields = this.template.querySelectorAll('c-survey-lookup');
        let hasError = 0;
        if(fields) {
            fields.forEach( field => {
                this.checkRequired(field.dataset.id);

                if(field.errors.length) {
                    hasError++;
                }
            })
        }
        return !hasError;
    }

    handleSend() {
        if(this.isValidSubmit()) {
            this.isLoading = true;
            //console.log('lookupselection' + this.lookupSelection.customEmail.id); 
            sendSurveyInvitation({  surveyVersionRecord: this.surveyVersionRecord, 
                                    emlTemplate: this.lookupSelection.emltemplate.id, 
                                    fromAddr: this.lookupSelection.fromaddr.id, 
                                    recipient: this.lookupSelection.recipient.id,
                                    // ccAddr: this.lookupSelection.customEmail.id
                                })
                .then(result => {
                    console.log('Result', result);
                    this.handleNotification('Sucesss', 'Survey Invitations has been sent out', 'success');
                    this.isLoading = false;
                })
                .catch(error => {
                    console.error('Error:', error);
                    this.handleNotification('An error has occured', 'Please contact your system administrator', 'error');
                    this.isLoading = false;
            });
        } else {
            this.handleNotification('Error', 'Please complete the required fields', 'error');
        }
    }
    
    handleNotification(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title, 
            message: message, 
            variant: variant, 
            mode: "dismissable"
        }));
    }
}