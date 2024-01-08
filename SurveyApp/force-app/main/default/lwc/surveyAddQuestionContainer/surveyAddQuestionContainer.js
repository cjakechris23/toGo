/*
Description: Question Container Component for Survey Builder
History:
1.0 - Christine Joy Cruz (chrcruz@deloitte.com) - 11/14/2022 - Initial version
*/

import { LightningElement, track, wire, api } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import SURVEYQUESTION_OBJECT from '@salesforce/schema/SurveyQuestion__c';
import QUESTIONTYPE_FIELD from '@salesforce/schema/SurveyQuestion__c.QuestionType__c';

export default class SurveyAddQuestionContainer extends LightningElement {
    addEmptyRow = true; // for automatic adding of row/option
    questionIndex = 0;
    questionTypes;
    @api selectedQuestionIndex; // for display logic modal
    @api questionDisplayLogicCondition; 
    @api displayLogicQuestionsList;
    @track questionsList = [];
    question = {
        Id : '',
        QuestionOrder__c : '',
        QuestionName__c : '',
        IsRequired__c : false,
        QuestionType__c : '',
        MaxSelection : '',
        RatingQuestionTypeIconPair : '',
        SurveyQuestionChoices__r : [{}],
        questionIndex : this.questionIndex,
        shortText : false,
        freeText : false,
        multiSelectPicklist : false,
        radioButton : false,
        dropDown : false,
        rating : false, 
        boolean : false, 
        DeleteQuestionDisabled : true,
        DeleteOptionDisabled : true,
        DisplayLogicDisabled : false,
        DisplayLogicCondition : '',
        SurveyQuestionDisplayLogics__r : [{}],
        InitialQuestion : ''
    };
    option = {
        Id : '',
        Name : '',
        QuestionOrder__c : '',
        ChoiceOrder__c : '',
        optionIndex: '',
        iconName : ''
    };
    openDisplayLogicModal = false;
    @api questionsListClone;
    @api existingLogicsList;
    @api hasExistingLogics = false;
    @api isExistingSurvey;
    questionsToDeleteList = [];
    choicesToDeleteList = [];
    displayLogicsToDeleteList = [];
    questionsListRetrieved;
    openDeleteDisplayLogicModal = false;
    moveQuestionUp = false;
    moveQuestionDown = false;
    selectedQuestionIndexToMove;
    @api set existingQuestionsList(value) {
        this.questionsListRetrieved = [...value];
        if(this.questionsListRetrieved) {

            // Map existing survey records to the survey builder
            this.questionsList = this.questionsListRetrieved.map(question => {
                let existingQuestion = {};
                existingQuestion.Id = question.Id;
                existingQuestion.QuestionOrder__c = question.QuestionOrder__c;
                existingQuestion.QuestionName__c = question.QuestionName__c;
                existingQuestion.IsRequired__c = question.IsRequired__c;
                existingQuestion.QuestionType__c = question.QuestionType__c;
                existingQuestion.questionIndex = this.questionsListRetrieved.indexOf(question);

                if(question.SurveyQuestionChoices__r !== undefined) {
                    existingQuestion.SurveyQuestionChoices__r = JSON.parse(JSON.stringify(question.SurveyQuestionChoices__r));
                }
                
                if(question.SurveyQuestionDisplayLogics__r !== undefined) {
                    existingQuestion.SurveyQuestionDisplayLogics__r = JSON.parse(JSON.stringify(question.SurveyQuestionDisplayLogics__r));
                    existingQuestion.DisplayLogicCondition = question.SurveyQuestionDisplayLogics__r[0].QuestionDisplayLogicCondition__c;
                } else {
                    existingQuestion.SurveyQuestionDisplayLogics__r = [];
                }

                // Disable delete and display logic for first question
                if(this.questionsListRetrieved.indexOf(question) === 0) {
                    existingQuestion.DisplayLogicDisabled = true;
                    existingQuestion.DeleteQuestionDisabled = true;
                } else {
                    existingQuestion.DisplayLogicDisabled = false;
                    existingQuestion.DeleteQuestionDisabled = false;
                }
            
                // Display question type
                switch(question.QuestionType__c) {
                    case 'ShortText':
                        existingQuestion.shortText = true;
                        break;
                    case 'Boolean':
                        existingQuestion.boolean = true;
                        existingQuestion.SurveyQuestionChoices__r.forEach(choice => {
                            switch(choice.Name) {
                                case 'Like':
                                    this.assignIconName(choice, 'utility:like', existingQuestion.QuestionOrder__c);
                                    existingQuestion.RatingQuestionTypeIconPair = 'Like or Dislike';
                                    break;
                                case 'Dislike':
                                    this.assignIconName(choice, 'utility:dislike', existingQuestion.QuestionOrder__c);
                                    break;
                                case 'Happy':
                                    this.assignIconName(choice, 'utility:smiley_and_people', existingQuestion.QuestionOrder__c);
                                    existingQuestion.RatingQuestionTypeIconPair = 'Happy or Unhappy';
                                    break;
                                case 'Unhappy':
                                    this.assignIconName(choice, 'utility:sentiment_negative', existingQuestion.QuestionOrder__c);
                                    break;
                                case 'Yes':
                                    this.assignIconName(choice, 'utility:check', existingQuestion.QuestionOrder__c);
                                    existingQuestion.RatingQuestionTypeIconPair = 'Yes or No';
                                    break;
                                case 'No':
                                    this.assignIconName(choice, 'utility:close', existingQuestion.QuestionOrder__c);
                                    break;
                            }
                        });
                        break;
                    case 'Rating':
                        existingQuestion.rating = true;
                        existingQuestion.SurveyQuestionChoices__r.forEach(choice => {
                            this.assignOptionIndex(choice, existingQuestion.SurveyQuestionChoices__r.indexOf(choice), existingQuestion.QuestionOrder__c);
                        })
                        break;
                    case 'RadioButton':
                        existingQuestion.radioButton = true;
                        existingQuestion.SurveyQuestionChoices__r.forEach(choice => {
                            this.assignOptionIndex(choice, existingQuestion.SurveyQuestionChoices__r.indexOf(choice), existingQuestion.QuestionOrder__c);
                        })
                        break;
                    case 'MultiSelectPicklist':
                        existingQuestion.multiSelectPicklist = true;
                        existingQuestion.SurveyQuestionChoices__r.forEach(choice => {
                            this.assignOptionIndex(choice, existingQuestion.SurveyQuestionChoices__r.indexOf(choice), existingQuestion.QuestionOrder__c);
                        })
                        break;
                }                
                return existingQuestion;
            });

            if(this.questionsList.length > 0) {
                this.questionIndex = this.questionsList.length;

                this.questionsList.forEach(existingQuestion => {
                    if(existingQuestion.SurveyQuestionDisplayLogics__r !== undefined) {
                        existingQuestion.SurveyQuestionDisplayLogics__r.forEach(existingLogic => {
                            var displayLogicBasisQuestion = this.questionsList.find(question => existingLogic.QuestionName__c == question.QuestionName__c);
                            
                            // Map survey question choices as options for responses in display logic
                            existingLogic.ResponseOptions = displayLogicBasisQuestion.SurveyQuestionChoices__r.map(choice => {
                                let response = {};
                                response.label = choice.Name;
                                response.value = choice.Name;
                                return response;
                            })
                            
                            // Get and assign the index of response from the list as basis for dynamically updating of response in display logic when icon pair changes
                            for(let i = 0; i < existingLogic.ResponseOptions.length; i++) {
                                if(existingLogic.ResponseOptions[i].value == existingLogic.Response__c) {
                                    Object.defineProperty(existingLogic, 'ResponseIndex', {value : i, writable : true});
                                }
                            }
                        })
                    }
                })
            }
        } 
    };

