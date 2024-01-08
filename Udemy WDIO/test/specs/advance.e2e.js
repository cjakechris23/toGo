import { expect, browser, $ } from '@wdio/globals'

describe.only("Advanced Testing", async () => {
    beforeEach(async() =>{
        await browser.url("https://the-internet.herokuapp.com/upload")
        
        
    })
 
    it("File Upload 1", async() => {
        
        const filePath = 'C:/Users/jadelosreyes/Documents/Udemy WDIO/my-screenshot.png'
        await browser.customFileUpload(filePath,'#file-upload','#file-submit')
        await browser.pause(2000)

        let uploadedFile = await $('#uploaded-files')
        await expect(uploadedFile).toBeDisplayed()
    })

    it("File Upload 2", async() => {
        
        const filePath = 'C:/Users/jadelosreyes/Documents/Udemy WDIO/my-screenshot.png'
        await browser.customFileUpload(filePath,'#file-upload','#file-submit')
        await browser.pause(2000)

        let uploadedFile = await $('#uploaded-files')
        await expect(uploadedFile).toBeDisplayed()
    })

    it("File Upload 3", async() => {
        
        const filePath = 'C:/Users/jadelosreyes/Documents/Udemy WDIO/my-screenshot.png'
        await browser.customFileUpload(filePath,'#file-upload','#file-submit')
        await browser.pause(2000)

        let uploadedFile = await $('#uploaded-files')
        await expect(uploadedFile).toBeDisplayed()
    })

    it("Display Title and Url", async () =>{
        const filePath = 'C:/Users/jadelosreyes/Documents/Udemy WDIO/my-screenshot.png'
        const results = await browser.getTitleAndUrl()
        console.log("TITLE = " + results.title)
        console.log("URL = " + results.url)

        await browser.waitAndClick('#file-submit')
        await browser.pause(3000)
    })
    it("Change Browser Session", async () => {
        
        console.log("SESSION BEFORE RELOAD " + browser.sessionId)
        await browser.reloadSession()
        console.log("SESSION AFTER RELOAD " + browser.sessionId)
    })
    it("Create and Switch New Window", async () => {
        await browser.url("https://google.com")
        await browser.newWindow("https://webdriver.io")
        await browser.pause(5000)
            await browser.switchWindow('google.com')
            await browser.pause(5000)
    })
    it("Network Throttle", async () => {
        await browser.throttle("WiFi")
        await browser.url("https://webdriver.io")
        await browser.pause(3000)

        await browser.throttle("Regular4G")
        await browser.url("https://webdriver.io")
        await browser.pause(3000)

        await browser.throttle("offline")
        await browser.url("https://webdriver.io")
        await browser.pause(3000)
    })
    it("Execute Javascript Code", async () => {
        const result = await browser.execute((a,b) =>{
            return a + b
        },
        5,
        10
        )
        await expect(result).toBe(15)
    })
    it.only("Exceute Async Javascript Code", async () => {
        const result = await browser.executeAsync((a, b, done) =>{
            setTimeout(() => {
                done(a+b)
            }, 3000)
        },
        5,
        10
        )
        await expect(result).toBe(15)
    })
   
})
