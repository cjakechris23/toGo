import "dotenv/config";
import TestDatajson from "../../../utils/TestData.json";


 class Incident_Response {
    get titlePage(){
        return $('//c-cimp-static-table[@data-id="a0a7e000008SdUsAAK"]//h1[text()="Incident Response"]')
    }

    public async verifyIncidentResponsePage(){
        await expect(this.titlePage).toHaveText("Incident Response")
    }
    
 }

export default new Incident_Response()

