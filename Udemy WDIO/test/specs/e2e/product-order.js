describe("Sauce Demo - Product Order", () => {
    before(async() => {
        //Here goes login
        await browser.url("https://www.saucedemo.com")
        await browser.sauceLogin()
    })

    after(async () => {
        //Here goes logout
        await browser.sauceLogout()
    })

    it('Should complete product order', async () => {
        // Put producst into cart
        await (await $('#inventory_container')).waitForDisplayed()
        await (await $('[data-test="add-to-cart-sauce-labs-backpack"]')).click()
        await (await $('[data-test="add-to-cart-sauce-labs-bike-light"]')).click()
        await (await $('.shopping_cart_link')).click()
        // Assert shopping cart
        await (await $('.cart_list')).waitForDisplayed()
        await browser.pause(3000)
        await (await $('[data-test="checkout"]')).click()
        // Fill customer information
        const firstName = 'Jake'
        const lastName = 'Ger'
        const postalCode = '678'

        await (await $('.checkout_info')).waitForDisplayed()
        
        await (await $('[data-test="firstName"]')).setValue(firstName)
        await (await $('[data-test="lastName"]')).setValue(lastName)
        await (await $('[data-test="postalCode"]')).setValue(postalCode)
        await browser.pause(3000)
        await (await $('[data-test="continue"]')).click()

        // Asser final order overview
        await (await $('.cart_list')).waitForDisplayed()
        await (await $('.summary_info')).waitForDisplayed()
        await browser.pause(3000)
        await (await $('[data-test="finish"]')).click()

        const message = await $('.complete-header')
        await expect(message).toHaveTextContaining("Thank you for your order")
    })
})