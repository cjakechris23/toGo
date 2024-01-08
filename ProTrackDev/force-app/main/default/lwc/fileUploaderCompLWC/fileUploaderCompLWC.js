import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import uploadFile from '@salesforce/apex/TR_FileUploaderClass.uploadFile';

export default class FileUploaderCompLWC extends LightningElement {
 @api recordId;
 fileData
 openfileUpload(event){
     const file = event.target.files[0]
     var reader = new FileReader()
     reader.onload = () => {
         var base64 = reader.result.split(',')[1]
         this.fileData = { 
             'filename': file.name,
             'base64': base64,
             'recordId': this.recordId
         }
         console.log(this.fileData)
     }
     reader.readAsDataURL(file)
 }

 handleClick(){
     const {base64, filename, recordId} = this.fileData
     uploadFile({base64, filename, recordId}).then(result => {
         this.fileData = null
         let title = `${filename} Uploaded Successfully! `
         this.toast(title)
     })
 }

 toast(title){
    this.dispatchEvent(
        new ShowToastEvent({
            title:title,
            message: 'Record Updated',
            variant: 'success'
        })
    );
 }

}