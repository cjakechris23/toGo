import "dotenv/config";

 class CI_Management {
    //Get the Client field input
    get TitlePage(){
        return $('//p[text()="What is a CI Management Plan (CIMP)?"]')
    }
    public async getTitlePage(){
        
    }
}

export default new CI_Management()

