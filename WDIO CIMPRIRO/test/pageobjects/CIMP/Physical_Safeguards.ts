import "dotenv/config";
import TestDatajson from "../../../utils/TestData.json";

 class Physical_Safeguards {
    public async comboBox_Definition(){
        
        for (var i=0;i<=12;){
            var comboBox = await $(`//button[@name="a0a7e000008SdV4AAK-`+i+`"]`)
            let selectYes = await $(`//lightning-combobox[@data-id="a0a7e000008SdV4AAK-`+i+`"]//lightning-base-combobox-item/span/span[text()="Y"]`)
            
            await expect(comboBox).toBeDisplayed()
            await comboBox.click()
            await expect(selectYes).toBeDisplayed()
            await selectYes.click()
            i++;
        }
       
        
    }
    
    public async textArea(){
        let DefinitionTextArea = await $(`//c-cimp-dynamic-table[@data-id="a0a7e000008SdUvAAK"]//lightning-input-rich-text[@data-id="a0a7e000008SdV4AAK-12"]//p`)

        await expect(DefinitionTextArea).toBeDisplayed()
        await DefinitionTextArea.click()
        await DefinitionTextArea.setValue(TestDatajson.Text_Area_Sample)
    }
 }

export default new Physical_Safeguards()

