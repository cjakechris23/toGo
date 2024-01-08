
import "dotenv/config";
import TestDatajson from "../../utils/TestData.json";

 class InternalPage {

    //Get Analytics button xpath
    get analyticsButton(){
        return $('//button[text()="Analytics"]')
    }

    //Get CIMP button xpath
    get cimpButton(){
        return $('//a[@title="CIMP"]')
    }

    //Get search Bar xpath
    get searchBar(){
        return $('//input[@name="searchEmail"]')
    }

    //Get the searched value `xpath
    get searchValue(){
        return $(`//tbody/tr[@data-row-key-value="`+TestDatajson.CIMP_Key+`"]/td/lightning-primitive-cell-factory/div/lightning-primitive-custom-cell/c-custom-button-icons/lightning-button-icon/button[@title="Edit"][@type="button"]`)
        
    }

    //Get the next button on cover page of CIMP
    get nextButtonCoverPage(){
        return $('//lightning-button/button[text()="Next"]')
    }

    //Get the attachment button on Data Classification Page
    get attachmentButton(){
        return $('//lightning-button/button[text()="Attachments"]')
    }

    //Get Upload input on attachment button modal
    get toUploadFile(){
        return $('//input[@name="fileUploader"]')
    }

    //Get the download button icon
    get downloadButton(){
        return $('//button[@title="Download File"]')
    }

    //Get the delete button from attachments modal
    get deleteButton(){
        return $('//button[@title="Delete File"]')
    }

    //Verify the attached file
    get attachedFiles(){
        const getFileId = "0697e000002KeScAAK"
        return $(`//tr/td/a`)
        
    }

    //Get Close Button for modal in attach file function
    get closeButtonUpload(){
        return $('//lightning-button/button[text()="Close"]')
    }

    //Get done button after successfully uploaded a file
    get doneButtonupload(){
        return $('//span/button[@type="button"]')
    }

     // Get Next Button in Document Control Information
    get nextButtonDocumentControlInformation(){
        const datakey_nextButtonDocumentControlInformation = "a0a7e000008SdUoAAK";
        return $(`//c-cimp-static-table[@data-key="`+datakey_nextButtonDocumentControlInformation+`"]/div/lightning-button/button[text()="Next"]`)
    }

    // Get Next Button in Engagement Summary
    get nextButtonEngSummary(){
        const datakey_nextButtonEngSummary = "a0a7e000008SdUmAAK";
        return $(`//c-cimp-static-table[@data-key="`+datakey_nextButtonEngSummary+`"]/div/lightning-button/button[text()="Next"]`)
    }

    //get the Next button in What is CIMP
    get nextButtonWhatIsCimp(){
        const datakey_nextButtonWhatIsCimp = "a0a7e000008SdUkAAK";
       return $(`//c-cimp-static-table[@data-key="`+datakey_nextButtonWhatIsCimp+`"]/div/lightning-button/button[text()="Next"]`)
    }

    //Get the Next button in Roles and responsibilities
    get nextButtonRolesAndResponsibilites(){
        const datakey_nextButtonRolesAndResponsibilites = "a0a7e000008SdUpAAK";
       return $(`//c-cimp-static-table[@data-key="`+datakey_nextButtonRolesAndResponsibilites+`"]/div/lightning-button/button[text()="Next"]`)
    }

    //Get the Next button in Confidential Information
    get nextButtonConfidentialInformation(){
        const datakey_nextButtonConfidentialInformation = "a0a7e000008SdUlAAK";
       return $(`//c-cimp-dynamic-table[@data-key="`+datakey_nextButtonConfidentialInformation+`"]/div/lightning-button/button[text()="Next"]`)
    }

    //Get the Next button in Data Classification
    get nextButtonDataClassification(){
        const datakey_nextButtonDataClassification = "a0a7e000008SdUtAAK";
       return $(`//c-cimp-static-table[@data-key="`+datakey_nextButtonDataClassification+`"]/div/lightning-button/button[text()="Next"]`)
    }

    //Get the Next button in Key Safeguards
    get nextButtonKeySafeguards(){
        const datakey_nextButtonKeySafeguards = "a0a7e000008SdUnAAK";
       return $(`//c-cimp-static-table[@data-key="`+datakey_nextButtonKeySafeguards+`"]/div/lightning-button/button[text()="Next"]`)
    }

    //Get the Next button in Onboarding and Offboarding
    get nextButtonOnboardingOffboarding(){
        const datakey_nextButtonOnboardingOffboarding = "a0a7e000008SdUjAAK";
       return $(`//c-cimp-dynamic-table[@data-key="`+datakey_nextButtonOnboardingOffboarding+`"]/div/lightning-button/button[text()="Next"]`)
    }

    //Get the Next button in Data Access and Data Use
    get nextButtonDataAccessAndDataUse(){
        const datakey_nextButtonDataAccessAndDataUse = "a0a7e000008SdUwAAK";
       return $(`//c-cimp-dynamic-table[@data-key="`+datakey_nextButtonDataAccessAndDataUse+`"]/div/lightning-button/button[text()="Next"]`)
    }

    //Get the Next button in Data Transfer and Data Retention
    get nextButtonDataTransferAndDataRetention(){
        const datakey_nextButtonDataTransferAndDataRetention = "a0a7e000008SdUuAAK";
       return $(`//c-cimp-dynamic-table[@data-key="`+datakey_nextButtonDataTransferAndDataRetention+`"]/div/lightning-button/button[text()="Next"]`)
    }

    //Get the Next button in Physical Safeguards
    get nextButtonPhysicalSafeguards(){
        const datakey_nextButtonPhysicalSafeguards = "a0a7e000008SdUvAAK";
       return $(`//c-cimp-dynamic-table[@data-key="`+datakey_nextButtonPhysicalSafeguards+`"]/div/lightning-button/button[text()="Next"]`)
    }

    //Get the Next button in Incident Response
    get nextButtonIncidentResponse(){
        const datakey_nextButtonIncidentResponse = "a0a7e000008SdUsAAK";
       return $(`//c-cimp-static-table[@data-key="`+datakey_nextButtonIncidentResponse+`"]/div/lightning-button/button[text()="Next"]`)
    }

    //Get the Next button in Last page 
    get nextButtonLastPage(){ 
        const datakey_nextButtonLastPage = "a0a7e000008SdUrAAK";
       return $(`//c-cimp-static-table[@data-key="`+datakey_nextButtonLastPage+`"]/div/lightning-button/button[text()="Save and Submit"]`)
    }

    //Get the Save and Submit button
    get saveAndSubmitField(){
        return $('//section/div[@class="slds-modal__container confirmModal"]')
    }

    //Get the Approve field 
    get approverField(){
        return $('//input[@placeholder="Search Approver"]')
        //return $('//lightning-pill/span/span[@class="slds-pill__label"]')
    }

    //Get the Approver Name
    get approverName(){
        return $('//ul/li/span/span[@class="slds-truncate"][contains(text(),"Silvino De Goma")]')
    }

    //Get the Confirm button on submition function
    get submitField(){
        return $('//footer/button[@title="Confirm"]')
    }

    //Get the text for confirmation
    get saveModalHeader(){
        return $('//h2[contains(text(),"Please confirm the details below:")]')
    }

    //Get the save Button on last page
    get saveButtonField(){
        return $('//div/lightning-button/button[text()="Save"]')
    }

    //Get the Confirm button
    get confirmButtonField(){
        return $('//button[@title="Confirm"]')
    }

    //Get the New CIMP Button
    get getNewCIMPButton(){
        return $('//lightning-button/button[text()="New CIMP"]')
    }
    //Get New CIMP Modal
    get engagementNameField(){
        return $('//input[@placeholder="Enter Engagement Name"]')
    }
    get startDateField(){
        return $('//lightning-datepicker/div/label[text()="Start Date"]/following-sibling::div/input')
    }
    get endDateField(){
        return $('//lightning-datepicker/div/label[text()="End Date"]/following-sibling::div/input')
    }
    get createCIMPButton(){
        return $('//footer/button[text()="Create CIMP"]')
    }
    get addRowField(){
        return $('//h1[text()="Document Edit History"]/following-sibling::p/b/following-sibling::lightning-button-icon//button')
    }
    get editVersionInput(){
        return $('//lightning-input//label[text()="Version"]/following-sibling::div/input')
    }
    get editDateInput(){
        return $('//lightning-input//label[text()="Date"]/following-sibling::div/input')
    }
    get additionsModificationsInput(){
        return $('//lightning-input//label[text()="Additions/Modifications:"]/following-sibling::div/input')
    }
    get saveDocumentHistoryInput(){
        return $('//div/button[text()="Save"]')
    }
    get editVersionButton(){
        return $('//h1[text()="Document Edit History"]/following-sibling::lightning-datatable//th//span/button')
    }
    get editDateButton(){
        return $('//h1[text()="Document Edit History"]/following-sibling::lightning-datatable//td[@data-label="Date"]//span/button')
    }
    get additionsModificationsButton(){
        return $('//h1[text()="Document Edit History"]/following-sibling::lightning-datatable//td[@data-label="Additions/Modifications:"]//span/button')
    }
    get successMessage(){
        return $('//div//h1[text()="SUCCESS!"]')
    }
    

    

    //Clicking Analytics Tab
    public async clickAnaylistcs(){
        await (await this.analyticsButton).waitForDisplayed()
        await (await this.analyticsButton).click()
       }
    //Click CIMP Tab
    public async clickCimp(){
        await (await this.cimpButton).waitForDisplayed()
        await (await this.cimpButton).click()
    }
    //Click the Search Bar
    public async clickSearchBar(name: string){
        await (await this.searchBar).waitForDisplayed()
        await (await this.searchBar).click()
        await (await this.searchBar).setValue(name)
        await browser.keys("Enter")

        await browser.pause(4000)
        
    }
    //Click the New CIMP
    public async clickNewCIMPButton(){
        await expect (this.getNewCIMPButton).toBeDisplayed()
        await (this.getNewCIMPButton).click()
        
    }
    //Enter required fields
    public async NewCIMPModal(){
        await expect(this.engagementNameField).toBeDisplayed()
        //await this.engagementNameField.click()
        await (this.engagementNameField).setValue(TestDatajson.CIMP_Project)
        await browser.pause(3000)
        
        await expect(this.startDateField).toBeDisplayed()
        //await this.startDateField.click()
        await this.startDateField.setValue(TestDatajson.startDate)
        await browser.pause(3000)

        await expect(this.endDateField).toBeDisplayed()
        //await this.endDateField.click()
        await this.endDateField.setValue(TestDatajson.endDate)
        await browser.pause(3000)

        await expect(this.createCIMPButton).toBeDisplayed()
        await this.createCIMPButton.click()
    }

    //Set value on Search Bar
    public async clickSearchValue(){
        await (await this.searchValue).waitForDisplayed()
        await (await this.searchValue).click()
        await browser.pause(3000)
    }
    // Cover Page
    public async navigateToDocumentControlInformation(){
        const displayText = await $(`//h1[@class='documentControl']`)
        //await browser.pause(3000)
        //await expect(browser).toHaveUrlContaining("cimp?cimpId=a0Z7e00000NpnZSEAZ") 
        await expect(this.nextButtonCoverPage).toBeDisplayed()
        await this.nextButtonCoverPage.waitForClickable()
        await (await this.nextButtonCoverPage).click()
        await expect(displayText).toHaveTextContaining("Document Control Information")
        await expect(this.nextButtonDocumentControlInformation).toBeDisplayed()
        //await (await this.nextButtonDocumentControlInformation).waitForExist()
    }
    // Document Control Information
    public async navigateToEngSummary(){
        const displayText = await $(`//h1[@class='title']`)
        await browser.pause(5000)
        await (await this.nextButtonDocumentControlInformation).click()
        await expect(displayText).toHaveTextContaining("Engagement Summary")
        await expect(this.nextButtonEngSummary).toBeDisplayed()
        await (await this.nextButtonEngSummary).waitForExist()
    }
    // Engagement Summarry
    public async navigateToWhatIsCimp(){
        const displayText = await $('//p[@class="title"]')  
        //await browser.pause(3000)   
        await (await this.nextButtonEngSummary).click()
        await (await this.nextButtonWhatIsCimp).waitForExist()
        await expect(displayText).toHaveTextContaining("What is a CI Management Plan (CIMP)?")
        await expect(this.nextButtonWhatIsCimp).toBeDisplayed()
    }
    // What is a CI Management Plan (CIMP)?
    public async navigateToRolesAndResponsibilites(){
        //await browser.pause(3000)
        await (await this.nextButtonWhatIsCimp).click()
        await (await this.nextButtonRolesAndResponsibilites).waitForExist()
        await expect(this.nextButtonRolesAndResponsibilites).toBeDisplayed()
    }
    //Roles and Responsibilities
    public async navigateToConfidentialInformation(){
        const displayText = await $('//div[@data-id="a0a7e000008SdUlAAK"]/span[@class="title"]')
        //await browser.pause(3000)
        await (await this.nextButtonRolesAndResponsibilites).click()
        await (await this.nextButtonConfidentialInformation).waitForExist()
        await expect(displayText).toHaveTextContaining("Confidential Information (CI)")
        await expect(this.nextButtonConfidentialInformation).toBeDisplayed()
        await expect(this.attachmentButton).toBeDisplayed()
    }
     //Confidential Information (CI)
    public async navigateToDataClassification(){
        const displayText = await $('//c-cimp-static-table[@data-key="a0a7e000008SdUtAAK"]/div/h1') 
        //await browser.pause(3000)
        await (await this.nextButtonConfidentialInformation).click()
        await (await this.nextButtonDataClassification).waitForExist()
        await expect(displayText).toHaveTextContaining("Data Classification")
        await expect(this.nextButtonDataClassification).toBeDisplayed()
    }
    //Data Classification
    public async navigateToKeySafeguards(){
        const displayText = await $('//div/div/span[@class="title"]')
        //await browser.pause(3000)
        await (await this.nextButtonDataClassification).click()
        await (await this.nextButtonKeySafeguards).waitForExist()
        await expect(displayText).toHaveTextContaining("Summary of Key Safeguards")
        await expect(this.nextButtonKeySafeguards).toBeDisplayed()
    }
    //Attachment Function
    public async clickAttachButton(){
        //const filePath = 'C:/Users/jadelosreyes/Documents/Udemy WDIO/my-screenshot.png';
        await browser.pause(2000)
        await (this.attachmentButton).waitForDisplayed()
        await (this.attachmentButton).scrollIntoView()
        await (this.attachmentButton).click()
    }
    public async clickUploadFile(){
        await expect(this.toUploadFile).toBeDisplayed()
        await (this.toUploadFile).setValue(process.env.FILE_PATH!)
        await expect(this.doneButtonupload).toBeEnabled()
        await (this.doneButtonupload).click()
        await expect(this.closeButtonUpload).toBeDisplayed()
        await (this.closeButtonUpload).click()
    }
    //Verify attached file
    public async verifyAttachedFiles(){
        const attachedFiles = await this.attachedFiles.getText()
        await expect(attachedFiles).toEqual(process.env.FILENAME!)
        
    }
    //Summary of Key Safeguards
    public async navigateToOnboardingOffboarding(){
        const displayText = await $('//div[@data-id="a0a7e000008SdUjAAK"]/span[@class="title"]')
        //await browser.pause(3000)
        await (await this.nextButtonKeySafeguards).click()
        await (await this.nextButtonOnboardingOffboarding).waitForExist()
        await expect(displayText).toHaveTextContaining("Onboarding / Offboarding Process")
        await expect(this.nextButtonOnboardingOffboarding).toBeDisplayed()
    }
    //Onboarding / Offboarding Process
    public async navigateToDataAccessAndDataUse(){
        const displayText = await $('//div[@data-id="a0a7e000008SdUwAAK"]/span[@class="title"]')
        //await browser.pause(3000)
        await (await this.nextButtonOnboardingOffboarding).click()
        await (await this.nextButtonDataAccessAndDataUse).waitForExist()
        await expect(displayText).toHaveTextContaining("Data Access and Data Use & Storage Safeguards")
        await expect(this.nextButtonDataAccessAndDataUse).toBeDisplayed()
        
    }
    //Data Access and Data Use & Storage Safeguards
    public async navigateToDataTransferAndDataRetention(){
        const displayText = await $('//div[@data-id="a0a7e000008SdUuAAK"]/span[@class="title"]')
        //await browser.pause(3000)
        await (await this.nextButtonDataAccessAndDataUse).click()
        await (await this.nextButtonDataTransferAndDataRetention).waitForExist()
        await expect(displayText).toHaveTextContaining("Data Transfer and Data Retention & Destruction")
        await expect(this.nextButtonDataTransferAndDataRetention).toBeDisplayed()
    }
    //Data Transfer and Data Retention & Destruction
    public async navigateToPhysicalSafeguards(){
        const displayText = await $('//div[@data-id="a0a7e000008SdUvAAK"]/span[@class="title"]')
        //await browser.pause(3000)
        await (await this.nextButtonDataTransferAndDataRetention).click()
        await (await this.nextButtonPhysicalSafeguards).waitForExist()
        await expect(displayText).toHaveTextContaining("Physical Safeguards")
        await expect(this.nextButtonPhysicalSafeguards).toBeDisplayed()
    }
    //Physical Safeguards
    public async navigateToIncidentResponse(){
        //await browser.pause(3000)
        await (await this.nextButtonPhysicalSafeguards).click()
        await (await this.nextButtonIncidentResponse).waitForExist()
        await expect(this.nextButtonIncidentResponse).toBeDisplayed()
    }
    //Incident Response
    public async navigateToLastPage(){
        //await browser.pause(3000)
        await (await this.nextButtonIncidentResponse).click()
        await (await this.saveButtonField).waitForExist()
        await expect(this.saveButtonField).toBeDisplayed()
    }
    //CIMP last page
    public async saveAndSubmitButton(){
        await (await this.nextButtonLastPage).click()
        await expect(this.saveAndSubmitField).toBeDisplayed()
        await expect(this.submitField).toBeDisplayed()
        await expect(this.approverField).toBeDisplayed()
    }
    //Function for submitting a CIMP
    public async submitButton(){
        //let approverName = "Sillvino De Goma"
        
        await (this.approverField).click()
        await (await this.approverName).waitForExist({timeout:10000})
        await (this.approverName).click()
        // await (await this.approverField).setValue(approverName)
        // await browser.keys("Enter")
        //expect(this.submitButton).toBeDisplayed()
        
    }

    //Editing Document Edit History
    public async editDocumentHistory(){

        await this.addRowField.waitForDisplayed()
        await expect(this.addRowField).toBeDisplayed()
        await this.addRowField.click()

        await expect(this.editVersionButton).toBeDisplayed()
        await this.editVersionButton.isClickable()
        await this.editVersionButton.click()
        await this.editVersionInput.setValue("1")
        await browser.keys('Enter')

        await expect(this.editDateButton).toBeDisplayed()
        await this.editDateButton.isClickable()
        await this.editDateButton.click()
        await this.editDateInput.setValue("11/11/2023")
        await browser.keys('Enter')

        await expect(this.additionsModificationsButton).toBeDisplayed()
        await await this.additionsModificationsButton.isClickable()
        await this.additionsModificationsButton.click()
        await this.additionsModificationsInput.setValue("Test Modifcication")
        await browser.keys('Enter')

        await expect(this.saveDocumentHistoryInput).toBeDisplayed()
        await this.saveDocumentHistoryInput.isClickable()
        await this.saveDocumentHistoryInput.click()
        await browser.pause(3000)

        await expect(this.submitField).toBeDisplayed()
        await this.submitField.isClickable()
        await this.submitField.click()
        await browser.pause(5000)

    }
    //Save button on last page CIMP
    public async saveButton(){
        await (await this.saveButtonField).waitForExist({timeout:10000})
        await (await this.saveButtonField).click()
    }
    //Confirm Button on CIMP
    public async confirmButton(){
        await (await this.saveModalHeader).isDisplayed()
        await (await this.confirmButtonField).waitForExist({timeout:10000})
        await (await this.confirmButtonField).click()
    }
    public async checkCimpTitle(span: string){
        const spanTitle = await $(`//*[text()="`+span+`"]`)
        await expect(spanTitle).toHaveTextContaining(span)
    }  
    public async checkSuccessMessage(){
        await expect(this.successMessage).toBeDisplayed()
        await expect(this.successMessage).toHaveText("SUCCESS!")
        // let generatePDF = await $('//lightning-button/button[text()="Generate PDF"]')
        // await generatePDF.click()
        
    }
    public async getIdRecord(){
            const xpathRecordId = `//th[@data-label="Project Name"]//lightning-base-formatted-text[text()="`+TestDatajson.CIMP_Project+`"]/ancestor::tr[@data-row-key-value]`
            const projName = await $(xpathRecordId)
            await expect(projName).toBeDisplayed()

            const elementWithId = await $$(xpathRecordId)

                const rowKeyValues = [];
                for(let i = 0; i < elementWithId.length; i++){
                    const element = elementWithId[i];
                    const rowKeyValue = await element.getAttribute('data-row-key-value');
                    rowKeyValues.push(rowKeyValue)
                }
                console.log("Row Key Values: ", rowKeyValues[0]);
        
                return rowKeyValues
      
    }

}

export default new InternalPage()

