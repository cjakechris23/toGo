import LoginPage from '../../pageobjects/LoginPage'
import HomePage from '../../pageobjects/HomePage'
import SearchPage from '../../pageobjects/SearchPage'
import InternalPage from '../../pageobjects/InternalPage'

import "dotenv/config";
import DocumentControlInformation from '../../pageobjects/CIMP/DocumentControlInformation';



describe("Login Test",() =>{
    it("Should login with valid username and password", async () =>{
        //let username = 'phpdcsfnoreply@phpdc.com.qa'
        //let password = 'Thinkas3'
        //Login Page
        await browser.maximizeWindow()
        await LoginPage.visit()
        await DocumentControlInformation.getuserNameText()
    })


})