    get existingQuestionsList() {
        return this.questionsListRetrieved;
    }

    handleSelectQuestionType(event) {
        this.handleAddQuestion(event.currentTarget.name);
        this.template.querySelector('[data-id="questionTypesPanel"]').classList.add('slds-hide');
    }

    handleClickAddQuestion() {
        this.template.querySelector('[data-id="questionTypesPanel"]').classList.remove('slds-hide');
    }

    // Adds 'iconName' property to existing Boolean choices
    assignIconName(object, iconName, questionOrder) { 
        return Object.defineProperties(object, {'iconName' : {value : iconName, writable : true}, 'QuestionOrder__c' : {value: questionOrder, writable : true}});
    }

    assignOptionIndex(object, optionIndex, questionOrder) {
        return Object.defineProperties(object, {'optionIndex' : {value : optionIndex, writable : true}, 'QuestionOrder__c' : {value: questionOrder, writable : true}});
    }

    // Icon pair options
    iconPairs = [{label : '👍 👎 Like or Dislike', value : 'Like or Dislike'},
                {label : '🙂 🙁 Happy or Unhappy', value : 'Happy or Unhappy'},
                {label : '✔️ ❌ Yes or No', value : 'Yes or No'}];

    @wire(getObjectInfo, {objectApiName: SURVEYQUESTION_OBJECT})
    surveyQuestionInfo;

