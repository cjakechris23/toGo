import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class SurveyNavigateBuilder extends NavigationMixin(LightningElement) {

    connectedCallback() {
        // Navigate to the Survey Builder page
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Test_App'
            },
        });
    }
}