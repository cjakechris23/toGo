import AbstractPage from "./AbstractPage"

class LoginPage extends AbstractPage{
    //Selectors
    public get loginForm(){
        return $('#login_form')
    }
    public get usernameInput(){
        return $('#user_login')
    }
    public get passwordInput(){
        return $('#user_password')
    }
    public get signinButton(){
        return $('input[type="submit"]')
    }
    public get errorMessage(){
        return $('.alert-error')
    }

    //functions
    public async assertLoginPageVisible(){
       await this.loginForm.waitForDisplayed()
    }
    public async assertErrorMessage(){
       await expect(this.errorMessage).toHaveTextContaining('Login and/or password are wrong')
    }
    public async login(username: string, password: string){
       await this.usernameInput.setValue(username)
       await this.passwordInput.setValue(password)
       await this.signinButton.click()
    }
}

export default new LoginPage()