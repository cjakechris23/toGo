const {defineStep } = require('@wdio/cucumber-framework');
const { expect, $ } = require('@wdio/globals')

const LoginPage = require('../pageobjects/LoginPage');
const HomePage = require('../pageobjects/HomePage')
const FeedbackPage = require('../pageobjects/FeedbackPage')


defineStep(/^I am on the login page$/, async () => {
    await LoginPage.visit()
});
defineStep(/^I am on the home page$/, async () => {
    await HomePage.visit()
});
defineStep(/^I am on the feedback page$/, async () => {
    await FeedbackPage.visit()
});
defineStep(/^I submit the feedback form$/, async () => {
    await FeedbackPage.submitFeedback()
});
defineStep(/^I should see feedback results$/, async () => {
    const selector = await $("h3")
    await expect(selector).toBeDisplayed()
});

defineStep(/^I login with (\w+) and (.+)$/, async (username, password) => {
    await LoginPage.login(username, password)
});

defineStep(/^I login with invalid credentials$/, async () => {
    await LoginPage.login('invalid-username','invalid-password')
});

defineStep(/^I should see error message$/, async () => {
    await LoginPage.assertErrorMessage()
});

defineStep(/^I search for "([^*"]*)"$/, async (text) => {
    await HomePage.searchFor(text)
});
defineStep(/^I should see results$/, async () => {
    const selector = await $('h2')
    await expect(selector).toBeDisplayed()
});

