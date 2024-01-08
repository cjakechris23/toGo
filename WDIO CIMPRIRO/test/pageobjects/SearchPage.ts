

class SearchPage{
   
    get appLauncher(){
        return $('//div[@aria-label="App"]/one-app-launcher-header/button[@class="slds-button slds-show"]')
    }
    get appLauncherSearchBar(){
        return $('//lightning-primitive-input-simple/div/div/input[@placeholder="Search apps and items..."]')
    }
    get contactTab () {
        return $('//one-app-launcher-menu-item/a/div/lightning-formatted-rich-text/span/p[@class="slds-truncate"]');
    }
    get cimpTab(){
        return $('//one-app-launcher-menu-item/a[@data-label="CIMPS"]//p')
    }
    

    public async selectAppLauncher(){
        let setValueContacts = "Contacts"
        await (await this.appLauncher).waitForExist({timeout: 10000,timeoutMsg: "App Launcher doesn't exist."})
        await (await this.appLauncher).click()
        await (await this.appLauncherSearchBar).setValue(setValueContacts)
        await (await this.contactTab).click()
      
    }
    public async selectAppLauncherCIMPS(){
        let setValueContacts = "CIMPS"
        await this.appLauncher.waitForExist({timeout: 10000,timeoutMsg: "App Launcher doesn't exist."})
        await this.appLauncher.click()
        await this.appLauncherSearchBar.setValue(setValueContacts)
        await expect(this.cimpTab).toBeDisplayed()
        await this.cimpTab.click()
      
    }
    public async selectSearchBar(){
        let Home = await $('//one-app-nav-bar-item-root/a[@title="Home"]')
        await (await this.contactTab).isDisplayed()
        await expect(Home).toBeDisplayed()
        await (await this.contactTab).click()
      
        //await (await this.allContactText).click()
        //await this.searchBar.click()
      
    }
    
    
}

export default new SearchPage()