import AbstractPage from "./AbstractPage"

class FeedbackPage extends AbstractPage{
    public get nameInput(){
        return $('#name')
    }
    public get emailInput(){
        return $('#email')
    }
    public get subjectInput(){
        return $('#subject')
    }
    public get commentInput(){
        return $('#comment')
    }
    public get submitButton(){
        return $('input[type="submit"]')
    }

    public async submitFeedback(
        name: string, 
        email: string,
        subject: string,
        comment: string
         ){
        await (await this.nameInput).setValue(name)
        await (await this.emailInput).setValue(email)
        await (await this.subjectInput).setValue(subject)
        await (await this.commentInput).setValue(comment)
        await (await this.submitButton).click()

    }
}

export default new FeedbackPage()