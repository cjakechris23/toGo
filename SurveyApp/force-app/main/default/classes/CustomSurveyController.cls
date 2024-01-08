/*
*********************************************************************************************************
Name: CustomSurveyController.js
==========================================================================================================
Purpose: Apex controller for the custom survey LWC
==========================================================================================================
History

VERSION    AUTHOR                                               DATE                DESCRIPTION
1.0        Kenneth Kim (kennkim@deloitte.com)            		01/30/2023          Initial version
*********************************************************************************************************
*/
public with sharing class CustomSurveyController {
    
    // Method for retriving survey question details
    @AuraEnabled(cacheable=true)
    public static List<SurveyQuestion__c> getSurveyQuestion(String surveyVersionId){
        return [SELECT Id, Name, QuestionType__c, QuestionOrder__c, IsRequired__c, (SELECT Id, Name, ChoiceOrder__c, QuestionId__c  FROM SurveyQuestionChoices__r ORDER BY ChoiceOrder__c ASC) FROM SurveyQuestion__c WHERE SurveyVersionId__c = :surveyVersionId ORDER BY QuestionOrder__c ASC];
    } 
    
    @AuraEnabled
    public static void saveSurveyResponses(String jsonResponseArray, String surveyName, String surveyId, String surveyVersionId, String customSurveyInvitationId, String participantContactId){
        
        System.debug('--------------- saveSurveyResponses -------------------');
        System.debug('suveyId: ---------------->' + surveyId); // a0H3J000002hwlkUAA
        System.debug('surveyName: ------------->' + surveyName);
        System.debug('surveyVersionId: -------->' + surveyVersionId); // a0I3J000001ActeUAC
        System.debug('customSurveyInvitationId: -------->' + customSurveyInvitationId); // a0I3J000001ActeUAC
        System.debug('participantContactId: -------->' + participantContactId); // a0I3J000001ActeUAC
        
        
        // Initialize a SurveyResponse__c object
        SurveyResponse__c surveyResponse = new SurveyResponse__c();
        surveyResponse.SurveyId__c = surveyId;
        surveyResponse.SurveyVersionId__c = surveyVersionId;
        surveyResponse.Status__c = 'Completed';
        surveyResponse.CompletionDateTime__c = DateTime.Now();
        surveyResponse.Name = surveyName + ' -- ' + UserInfo.getName();
        surveyResponse.InvitationId__c = customSurveyInvitationId;
        surveyresponse.ResponseSubmitterContactID__c = participantContactId;
        
        Id surveyResponseId = insertSurveyResponse(surveyResponse);
        
        // Create a collection for bulk insert
        List<SurveyQuestionResponse__c> surveyQuestionResponseList = new List<SurveyQuestionResponse__c>();
        
        // Deserialize JSON array of questions and answers from LWC
        List<Object> responseList = (List<Object>)JSON.deserializeUntyped(jsonResponseArray);
        
        // Loop through the array of objects containing the reponses. Convert each element to a Map (key: property name, value: property value)
        for(Object response : responseList){   
            
            Map<String,Object> data = (Map<String,Object>) response;
            SurveyQuestionResponse__c surveyQuestionResponse = new SurveyQuestionResponse__c();
            surveyQuestionResponse.ResponseId__c =  surveyResponseId;
            surveyQuestionResponse.SurveyVersionId__c = surveyVersionId;
            surveyQuestionResponse.Name = (String) data.get('questionName');
            surveyQuestionResponse.QuestionId__c = (String) data.get('questionId');
            surveyQuestionResponse.InvitationId__c = customSurveyInvitationId;
            
            // DEBUG:
            System.debug('Current Question Type: ---------------------------------------------> ' + data.get('questionType'));
            
            // Handle ResponseValue__c for multi-select: If current response is a MultiSelectPicklist. Do not store QuestionChoiceId__c
            if(data.get('questionType') == 'ShortText' && data.get('answerValue') != ''){
                surveyQuestionResponse.ResponseValue__c = data.get('answerValue').toString();
                surveyQuestionResponse.DataType__c = 'String';
            }
            else if(data.get('questionType') == 'MultiSelectPicklist' && data.get('answerValue') != ''){
                surveyQuestionResponse.ResponseValue__c = data.get('answerValue').toString();
                surveyQuestionResponse.DataType__c = 'String';
            }
            else if(data.get('questionType') == 'RadioButton' && data.get('answerValue') != ''){
                surveyQuestionResponse.ResponseValue__c = data.get('answerValue').toString();
                surveyQuestionResponse.DataType__c = 'String';
                surveyQuestionResponse.QuestionChoiceId__c = (String) data.get('answerId');
            }
            
            else if( data.get('questionType') == 'Boolean'){
                surveyQuestionResponse.DataType__c = 'Boolean'; 
                if((data.get('answerValue').toString() == 'Happy') || (data.get('answerValue').toString() == 'Like') || (data.get('answerValue').toString() == 'Yes')){
                    surveyQuestionResponse.IsTrueOrFalse__c = true;
                    surveyQuestionResponse.ResponseValue__c = data.get('answerValue').toString();
                }
                else{
                    surveyQuestionResponse.IsTrueOrFalse__c = false;
                    surveyQuestionResponse.ResponseValue__c = data.get('answerValue').toString();
                }
                surveyQuestionResponse.QuestionChoiceId__c = (String) data.get('answerId');
                
            }
            else if(data.get('questionType') == 'Rating' && data.get('answerValue') != ''){
                surveyQuestionResponse.DataType__c = 'Number';  
                surveyQuestionResponse.Rank__c = Decimal.valueOf(data.get('answerValue').toString());
                surveyQuestionResponse.QuestionChoiceId__c = (String) data.get('answerId');
                surveyQuestionResponse.ResponseValue__c = data.get('answerValue').toString();
            }
           
            
            // Add response to list
            surveyQuestionResponseList.add(surveyQuestionResponse);	
            
        }
        // Insert surveyQuestionResponses
        insertSurveyQuestionResponse(surveyQuestionResponseList);
        
        //Update SurveyInvitation__c ResponseStatus__c to completed
        SurveyInvitation__c surveyInvitation = new SurveyInvitation__c();
        surveyInvitation.Id = customSurveyInvitationId;
        surveyInvitation.ResponseStatus__c = 'Completed';
        
        //Update SurveyInvitation__c
        updateSurveyInvitation(surveyInvitation);
    }
    
    
    // Method for inserting survey response
    private static Id insertSurveyResponse(SurveyResponse__c surveyResponse){
        System.debug('Saving survey response');
        
        try{	
            Database.SaveResult result = Database.insert(surveyResponse, true);
            
            if(result.isSuccess()) {
                System.debug('Successfully created SurveyResponse__c : ' + result.getId());
            } else {        
                for(Database.Error error : result.getErrors()) {
                    System.debug('Error Status : ' + error.getStatusCode() + ' : ' + 'Error Fields : ' + error.getFields());
                }
            }    
            
        }catch(DMLException e){
            throw new DMLException('Unable to Perform the DML Operation on SurveyResponse__c : ' +e.getMessage());
        }
        return surveyResponse.Id;
    }
    
    // Method for inserting survey question response
    private static void insertSurveyQuestionResponse(List<SurveyQuestionResponse__c> surveyQuestionResponseList){
        System.debug('Saving survey question response');
        
        try{	
            Database.SaveResult[] results = Database.insert(surveyQuestionResponseList, true);
            
            // Iterate over the list of returned results
            for(Database.SaveResult result : results) {
                if(result.isSuccess()) {
                    System.debug('Successfully inserted SurveyQuestionResponse__c : ' + result.getId());
                } else {        
                    for(Database.Error error : result.getErrors()) {
                        System.debug('Error Status : ' + error.getStatusCode() + ' : ' + 'Error Fields : ' + error.getFields());
                    }
                }
            }
        }catch(DMLException e){
            throw new DMLException('Unable to Perform the DML Operation on SurveyQuestionResponse__c : ' +e.getMessage());
        } 
    }
    
    private static void updateSurveyInvitation(SurveyInvitation__c surveyInvitation){
        System.debug('Updating Survey Invitation');
        
        try{	
            Database.SaveResult result = Database.update(surveyInvitation, true);
            
            if(result.isSuccess()) {
                System.debug('Successfully updated SurveyInvitation__c : ' + result.getId());
            } else {        
                for(Database.Error error : result.getErrors()) {
                    System.debug('Error Status : ' + error.getStatusCode() + ' : ' + 'Error Fields : ' + error.getFields());
                }
            }    
            
        }catch(DMLException e){
            throw new DMLException('Unable to Perform the DML Operation on SurveyInvitation__c : ' +e.getMessage());
        }  
    }
    
}
x   