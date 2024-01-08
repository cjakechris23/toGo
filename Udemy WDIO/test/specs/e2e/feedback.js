describe("Feedback Form", () => {
    it("Should submit feedback form with all the values", async () =>{
       
       
        //Define values for the form inputs
        const name = process.env.CONTACTS
        const email = "test@test.com"
        const subject = "subject"
        const message = "My very short message for feedback test"
        //Click on feedback button
        await browser.url('http://zero.webappsecurity.com/index.html')
        await browser.waitAndClick('#feedback')
        //Fill feedback form
        await (await $('#name')).setValue(name)
        await (await $('#email')).setValue(email)
        await (await $('#subject')).setValue(subject)
        await (await $('#comment')).setValue(message)
        await browser.debug()
        //Submit feedback form
        await (await $('input[type="submit"]')).click()
        //Verify correct URL
        await expect(browser).toHaveUrlContaining('sendFeedback.html')
        
    })
})