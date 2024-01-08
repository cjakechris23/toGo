import "dotenv/config";
import TestDatajson from "../../../utils/TestData.json";

 class EngagementSummary {
    //Get the Client field input
    get EngagementDescriptionTextArea(){
        return $('//td[text()="Engagement Description"]/following-sibling::td//textarea')
    }
    get EngagingMemberFirmField(){
        return $(`//td[text()="Engaging Member Firm"]/following-sibling::td//input`)
    }
    get EngagementLeadershipField(){
        return $(`//td[text()="Engagement Leadership"]/following-sibling::td//input`)
    }
    get LocationTextArea(){
        return $('//td[text()="Locations"]/following-sibling::td//textarea')
    }
    public async getEngagementDescription(){
        expect (this.EngagementDescriptionTextArea).toBeDisplayed()
        expect (this.EngagingMemberFirmField).toBeDisplayed()
        expect (this.EngagementLeadershipField).toBeDisplayed()
        expect (this.LocationTextArea).toBeDisplayed()

        await this.EngagementDescriptionTextArea.click()
        await this.EngagementDescriptionTextArea.setValue(TestDatajson.eng_Description)

        await this.EngagingMemberFirmField.click()
        await this.EngagingMemberFirmField.setValue(TestDatajson.eng_MemberFirm)

        await this.EngagementLeadershipField.click()
        await this.EngagementLeadershipField.setValue(TestDatajson.eng_Leadership)

        await this.LocationTextArea.click()
        await this.LocationTextArea.setValue(TestDatajson.Locations)
    }
}

export default new EngagementSummary()

