import LoginPage from '../../pageobjects/LoginPage'
import HomePage from '../../pageobjects/HomePage'
import SearchPage from '../../pageobjects/SearchPage'
import InternalPage from '../../pageobjects/InternalPage'
import TestDatajson from "../../../utils/TestData.json";
     

describe("View Next Button on CIMP pages ",() =>{
    
    before("Should login with valid username and password", async () =>{
        //let username = "phpdcsfnoreply@phpdc.com.qa"
        //let password = "Thinkas3"
      
        //Login Page
        await browser.maximizeWindow()
        await LoginPage.visit()
        await LoginPage.login(TestDatajson.Username, TestDatajson.Password)   
    })

    it("Should Select All Contact", async () => {
        //let contact = "Edward Lee Abella"
        await SearchPage.selectAppLauncher()
        await HomePage.clickAllContacts()
        await HomePage.clickUser(TestDatajson.Contact)
        await HomePage.clickLoginAsUser()
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
    it("Should edit the search value", async () => {
        await InternalPage.clickSearchValue()
    })
    it("Should see the next button in Document Control Information", async () =>{
        await InternalPage.navigateToDocumentControlInformation()
    })
    it("Should see the next button in Engagement Summary", async () => {
        await InternalPage.navigateToEngSummary()
    })
    it("Should see the next button in What is CIMP?", async () => {
        await InternalPage.navigateToWhatIsCimp()
    })
    it("Should see the next button in Roles and Responsibilities", async () => {
        await InternalPage.checkCimpTitle("Roles and Responsibilities")
        await InternalPage.navigateToRolesAndResponsibilites()
    })
    it("Should see the next button in Confidential Information", async () => {
        await InternalPage.navigateToConfidentialInformation()
    })
    it("Should click attach button ", async () => {
        await InternalPage.clickAttachButton()
    })
    it("Should click upload file", async () => {
        await InternalPage.clickUploadFile()
    })
    it("Should see the next button in Data classification", async () => {
        await InternalPage.navigateToDataClassification()
    })
    it("Should see the next button in Key Safeguards", async () => {
        await InternalPage.navigateToKeySafeguards()
    })
    it("Should see the next button in Onboarding Offboarding", async () => {
        await InternalPage.navigateToOnboardingOffboarding()
    })
    it("Should see the next button in Data Access and Data Use", async () => {
        await InternalPage.navigateToDataAccessAndDataUse()
    })
    it("Should see the next button in Data Transfer and Data Retention", async () => {
        await InternalPage.navigateToDataTransferAndDataRetention()
    })
    it("Should see the next button in Physical Safeguards", async () => {
        await InternalPage.navigateToPhysicalSafeguards()
    })
    it("Should see the next button in Incident Response", async () => {
        await InternalPage.navigateToIncidentResponse()
    })
    it("Should see the save button in Last Page", async () => {
        await InternalPage.navigateToLastPage()
    })
    it("Should save the CIMP form ", async () => {
        await InternalPage.saveButton()
    })
    it("Should see the confirm button and clickable", async () => {
        await InternalPage.confirmButton()
    })
    it("Should click the analytics tab ", async () => {
        await InternalPage.clickAnaylistcs() 
    })
    it("Should click the CIMP", async () => {
        await InternalPage.clickCimp()
    })
    it("Should search CIMP project", async () => {
        //let name = "CIMP Test"
        await InternalPage.clickSearchBar(process.env.CIMP_PROJECT!)
    })
    it("Should edit the search value", async () => {
        await InternalPage.clickSearchValue()
    })
    it("Should see the next button in Document Control Information", async () =>{
        await InternalPage.navigateToDocumentControlInformation()
    })
    it("Should see the next button in Engagement Summary", async () => {
        await InternalPage.navigateToEngSummary()
    })
    it("Should see the next button in What is CIMP?", async () => {
        await InternalPage.navigateToWhatIsCimp()
    })
    it("Should see the next button in Roles and Responsibilities", async () => {
        await InternalPage.navigateToRolesAndResponsibilites()
    })
    it("Should see the next button in Confidential Information", async () => {
        await InternalPage.navigateToConfidentialInformation()
    })
    it("Should click the attachment button", async () => {
        await InternalPage.clickAttachButton()
    })
    it(`Verify the attached file is = `+process.env.FILENAME!+``, async () => {
        await InternalPage.verifyAttachedFiles()
    })

    
})     
    
