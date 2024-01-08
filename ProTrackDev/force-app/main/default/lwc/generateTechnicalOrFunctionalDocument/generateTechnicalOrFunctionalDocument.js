import { LightningElement, api } from "lwc";
import { CloseActionScreenEvent } from "lightning/actions";
import invokeGenerateDocumentHelper from "@salesforce/apex/GenerateTechnicalOrFunctionalDocHelper.invokeGenerateDocument";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class GenerateTechnicalOrFunctionalDocument extends LightningElement {
  TypeOptions = [
    { label: 'Functional Specifications (from User Stories)', value: 'Functional' },
    { label: 'Technical Specifications (from Technical Design)', value: 'Technical' }
  ];
  documentTypeSelected = "";
  versionValue = "";
  isDisableButton = true;
  @api recordId;

  handleTypeChange(event) {
    this.documentTypeSelected = event.detail.value;
    this.validateShowButton();
  }

  handleVersionChange(event) {
    this.versionValue = event.detail.value;
    this.validateShowButton();
  }

  validateShowButton() {
    this.isDisableButton = true;
    if (this.documentTypeSelected && this.versionValue) {
      this.isDisableButton = false;
    }
  }

  cancelAction() {
    this.dispatchEvent(new CloseActionScreenEvent());
  }

  generateDocument() {
    if (this.documentTypeSelected) {
      var wrpRec = {
        releaseId: this.recordId,
        documentType: this.documentTypeSelected,
        version: this.versionValue
      };
      console.log("21==>", wrpRec);
      invokeGenerateDocumentHelper({
        paramWrp: wrpRec
      })
        .then((result) => {
          const event = new ShowToastEvent({
            title: "Generating Document...",
            message:
              this.documentTypeSelected +
              "Socument is being generated. It will be stored in the File related list in this record page.",
            variant: "info"
          });
          this.dispatchEvent(event);
        })
        .catch((error) => {
          console.log("Error stack-->", error.stack);
          console.log("Error name-->", error.name);
          console.log("Error message-->", error.message);
          const event = new ShowToastEvent({
            title: "Error",
            message:
              "Error in generating the document. Please Contact System Admin",
            variant: "error"
          });
          this.dispatchEvent(event);
        });
      this.cancelAction();
    }
  }
}
