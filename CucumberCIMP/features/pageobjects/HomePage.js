const AbstractPage = require("./AbstractPage");

class HomePage extends AbstractPage{
    get searchBox(){
        return $('#searchTerm')
    }

    async visit(){
        await browser.url("http://zero.webappsecurity.com/index.html")
    }

    async searchFor(text){
        await (await this.searchBox).setValue(text)
        await browser.keys(['Enter'])
    }
}
module.exports = new HomePage()