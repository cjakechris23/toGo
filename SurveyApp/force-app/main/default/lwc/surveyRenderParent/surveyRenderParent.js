/*
*********************************************************************************************************
Name: suveyRenderParent.js
==========================================================================================================
Purpose: suveyRenderParent javascript component
==========================================================================================================
History

VERSION    AUTHOR                                               DATE                DESCRIPTION
1.0        Kenneth Kim (kennkim@deloitte.com)            		01/30/2023          Initial version
1.1        Kenneth Kim (kennkim@deloitte.com)            		02/09/2023          Added wire functions for getSurveyQuestion
1.2        Kenneth Kim (kennkim@deloitte.com)            		02/13/2023          Added background image
1.3        Kenneth Kim (kennkim@deloitte.com)            		02/20/2023          Added event handlers for child on answer change and validation
1.4        Kenneth Kim (kennkim@deloitte.com)            		02/21/2023          Updated method: handleSubmit
1.5        Kenneth Kim (kennkim@deloitte.com)            		02/23/2023          Updated method: handleSubmit. Added method: showFormInvalidNotification
1.3        Kenneth Kim (kennkim@deloitte.com)            		02/28/2023          Updated map for storing answer values
1.4        Kenneth Kim (kennkim@deloitte.com)                   03/07/2023          Updated method: callSaveSurveyResponseApex
*********************************************************************************************************
*/

import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue  } from 'lightning/uiRecordApi';
import getSurveyQuestion from '@salesforce/apex/SurveyRenderController.getSurveyQuestion';
import saveSurveyResponses from '@salesforce/apex/SurveyRenderController.saveSurveyResponses';
import SURVEYNAME_FIELD from '@salesforce/schema/SurveyVersion__c.SurveyId__r.Name';
import SURVEYID_FIELD from '@salesforce/schema/SurveyVersion__c.SurveyId__r.Id';
import backgroundUrl from '@salesforce/resourceUrl/Custom_Survey_Background_Image';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { FlowNavigationNextEvent } from 'lightning/flowSupport';

export default class SurveyRenderParent extends LightningElement {

    // Flow input (hardcoded Id for testing only - a0I3J000001ActeUAC)
    @api customSurveyVersionId = 'a0I3J000001ActeUAC';
    @api customSurveyInvitationId = 'a0L3J000003sffiUAA';
    @api participantContactId = '0033J00000RuS8YQAV';

    // This will be accessed by the screen flow to provide the available navigation options based on the current screen (ex. on last screen = no more next action)
    @api availableActions = [];

    // This will contain the input param (value = true) from the survey builder when previewing the survey
    @api isPreviewMode;

    customSurveyName;
    questionDetailList;
    surveyName;
    surveyId;
    isLoading = true;
    isSuccess = false;
    questionAnswerMap = new Map();
    isFormValid = false
    //bgImageUrl = "https://phpdc--survey.sandbox.file.force.com/sfc/servlet.shepherd/version/download/0683J000002ASsN"
       
    connectedCallback(){
        if(this.isPreviewMode == true){
            console.log("===========> PREVIEW MODE <===========");
        }
    }


    // Get survey questions and related question choices based on survey version (a0I3J000001ActeUAC)
    @wire(getSurveyQuestion, {surveyVersionId: '$customSurveyVersionId'})
    getSurveyQuestionHandler({error, data}){
        if(data){
            console.log(data);
            this.questionDetailList = data;
            this.isLoading = false;
            this.createMapping();
        }else if(error){
            console.log('Error getting survey questions: ' + error.body.message);
        }
    }

    // Get survey name based on survey version
    @wire(getRecord, {recordId: '$customSurveyVersionId', fields:[SURVEYNAME_FIELD, SURVEYID_FIELD]})
    surveyVersionHandler({error, data}){
        if(data){
            this.surveyName = getFieldValue(data, SURVEYNAME_FIELD);
            this.surveyId = getFieldValue(data, SURVEYID_FIELD);
            console.log('surveyName: ' +  this.surveyName);
            console.log('surveyId: ' +  this.surveyId);
        }else if (error){
            console.log('Error getting survey name: ' + error.body.message);
        }
    }

    get backgroundImage(){
        return `background-image:url("${backgroundUrl}");background-size:cover;background-attachment: fixed`;
    }

    // Create initial map for checking answers on submit. (key= question Id, value = question name and IsRequired__c (Initial values only))
    createMapping(){
    
        this.questionDetailList.forEach(element => {
            this.questionAnswerMap.set(element.Id, { questionName: element.Name, questionId: element.Id, isRequired: element.IsRequired__c, questionOrder: element.QuestionOrder__c, questionType: element.QuestionType__c});
        });

        console.log(this.questionAnswerMap);
    }

    // On value input from child, updated the map of questions with the provided answer from the child
    handleAnswerChange(event){
        //console.log('PARENT: handleAnswerChange');
        console.log(JSON.stringify(event.detail.questionDetails));
        this.questionAnswerMap.set(event.detail.questionId, event.detail.questionDetails);
    }

