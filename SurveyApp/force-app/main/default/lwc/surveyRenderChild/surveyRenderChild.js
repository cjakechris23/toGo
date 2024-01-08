/*
*********************************************************************************************************
Name: suveyRenderParent.html
==========================================================================================================
Purpose: suveyRenderParent html component
==========================================================================================================
History

VERSION    AUTHOR                                               DATE                DESCRIPTION
1.0        Kenneth Kim (kennkim@deloitte.com)            		02/07/2023          Initial version
1.1        Kenneth Kim (kennkim@deloitte.com)            		02/10/2023          Added getters and handlers methods for elements:boolean question and star rating question
1.1        Kenneth Kim (kennkim@deloitte.com)            		02/16/2023          Added method: sendAnswerToParent
1.2        Kenneth Kim (kennkim@deloitte.com)            		02/20/2023          Updated sendAnswerToParent payload and input parameters
1.3        Kenneth Kim (kennkim@deloitte.com)            		02/21/2023          Added method: handleValidation
1.4        Kenneth Kim (kennkim@deloitte.com)            		02/22/2023          Updated method: handleValidation, sendAnswerToParent
1.5        Kenneth Kim (kennkim@deloitte.com)            		02/23/2023          Updated method: sendAnswerToParent
1.6        Kenneth Kim (kennkim@deloitte.com)            		02/23/2023          Added methods for getting/setting the choice Id of the selected answer
*********************************************************************************************************
*/


import { LightningElement, api, track } from 'lwc';

export default class SurveyRenderChild extends LightningElement {
    @api questionDetails

    // Boolean flags for determining the type of question
    isShortTextQuestion = false;
    isSingleSelectionQuestion = false;
    isMultipleSelectionQuestion = false;
    isbooleanQuestion = false;
    isStarRatingQuestion = false;
    
    //default button variant for the 2 boolean bottons (when nothing is clicked yet)
    trueButtonVariant = "neutral";   
    falseButtonVariant = "neutral"; 

    // Fields to be sent to the parent
    isAnswerValid = true;
    answerValue = null;
    answerId = null;

    connectedCallback(){

        // Determines the type of question to render
        if(this.questionDetails){
            switch(this.questionDetails.QuestionType__c){

                case 'ShortText':
                    this.isShortTextQuestion = true;
                    break;

                case 'RadioButton':
                    this.isSingleSelectionQuestion = true;
                    break;

                case 'MultiSelectPicklist':
                    this.isMultipleSelectionQuestion = true;
                    break;

                case 'Boolean':
                    this.isbooleanQuestion = true;
                    break;

                case 'Rating':
                    this.isStarRatingQuestion = true;
                    this.sortStarRating();
                    break;

                default:

            }
        }
    }

    // ----------------------------------------- QUESTION RENDER FUNCTIONS ----------------------------------------- //

    // Getter for the Single / multiple selection options (for radio group and checkbox group)
    // Label = Name, Value = 
    get selectionOptions() {
        return this.questionDetails.SurveyQuestionChoices__r.map(item => {
            return {label: item.Name, value: item.Id};
        });
    }

    // Getter for the label of the true boolean button 
    get booleanButtonLabelTrue() {
        return this.questionDetails.SurveyQuestionChoices__r[0].Name;
    }

    // Getter for the label of the false boolean button 
    get booleanButtonLabelFalse() {
        return this.questionDetails.SurveyQuestionChoices__r[1].Name;
    }
    
    // Getter for the icon name of the true boolean button 
    // TODO: Happy/Unhappy is not saving correctly in survey builder, it is being saved as Yes/No (BUG?)
    get booleanButtonIconTrue() {
        switch(this.questionDetails.SurveyQuestionChoices__r[0].Name){
            case 'Like':
                return 'utility:like';

            case 'Happy':
                return 'utility:smiley_and_people';
                   
            case 'Yes':
                return 'utility:check';   
            
            default:
                return;
        }
    }

    // Getter for the icon name of the false boolean button 
    // TODO: Happy/Unhappy is not saving correctly in survey builder, it is being saved as Yes/No (BUG?)
    get booleanButtonIconFalse() {
        switch(this.questionDetails.SurveyQuestionChoices__r[1].Name){
            case 'Dislike':
                return 'utility:dislike';

            case 'Unhappy':
                return 'utility:sentiment_negative';
                   
            case 'No':
                return 'utility:close';   
            
            default:
                return;
        }
    }

    // Getter functions for adding the choice id as an attribute to the boolean button (true)
    get booleanButtonButtonTrueChoiceId(){
        return this.questionDetails.SurveyQuestionChoices__r[0].Id
    }

        // Getter functions for adding the choice id as an attribute to the boolean button (false)
    get booleanButtonButtonFalseChoiceId(){
        return this.questionDetails.SurveyQuestionChoices__r[1].Id
    }
    
    // Initialize star rating element values - Convert list to array and sort by name in decending order (important) 
    // Add a "starNumber" property for label values
    @track
    sortedStarRating = [];

    // Method for initializing star rating component.
    sortStarRating(){

        // Convert list to array to perform sort
        for(let item in this.questionDetails.SurveyQuestionChoices__r){
            
            // this condition is required to prevent moving forward to prototype chain
            if(this.questionDetails.SurveyQuestionChoices__r.hasOwnProperty(item)){
                this.sortedStarRating.push(this.questionDetails.SurveyQuestionChoices__r[item]);
            } 
        }
        
        // Sort array by name
        this.sortedStarRating.sort((a, b)=> { return b.Name - a.Name;})

        // Add a "starNumber" property on each of the array elements for the label value (ex. star5, star4, star3...)
        this.sortedStarRating = this.sortedStarRating.map(item => {
            let starNumber = `star${item.Name}`;
            return  {...item, starNumber}
        })

    }

