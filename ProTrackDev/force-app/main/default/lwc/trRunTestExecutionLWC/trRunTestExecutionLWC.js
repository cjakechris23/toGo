import { LightningElement, api, wire, track } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import RunTestExecutionResource from "@salesforce/resourceUrl/trRunTestExecution";
import { loadStyle } from "lightning/platformResourceLoader";
//Apex methods import
import getTRTestExecutionStepByTestExecutionId from "@salesforce/apex/TR_LWC_DataLayer.getTRTestExecutionStepByTestExecutionId";
import getTicketsByTestExecutionId from "@salesforce/apex/TR_LWC_DataLayer.getTicketsByTestExecutionId";
import createTicket from "@salesforce/apex/TR_LWC_DataLayer.createTicket";
import updateTestExecutionSteps from "@salesforce/apex/TR_LWC_DataLayer.updateTestExecutionSteps";
import { refreshApex } from '@salesforce/apex';

// define the required data for display
const FIELDS = [
  "TR_Test_Execution__c.TR_Project__c",
  "TR_Test_Execution__c.TR_User_Story__c",
  "TR_Test_Execution__c.TR_User_Story__r.Name",
  "TR_Test_Execution__c.Name",
  "TR_Test_Execution__c.TR_Tester__c",
  "TR_Test_Execution__c.TR_Tester__r.Name",
  "TR_Test_Execution__c.TR_Template__r.TR_Introduction__c",
  "TR_Test_Execution__c.TR_Template__c",
  "TR_Test_Execution__c.TR_Test_Phase__c",
  "TR_Test_Execution__c.TR_Tester_Relationship__c",
  "TR_Test_Execution__c.TR_Status__c",
  "TR_Test_Execution__c.TR_Test_Outcome__c",
  "TR_Test_Execution__c.TR_Test_Title__c"
];

const columnsTeExSteps = [
  {label: 'Ref', fieldName: 'Name'},
  {label: 'Action', fieldName: 'TR_Action__c', wrapText: true},
  {label: 'Expected Results', fieldName: 'TR_Expected_Result__c', wrapText: true},
  {label: 'Test Outcome', fieldName: 'TR_Step_Outcome__c', type: 'picklist', typeAttributes: {
    placeholder: 'Choose Outcome', options: [
      { label: 'Passed', value: 'Pass' },
      { label: 'Passed with Issues', value: 'Passed with issues' },
      { label: 'Failed', value: 'Failed' },
    ] // list of all picklist options
    , value: { fieldName: 'TR_Step_Outcome__c' } // default value for picklist
    , context: { fieldName: 'Id' } // binding account Id with context variable to be returned back
  }},
  {label: 'Test Comments', fieldName: 'TR_Comments__c', editable: true, wrapText: true},
  {label: 'Add Ticket', fieldName: 'addTicket', type: 'button', typeAttributes: { label: 'Add Ticket', iconPosition: 'center', name: 'addTickets' }, cellAttributes: { alignment: 'center' }}
];

const ticketColumns = [
  {label: 'Number', fieldName: 'nameUrl', type: 'url', typeAttributes: {label: { fieldName: 'Name' }, target: '_blank'}, cellAttributes: { class: 'slds-size_1-of-6' }},
  {label: 'Problem', fieldName: 'TR_Problem__c', wrapText: true, cellAttributes: { class: 'slds-size_1-of-6' }},
  {label: 'Problem Description', fieldName: 'TR_Problem_Description__c', wrapText: true, cellAttributes: { class: 'slds-size_xx-large' }},
  {label: 'Status', fieldName: 'TR_Status__c', cellAttributes: { class: 'slds-size_x-small' }},
  {label: 'Impact', fieldName: 'TR_Business_Impact__c', cellAttributes: { class: 'slds-size_xx-small' }},
  {label: 'Created On', fieldName: 'CreatedDate', cellAttributes: { class: 'slds-size_x-small' }}
];
export default class RunTestExecutionComponent extends NavigationMixin (LightningElement) {
  constructor(props) {
    super(props);
  }
  
  @track ticketData = []; 
  @track draftValues = [];
  @track NewTicketDialog = false;
  @track default_TR_User_Story__c;
  @track default_TR_Project__c;
  @track default_TR_Test_Execution__c;
  @track default_TR_Test_Phase__c;
  @track default_TR_Functional_Comment__c;
  @track default_TR_Problem__c;
  @track default_TR_Problem_Description__c;
  @track default_TR_Test_Script__c;
  @track default_TR_Logged_by__c;
  @track default_TR_Tester__c;
  @track default_TR_Business_Impact__c;
  @track default_TR_Ticket_Type__c;
  @track default_TR_Status__c;

