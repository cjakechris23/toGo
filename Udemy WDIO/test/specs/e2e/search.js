import { expect, browser, $ } from '@wdio/globals'
require('dotenv').config()

describe('Search Feature', () => {
   it('Should search for values using keyboard press', async () => {
    await browser.url('http://zero.webappsecurity.com')
    await (await $('#searchTerm')).waitForDisplayed()
        await (await $('#searchTerm')).setValue('bank')
        await browser.keys('Enter')

        const results = await $('h2')
        await expect(results).toBeExisting()
        await expect(results).toHaveTextContaining('Search Results')
        
   })
})