import { expect, browser, $ } from '@wdio/globals'

describe("Login Flow", () => {
    before(async () => {
        await browser.url("http://zero.webappsecurity.com")
    })

    it('Should not login with invalid username and password ', async () => {
       
        await browser.waitAndClick('#signin_button')
        await $('#login_form').waitForDisplayed()
        await $('#user_login').setValue('test')
        await $('#user_password').setValue('test')
        await (await $('input[type="submit"]')).click()
        const errorMessage = await $('.alert-error')
        await expect(errorMessage).toHaveTextContaining(
            'Login and/or password are wrong'
            )
    })

    it('Reset Account Password', async () =>{
        const email = 'test@test.com'
        //Click on reset button
        await browser.waitAndClick('*=Forgot')
        //Fill form
        await (await $('#user_email')).waitForDisplayed()
        await $('#user_email').setValue(email)
        //Submit form
        
        await (await $('input[type="submit"]')).click()
        //Verify the message
        const message = await $('.span6')
        await expect(message).toHaveTextContaining(`email: ${email}`)
    })
})