  currentPageReference = null; 
  urlStateParameters = null;
  lastSavedData = [];
  error;
  columnsTeExSteps = columnsTeExSteps;
  ticketColumns = ticketColumns;

  /** Wired Apex result so it can be refreshed programmatically */
  _wiredResult;

  @api recordId;
  
  @wire(CurrentPageReference)
  getStateParameters(currentPageReference) {
    if (currentPageReference) {
      this.urlStateParameters = currentPageReference.state;
      this.setParametersBasedOnUrl();
    }
  }

  @wire(getRecord, {
    recordId: "$recordId",
    fields: FIELDS
  })
  record;

  @wire(getTRTestExecutionStepByTestExecutionId, {
    TestExecutionId: "$recordId"
  })
  testExecutionStepsRecords;

  @wire(getTRTestExecutionStepByTestExecutionId, {
    TestExecutionId: "$recordId"
  })
  lastSavedData;

  @wire(getTicketsByTestExecutionId, {
    TestExecutionId: "$recordId"
  })
  wiredTickets(result) {  
    this._wiredResult = result;
    if (result.data) {  
      var tempTicketList = [];  
      for (var i = 0; i < result.data.length; i++) {  
        let tempRecord = Object.assign({}, result.data[i]); //cloning object  
        tempRecord.nameUrl = "/" + tempRecord.Id;  
        tempTicketList.push(tempRecord);  
     }  
      this.ticketData = tempTicketList;  
      this.error = undefined;  
    } else if (result.error) {  
      this.error = result.error;  
      this.ticketData = undefined;  
    }  
  }  

  /**
   * Return formatted execution title
   * @returns {string}
   */
  get title() {
    return `Test Execution:  ${this.name}`;
  }

  /**
   * Return formatted execution name
   * @returns {string}
   */
  get name() {
    if (typeof this.record.data === "undefined") {
      return true;
    }
    return this.record.data.fields.Name.displayValue
      ? this.record.data.fields.Name.displayValue
      : this.record.data.fields.Name.value;
  }

  /**
   * Return formatted related user story name
   * @returns {string}
   */
  get user_story() {
    return this.record.data.fields.TR_User_Story__r.displayValue
      ? this.record.data.fields.TR_User_Story__r.displayValue
      : this.record.data.fields.TR_User_Story__r.value;
  }

  /**
   * Return formatted related tester name
   * @returns {string}
   */
  get tester() {
    return this.record.data.fields.TR_Tester__r.displayValue
      ? this.record.data.fields.TR_Tester__r.displayValue
      : this.record.data.fields.TR_Tester__r.value;
  }

  /**
   * Return formatted related test phase
   * @returns {string}
   */
  get test_phase() {
    return this.record.data.fields.TR_Test_Phase__c.displayValue
      ? this.record.data.fields.TR_Test_Phase__c.displayValue
      : this.record.data.fields.TR_Test_Phase__c.value;
  }

  /**
   * Return formatted introduction
   * @returns {string}
   */
  get introduction() {
    return this.record.data.fields.TR_Test_Title__c.displayValue
      ? this.record.data.fields.TR_Test_Title__c.displayValue
      : this.record.data.fields.TR_Test_Title__c.value;
  }

    /**
   * Return formatted related test Status
   * @returns {string}
   */
  get test_status() {
    return this.record.data.fields.TR_Status__c.displayValue
      ? this.record.data.fields.TR_Status__c.displayValue
      : this.record.data.fields.TR_Status__c.value;
  }

      /**
   * Return formatted related test outcome
   * @returns {string}
   */
  get test_outcome() {
    return this.record.data.fields.TR_Test_Outcome__c.displayValue
      ? this.record.data.fields.TR_Test_Outcome__c.displayValue
      : this.record.data.fields.TR_Test_Outcome__c.value;
  }

  /**
   * Return formatted test outcome selection
   * @returns {array}
   */
  get test_outcome_options() {
    return [
      { label: "Passed", value: "Passed" },
      { label: "Passed with minor issues", value: "Passed with minor issues" },
      { label: "Failed", value: "Failed" },
      { label: "Not Executed", value: "Not Executed" }
    ];
  }

