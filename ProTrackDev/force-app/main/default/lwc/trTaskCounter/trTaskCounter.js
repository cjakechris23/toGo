import { LightningElement, wire } from 'lwc';
import TR_TaskCounterClass from '@salesforce/apex/TR_TaskCounterClass.getTestExecutionRecord';
import TR_GetMyOwnTickets from '@salesforce/apex/TR_TaskCounterClass.getMyOwnTickets'
import currentUserId from '@salesforce/user/Id';

export default class TrTaskCounter extends LightningElement {
    taskCount;
    retestCount;
    uId = currentUserId;

    @wire(TR_TaskCounterClass, {userId :'$uId'}) 
    TestExecutionCount({data}){
        this.taskCount = data
    }

    @wire(TR_GetMyOwnTickets, {userId :'$uId'})
        TestExecutionStatus({data}){
        this.retestCount = data    
    }
}