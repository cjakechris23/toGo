import LoginPage from '../../pageobjects/LoginPage'
import HomePage from '../../pageobjects/HomePage'
import SearchPage from '../../pageobjects/SearchPage'
import InternalPage from '../../pageobjects/InternalPage'
import TestDatajson from "../../../utils/TestData.json";
import Confidential_Information from '../../pageobjects/CIMP/Confidential_Information';
import Onboarding_Offboarding from '../../pageobjects/CIMP/Onboarding_Offboarding';
import "dotenv/config";
import Data_Access_And_Storage from '../../pageobjects/CIMP/Data_Access_And_Storage';
import Incident_Response from '../../pageobjects/CIMP/Incident_Response';
import Data_Transfer_and_Destruction from '../../pageobjects/CIMP/Data_Transfer_and_Destruction';
import Physical_Safeguards from '../../pageobjects/CIMP/Physical_Safeguards';
import DocumentControlInformation from '../../pageobjects/CIMP/DocumentControlInformation';
import EngagementSummary from '../../pageobjects/CIMP/EngagementSummary';



describe("Login Test",() =>{

    it("Should login with valid username and password", async () =>{
        //Login Page
        await browser.maximizeWindow()
        await LoginPage.visit()
        await LoginPage.login(TestDatajson.Username, TestDatajson.Password)   
        //await Onboarding_Offboarding.textArea()
    })

    it("Should Select All Contact", async () => {

        await SearchPage.selectAppLauncher()
        await HomePage.clickAllContacts()
        await HomePage.clickUser(TestDatajson.Contact)
        await HomePage.clickLoginAsUser()
    })
    

})

describe("CIMP/RIRO", () => {
    it("Should click the analytics tab ", async () => {
        await InternalPage.clickAnaylistcs() 
    })
    it("Should click the CIMP", async () => {
        await InternalPage.clickCimp()
    })
    it("Should Click the New CIMP", async () => {
        await InternalPage.clickNewCIMPButton()
    })
    it("Should see the modal", async () =>{
        await InternalPage.NewCIMPModal()
     })
     it("Should see the next button and  it is clickable", async () =>{
        await InternalPage.navigateToDocumentControlInformation()
        await DocumentControlInformation.clientName(TestDatajson.Client)

     })
    it("Should see the next button and  it is clickable", async () => {
        await InternalPage.navigateToEngSummary()
        await EngagementSummary.getEngagementDescription()
    })
    it("Should see the next button and  it is clickable", async () => {
        await InternalPage.navigateToWhatIsCimp()
    })
    it("Should see the next button and  it is clickable", async () => {
        await InternalPage.navigateToRolesAndResponsibilites()
    })
    it("Should see the next button and  it is clickable", async () => {
        await InternalPage.navigateToConfidentialInformation()
        //await Confidential_Information.comboBox()
    })
    it("Should see the next button and  it is clickable", async () => {
        await InternalPage.navigateToDataClassification()
    })
    it("Should see the next button and  it is clickable", async () => {
        await InternalPage.navigateToKeySafeguards()
    })
    it("Should see the next button and  it is clickable", async () => {
        await InternalPage.navigateToOnboardingOffboarding()
        await Onboarding_Offboarding.comboBoxOnBoarding();
        await Onboarding_Offboarding.comboBoxOffBoarding();
        await Onboarding_Offboarding.textArea();
    })
    it("Should see the next button and  it is clickable", async () => {
        await InternalPage.navigateToDataAccessAndDataUse()
        await Data_Access_And_Storage.comboBox_DataAccess()
        await Data_Access_And_Storage.comboBox_DataUse()
        await Data_Access_And_Storage.textArea()
    })
    it("Should see the next button and  it is clickable", async () => {
        await InternalPage.navigateToDataTransferAndDataRetention()
        await Data_Transfer_and_Destruction.comboBox_DataTransferSafeguards()
        await Data_Transfer_and_Destruction.comboBox_DataRetention_DestructionSafeguards()
        await Data_Transfer_and_Destruction.textArea()
    })
    it("Should see the next button and  it is clickable", async () => {
        await InternalPage.navigateToPhysicalSafeguards()
        await Physical_Safeguards.comboBox_Definition()
        await Physical_Safeguards.textArea()
    })
    it("Should see the next button and  it is clickable", async () => {
        //await Incident_Response.verifyIncidentResponsePage()
        //await InternalPage.checkCimpTitle("Incident Responses")
        await InternalPage.navigateToIncidentResponse()
        await InternalPage.checkCimpTitle("Incident Response")
    })
    it("Should see the next button and  it is clickable", async () => {
        await InternalPage.navigateToLastPage()
    })
    it("Should save the CIMP form ", async () => {
        await InternalPage.saveAndSubmitButton()
    })
    it("Should see the confirm button and clickable", async () => {
        await InternalPage.submitButton()
        await InternalPage.editDocumentHistory()
    })
    it("Should see the success page", async () => {
        await InternalPage.checkSuccessMessage()
        // await InternalPage.clickAnaylistcs() 
        // await InternalPage.clickCimp() 
        // await InternalPage.clickNewCIMPButton()
    })
    it("Should click the analytics tab ", async () => {
        await InternalPage.clickAnaylistcs() 
    })
    it("Should click the CIMP", async () => {
        await InternalPage.clickCimp()
    })
    it("Should search CIMP project", async () => {
        //let name = "CIMP Test"
        await InternalPage.clickSearchBar(TestDatajson.CIMP_Project)       
    })
    it("Delete the created record", async () =>{
        await InternalPage.getIdRecord()
        await HomePage.deleteCIMPRecord()
    })
    
    
})      
 
    