  /**
   * Return formatted execution steps
   * @returns {array}
   */
  get execution_steps() {
    //let data = Object.assign({}, this.testExecutionStepsRecords.data);
    let newData = {};
    if (this.testExecutionStepsRecords.data) {
      newData = this.testExecutionStepsRecords.data.map((item) =>
        Object.assign({}, item, {
          Combine_Seq_Ref: "Sequence " + item["TR_Sequence__c"],
          TR_Comments__c_Name: `ExecutionSteps[${item["Id"]}]TR_Comments__c`,
          TR_Step_Outcome__c_Name: `ExecutionSteps[${item["Id"]}]TR_Step_Outcome__c`
        })
      );
    }
    return Object.values(newData);
  }

  //TODO - Get a related tickets and display in frontend
  /**
   *
   * Return formatted related tickets
   * @returns {array}
   */
  get tickets() {
    return [];
  }

  //handler to handle cell changes & update values in draft values
  handleCellChange(event) {
    this.updateDraftValues(event.detail.draftValues[0]);
  }

  handleCancel(event) {
    //remove draftValues & revert data changes
    this.testExecutionStepsRecords = JSON.parse(JSON.stringify(this.lastSavedData));
    this.draftValues = [];
  }

  //Methods to save Test Executiuon Step records
  async handleSave(event) {
    const updatedFields = event.detail.draftValues;
    
    // Prepare the record IDs for getRecordNotifyChange()
    const notifyChangeIds = updatedFields.map(row => { return { "recordId": row.Id } });

    // Pass edited fields to the updateTestExecutionSteps Apex controller
    await updateTestExecutionSteps({data: updatedFields})
    .then(result => {
      //console.log(JSON.stringify("Apex update result: "+ result));
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Success',
          message: 'Test Execution Steps updated',
          variant: 'success'
        })
      );

      // Refresh LDS cache and wires
      getRecordNotifyChange(notifyChangeIds);
      this.lastSavedData = JSON.parse(JSON.stringify(this.testExecutionStepsRecords));

