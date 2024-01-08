const crypto = require("crypto")
export default class AbstractPage{
    public async waitForSeconds(seconds: number){
        await browser.pause(seconds * 1000)
    }
    public async setFullHDresolution(){
        await browser.maximizeWindow()
    }
    public async setNetworkSpeedTo3G(){
        await browser.throttle("Regular3G")
    }
    public async generateRandomNumber(){
        return Math.floor(Math.random() * 10000 + 1)
    }
    public async generateRandomString(){
        return crypto.randomBytes(20).toString('hex')
    }
}