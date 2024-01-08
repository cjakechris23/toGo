/*
Description: Parent component for Survey Builder
History:
1.0 - Christine Joy Cruz (chrcruz@deloitte.com) - 11/14/2022 - Initial version
*/

import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import SURVEY_OBJECT from '@salesforce/schema/Survey__c';
import SURVEYTYPE_FIELD from '@salesforce/schema/Survey__c.SurveyType__c';
import getSurvey from '@salesforce/apex/SurveyController.getSurvey';
import getSurveyQuestions from '@salesforce/apex/SurveyController.getSurveyQuestions';
import saveSurvey from '@salesforce/apex/SurveyController.saveSurvey';
import updateSurveyVersionStatus from '@salesforce/apex/SurveyController.updateSurveyVersionStatus';
import cloneSurvey from '@salesforce/apex/SurveyRenderController.cloneSurvey';
import refreshsearchFromEmail from '@salesforce/apex/SurveySendController.searchFromEmail';
import refreshsearchRecipient from '@salesforce/apex/SurveySendController.searchRecipient';
import refreshsearchEmlTemplate from '@salesforce/apex/SurveySendController.searchEmlTemplate';
import refreshgetEmailTemplateContent from '@salesforce/apex/SurveySendController.getEmailTemplateContent';
import refreshsendSurveyInvitation from '@salesforce/apex/SurveySendController.sendSurveyInvitation';

export default class SurveyBuilderContainer extends NavigationMixin(LightningElement) {
    @api surveyName;
    surveyTypes;
    surveyType;
    @api existingQuestionsList;
    @api isExistingSurvey = false;
    questionsList;
    questionsToDeleteList;
    choicesToDeleteList;
    displayLogicsToDeleteList;
    choicesMap = new Map();
    displayLogicsMap = new Map();
    hasQuestions;
    latestVersionId;
    surveyRecordId;
    wiredSurveyQuestions;
    isLoading = false;
    surveyVersionStatus;
    activeButtonDisable = false;
    isCancelModalOpen = false;