    // Retrieves the picklist values for the question type field
    @wire(getPicklistValues, {recordTypeId: '$surveyQuestionInfo.data.defaultRecordTypeId', fieldApiName: QUESTIONTYPE_FIELD})
    wiredQuestionTypes({error, data}) {
        if(data) {
            this.questionTypes = data.values.map(type => {
                return {
                    label: `${type.label}`,
                    value: `${type.value}`
                };
            });
        } else if (error) {
            console.log('wiredQuestionTypes error: ' + JSON.stringify(error));
        }
    };

    handleOptionTypeChange(questionType, newQuestion) {
        var defaultRatingScale = [{Id : '', Name : '1', ChoiceOrder__c : 1, QuestionOrder__c : newQuestion.QuestionOrder__c}, 
                                {Id : '', Name : '2', ChoiceOrder__c : 2, QuestionOrder__c : newQuestion.QuestionOrder__c},
                                {Id : '', Name : '3', ChoiceOrder__c : 3, QuestionOrder__c : newQuestion.QuestionOrder__c},
                                {Id : '', Name : '4', ChoiceOrder__c : 4, QuestionOrder__c : newQuestion.QuestionOrder__c},
                                {Id : '', Name : '5', ChoiceOrder__c : 5, QuestionOrder__c : newQuestion.QuestionOrder__c}];
        var defaultBooleanOptions = [{Id : '', Name : 'Like', iconName : 'utility:like', ChoiceOrder__c : 1, QuestionOrder__c : newQuestion.QuestionOrder__c},
                                    {Id : '', Name : 'Dislike', iconName : 'utility:dislike', ChoiceOrder__c : 2, QuestionOrder__c : newQuestion.QuestionOrder__c}];

        // Show/Hide Question Type depending on selected Option Type
        switch(questionType) {
            case 'ShortText': // Active
                newQuestion.shortText = true;
                newQuestion.freeText = false;
                newQuestion.multiSelectPicklist = false;
                newQuestion.radioButton = false;
                newQuestion.dropDown = false;
                newQuestion.boolean = false;
                newQuestion.rating = false;
                break;
            case 'FreeText':
                newQuestion.shortText = false;
                newQuestion.freeText = true;
                newQuestion.multiSelectPicklist = false;
                newQuestion.radioButton = false;
                newQuestion.dropDown = false;
                newQuestion.boolean = false;
                newQuestion.rating = false;
                break;
            case 'MultiSelectPicklist': // Active
                newQuestion.shortText = false;
                newQuestion.freeText = false;
                newQuestion.multiSelectPicklist = true;
                newQuestion.radioButton = false;
                newQuestion.dropDown = false;
                newQuestion.boolean = false;
                newQuestion.rating = false;
                break;
            case 'RadioButton':
                newQuestion.shortText = false;
                newQuestion.freeText = false;
                newQuestion.multiSelectPicklist = false;
                newQuestion.radioButton = true;
                newQuestion.dropDown = false;
                newQuestion.boolean = false;
                newQuestion.rating = false;
                break;
            case 'DropDown':
                newQuestion.shortText = false;
                newQuestion.freeText = false;
                newQuestion.multiSelectPicklist = false;
                newQuestion.radioButton = false;
                newQuestion.dropDown = true;
                newQuestion.boolean = false;
                newQuestion.rating = false;
                break;
            case 'Boolean': // Active
                newQuestion.SurveyQuestionChoices__r = defaultBooleanOptions;
                newQuestion.shortText = false;
                newQuestion.freeText = false;
                newQuestion.multiSelectPicklist = false;
                newQuestion.radioButton = false;
                newQuestion.dropDown = false;
                newQuestion.boolean = true;
                newQuestion.rating = false;
                break;
            case 'Rating': // Active
                newQuestion.SurveyQuestionChoices__r = defaultRatingScale;
                newQuestion.shortText = false;
                newQuestion.freeText = false;
                newQuestion.multiSelectPicklist = false;
                newQuestion.radioButton = false;
                newQuestion.dropDown = false;
                newQuestion.boolean = false;
                newQuestion.rating = true;
                break;
        }
    }

