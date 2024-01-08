import HomePage from '../pageobjects/HomePage'
import LoginPage from '../pageobjects/LoginPage'
import FeedbackPage from '../pageobjects/FeedbackPage'

import NavBar from '../pageobjects/components/Navbar'
describe.only("Login Test", () => {
    it("Should not login with invalid username and password", async () =>{
     

        await browser.maximizeWindow()
        await HomePage.visit()
        await NavBar.clickOnSignIn()

        await LoginPage.assertLoginPageVisible()
        await LoginPage.login("invalid-username","invalid-password")
        await LoginPage.assertErrorMessage()
        await LoginPage.waitForSeconds(3)
   
    })
})

describe("Feedback Test", () => {
    it("Should submit the feedback form", async () =>{

        await HomePage.visit()
        await HomePage.clickOnFeedbackLink()
        await FeedbackPage.submitFeedback(
            "Jake",
            "test@gmail.com",
            "subject",
            "sample message"
            )
        await LoginPage.waitForSeconds(5)

    })
})