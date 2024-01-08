import "dotenv/config";
import TestDatajson from "../../../utils/TestData.json";


 class Onboarding_Offboarding {
    public async comboBoxOnBoarding(){
        
        
        for (var i=0; i<=4;){
            let comboBox = await $(`//button[@name="a0a7e000008SdUyAAK-`+i+`"]`)
            let selectYes = await $(`//lightning-combobox[@data-id="a0a7e000008SdUyAAK-`+i+`"]//lightning-base-combobox-item/span/span[text()="Y"]`)
            

            await expect(comboBox).toBeDisplayed()
            await comboBox.click()
            await expect(selectYes).toBeDisplayed()
            await selectYes.click()
            i++;
        }
    }
    public async comboBoxOffBoarding(){
        
        
        for (var i=0; i<=3;){
            let comboBox = await $(`//button[@name="a0a7e000008SdUzAAK-`+i+`"]`)
            let selectYes = await $(`//lightning-combobox[@data-id="a0a7e000008SdUzAAK-`+i+`"]//lightning-base-combobox-item/span/span[text()="Y"]`)
            

            await expect(comboBox).toBeDisplayed()
            await comboBox.click()
            await expect(selectYes).toBeDisplayed()
            await selectYes.click()
            i++;
        }
    }
    public async textArea(){
        const textSample = "Adhere to client-specific/ required offboarding requirements (list any if applicable). (TEST AUTOMATION)"
        
        
        
        let selectTextAreaOffBoarding = await $(`//c-cimp-dynamic-table[@data-id="a0a7e000008SdUjAAK"]//lightning-input-rich-text[@data-id="a0a7e000008SdUzAAK-3"]//p`)
        let selectTextAreaOnBoarding = await $(`//c-cimp-dynamic-table[@data-id="a0a7e000008SdUjAAK"]//lightning-input-rich-text[@data-id="a0a7e000008SdUyAAK-4"]//p`)
        await expect(selectTextAreaOffBoarding).toBeDisplayed()
        await expect(selectTextAreaOnBoarding).toBeDisplayed()
        //await selectTextArea.scrollIntoView()
        await selectTextAreaOffBoarding.click()
        await selectTextAreaOffBoarding.setValue(textSample)

        await selectTextAreaOnBoarding.click()
        await selectTextAreaOnBoarding.setValue(textSample)

       
    }
 }

export default new Onboarding_Offboarding()

