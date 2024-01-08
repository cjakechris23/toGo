import "dotenv/config";
import TestDatajson from "../../../utils/TestData.json";
import { count } from "console";


 class Data_Access_And_Storage {
    public async comboBox_DataAccess(){
        
        for (var i=0;i<=9;){
            var comboBox = await $(`//button[@name="a0a7e000008SdV0AAK-`+i+`"]`)
            let selectYes = await $(`//lightning-combobox[@data-id="a0a7e000008SdV0AAK-`+i+`"]//lightning-base-combobox-item/span/span[text()="Y"]`)
            
            await expect(comboBox).toBeDisplayed()
            await comboBox.click()
            await expect(selectYes).toBeDisplayed()
            await selectYes.click()
            i++;
        }
       
        return i;
        
    }
    public async comboBox_DataUse(){
        
        
        for (var i=0; i<=12;){
            let comboBox = await $(`//button[@name="a0a7e000008SdV3AAK-`+i+`"]`)
            let selectYes = await $(`//lightning-combobox[@data-id="a0a7e000008SdV3AAK-`+i+`"]//lightning-base-combobox-item/span/span[text()="Y"]`)
            

            await expect(comboBox).toBeDisplayed()
            await comboBox.click()
            await expect(selectYes).toBeDisplayed()
            await selectYes.click()
            i++;
        }

        
    }
    public async textArea(){
        const textSample = "Adhere to client-specific/ required offboarding requirements (list any if applicable). (TEST AUTOMATION)"
        
        
        
        let selectDataAccessTextArea = await $(`//c-cimp-dynamic-table[@data-id="a0a7e000008SdUwAAK"]//lightning-input-rich-text[@data-id="a0a7e000008SdV0AAK-9"]//p`)
        let selectDataUseTextArea = await $(`//c-cimp-dynamic-table[@data-id="a0a7e000008SdUwAAK"]//lightning-input-rich-text[@data-id="a0a7e000008SdV3AAK-12"]//p`)
        await expect(selectDataAccessTextArea).toBeDisplayed()
        await expect(selectDataUseTextArea).toBeDisplayed()
        //await selectTextArea.scrollIntoView()
        await selectDataAccessTextArea.click()
        await selectDataAccessTextArea.setValue(textSample)

        await selectDataUseTextArea.click()
        await selectDataUseTextArea.setValue(textSample)

       
    }
 }

export default new Data_Access_And_Storage()