    // Handles the deletion of option 
    handleDeleteOption(event) {
        var selectedRow = event.currentTarget.dataset.id;
        var questionIndex = event.target.dataset.question;
        var currentQuestion = this.questionsList[questionIndex];
        var choiceToDelete = currentQuestion.SurveyQuestionChoices__r[selectedRow];

        // Remove option from list
        if(currentQuestion.SurveyQuestionChoices__r.length > 1) {
            if(choiceToDelete.Id.length > 0) {
                this.choicesToDeleteList.push(choiceToDelete);
            }

            currentQuestion.SurveyQuestionChoices__r.splice(selectedRow, 1);

            // Disable option delete button
            if(currentQuestion.SurveyQuestionChoices__r.length == 1) {
                currentQuestion.DeleteOptionDisabled = true;
                this.addEmptyRow = true;
            }

            // Decrease Row Number of succeeding option/s
            currentQuestion.SurveyQuestionChoices__r.forEach(option => {
                if(option.ChoiceOrder__c > selectedRow) {
                    option.ChoiceOrder__c--;
                }
            })
        }
        
        this.addEmptyRow = true;
    }

    handleMultipleOptionChange(event) {
        var selectedRow = event.currentTarget.dataset.id;
        var questionIndex = event.target.dataset.question;
        this.questionsList[questionIndex].SurveyQuestionChoices__r[selectedRow].Name = event.detail.value;
    }

    handleOptionOnBlur(event) { 
        
        var selectedRow = event.currentTarget.dataset.id; 
        var questionIndex = Number(event.target.dataset.question); 
        var currentQuestion = this.questionsList[questionIndex];
        var lastOptionIndex = currentQuestion.SurveyQuestionChoices__r.length - 1; 

        // Verify if current row is empty or not for automatic adding of new empty row
        if(currentQuestion.SurveyQuestionChoices__r[selectedRow].Name.trim().length == 0 ||  
        currentQuestion.SurveyQuestionChoices__r[lastOptionIndex].Name.trim().length == 0) { 
            this.addEmptyRow = false;
        } else {
            this.addEmptyRow = true;
        }
        
        // Add empty row for option
        if(this.addEmptyRow) {
            let newOption = {Id : '', Name : '', ChoiceOrder__c : Number(currentQuestion.SurveyQuestionChoices__r[selectedRow].ChoiceOrder__c) + 1, QuestionOrder__c : questionIndex + 1};
            currentQuestion.SurveyQuestionChoices__r = currentQuestion.SurveyQuestionChoices__r.concat(newOption);
            this.addEmptyRow = false;
        }

        // Enable option delete button
        if(currentQuestion.SurveyQuestionChoices__r.length > 1) {
            currentQuestion.DeleteOptionDisabled = false;
        }
    }

    handleDecreaseRatingScale(event) {
        var questionIndex = event.target.dataset.question;
        var currentQuestionChoices = this.questionsList[questionIndex].SurveyQuestionChoices__r;

        if(!this.isExistingSurvey) {
            // Remove option from list
            if(currentQuestionChoices.length > 5) {
                currentQuestionChoices.pop();
            }
        } else {
            if(currentQuestionChoices.length > 5) {
                var lastChoice = currentQuestionChoices[currentQuestionChoices.length - 1];
                if(lastChoice.Id.length > 0) {
                    this.choicesToDeleteList.push(lastChoice);
                }
                currentQuestionChoices.pop();
            }
        }
    }