    // ----------------------------------------- ANSWER HANDLER FUNCTIONS ----------------------------------------- //
    
    // Onchange handler for the text input
    handleChangeTextInput(event){
        this.answerValue = event.target.value;
        this.answerId = this.questionDetails.SurveyQuestionChoices__r[0].Id;
        this.sendAnswerToParent();
    }

    // Onchange handler for the single selection (radio group)
    handleChangeSingleSelection(event){
        console.log("Single-select value: " +  event.target.value);
        console.log(">> " + this.questionDetails.SurveyQuestionChoices__r.find(obj => obj.Id === event.target.value).Name);
        //this.answerValue = JSON.stringify(event.target.value).replace(/["]/g, '');

        this.answerValue = this.questionDetails.SurveyQuestionChoices__r.find(obj => obj.Id === event.target.value).Name;
        this.answerId = event.target.value; 
        this.sendAnswerToParent();
    }

    // Onchange handler for the multiple selection (checkbox group)
    multiSelectValue = [];
    handleChangeMultipleSelection(event) {
        this.multiSelectValue = event.detail.value;
        
        // Remove extra characters to make selection comma separated
        //this.multiSelectValue = JSON.stringify(this.multiSelectValue).replace(/["]/g, '');
        //this.answerValue = this.multiSelectValue.replace(/[\[\]']+/g,'');
        this.answerId = this.multiSelectValue;
        let newArray = Array.from([...this.answerId]);

        this.answerValue = [];

        for (let item of newArray){
            this.answerValue.push(this.questionDetails.SurveyQuestionChoices__r.find(obj => obj.Id == item).Name);
        }
        console.log("Multi-select values: " + this.answerId);
        console.log(">> " + this.answerValue);
        this.sendAnswerToParent();
    }



    // Onclick handler for the boolean buttons
    handleStateClick(event){
        console.log("Boolean button value: " + event.target.dataset.choiceid)

        this.answerId = event.target.dataset.choiceid;

        // Toggle between button variants based on the selected value (selected = brand, not selected = neutral)
        if(event.target.dataset.value == "true"){  
            this.answerValue = this.questionDetails.SurveyQuestionChoices__r.find(obj => obj.Id == event.target.dataset.choiceid).Name;
            event.target.variant="brand";  
            this.template.querySelector(".buttonBooleanFalse").variant="neutral"    
        }else if(event.target.dataset.value == "false"){
            this.answerValue = this.questionDetails.SurveyQuestionChoices__r.find(obj => obj.Id == event.target.dataset.choiceid).Name;
            event.target.variant="brand";  
            this.template.querySelector(".buttonBooleanTrue").variant="neutral"  
        }

       console.log(">> " + this.answerValue);
       this.sendAnswerToParent();      

    }

    // Onclick handler for the star rating elements
    handleOnRatingChange(event){

        this.answerId =  this.questionDetails.SurveyQuestionChoices__r.find(obj => obj.Name == event.target.value).Id;
        this.answerValue = event.target.value;

        console.log("Selected star rating: " + this.answerId)
        console.log(">> " + event.target.value)
        this.sendAnswerToParent();
    }

    // Method that fires an event containing the question details and answers 
    sendAnswerToParent = () => {
        console.log("sendAnswerToParent");
        this.isAnswerValid = this.handleValidation();

        if(this.answerValue == null || this.answerValue == "" || typeof this.answerValue === "undefined"){
            this.answerId = undefined;
        }

        const answerEvent = new CustomEvent("answerchange", {
            detail: {
                questionId: this.questionDetails.Id,
                questionDetails : {
                    questionId: this.questionDetails.Id,
                    questionName: this.questionDetails.Name,
                    questionType: this.questionDetails.QuestionType__c,
                    questionOrder: this.questionDetails.QuestionOrder__c,
                    isRequired : this.questionDetails.IsRequired__c,
                    answerValue: this.answerValue,
                    answerId: this.answerId,
                    isValid: this.isAnswerValid
                } 
            }
        });
        this.dispatchEvent(answerEvent);    
    }

    @api
    handleValidation(){
        
        // Check if question child is a standard lightning input. Use report validity method to show error
        if(this.isShortTextQuestion || this.isSingleSelectionQuestion || this.isMultipleSelectionQuestion){

            this.isAnswerValid = this.template.querySelector("[data-id=" + this.questionDetails.Id + "]").reportValidity();
            //console.log("Stadard element validity: Name: " + this.questionDetails.Name + " VALID?: " + this.isAnswerValid + " Value: " + this.answerValue + " ID: " + this.answerId);
        
       // Check if question child is a custom element. Show error error by setting the flag variables
       }else if(this.isbooleanQuestion || this.isStarRatingQuestion){

            this.answerValue === null && this.questionDetails.IsRequired__c ? this.isAnswerValid = false : this.isAnswerValid = true;
            //console.log("Custom element validity: Name: " + this.questionDetails.Name + " VALID?: " + this.isAnswerValid + " Value: " + this.answerValue + " ID: " + this.answerId);

        }
       return this.isAnswerValid;
    }
}