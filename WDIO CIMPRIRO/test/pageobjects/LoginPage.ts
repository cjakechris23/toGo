//import crypto from "../../utils/crypto.js"
const { decryptCredentials } = require('../../utils/decrypt');
const { encryptCredentials  } = require('../../utils/encrypt');

class LoginPage{
    //Selectors
    public get loginForm(){
        return $('#content')
    }
    public get loginUsername(){
        return $('#username')
    }
    public get loginPassword(){
        return $('input[type="password"]')
    }
    public get loginButton(){
        return $('#Login')
    }
    public get errorLoginMessage(){
        return $('.loginError')
    }
    //Functions
    //Visit Login Page
    public async visit(){
        await browser.url('https://phpdc--qa.sandbox.my.salesforce.com/')
        await browser.pause(5000)
    }

    public async QAPage(){
        await browser.url('https://phpdc--qa.sandbox.lightning.force.com/')
    }

    public async assertErrorMessage(){
        await expect(this.errorLoginMessage).toHaveTextContaining(
            'Please enter your password'
        )
    }
    public async login(username: string,password: string){
        
        const decryptedCredentials = decryptCredentials(username,password, process.env.KEY!);
        await this.loginUsername.setValue(decryptedCredentials.username)
        await this.loginPassword.setValue(decryptedCredentials.password)
        await this.loginButton.click()
    }
}

export default new LoginPage()