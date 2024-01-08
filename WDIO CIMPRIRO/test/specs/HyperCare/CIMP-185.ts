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
    

    
})     
    
