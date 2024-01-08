const AbstractPage = require('./AbstractPage');
class LoginPage extends AbstractPage {
    get inputUsername () {
        return $('#user_login');
    }

    get inputPassword () {
        return $('#user_password');
    }

    get btnSubmit () {
        return $('input[type="submit"]');
    }
    get errorMessage(){
        return $('.alert-error')
    }
    async visit(){
        await browser.url('http://zero.webappsecurity.com/login.html')
    }
    async login (username, password) {
        await this.inputUsername.setValue(username);
        await this.inputPassword.setValue(password);
        await this.btnSubmit.click();
    }
    async assertErrorMessage(){
        await expect(this.errorMessage).toHaveTextContaining(
            'Login and/or password are wrong'     
        )
    }
}

module.exports = new LoginPage();