    handleIncreaseRatingScale(event) {
        var questionIndex = Number(event.target.dataset.question);
        var currentQuestion = this.questionsList[questionIndex];
        var currentQuestionChoices = this.questionsList[questionIndex].SurveyQuestionChoices__r;
        if(currentQuestionChoices.length < 10) {
            var previousOption = this.questionsList[questionIndex].SurveyQuestionChoices__r[this.questionsList[questionIndex].SurveyQuestionChoices__r.length - 1];
            let newOption = {Id : '', Name : previousOption.ChoiceOrder__c + 1, ChoiceOrder__c : previousOption.ChoiceOrder__c + 1, QuestionOrder__c : questionIndex + 1};
            currentQuestion.SurveyQuestionChoices__r = currentQuestion.SurveyQuestionChoices__r.concat(newOption);
        }
    }

    handleSelectIconPair(event) {
        var questionIndex = Number(event.target.dataset.question);
        var currentQuestion = this.questionsList[questionIndex];
        currentQuestion.RatingQuestionTypeIconPair = event.detail.value;
        var questionOrder = questionIndex + 1;
        if(!this.isExistingSurvey) {
            currentQuestion.SurveyQuestionChoices__r.length = 0;
            currentQuestion.SurveyQuestionChoices__r = [...currentQuestion.SurveyQuestionChoices__r, ...this.selectIconPair(event.detail.value, questionOrder)];
            
        } else {
            // Update Name and Icon of choices
            currentQuestion.SurveyQuestionChoices__r.forEach(oldChoice => {
                this.selectIconPair(event.detail.value, questionOrder).forEach(newChoice => {
                    if(oldChoice.ChoiceOrder__c == newChoice.ChoiceOrder__c) {
                        oldChoice.Name = newChoice.Name;
                        oldChoice.iconName = newChoice.iconName;
                    }
                })
            })
        }
        
        // Update the response options for display logic referencing the updated question
        this.questionsList.forEach(question => {
            if(question.SurveyQuestionDisplayLogics__r !== undefined) {
                question.SurveyQuestionDisplayLogics__r.forEach(logic => {
                    if(logic.QuestionName__c == currentQuestion.QuestionName__c) {
                        // Map survey question choices to options for responses
                        logic.ResponseOptions = currentQuestion.SurveyQuestionChoices__r.map(choice => {
                            let response = {};
                            response.label = choice.Name;
                            response.value = choice.Name;
                            return response;
                        })
                        logic.Response__c = logic.ResponseOptions[logic.ResponseIndex].value;
                    }
                })
            }
        })
    }

    selectIconPair(ratingQuestionTypeIconPair, questionOrder) {
        var options = [];
        var option1;
        var option2;

        // Display icon and label selected
        switch(ratingQuestionTypeIconPair) {
            case 'Like or Dislike':
                option1 = {Id : '', Name : 'Like', iconName : 'utility:like', ChoiceOrder__c : 1, QuestionOrder__c : questionOrder};
                option2 = {Id : '', Name : 'Dislike', iconName : 'utility:dislike', ChoiceOrder__c : 2, QuestionOrder__c : questionOrder};
                options.push(option1, option2);
                break;
            case 'Happy or Unhappy':
                option1 = {Id : '', Name : 'Happy', iconName : 'utility:smiley_and_people', ChoiceOrder__c : 1, QuestionOrder__c : questionOrder};
                option2 = {Id : '', Name : 'Unhappy', iconName : 'utility:sentiment_negative', ChoiceOrder__c : 2, QuestionOrder__c : questionOrder};
                options.push(option1, option2);
                break;
            case 'Yes or No':
                option1 = {Id : '', Name : 'Yes', iconName : 'utility:check', ChoiceOrder__c : 1, QuestionOrder__c : questionOrder};
                option2 = {Id : '', Name : 'No', iconName : 'utility:close', ChoiceOrder__c : 2, QuestionOrder__c : questionOrder};
                options.push(option1, option2);
                break;
        }

        return options;
    }

    handleQuestionChange(event) {
        var selectedRow = event.currentTarget.dataset.id;
        this.questionsList[selectedRow].QuestionName__c = event.detail.value; 
    }

