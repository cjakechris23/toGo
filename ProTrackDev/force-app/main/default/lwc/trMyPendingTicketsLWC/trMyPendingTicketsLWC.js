
// This is the JS component for the My Pending Tickets List View in the Project Tracker's Home Page

import { LightningElement, track, wire } from 'lwc';
import getTickets from '@salesforce/apex/TR_TicketsController.getTickets';
import Format from '@salesforce/schema/Report.Format';

const columns = [
    { label: 'Ticket Name', fieldName: 'TR_Ext_View_Ticket__c', sortable: "true", type: 'url', typeAttributes: { label: {fieldName: 'Name'} } },
    { label: 'Problem', fieldName: 'TR_Problem__c', sortable: "true", type: 'text' },
    { label: 'Status', fieldName: 'TR_Status__c', sortable: "true", type: 'text' },
    { label: 'Business Impact', fieldName: 'TR_Business_Impact__c', sortable: "true", type: 'text' }
];
export default class TicketsLWC extends LightningElement {
    @track data;
    @track columns = columns;
    @track defaultSortDirection = 'asc';
    @track sortedBy;
    @track sortDirection = 'asc';
   
    // Start of Infinite Loading Function
    columns = columns;
    data = [];
    error;
    totalNumberOfRows = 25; // Displays the Initial Count of Records to Load
    offsetCount = 0; // offsetCount to send APEX to get the subsequent result. 0 offsetCount signifies the initial load of records on component load
    loadMoreStatus;
    targetDatatable;

    connectedCallback() { // Get the initial chunk of data with offset set at 0
        this.getTickets();
    }


    // getTickets
    getTickets() {
        getTickets({offsetCount : this.offsetCount }).then(result => {
            result = JSON.parse(JSON.stringify(result));
            result.forEach(record => {
                record.linkAccount = '/' + record.id;
            });
            this.data = [...this.data, ...result];
            this.error = undefined;
            this.loadMoreStatus = '';
            if(this.targetDatatable && this.data.length >= this.totalNumberOfRows) {
                // Stop Infinite Loading when Threshold is Reached
                this.targetDatatable.enableInfiniteLoading = false;
                // Display "No More Data to Load" when Threshold is Reached
                this.loadMoreStatus = 'No More Data to Load';
            }
            // Displays a Spinner to Signal that Data has been loaded
            if(this.targetDatatable) this.targetDatatable.isLoading = false;
        })
        .catch(error => {
            this.error = error;
            this.data = undefined;
            console.log('error: ' + JSON.stringify(this.error));
        })
        .finally(() => {
            getTickets({ offsetCount : this.offsetCount }).then(result => {
                this.totalNumberOfRows = result;
            })
        });
    }

    // Event to handle onLoadMore on Lightning datatable markup
    handleLoadMore(event) {
        event.preventDefault();
        // Increase the offset count by 25 on every loadmore markup
        this.offsetCount = this.offsetCount + 25;
        // Display a spinner to signal that the data is being loaded
        event.target.isLoading = true;
        // Set the onloadmore event target to make it visible to imperative call response to apex
        this.targetDatatable = event.target;
        // Display "Loading" when more data is being loaded
        this.loadMoreStatus = 'Loading';
        // Get new set of records and append to this.data
        this.getTickets();
    }

    // Start of Sort Event

    onHandleSort(event) {
        this.sortedBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortedBy, this.sortDirection);
    }

    sortData(fieldName, direction) {

        let parseData = JSON.parse(JSON.stringify(this.data));
        // Return the Value Stored in the Field
        let keyValue = (a) => {
            return a[fieldName];
        };
        // Checking Reverse Direction
        let isReverse = direction === 'asc' ? 1: -1;
        // Sorting Data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';

                // Sorting Values Based on Direction selected
                return isReverse*((x > y) - (y > x));
        });
        this.data = parseData;
    }
}