import "dotenv/config";

 class DocumentControlInformation {
    //Get the Client field input
    get clientField(){
        return $('//lightning-input[@data-fieldname="CIMP_Engagement_Client__c"]//*[last()][@part="input"]')
    }
    get startDateField(){
        return $('//lightning-input[@data-fieldname="CIMP_Ringfence_Start_Date__c"]//input[@part="input"]')
    }

    public async clientName(client: string){
        await expect(this.clientField).toBeDisplayed()
        await this.clientField.click()
        await this.clientField.setValue(client)
    }


    
   
}

export default new DocumentControlInformation()