    // Saves the initial question that is used in updating the existing question name of display logic
    handleInitialQuestion(event) {
        var selectedRow = event.currentTarget.dataset.id;
        this.questionsList[selectedRow].InitialQuestion = event.target.value;
    }

    handleAddQuestion(questionType) {
        let newQuestion;
        if(this.questionIndex == 0) {
            newQuestion = {Id : '', QuestionName__c : '', QuestionOrder__c : this.questionsList.length + 1, questionIndex : this.questionIndex,  
                                IsRequired__c : false, shortText : false, freeText : false, multiSelectPicklist : false, radioButton : false, 
                                dropDown : false, boolean : false, rating : false, QuestionType__c : questionType, InitialQuestion : '',
                                SurveyQuestionChoices__r : [{Name : '', ChoiceOrder__c : 1, QuestionOrder__c : this.questionIndex + 1}], 
                                DeleteQuestionDisabled : true, DeleteOptionDisabled : true, DisplayLogicDisabled : true, SurveyQuestionDisplayLogics__r : []};
        } else {
            newQuestion = {Id : '', QuestionName__c : '', QuestionOrder__c : this.questionsList.length + 1, questionIndex : this.questionIndex,  
                                IsRequired__c : false, shortText : false, freeText : false, multiSelectPicklist : false, radioButton : false, 
                                dropDown : false, boolean : false, rating : false, QuestionType__c : questionType, InitialQuestion : '',
                                SurveyQuestionChoices__r : [{Name : '', ChoiceOrder__c : 1, QuestionOrder__c : this.questionIndex + 1}], 
                                DeleteQuestionDisabled : false, DeleteOptionDisabled : true, DisplayLogicDisabled : false, SurveyQuestionDisplayLogics__r : []};
        }

        this.questionIndex++;
        this.handleOptionTypeChange(questionType, newQuestion);
        this.questionsList.push(newQuestion);
    }

    // Handles the toggle for required property of question
    handleRequiredToggleChange(event) {
        var selectedRow = event.currentTarget.dataset.id;
        this.questionsList[selectedRow].IsRequired__c = !this.questionsList[selectedRow].IsRequired__c;
    }

    // Handles the deletion of question
    handleDeleteQuestion(event) {
        var selectedRow = Number(event.currentTarget.dataset.id);

        // Remove question from list if questions are more than 1
        if(this.questionsList.length > 1) {

            // If question exists on database, add to list of questions for deletion 
            if(this.isExistingSurvey && this.questionsList[selectedRow].Id.length > 0) {
                this.questionsToDeleteList.push(this.questionsList[selectedRow]);
                // If question has existing choices on database, add to list of choices for deletion 
                if(this.questionsList[selectedRow].SurveyQuestionChoices__r !== undefined) {
                    this.choicesToDeleteList = [...this.choicesToDeleteList, ...this.questionsList[selectedRow].SurveyQuestionChoices__r];
                }

                // If question has existing display logic on database, add to list of display logics for deletion 
                if(this.questionsList[selectedRow].SurveyQuestionDisplayLogics__r !== undefined) { 
                    this.displayLogicsToDeleteList = [...this.displayLogicsToDeleteList, ...this.questionsList[selectedRow].SurveyQuestionDisplayLogics__r];
                }
            }

            // Remove selected question from list
            this.questionsList.splice(selectedRow, 1);

            // Enable delete question button
            if(this.questionsList.length == 1) {
                this.questionsList[0].DeleteQuestionDisabled = true;
            }

            // Decrease Row Number of succeeding question/s
            this.questionsList.forEach(question => {
                if(question.QuestionOrder__c > selectedRow) {
                    question.QuestionOrder__c--;
                    question.questionIndex--;
                    question.SurveyQuestionChoices__r.forEach(option => {
                        option.QuestionOrder__c = question.QuestionOrder__c;
                    })
                }
            })

            this.questionIndex--;
        }
    }

    

