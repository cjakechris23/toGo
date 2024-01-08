import { LightningElement, track, wire } from 'lwc'; // import fetchDataHelper from './fetchDataHelper';
import getTestExecutions from '@salesforce/apex/TR_TestExecutionController.getTestExecutions';
import { NavigationMixin } from 'lightning/navigation'; // added by Johnmarc 


const columns = [
    { label: 'Test Execution Number', fieldName: 'Name', sortable: "true", type: 'text' },
    { label: 'Test Title', fieldName: 'TR_Test_Title__c', sortable: "true", type: 'text' },
    { label: 'Status', fieldName: 'TR_Status__c', sortable: "true", type: 'text'},
    { label: 'Deadline', fieldName: 'TR_Deadline__c', sortable: "true", type: 'text' },
    { label: 'Execute Now', fieldName: 'TR_Ext_Execute_Now__c', type: 'url', typeAttributes: { label: 'Execute Now' }}
];

export default class BasicDatatable extends NavigationMixin ( LightningElement ){  // added by Johnmarc  with navigationMixin
    @track data;
    @track columns = columns;
    @track sortedBy;
    @track sortDirection = 'asc';
    @track defaultSortDirection = 'asc';


    //--------------------------------------------------------
    data = [];
    error;
    totalNumberOfRows = 25; // stop the infinite load after this threshold count          
    offSetCount = 0; // offSetCount to send apex to get the subsequent result. 0 in offSetCountsignifies for the initial load of records     on component load
    loadMoreStatus;
    targetDatatable;

    connectedCallback(){
        // Get initial chunk of data with offset set at 0
        this.getTestExecutions();
    }
    //--------------------------------------------------------

    getTestExecutions() {
        getTestExecutions({offSetCount : this.offSetCount})
            .then(result => {
                result = JSON.parse(JSON.stringify(result));
                result.forEach(record => {
                    record.linkAccount = '/' + record.id;
                });
                this.data = [...this.data, ...result];
                this.error = undefined;
                this.loadMoreStatus = '';
                if(this.targetDatatable && this.data.length >= this.totalNumberOfRows) {
                    //Stop Infinite Loading when  threshold is reached
                    this.targetDatatable.enableInfiniteLoading = false;
                    //Display "No more data to load" when threshold is reached 
                    this.loadMoreStatus = 'No More data to load';
                }
                // Display a spinner to signal that data has been loaded
                if(this.targetDatatable) this.targetDatatable.isLoading = false;            
            })
            .catch(error => {
                this.error = error;
                this.data = undefined;
                console.log('error : ' + JSON.stringify(this.error));
            })
            .finally(() => {
                getTestExecutions({ offSetCount : this.offSetCount }).then(result => {
                    this.totalNumberOfRows = result;
                })
            });
    }

    //--------------------------------------------------------
    //Event to handle onLoadmore on lightning datatable markup
    handleLoadMore(event) {
        event.preventDefault();
        //increase teh offset count by 20 on every loadmore markup
        this.offSetCount = this.offSetCount + 25;
        //Display a spinner to signal that the data is being loaded
        event.target.isLoading = true;
        //set teh onloadmore event target to make it visible to imperative call response to apex.
        this.targetDatatable = event.target;
        //Display "Loading" when more data is being loaded
        this.loadMoreStatus = 'Loading';
        //Get new set of records and append to this.data
        this.getTestExecutions();

    }
    //--------------------------------------------------------

    // Start of Sort Event
    onHandleSort(event) {

        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.data];

        cloneData.sort( this.sortBy( sortedBy, sortDirection === 'asc' ? 1 : -1 ) );
        this.data = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;

    }

    sortBy( field, reverse, primer ) {

        const key = primer
            ? function( x ) {
                  return primer(x[field]);
              }
            : function( x ) {
                  return x[field];
              };

        return function( a, b ) {
            a = key(a);
            b = key(b);
            return reverse * ( ( a > b ) - ( b > a ) );
        };

    }
   
}