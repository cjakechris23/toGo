
module.exports = class AbstractPage {
    async visit(url){
        await browser.url(url)
    }

    async waitForSecpmds(seconds){
        await browser.pause(seconds * 1000)

    }
}