    handleValidateDisplayLogic(event) {
        var selectedRow = Number(event.currentTarget.dataset.id);
        var button = event.currentTarget.name;
        var surveyQuestionDisplayLogics = this.questionsList[selectedRow].SurveyQuestionDisplayLogics__r;
        this.selectedQuestionIndexToMove = selectedRow;

        // Check if question will be moved up and there are no existing display logic/s and question index > 0
        if(button == 'up' && surveyQuestionDisplayLogics.length === 0 && selectedRow > 0) {
            this.moveQuestionUp = true;
            this.moveQuestionDown = false;
            this.moveQuestion(this.questionsList, 'up', selectedRow, (selectedRow - 1));
        } 
        // Check if question will be moved up and there are existing display logic/s and question index > 0
        else if(button == 'up' && surveyQuestionDisplayLogics.length > 0 && selectedRow > 0) {
            this.openDeleteDisplayLogicModal = true;
            this.moveQuestionUp = true;
            this.moveQuestionDown = false;
        } 
        // Check if question will be moved down and there are no existing display logic/s and question is last
        else if(button == 'down' && surveyQuestionDisplayLogics.length === 0 && selectedRow != (this.questionsList.length - 1) && this.questionsList.length > 1) {
            this.moveQuestionDown = true;
            this.moveQuestionUp = false;
            this.moveQuestion(this.questionsList, 'down', selectedRow, (selectedRow + 1));
        }
        // Check if question will be moved down and there are existing display logic/s and question is last
        else if (button == 'down' && surveyQuestionDisplayLogics.length > 0 && selectedRow != (this.questionsList.length - 1) && this.questionsList.length > 1) {
            this.openDeleteDisplayLogicModal = true;
            this.moveQuestionDown = true;
            this.moveQuestionUp = false;
        }
    }

    moveQuestion(surveyQuestions, direction, oldIndex, newIndex) {
        let oldIndexSurveyQuestions = surveyQuestions[oldIndex];
        let oldIndexSurveyQuestionChoices = surveyQuestions[oldIndex].SurveyQuestionChoices__r;
        let newIndexSurveyQuestions = surveyQuestions[newIndex];
        let newIndexSurveyQuestionChoices = surveyQuestions[newIndex].SurveyQuestionChoices__r;

        if(direction == 'up') {
            // Update question that will move up an index
            oldIndexSurveyQuestions.QuestionOrder__c = oldIndexSurveyQuestions.QuestionOrder__c++;
            oldIndexSurveyQuestions.questionIndex = oldIndexSurveyQuestions.questionIndex++;
            if(oldIndexSurveyQuestionChoices.length > 0) {
                oldIndexSurveyQuestionChoices.forEach(choice => {
                    choice.QuestionOrder__c--;
                })
            }

            // Update question that will move down an index
            newIndexSurveyQuestions.QuestionOrder__c = oldIndexSurveyQuestions.QuestionOrder__c--;
            newIndexSurveyQuestions.questionIndex = oldIndexSurveyQuestions.questionIndex--;
            if(newIndexSurveyQuestionChoices.length > 0) {
                newIndexSurveyQuestionChoices.forEach(choice => {
                    choice.QuestionOrder__c++;
                })
            }

        } else {
            // Update question that will move down an index
            oldIndexSurveyQuestions.QuestionOrder__c = oldIndexSurveyQuestions.QuestionOrder__c--;
            oldIndexSurveyQuestions.questionIndex = oldIndexSurveyQuestions.questionIndex--;
            if(oldIndexSurveyQuestionChoices.length > 0) {
                oldIndexSurveyQuestionChoices.forEach(choice => {
                    choice.QuestionOrder__c++;
                })
            }

            // Update question that will move up an index
            newIndexSurveyQuestions.QuestionOrder__c = oldIndexSurveyQuestions.QuestionOrder__c++;
            newIndexSurveyQuestions.questionIndex = oldIndexSurveyQuestions.questionIndex++;
            if(newIndexSurveyQuestionChoices.length > 0) {
                newIndexSurveyQuestionChoices.forEach(choice => {
                    choice.QuestionOrder__c--;
                })
            }
        }

        if(newIndex >= surveyQuestions.length) {
            var i = newIndex - surveyQuestions.length + 1;
            while(i--) {
                surveyQuestions.push(undefined);
            }
        }

        surveyQuestions.splice(newIndex, 0, surveyQuestions.splice(oldIndex, 1)[0]);

        this.questionsList.forEach(question => {
            if(question.questionIndex != 0) {
                question.DeleteQuestionDisabled = false;
                question.DisplayLogicDisabled = false;
            } else {
                question.DeleteQuestionDisabled = true;
                question.DisplayLogicDisabled = true;
            }
        })
    }

