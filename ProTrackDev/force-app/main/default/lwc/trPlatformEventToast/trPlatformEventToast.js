/*
*	Author:- Rahul Malhotra
*	Description:- Platform Event Toast
*	Created:- 11/04/2020
*	Last Updated:- 12/04/2020
*	Code Origin:- SFDCStop (https://www.sfdcstop.com/)
*/
import { LightningElement, api } from 'lwc';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import currentUserId from '@salesforce/user/Id';

export default class PlatformEventToast extends LightningElement {

    @api toastKeys;
    @api toastTitle;
    @api toastMessage;
    @api toastVariant;
    @api toastMode;
    @api runInSystemMode;
    channelName = '/event/TR_ToastEvent__e';
    subscription = {};

    connectedCallback() {
        this.toastKeys = this.toastKeys ? this.toastKeys.split(',').map(key => key.trim()) : '';
        const ci = this;
        const toastCallback = function(response) {
            let toastData = response['data']['payload'];
            if(
                toastData &&
                toastData['TR_Key__c'] &&
                ci.toastKeys.includes(toastData['TR_Key__c']) &&
                (
                    ci.runInSystemMode ||
                    (toastData['CreatedById'] === currentUserId)
                )
            ) {
                const toastEvent = new ShowToastEvent({
                    title: toastData['TR_Title__c'] ? toastData['TR_Title__c'] : ci.toastTitle,
                    message: toastData['TR_Message__c'] ? toastData['TR_Message__c'] : ci.toastMessage,
                    variant: toastData['TR_Variant__c'] ? toastData['TR_Variant__c'] : ci.toastVariant,
                    mode: toastData['TR_Mode__c'] ? toastData['TR_Mode__c'] : ci.toastMode
                });
                ci.dispatchEvent(toastEvent);
            }
        }
        subscribe(this.channelName, -1, toastCallback).then(response => {
            console.log('Subscribed to Platform Event Toast');
            this.subscription = response;
        });
        onError(error => {
            console.log('Error in Platform Event Toast');
            console.log(error);
        });
    }

    disconnectedCallback() {
        unsubscribe(this.subscription, response => {
            console.log('Un-Subscribed from Platform Event Toast');
            console.log(response);
        });
    }
}