      // Display fresh data in the datatable
      refreshApex(this.testExecutionStepsRecords).then(() => {
        // Clear all draft values in the datatable
        this.draftValues = [];
      });
    }).catch(error => {
      this.dispatchEvent(
          new ShowToastEvent({
            title: 'Error updating or refreshing records',
            message: error.body.message,
            variant: 'error'
          })
        );
    });
  }

  //handle the toast message - success in updateTestExecution button
  async handleSuccess(){
    this.dispatchEvent(
      new ShowToastEvent({
        title: 'Success',
        message: 'Test Execution updated',
        variant: 'success'
      })
    );
  }

  //handle the toast message - error in updateTestExecution button
  async handleError(){
    this.dispatchEvent(
      new ShowToastEvent({
        title: 'Error updating or refreshing records',
        message: error.body.message,
        variant: 'error'
      })
    );
  }

  updateDataValues(updateItem) {
    //let copyData = [... this.testExecutionStepsRecords.data];
    let copyData = JSON.parse(JSON.stringify(this.testExecutionStepsRecords.data));
    copyData.forEach(item => {
      if (item.Id === updateItem.Id) {
        for (let field in updateItem) {
          item[field] = updateItem[field];
        }
      }
    });

    //write changes back to original data
    this.testExecutionStepsRecords.data = [...copyData];
  }

  updateDraftValues(updateItem) {
    let draftValueChanged = false;
    let copyDraftValues = [...this.draftValues];
    //store changed value to do operations
    //on save. This will enable inline editing &
    //show standard cancel & save button
    copyDraftValues.forEach(item => {
      if (item.Id === updateItem.Id) {
        for (let field in updateItem) {
          item[field] = updateItem[field];
        }
        draftValueChanged = true;
      }
    });

    if (draftValueChanged) {
      this.draftValues = [...copyDraftValues];
    } else {
      this.draftValues = [...copyDraftValues, updateItem];
    }
  }

    //listener handler to get the context and data
    //updates datatable
  picklistChanged(event) {
    event.stopPropagation();
    let dataReceived = event.detail.data;
    let updatedItem = { Id: dataReceived.context, TR_Step_Outcome__c: dataReceived.value };
    this.updateDraftValues(updatedItem);
    this.updateDataValues(updatedItem); 
  }

  // closing modal box
  closeModal() {
    this.NewTicketDialog = false;
    this.error = '';
  }

  renderedCallback() {
    Promise.all([loadStyle(this, RunTestExecutionResource)]).then(() => {});
  }

  handleTicketSubmit() {
    createTicket({ 
      problem : this.default_TR_Problem__c,
      problemDescription : this.default_TR_Problem_Description__c,
      comments : this.default_TR_Functional_Comment__c,
      businessImpact : this.default_TR_Business_Impact__c,
      ticketType : this.default_TR_Ticket_Type__c,
      status : this.default_TR_Status__c,
      testScript : this.default_TR_Test_Script__c,
      project : this.default_TR_Project__c,
      loggedBy : this.default_TR_Logged_by__c,
      testExecution : this.default_TR_Test_Execution__c,
      testPhase : this.default_TR_Test_Phase__c,
      userStory : this.default_TR_User_Story__c,
      tester : this.default_TR_Tester__c,
      businessImpact : this.default_TR_Business_Impact__c,
      ticketType : this.default_TR_Ticket_Type__c,
    }).then(result => {
      this.NewTicketDialog = false;
      // showing success message
      this.dispatchEvent(new ShowToastEvent({
        message: 'Ticket Created successfully',
        variant: 'success'
      }));

      return refreshApex(this._wiredResult);
    }).catch(error => {
      this.error = error.body.message;
    });
  }

  handleRowAction(event) {
    var action = event.detail.action.name;
    var row = event.detail.row.name;
    switch (action) {
      case 'addTickets':
        this.NewTicketDialog = true;
        this.default_TR_User_Story__c = this.record.data.fields.TR_User_Story__c.value;
        this.default_TR_Project__c = this.record.data.fields.TR_Project__c.value;
        this.default_TR_Test_Execution__c = this.record.data.id;
        this.default_TR_Test_Phase__c = this.record.data.fields.TR_Test_Phase__c.value;
      if(event.detail.row.TR_Comments__c != undefined) this.default_TR_Functional_Comment__c = '<p>' + event.detail.row.TR_Comments__c + '</p>';
        this.default_TR_Problem__c = event.detail.row.Name + ' - ';
        this.default_TR_Problem_Description__c =  'Related to Test Scrip Execution step ' + event.detail.row.Name + ' (' + event.detail.row.Id + ')';
        this.default_TR_Test_Script__c = this.record.data.fields.TR_Template__c.value;
        this.default_TR_Logged_by__c = this.record.data.fields.TR_Tester__c.value;
        this.default_TR_Tester__c = this.record.data.fields.TR_Tester_Relationship__c.value;
        this.default_TR_Status__c = "Raised";
        this.default_TR_Ticket_Type__c = "Issue";
      break;
    }
  }

  //Event to track the First Name field
  userStoryChanged(event) {
    this.default_TR_User_Story__c = event.target.value;
    this.error = '';
  }

  //Event to track the First Name field
  projectChanged(event) {
    this.default_TR_Project__c = event.target.value;
    this.error = '';
  }

  //Event to track the First Name field
  testExecutionChanged(event) {
    this.default_TR_Test_Execution__c = event.target.value;
    this.error = '';
  }

  //Event to track the First Name field
  testPhaseChanged(event) {
    this.default_TR_Test_Phase__c = event.target.value;
    this.error = '';
  }

  //Event to track the First Name field
  commentsChanged(event) {
    this.default_TR_Functional_Comment__c = event.target.value;
    this.error = '';
  }

  //Event to track the First Name field
  problemChanged(event) {
    this.default_TR_Problem__c = event.target.value;
    this.error = '';
  }

  //Event to track the First Name field
  problemDescriptionChanged(event) {
    this.default_TR_Problem_Description__c = event.target.value;
    this.error = '';
  }

  //Event to track the First Name field
  testScriptChanged(event) {
    this.default_TR_Test_Script__c = event.target.value;
    this.error = '';
  }

  //Event to track the First Name field
  loggedByChanged(event) {
    this.default_TR_Logged_by__c = event.target.value;
    this.error = '';
  }

  //Event to track the First Name field
  testerChanged(event) {
    this.default_TR_Tester__c = event.target.value;
    this.error = '';
  }

  //Event to track the First Name field
  businessImpactChanged(event) {
    this.default_TR_Business_Impact__c = event.target.value;
    this.error = '';
  }

  //Event to track the First Name field
  ticketTypeChanged(event) {
    this.default_TR_Ticket_Type__c = event.target.value;
    this.error = '';
  }

  //Event to track the First Name field
  statusChanged(event) {
    this.default_TR_Status__c = event.target.value;
    this.error = '';
  }

  setParametersBasedOnUrl() {
    this.recordId = this.urlStateParameters.c__recordId || this.recordId;
  }

}