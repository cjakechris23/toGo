import { LightningElement, api } from 'lwc';
import getSurvey from '@salesforce/apex/SurveyController.getSurvey';
import getSurveyQuestions from '@salesforce/apex/SurveyController.getSurveyQuestions';

export default class OpenExistingSurvey extends LightningElement {
    openExistingSurvey = false;
    @api isExistingSurvey = false;
    @api recordId;
    @api existingSurveyRecord;
    latestVersionId;
    @api questionsList;
    @api invoke() {
        // Retrieve existing survey record
        getSurvey({recordId : this.recordId})
        .then(result => {
            this.isExistingSurvey = true;
            this.existingSurveyRecord = result;
            this.latestVersionId = result.LatestVersionId__c;

            // Retrieve survey questions, survey question choices, and survey question display logics
            getSurveyQuestions({surveyVersionId : this.latestVersionId})
            .then(result => {
                this.openExistingSurvey = true;
                this.questionsList = result;
            }) .catch(error => {
                console.log('Error: ' + JSON.stringify(error));
            })
        }).catch(error => {
            console.log('Error: ' + JSON.stringify(error));
        })
    }
}