    handleOpenDisplayLogicModal(event) {
        this.openDisplayLogicModal = true;
        this.questionsListClone = [...this.questionsList];
        this.selectedQuestionIndex = Number(event.currentTarget.dataset.id);
        this.questionsListClone.splice(this.selectedQuestionIndex, (this.questionsListClone.length - this.selectedQuestionIndex));

        if(this.questionsList[this.selectedQuestionIndex].SurveyQuestionDisplayLogics__r.length == 0) {
            this.hasExistingLogics = false;
        } else {
            this.hasExistingLogics = true;
            this.existingLogicsList = this.questionsList[this.selectedQuestionIndex].SurveyQuestionDisplayLogics__r;

            // Update QuestionName of display logic if question referenced by the display logic has been updated
            this.questionsList.forEach(question => {
                this.existingLogicsList.forEach(logic => {
                    if(logic.QuestionName__c == question.InitialQuestion && question.QuestionName__c != question.InitialQuestion) {
                        logic.QuestionName__c = question.QuestionName__c;
                    }
                })
            })
            this.questionDisplayLogicCondition = this.questionsList[this.selectedQuestionIndex].DisplayLogicCondition;
        }
    }

    handleCloseDisplayLogicModal(event) {
        this.openDisplayLogicModal = event.detail;
    }

    // Handles closing of display logic modal and retrieving of question display logics
    handleLogicsList(event) {
        this.openDisplayLogicModal = event.detail;
        this.questionsList[this.selectedQuestionIndex].SurveyQuestionDisplayLogics__r = this.template.querySelector('c-survey-display-question-logic-modal').passLogicsList();
        this.questionsList[this.selectedQuestionIndex].DisplayLogicCondition = this.template.querySelector('c-survey-display-question-logic-modal').passLogicCondition();
        this.displayLogicsToDeleteList = [...this.displayLogicsToDeleteList, ...this.template.querySelector('c-survey-display-question-logic-modal').passLogicsToDeleteList()]; 
    }

    // Handles the closing of display logic deletion warning modal and deleting of existing display logic when user moves the question up/down
    handleDeleteQuestionDisplayLogic() {
        this.openDeleteDisplayLogicModal = false;
        if(!this.isExistingSurvey) {
            this.questionsList[this.selectedQuestionIndexToMove].SurveyQuestionDisplayLogics__r.length = 0;
        } else {
            this.displayLogicsToDeleteList = [...this.displayLogicsToDeleteList, ...this.questionsList[this.selectedQuestionIndexToMove].SurveyQuestionDisplayLogics__r];
            this.questionsList[this.selectedQuestionIndexToMove].SurveyQuestionDisplayLogics__r = [];
        }
        
        if(this.moveQuestionUp) {
            this.moveQuestion(this.questionsList, 'up', this.selectedQuestionIndexToMove, (Number(this.selectedQuestionIndexToMove) - 1));
        } else {
            this.moveQuestion(this.questionsList, 'down', this.selectedQuestionIndexToMove, (this.selectedQuestionIndexToMove + 1));
        }
    }

    // Handles the closing of display logic deletion warning modal
    handleCloseDeleteQuestionDisplayLogic() {
        this.openDeleteDisplayLogicModal = false;
    }

    // Pass questionsList to parent component
    @api passQuestionsList() {
        return this.questionsList;
    }

    // Creates list of ids
    createIdList(recordsList) {
        var idList = [];
        recordsList.forEach(record => {
            if(record.Id != undefined) {
                idList.push(record.Id);
            }
        })
        return idList;
    }

    @api passQuestionsToDelete() {
        return this.createIdList(this.questionsToDeleteList);
    }

    @api passChoicesToDelete() {
        return this.createIdList(this.choicesToDeleteList);
    }

    @api passDisplayLogicsToDelete() {
        return this.createIdList(this.displayLogicsToDeleteList);
    }
}