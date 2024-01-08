/*
Description: Question Display Logic Modal Component for Survey Builder
History:
1.0 - Christine Joy Cruz (chrcruz@deloitte.com) - 11/08/2022 - Initial version
*/

import { LightningElement, api, wire, track } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import SURVEYQUESTIONDISPLAYLOGIC_OBJECT from '@salesforce/schema/SurveyQuestionDisplayLogic__c';
import OPERATOR_FIELD from '@salesforce/schema/SurveyQuestionDisplayLogic__c.Operator__c';
import DISPLAYLOGICCONDITION_FIELD from '@salesforce/schema/SurveyQuestionDisplayLogic__c.QuestionDisplayLogicCondition__c';

export default class SurveyDisplayQuestionLogicModal extends LightningElement {
    @api hasExistingLogics;
    logicIndex = 0;
    @api existingLogicsList;
    @track logicsList = [];
    @api questionIndex;
    @api questionsListClone;
    questionsList;
    @api existingQuestionDisplayLogicCondition;
    @api questionDisplayLogicCondition;
    operators;
    logic = {
        Id : '',
        QuestionName__c : '',
        parentQuestionIndex : this.questionIndex,
        Operator__c : '',
        Response__c : '',
        QuestionDisplayLogicCondition__c : this.existingQuestionDisplayLogicCondition,
        DeleteLogicDisabled : false,
        QuestionDisabled : false,
        logicIndex : '',
        textInputResponse : true,
        ResponseOptions : [],
        ResponseIndex : ''
    };
    filteredQuestionsListClone = [];
    displayLogicOptions;
    displayLogicsToDeleteList = [];

    connectedCallback() {

        // Remove empty question from options
        this.questionsListClone.forEach(question => {
            if(question.QuestionName__c.length > 0) {
                this.filteredQuestionsListClone.push(question);
            }
        })

        if(this.filteredQuestionsListClone.length > 0) {
            this.questionsList = this.filteredQuestionsListClone.map(question => {
                let questionOption = {};
                questionOption.label = question.QuestionName__c;
                questionOption.value = question.QuestionName__c;
                return questionOption;
            })

            // Enable question combobox
            this.logicsList.forEach(logic => {
                logic.QuestionDisabled = false;
            })
        } else {
            // Disable question combobox
            this.logicsList.forEach(logic => {
                logic.QuestionDisabled = true;
            })
        }

        // Load existing display condition logic
        if(this.hasExistingLogics) {
            this.questionDisplayLogicCondition = this.existingQuestionDisplayLogicCondition;
            // Map existing logics to the component's list
            this.logicsList = this.existingLogicsList.map(logic => {
                let existingLogic = {};
                existingLogic.Id = logic.Id;
                existingLogic.QuestionName__c = logic.QuestionName__c;
                existingLogic.Operator__c = logic.Operator__c;
                existingLogic.Response__c = logic.Response__c;
                existingLogic.QuestionDisplayLogicCondition__c = this.existingQuestionDisplayLogicCondition;
                existingLogic.DeleteLogicDisabled = logic.DeleteLogicDisabled;
                existingLogic.QuestionDisabled = logic.QuestionDisabled;
                existingLogic.logicIndex = this.existingLogicsList.indexOf(logic);
                
                this.filteredQuestionsListClone.map(question => {

                    // Check if question referenced by logic has multiple choices
                    if(logic.QuestionName__c == question.QuestionName__c && (question.QuestionType__c != 'ShortText')) {
                        existingLogic.textInputResponse = false;

                        // Map survey question choices to options for responses
                        existingLogic.ResponseOptions = question.SurveyQuestionChoices__r.map(choice => {
                            let response = {};
                            response.label = choice.Name;
                            response.value = choice.Name;
                            return response;
                        })
                    } else {
                        existingLogic.textInputResponse = true;
                    }
                })

                return existingLogic;
            })
            
        } else {
            let firstLogic = {Id : '', QuestionName__c : '', parentQuestionIndex : this.questionIndex, Operator__c : '', Response__c : '', DeleteLogicDisabled : true, 
                               QuestionDisplayLogicCondition__c : '', QuestionDisabled : false, logicIndex : 0, LogicOrder__c : 1,
                               textInputResponse : true, ResponseOptions : [], ResponseIndex : ''};
            this.logicsList.push(firstLogic);
        }
    }
    
    @wire(getObjectInfo, {objectApiName: SURVEYQUESTIONDISPLAYLOGIC_OBJECT})
    surveyQuestionDisplayLogicInfo;