    // On pressing submit, loop through the map of questions and update each question (key) with "isValid" property to denote whether the provided answers are valid or not
    handleSubmit(){
        console.log("--->> SUBMIT CLICKED <<--- ");
        console.log(this.questionAnswerMap);

        for(let [key, value] of this.questionAnswerMap){

            // Get the answer validity (boolean) from child question and update the parent map with the isValid value
            let isValidAnswer = this.template.querySelector(".survey-question-child[data-key=" + key + "]").handleValidation();
            value.isValid = isValidAnswer; 
         }

        // Print the map for debugging purposes
        console.log("--------> UPDATED MAP <--------");
        for(let [key, value] of this.questionAnswerMap){
            //console.log(JSON.stringify(value));
            console.log("==========================");
            console.log("Ques: " + value.questionName);
            console.log("QuesType: " + value.questionType);
            console.log("Q-ID: " + value.questionId);
            console.log("Ans Value: " + value.answerValue);
            console.log("Ans-ID: " + value.answerId);
            console.log("IsRequired?: " + value.isRequired);
            console.log("IsValid?: " + value.isValid);
        }

        // Checking of answers. Evaluate each question if isValid is set to true. If all is true, form can be submitted, else show error
        this.isFormValid = [...this.questionAnswerMap.values()].reduce((validSoFar, element) => {
            return validSoFar && element.isValid;
        }, true);

        if(this.isFormValid === true){
            console.log("-----> FORM IS VALID <-----");
            if(this.isPreviewMode == true){
                this.showFormValidNotifiction();
            }else{
                this.callSaveSurveyResponseApex();
            }         
        }else{
            console.log("-----> FORM IS INVALID <-----");
            this.showFormInvalidNotification();
        }
    }
    
    // Method for calling the apex controller that will save the survey response
    callSaveSurveyResponseApex(){ 
        this.isLoading = true;
        
        let responses = [];
        for(let [key, value] of this.questionAnswerMap){
            
            // Handle undefined value of Boolean buttons
            if(value.questionType == "Boolean" && value.answerValue == undefined){
                value.answerValue = "";
            }

            // Handle MultiSelectPicklist questions
            if(value.questionType == "MultiSelectPicklist") {

                // Handle undefined value of MultiSelectPicklist 
                if(value.answerValue == undefined || value.answerValue.length == 0){
                    value.answerValue = "";
    
                }else{

                    // Change multi-select answers in this format --> val1;val2;val3
                    console.log('MultiSelectPicklist!!!: HAS VALUE');
                    console.log('Size '+ value.answerValue.length);
                    
                    value.answerValue = JSON.stringify(value.answerValue).replaceAll('"', '');
                    value.answerValue = value.answerValue.replaceAll(",", ";");
                    value.answerValue = value.answerValue.replace(/[\[\]']+/g,'');

                    value.answerId = JSON.stringify(value.answerId).replaceAll('"', '');
                    value.answerId = value.answerId.replaceAll(",", ";");
                    value.answerId = value.answerId.replace(/[\[\]']+/g,'');                
                }
            }
            //Handle undefined for ShortText
            if(value.questionType == "ShortText" && value.answerValue == undefined) {
                value.answerValue = "";
            }
            // Handle undefined value of RadioButton questons
            if(value.questionType == "RadioButton" && value.answerValue == undefined) {
                value.answerValue = "";
            }

            // Handle undefined value of star rating questions
            if(value.questionType == "Rating" && value.answerValue == undefined){
                value.answerValue = "";
                console.log('Rating!!!: NO VALUE');
            }
            responses.push(value);
        }

        // Stringify apex input params
        let jsonResponseArray = JSON.stringify(responses);

        saveSurveyResponses({ 
            jsonResponseArray: jsonResponseArray,  
            surveyName: this.surveyName, 
            surveyId: this.surveyId, 
            surveyVersionId: this.customSurveyVersionId, 
            customSurveyInvitationId: this.customSurveyInvitationId,
            participantContactId: this.participantContactId 
        })
        .then( result => {
            console.log("-----> APEX Success! <-----");
            this.isLoading = false;
            this.isSuccess = true;
            this.updateBackgroundImage();

        }).catch(error => {
            console.log("-----> APEX Error! <-----");
            console.log(error);
            this.isLoading = true;
            this.isSuccess = false;
            this.showSaveErrorNotification();
        });
     
    }

    

    // Method for showing a toast notification for when the form is submitted without any validation errors
    showFormValidNotifiction(){
        const evt = new ShowToastEvent({
            title: "Success",
            message: "Your form inputs are valid",
            variant: "success",
            mode: "dismissable"
        });
        this.dispatchEvent(evt);
    }

    // Method for showing a toast notification for when the form is submitted with validation errors
    showFormInvalidNotification(){
        const evt = new ShowToastEvent({
            title: "Cannot submit survey",
            message: "Please check the errors on the survey form",
            variant: "error",
            mode: "dismissable"
        });
        this.dispatchEvent(evt);
    }

    // Method for showing a toast notification when an error occurs during saving
    showSaveErrorNotification(){
        const evt = new ShowToastEvent({
            title: "An error has occured",
            message: "Please contact your system administrator",
            variant: "error",
            mode: "dismissable"
        });
        this.dispatchEvent(evt);
    }

    // Method for updating the background image after form submit
    updateBackgroundImage(){
        this.template.querySelector(".main-parent-div").style.height = "100vh";
    }

    // Method for handling flow navigation. Trigger next action.
    handleNextFlow(){
        console.log("Handle flow next navigation");
        console.log("availableActions: " + JSON.stringify(this.availableActions));
        if(this.availableActions.find((action) => action === "NEXT")){
            const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
        }
    }
}