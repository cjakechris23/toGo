import "dotenv/config";
import TestDatajson from "../../../utils/TestData.json";
import { count } from "console";


 class Data_Transfer_and_Destruction {
    public async comboBox_DataTransferSafeguards(){
        
        for (var i=0;i<=7;){
            var comboBox = await $(`//button[@name="a0a7e000008SdV1AAK-`+i+`"]`)
            let selectYes = await $(`//lightning-combobox[@data-id="a0a7e000008SdV1AAK-`+i+`"]//lightning-base-combobox-item/span/span[text()="Y"]`)
            
            await expect(comboBox).toBeDisplayed()
            await comboBox.click()
            await expect(selectYes).toBeDisplayed()
            await selectYes.click()
            i++;
        }
        
    }
    public async comboBox_DataRetention_DestructionSafeguards(){
        
        
        for (var i=0; i<=7;){
            let comboBox = await $(`//button[@name="a0a7e000008SdV2AAK-`+i+`"]`)
            let selectYes = await $(`//lightning-combobox[@data-id="a0a7e000008SdV2AAK-`+i+`"]//lightning-base-combobox-item//span[text()="Y"]`)
            

            await expect(comboBox).toBeDisplayed()
            await comboBox.click()
            await expect(selectYes).toBeDisplayed()
            await selectYes.click()
            i++;
        }

        
    }
    public async textArea(){
        const textSample = "Adhere to client-specific/ required offboarding requirements (list any if applicable). (TEST AUTOMATION)"
        
        
        
        let DataTransferSafeguardsTextArea = await $(`//c-cimp-dynamic-table[@data-id="a0a7e000008SdUuAAK"]//lightning-input-rich-text[@data-id="a0a7e000008SdV1AAK-7"]//p`)
        let DataRetention_DestructionSafeguardsTextArea = await $(`//c-cimp-dynamic-table[@data-id="a0a7e000008SdUuAAK"]//lightning-input-rich-text[@data-id="a0a7e000008SdV2AAK-7"]//p`)
        await expect(DataTransferSafeguardsTextArea).toBeDisplayed()
        await expect(DataRetention_DestructionSafeguardsTextArea).toBeDisplayed()
        //await selectTextArea.scrollIntoView()
        await DataTransferSafeguardsTextArea.click()
        await DataTransferSafeguardsTextArea.setValue(textSample)

        await DataRetention_DestructionSafeguardsTextArea.click()
        await DataRetention_DestructionSafeguardsTextArea.setValue(textSample)

       
    }
 }

export default new Data_Transfer_and_Destruction()

