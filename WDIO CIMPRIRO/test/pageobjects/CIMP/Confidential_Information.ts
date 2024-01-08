import "dotenv/config";
import TestDatajson from "../../../utils/TestData.json";

 class Confidential_Information {
    //Get the Client field input
    get comboBoxYes(){
        return $('//button[@name="a0a7e000008SdUxAAK-0"][@data-value="Y"]')
    }
    public async comboBox(){
        
        
        for (var i=0; i<=6;){
            let comboBox = await $(`//button[@name="a0a7e000008SdUxAAK-`+i+`"]`)
            let selectYes = await $(`//lightning-combobox[@data-id="a0a7e000008SdUxAAK-`+i+`"]//lightning-base-combobox-item/span/span[text()="Y"]`)
            let selectTextArea = await $(`//lightning-textarea[@data-id="a0a7e000008SdUxAAK-`+i+`"]//textarea[@placeholder="Input team member names separated by ','"]`)
            await expect(comboBox).toBeDisplayed()
            await comboBox.click()
            await expect(selectYes).toBeDisplayed()
            await selectYes.click()
            await expect(selectTextArea).toBeDisplayed()
            await selectTextArea.click()
            await selectTextArea.setValue(TestDatajson.Contact +`${i}`)
            i++;
        }
    }
}

export default new Confidential_Information()

