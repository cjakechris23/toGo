import { LightningElement, track, wire, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import checkSurveyName from '@salesforce/apex/SurveyController.checkSurveyName'; 
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SurveyNewContainer extends NavigationMixin(LightningElement) {
    @track showSearchComponent = false;
    @track isModalOpen = true;
    @api surveyName;

    onChangeSurveyName(event) {
       this.surveyName = event.detail.value;
      // console.log('### Survey Name'+this.surveyName);
      // if(this.surveyName == null || this.surveyName == ''){
      //   this.showToast();  
      // }
    }
    
    showSearch() {
        // this.showSearchComponent = true;
        if(this.surveyName == null || this.surveyName == ''){
          this.showToastInvalidName();  
        }else{
          this.checkSurveyName();
        }
    }

    checkSurveyName() {
      checkSurveyName({ strSurveyName: this.surveyName })
      .then(result => {
        console.log('###Result'+JSON.stringify(result));
            
          if(result == false) {
            this.showSearchComponent = true;  
            this.isModalOpen = false;                
          }
          else {
            let surveyNameClass = this.template.querySelector(".surveyNameClass");
            this.showToastSurveyNameAlreadyExist();
            this.isModalOpen = true;
          }
      })
      .catch(error => {
          this.error = error;
      });
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

    showToastSurveyNameAlreadyExist() {
      const event = new ShowToastEvent({
          title: 'Message',
          message: 'Survey Name is already existing. Please enter a new one.',
          variant: 'error',
          mode: 'dismissable'
      });
      this.dispatchEvent(event);
  }

  showToastInvalidName() {
    const event = new ShowToastEvent({
        title: 'Message',
        message: 'Survey name cannot be blank',
        variant: 'error',
        mode: 'dismissable'
    });
    this.dispatchEvent(event);
}
}