    // Retrieves the picklist values for the logic operators
    @wire(getPicklistValues, {recordTypeId: '$surveyQuestionDisplayLogicInfo.data.defaultRecordTypeId', fieldApiName: OPERATOR_FIELD})
    wiredOperators({error, data}) {
        if(data) {
            this.operators = data.values.map(operator => {
                return {
                    label: `${operator.label}`,
                    value: `${operator.value}`
                };
            });
        } else if (error) {
            console.log('wiredOperators error: ' + JSON.stringify(error));
        }
    };

    // Retrieves the picklist values for the display logic condition
    @wire(getPicklistValues, {recordTypeId: '$surveyQuestionDisplayLogicInfo.data.defaultRecordTypeId', fieldApiName: DISPLAYLOGICCONDITION_FIELD})
    wiredDisplayLogicConditions({error, data}) {
        if(data) {
            this.displayLogicOptions = data.values.map(condition => {
                return {
                    label: `${condition.label}`,
                    value: `${condition.value}`
                };
            });
        } else if (error) {
            console.log('wiredDisplayLogicConditions error: ' + JSON.stringify(error));
        }
    };

    handleQuestionChange(event) {
        var selectedRow = Number(event.currentTarget.dataset.id);
        this.logicsList[selectedRow].QuestionName__c = event.detail.value;        

        // Check if question type of selected question has multiple choices
        var booleanRatingQuestion = this.filteredQuestionsListClone.find(question => event.detail.value == question.QuestionName__c && (question.QuestionType__c != 'ShortText')); // || question.QuestionType__c != 'FreeText' <--- add this to logic once 'FreeText' is activated
        if(booleanRatingQuestion) {
            this.logicsList[selectedRow].textInputResponse = false;

            // Map survey question choices to options for responses
            this.logicsList[selectedRow].ResponseOptions = booleanRatingQuestion.SurveyQuestionChoices__r.map(choice => {
                let response = {};
                response.label = choice.Name;
                response.value = choice.Name;
                return response;
            })
        } else {
            this.logicsList[selectedRow].textInputResponse = true;
        }
    }
    
    handleOperatorChange(event) {
        var selectedRow = Number(event.currentTarget.dataset.id);
        this.logicsList[selectedRow].Operator__c = event.detail.value;
    }

    handleResponseChange(event) {
        var selectedRow = Number(event.currentTarget.dataset.id);
        this.logicsList[selectedRow].Response__c = event.detail.value;
        var responseOptionsList = this.logicsList[selectedRow].ResponseOptions;
        if(responseOptionsList.length > 0) {
            for(let i = 0; i < responseOptionsList.length; i++) {
                if(responseOptionsList[i].value == event.detail.value) {
                    this.logicsList[selectedRow].ResponseIndex = i;
                }
            }
        }
    }

    // Close modal
    handleCloseDisplayLogicModal() {
        this.dispatchEvent(new CustomEvent("closedisplaylogicmodal", {detail: false}));
    }

    // Close modal on save
    handleSaveQuestionDisplayLogic() {
        this.dispatchEvent(new CustomEvent("savelogicslist", {detail: false}));
    }

    // Pass logics list to parent component
    @api passLogicsList() {
        return this.logicsList;
    }

    @api passLogicsToDeleteList() {
        return this.displayLogicsToDeleteList;
    }

    // Pass display logic condition
    @api passLogicCondition() {
        return this.questionDisplayLogicCondition;
    }

    handleDisplayLogicConditionChange(event) {
        this.questionDisplayLogicCondition = event.detail.value;
        if(this.logicsList.length > 0) {
            // Assign display logic condition to logics
            this.logicsList.forEach(logic => {
                logic.QuestionDisplayLogicCondition__c = this.questionDisplayLogicCondition;
            })
        }
    }

    handleAddLogic() {
        this.logicIndex++;
        let newLogic = {Id : '', QuestionName__c : '', parentQuestionIndex : this.questionIndex, Operator__c : '', Response__c : '', DeleteLogicDisabled : false, 
                        QuestionDisplayLogicCondition__c : this.questionDisplayLogicCondition, QuestionDisabled : false, logicIndex : this.logicIndex, 
                        LogicOrder__c : this.logicIndex + 1, textInputResponse : true, ResponseOptions : [], ResponseIndex : ''};
        this.logicsList.push(newLogic);
    }

    handleDeleteLogic(event) {
        var selectedRow = Number(event.currentTarget.dataset.id);

        // Add logic to delete in list for deletion if logic is already saved on database
        if(this.isExistingSurvey == true && this.logicsList[selectedRow].Id != '') {
            this.displayLogicsToDeleteList.push(this.logicsList[selectedRow]);
        }

        this.logicsList.splice(selectedRow, 1);

        // Decrease Row Number of succeeding question/s
        this.logicsList.forEach(logic => {
            if(logic.logicIndex > selectedRow) {
                logic.logicIndex--;
            }
        })

        this.logicIndex--;
    }
}