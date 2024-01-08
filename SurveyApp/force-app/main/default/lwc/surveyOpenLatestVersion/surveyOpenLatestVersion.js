/*
Description: Navigates to Survey Builder component from the Survey record
History:
1.0 - Christine Joy Cruz (chrcruz@deloitte.com) - 11/24/2022 - Initial version
*/

import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
export default class OpenExistingSurvey extends NavigationMixin(LightningElement) {
    @api recordId;
    @api invoke() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Survey_Builder'
            },
            state: {
                c__surveydId: this.recordId
            }
        });
        refreshApex(this.invoke);
        refreshApex(this.recordId);
        
    }
}