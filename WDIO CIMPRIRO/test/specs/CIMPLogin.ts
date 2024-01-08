import LoginPage from '../pageobjects/LoginPage'
import HomePage from '../pageobjects/HomePage'
import SearchPage from '../pageobjects/SearchPage'
import InternalPage from '../pageobjects/InternalPage'

describe("Login Test",() =>{
    it("Should login with valid username and password", async () =>{
        let username = 'phpdcsfnoreply@phpdc.com.qa'
        let password = 'Thinkas3'
        //Login Page
        await browser.maximizeWindow()
        await LoginPage.visit()
        await LoginPage.login(username,password)
      
    })

    it("Should Select All Contact", async () => {
        let contact = "Edward Lee Abella"
        await SearchPage.selectAppLauncher()
        await HomePage.clickAllContacts()
        await HomePage.clickUser(contact)
        await HomePage.clickLoginAsUser()
    })

})

describe("CIMP/RIRO", () => {
    it("Should click the analytics tab", async () => {
        await InternalPage.clickAnaylistcs()
    })
    it("Should click the CIMP", async () => {
        await InternalPage.clickCimp()
    })
    it("Should search CIMP project", async () => {
        let name = "CIMP Test"
        await InternalPage.clickSearchBar(name) 
    })
    it("Should edit the search value", async () => {
        await InternalPage.clickSearchValue()
    })
    it("Should click the next button to navigate to Document Control Information", async () =>{
        await InternalPage.navigateToDocumentControlInformation()
     })
    it("Should click the next button to navigate to Engagement Summary", async () => {
        await InternalPage.navigateToEngSummary()
    })
    it("Should click the next button to navigate to What is a CI Management Plan (CIMP)?", async () => {
        await InternalPage.navigateToWhatIsCimp()
    })
    it("Should click the next button to navigate to Roles and Responsibilities", async () => {
        await InternalPage.navigateToRolesAndResponsibilites()
    })
    
    it("Should click the next button to navigate to Confidential Information (CI)", async () => {
        await InternalPage.navigateToConfidentialInformation()
    })
    it("Should click the next button to navigate to Data Classification", async () => {
        await InternalPage.navigateToDataClassification()
    })
    it("Should click the next button to navigate to Summary of Key Safeguards", async () => {
        await InternalPage.navigateToKeySafeguards()
    })
    it("Should click the next button to navigate to Onboarding / Offboarding Process", async () => {
        await InternalPage.navigateToOnboardingOffboarding()
    })
    it("Should click the next button to navigate to Data Access and Data Use & Storage Safeguards", async () => {
        await InternalPage.navigateToDataAccessAndDataUse()
    })
    it("Should click the next button to navigate to Data Transfer and Data Retention & Destruction", async () => {
        await InternalPage.navigateToDataTransferAndDataRetention()
    })
    it("Should click the next button to navigate to Physical Safeguards", async () => {
        await InternalPage.navigateToPhysicalSafeguards()
    })
    it("Should click the next button to navigate to Incident Response", async () => {
        await InternalPage.navigateToIncidentResponse()
    })
    it("Should click the next button to navigate to CIMP last page", async () => {
        await InternalPage.navigateToLastPage()
    })
    // it("Should click the Save and Submit button", async () => {
    //     await InternalPage.saveAndSubmitButton()
    // })
    // it("Should click Submit button", async () => {
    //     await InternalPage.submitButton()
    // })
    it("Should click the save button", async () =>{
        await InternalPage.saveButton()
        await browser.pause(5000)
    })
    it("Should click the confirm button", async () =>{
        await InternalPage.confirmButton()
    })





})      
    
