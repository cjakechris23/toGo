import { NOTFOUND } from "dns";
import TestDatajson from "../../utils/TestData.json";
import InternalPage from "./InternalPage";
import assert from 'assert'
class HomePage{
    //Selectors
    get listView() {
        // return $(`//button[@title="Select a List View"]`)
        return $(`//button[@title="Select a List View: Contacts"]`)
        
    }
    get allContacts() {
        return $(`//ul/li/a/span[@class=" virtualAutocompleteOptionText"][text()="All Contacts"]`)
     
    }
    get searchContact() {
        return $(`//input[@aria-label="Search All Contacts list view."]`)
    }
    get btnLogInAsUser() {
        return $(`//button[@name='LoginToNetworkAsUser']`)
    }
    get cimpRecord(){
        return $(`//td/span/span[text()="`+TestDatajson.CIMP_Project+`"]`)
    }
    get dropDownButton(){
        return $(`//td/span/span[text()="`+TestDatajson.CIMP_Project+`"]/parent::span/parent::td/following-sibling::td/span/div/a`)
    }
    get selectDelete(){
        return $('//a[@title="Delete"]')
    }
    get deleteConfirmation(){
        return $('//div/button[@title="Delete"]')
    }
    get CIMPS(){
        return $('//div/div/span[text()="CIMPS"]')
    }
    get recordPage_DeleteButton(){
        return $('//button[@name="Delete"]')
    }
    get successToastDelete(){
        return $('//div[@data-key="success"]//span/span[text()="Success"]')
    }
    get getAllCIMP(){
        return $('//ul/li/a/span[text()="All"]')
    }
    get buttonCIMP(){
        return $('//button[@title="Select a List View: CIMPS"]')
    }




    //Function
    public async visitContact(){
        
        await browser.url('https://phpdc--qa.sandbox.my.salesforce.com/lightning/o/Contact/home')
        //await (await this.getContactDisplay).click()
    }
    public async deleteCIMPRecord(){
        const recordId = await InternalPage.getIdRecord()
        await browser.url(`https://phpdc--qa.sandbox.lightning.force.com/lightning/r/CIMP__c/`+recordId[0]+`/view`)
        await expect(browser).toHaveUrlContaining(recordId[0])
        await (this.recordPage_DeleteButton).isDisplayed()
        await this.recordPage_DeleteButton.click()
        await (this.deleteConfirmation).isDisplayed()
        await this.deleteConfirmation.click()
        await (this.successToastDelete).isDisplayed()
        await browser.url('https://phpdc--qa.sandbox.lightning.force.com/lightning/o/CIMP__c/home')

        await this.buttonCIMP.isDisplayed()
        await this.buttonCIMP.click()
        await this.getAllCIMP.isDisplayed()
        await this.getAllCIMP.click()

    }
    public async clickAllContacts () {
        await expect(this.listView).toBeDisplayed()
        await this.listView.click();
        await expect(this.allContacts).toBeDisplayed()
        await this.allContacts.click();
      
        //await this.searchContact.waitForExist({ timeout: 5000 });
   }
   public async clickUser(title: string){

    await browser.waitUntil(
        async () => {
          return (await $(`//table[@aria-label="All Contacts"]`).isDisplayed());
      },
          {
              timeout: 10000, // 10 seconds
              timeoutMsg: "Message on failure",
          }
      );
       
    await this.searchContact.click();
    await this.searchContact.setValue(title);
    await browser.keys('Enter');
    await $(`//a[(@title = "`+title+`")]`).waitForExist({ timeout: 10000 }); 
    await $(`//a[(@title = "`+title+`")]`).click();
   }

   public async clickLoginAsUser () {
    await this.btnLogInAsUser.click();
    await browser.pause(3000)

   }

   
    
}

export default new HomePage()