    renderedCallback() {
        // Select Questions tab on load
        this.template.querySelector('[data-id="QuestionsTab"]').classList.add('tab-selected');
    }

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if(currentPageReference) {
            // Get survey id
            this.surveyRecordId = currentPageReference.state?.c__surveydId;
        }
    }
    
    wiredSurveyRecord;
    @wire(getSurvey, {recordId : '$surveyRecordId'})
    wiredSurvey(value) {
        this.wiredSurveyRecord = value;
        const {data, error} = value
        if(data) {
            this.isExistingSurvey = true;
            this.surveyName = data.Name;
            this.surveyType = data.SurveyType__c;
            this.latestVersionId = data.LatestVersionId__c;
            this.surveyVersionStatus = data.LatestVersionId__r.SurveyStatus__c;
                if(this.surveyVersionStatus == 'Active'){
                    this.activeButtonDisable = true ; 
                }
                else{
                    this.activeButtonDisable = false ; 
                }
        } else if (error) {
            this.showToast('Error!', 'The following error occurred: ' + error.body.message, 'error');
        }
    }

    @wire(getSurveyQuestions, {surveyVersionId : '$latestVersionId'})
    wiredQuestions(value) { 
        this.wiredSurveyQuestions = value;
        const {data, error} = value
        if(data) {
            this.hasQuestions = true;
            this.existingQuestionsList = data;
        } else if (error) {
            this.showToast('Error!', 'The following error occurred: ' + error.body.message, 'error');
        }
    }

    @wire(getObjectInfo, {objectApiName: SURVEY_OBJECT})
    surveyInfo;

    // Retrieves the picklist values for the question type field
    @wire(getPicklistValues, {recordTypeId: '$surveyInfo.data.defaultRecordTypeId', fieldApiName: SURVEYTYPE_FIELD})
    wiredSurveyTypes({error, data}) {
        if(data) {
            this.surveyTypes = data.values.map(type => {
                return {
                    label: `${type.label}`,
                    value: `${type.value}`
                };
            });
        } else if (error) {
            this.showToast('Error!', 'The following error occurred: ' + error.body.message, 'error');
        }
    };

    showToast(title, message, variant) {
        const toastEvt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(toastEvt);
    }

    handleSurveyTypeChange(event) {
        this.surveyType = event.detail.value;
    }

    handleChangeSurveyName(event) {
        this.surveyName = event.detail.value;
    }
    
    handleTabSelected(event) {
        switch(event.target.value) {
            case '1':
                this.template.querySelector('[data-id="Questions"]').className='slds-show';
                this.template.querySelector('[data-id="QuestionsTab"]').classList.add('tab-selected');
                this.template.querySelector('[data-id="Send"]').className='slds-hide';
                this.template.querySelector('[data-id="SendTab"]').classList.remove('tab-selected');
                break;
            case '2':
                this.template.querySelector('[data-id="Questions"]').className='slds-hide';
                this.template.querySelector('[data-id="QuestionsTab"]').classList.remove('tab-selected');
                this.template.querySelector('[data-id="Send"]').className='slds-show';
                this.template.querySelector('[data-id="SendTab"]').classList.add('tab-selected');
                break;
        }
    }

    handleSaveSurvey() {
        this.isLoading = true;
        var Survey__c = {Id : this.surveyRecordId, Name : this.surveyName.trim(), 	SurveyType__c : this.surveyType};
        this.questionsList = this.template.querySelector('c-survey-add-question-container').passQuestionsList();
        this.questionsToDeleteList = this.template.querySelector('c-survey-add-question-container').passQuestionsToDelete();
        this.choicesToDeleteList = this.template.querySelector('c-survey-add-question-container').passChoicesToDelete();
        this.displayLogicsToDeleteList = this.template.querySelector('c-survey-add-question-container').passDisplayLogicsToDelete();
           
        // Handle empty survey name
        if(Survey__c.Name == undefined || Survey__c.Name == '' || Survey__c.Name.length == 0){
            console.log('SUVEY NAME IS BLANK: ');
            this.showInvalidSurveyNameToast();
            this.isLoading = false;
            return;
        }

        // TODO: handle empty survey questions. if empty, do not save else, continue


        this.questionsList.forEach(question => {

            // Populate question choices map
            if(question.SurveyQuestionChoices__r !== undefined && question.SurveyQuestionChoices__r.length > 0) {
                this.choicesMap[question.QuestionOrder__c] = question.SurveyQuestionChoices__r;
            }

            // Populate display logics map
            if(question.SurveyQuestionDisplayLogics__r !== undefined && question.SurveyQuestionDisplayLogics__r.length > 0) {
                question.SurveyQuestionDisplayLogics__r.forEach(logic => {
                    var displayLogicBasisQuestion = this.questionsList.find(question => logic.QuestionName__c == question.InitialQuestion);
                    if(displayLogicBasisQuestion != undefined && logic.QuestionName__c == displayLogicBasisQuestion.InitialQuestion && displayLogicBasisQuestion.QuestionName__c != displayLogicBasisQuestion.InitialQuestion) {
                        logic.QuestionName__c = displayLogicBasisQuestion.QuestionName__c;
                    }
                })
                this.displayLogicsMap[question.QuestionName__c] = question.SurveyQuestionDisplayLogics__r;
            }
        });
        // Will Check the lenght of the question list if 0 or undefined
        if(this.questionsList.length == 0 || this.questionsList == undefined){
            this.showInvalidSurveyToast();
            this.isLoading = false;
        }
        else
        {
            this.isLoading = true;
            saveSurvey({isExistingSurvey : this.isExistingSurvey, surveyRecord : Survey__c,  lstSurveyQuestions : this.questionsList, 
                mapSurveyQuestionChoices : this.choicesMap, mapSurveyQuestionDisplayLogics : this.displayLogicsMap,
                lstSurveyQuestionsForDelete : this.questionsToDeleteList,  lstSurveyQuestionChoicesForDelete : this.choicesToDeleteList,
                lstQuestionDisplayLogicsForDelete: this.displayLogicsToDeleteList})
    .then(result => {
        if(result) {
          
            // Redirect to survey record
            if(!this.isExistingSurvey) {
                this.showToast('Success!', this.surveyName + ' was saved. Redirecting you to the survey record.', 'success');

                setTimeout(() => {

                    this[NavigationMixin.Navigate]({
                        type: 'standard__recordPage',
                        attributes: {
                            recordId: result,
                            actionName: 'view'
                        }
                    });
                    this.isLoading = false;
                }, 3000);
            } else {
                this.showToast('Success!', this.surveyName + ' was saved.', 'success');
                refreshApex(this.wiredSurveyQuestions);
                refreshApex(this.wiredSurveyRecord);
                this.isLoading = false;
            }
        }
    }) .catch(error => {
        this.showToast('Error!', this.surveyName + ' was not saved. The following error occurred: ' + error.body.message, 'error')
    })
        }
        console.log('QuestionsList:' , this.questionsList);
      
    }

    handlePreviewSurvey(){
        var compDefinition = {
            componentDef: "c:surveyRenderParent",
            attributes: {
                isPreviewMode: true,
                customSurveyVersionId: this.latestVersionId
            }
        };
        // Base64 encode the compDefinition JS object
        var encodedCompDef = btoa(JSON.stringify(compDefinition));
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodedCompDef
            }
        }).then(url => {
            window.open(url, "_blank");
        });  
    }

    handleActivateSurvey(){
        this.isLoading = true;

        setTimeout(() => {
            updateSurveyVersionStatus({ latestVersionId: this.latestVersionId, picklistValue: "Active"})
            .then(()=>{
                //refresh record data     
                this.showActivatedNotification();
                this.activeButtonDisable = true;
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            })
            .catch(error => {
                console.error(error);
                this.isLoading = false;
            });
        }, 3000);
    }

    
    // TODO: Test method only. Move this method on the survey builder
    handleClone(){
        this.isLoading = true;
        
        cloneSurvey({
            surveyVersionId: this.latestVersionId
        })
        .then( result => {
            if(result){
                
                console.log("-----> APEX Success! <-----");
                console.log(result);
    
                //Redirect to cloned survey Record
                this.showToast('Survey form cloned successfully', 'Redirecting you to the cloned survey record.', 'success');

                setTimeout(()=>{
                    this.isLoading = false;
                    this[NavigationMixin.Navigate]({
                        type: 'standard__recordPage',
                        attributes: {
                            recordId: result,
                            actionName: 'view',  
                        }
                    });
                },3000);
            }
        }).catch(error => {
            console.log("-----> APEX Error! <-----");
            console.log(error);
            this.isLoading = false;
            this.showSaveErrorNotification();
        });
    }

    handleCancel(){
        this.isCancelModalOpen = true;
    }
    closeCancelModal(){
        this.isCancelModalOpen = false;
    }

    navigateToObjectHome() {
        this[NavigationMixin.Navigate]({
          type: "standard__objectPage",
          attributes: {
            objectApiName: "Survey__c",
            actionName: "list"
          }
        });
    } 

    showSaveErrorNotification(){
        const evt = new ShowToastEvent({
            title: "An error has occured",
            message: "Please contact your system administrator",
            variant: "error",
            mode: "dismissable"
        });
        this.dispatchEvent(evt);
    }

    showActivatedNotification(){
        const evt = new ShowToastEvent({
            title: "Success",
            message: "The survey form is now activated.",
            variant: "success",
            mode: "dismissable"
        });
        this.dispatchEvent(evt);
    }

    showInvalidSurveyNameToast(){
        const evt = new ShowToastEvent({
            title: "Error",
            message: "The survey name cannot be empty",
            variant: "error",
            mode: "dismissable"
        });
        this.dispatchEvent(evt);
    }
    
    showInvalidSurveyToast(){
        const evt = new ShowToastEvent({
            title: "Error",
            message: "The survey cannot have an empty list",
            variant: "error",
            mode: "dismissable"
        });
        this.dispatchEvent(evt);
    }
}