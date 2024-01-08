/*
Description: Controller for SurveyNewContainer and SurveyBuilderContainer LWC
Called From: SurveyNewContainer, SurveyBuilderContainer
Test Class: 
Called Classes: N/A
VF Page : N/A
History:
1.0 - Geecel Ginez (gginez@deloitte.com) - 11/04/2022 - Initial version
2.0 - Christine Joy Cruz (chrcruz@deloitte.com) - 11/14/2022 - Added getSurvey, getSurveyQuestions, saveSurvey method
*/

public with sharing class SurveyController {
    
    /**
    * @description This method handles the assignment of permission set and update of account record
    * @author gginez@deloitte.com | 11/04/2022
    * @param strSurveyName
    **/
    @AuraEnabled(cacheable=true)
    public static Boolean checkSurveyName(String strSurveyName) {
        Boolean isExisting = FALSE;
        List<Survey__c> surveyRec = [SELECT Id, Name FROM Survey__c WHERE Name = :strSurveyName LIMIT 1];
        return isExisting = surveyRec.isEmpty() ? isExisting : TRUE;
    }

    /**
    * @description This method handles the retrieval of survey record
    * @author chrcruz@deloitte.com | 11/14/22
    * @param recordId
    **/
    @AuraEnabled(cacheable=true)
    public static Survey__c getSurvey(Id recordId) {
        return [SELECT Id, Name, SurveyType__c, LatestVersionId__c, LatestVersionId__r.SurveyStatus__c FROM Survey__c WHERE Id = :recordId];
    }

    /**
    * @description This method handles the retrieval of survey questions, choices, and display logic records
    * @author chrcruz@deloitte.com | 11/14/22
    * @param surveyVersionId
    **/
    @AuraEnabled(cacheable=true)
    public static List<SurveyQuestion__c> getSurveyQuestions(Id surveyVersionId) {
        return [SELECT Id, QuestionName__c, QuestionType__c, QuestionOrder__c, IsRequired__c, SurveyVersionId__c, 
                (SELECT Name, ChoiceOrder__c FROM SurveyQuestionChoices__r ORDER BY ChoiceOrder__c), 
                (SELECT QuestionName__c, Operator__c, Response__c, QuestionDisplayLogicCondition__c FROM SurveyQuestionDisplayLogics__r ORDER BY LogicOrder__c) 
                FROM SurveyQuestion__c WHERE SurveyVersionId__c = :surveyVersionId ORDER BY QuestionOrder__c];
    }

    /**
    * @description This method handles creation/cascade update/delete of survey, survey version, questions, choices, and display logic records
    * @author chrcruz@deloitte.com | 08/17/22
    * @param isExistingSurvey, surveyRecord, lstSurveyQuestions, mapSurveyQuestionChoices, mapSurveyQuestionDisplayLogics, 
    * lstSurveyQuestionsForDelete, lstSurveyQuestionChoicesForDelete, lstQuestionDisplayLogicsForDelete
    **/
    @AuraEnabled
    public static String saveSurvey(
        Boolean isExistingSurvey, 
        Survey__c surveyRecord, 
        List<SurveyQuestion__c> lstSurveyQuestions, 
        Map<String, List<SurveyQuestionChoice__c>>  mapSurveyQuestionChoices, 
        Map<String, List<SurveyQuestionDisplayLogic__c>> mapSurveyQuestionDisplayLogics,
        List<Id> lstSurveyQuestionsForDelete, 
        List<Id> lstSurveyQuestionChoicesForDelete,  
        List<Id> lstQuestionDisplayLogicsForDelete
    ) {
        /*System.debug('SurveyController - lstSurveyQuestions: ' + lstSurveyQuestions);
        System.debug('SurveyController - mapSurveyQuestionChoices: ' + mapSurveyQuestionChoices);
        System.debug('SurveyController - mapSurveyQuestionDisplayLogics: ' + mapSurveyQuestionDisplayLogics);
        System.debug('SurveyController - lstSurveyQuestionsForDelete: ' + lstSurveyQuestionsForDelete);
        System.debug('SurveyController - lstSurveyQuestionChoicesForDelete: ' + lstSurveyQuestionChoicesForDelete);
        System.debug('SurveyController - lstQuestionDisplayLogicsForDelete: ' + lstQuestionDisplayLogicsForDelete);*/
        
        Id strSurveyRecordId = surveyRecord.Id;
        String strSurveyName = surveyRecord.Name;
        String strSurveyType = surveyRecord.SurveyType__c;
        Boolean isSuccess = true;

        // List of new records for insert
        List<SurveyQuestion__c> lstNewSurveyQuestionsForInsert = new List<SurveyQuestion__c>();
        List<SurveyQuestionChoice__c> lstNewChoicesForInsert = new List<SurveyQuestionChoice__c>();
        List<SurveyQuestionDisplayLogic__c> lstNewDisplayLogicsForInsert = new List<SurveyQuestionDisplayLogic__c>();

        if(isExistingSurvey) {
            isSuccess = updateSurvey(surveyRecord, lstSurveyQuestions, mapSurveyQuestionChoices, mapSurveyQuestionDisplayLogics,
                                    lstSurveyQuestionsForDelete, lstSurveyQuestionChoicesForDelete, lstQuestionDisplayLogicsForDelete);
        } else {
            // Create new survey record
            Survey__c newSurvey = new Survey__c(
                Name = strSurveyName,
                SurveyType__c = strSurveyType
            );

            insert newSurvey;

            strSurveyRecordId = newSurvey.Id;
           
            // Create survey version record
            SurveyVersion__c newSurveyVersion = new SurveyVersion__c(
                Name = strSurveyName + ' v1', // placeholder, for update
                VersionNumber__c = 1,
                SurveyId__c = newSurvey.Id,
                SurveyStatus__c = 'Draft'
            );

            insert newSurveyVersion;

            // Update latest survey version field of survey record
            Survey__c survey = [SELECT Id, LatestVersionId__c FROM Survey__c WHERE Name = :strSurveyName LIMIT 1];
            survey.LatestVersionId__c = newSurveyVersion.Id;

            update survey;

            lstNewSurveyQuestionsForInsert.addAll(createSurveyQuestions(newSurveyVersion.Id, lstSurveyQuestions));

            if(!lstNewSurveyQuestionsForInsert.isEmpty()) {
                insert lstNewSurveyQuestionsForInsert;

                for(SurveyQuestion__c question : lstNewSurveyQuestionsForInsert) {
                    // Create survey question choice records
                    String strQuestionOrder = String.valueOf(question.QuestionOrder__c);
                    if(!mapSurveyQuestionChoices.isEmpty() && mapSurveyQuestionChoices.containsKey(strQuestionOrder)) {
                        lstNewChoicesForInsert.addAll(createSurveyQuestionChoices(mapSurveyQuestionChoices, strQuestionOrder, question.Id, question.SurveyVersionId__c));
                    }

                    // Create survey question display logic records
                    String strQuestionName = String.valueOf(question.QuestionName__c);
                    if(!mapSurveyQuestionDisplayLogics.isEmpty() && mapSurveyQuestionDisplayLogics.containsKey(strQuestionName)) {
                        lstNewDisplayLogicsForInsert.addAll(createSurveyQuestionDisplayLogics(mapSurveyQuestionDisplayLogics, strQuestionName, question.Id));
                    }
                }

                insert lstNewChoicesForInsert;

                insert lstNewDisplayLogicsForInsert;
            }
        }

        return strSurveyRecordId;
    }

    /**
    * @description This method handles cascade update/delete of survey, survey version, questions, choices, and display logic records
    * @author chrcruz@deloitte.com | 08/17/22
    * @param surveyRecord, lstSurveyQuestions, mapSurveyQuestionChoices, mapSurveyQuestionDisplayLogics, 
    * lstSurveyQuestionsForDelete, lstSurveyQuestionChoicesForDelete, lstQuestionDisplayLogicsForDelete
    **/
    @AuraEnabled
    public static Boolean updateSurvey(Survey__c surveyRecord, List<SurveyQuestion__c> lstSurveyQuestions,
                                        Map<String, List<SurveyQuestionChoice__c>>  mapSurveyQuestionChoices, Map<String, List<SurveyQuestionDisplayLogic__c>> mapSurveyQuestionDisplayLogics,
                                        List<Id> lstSurveyQuestionsForDelete, List<Id> lstSurveyQuestionChoicesForDelete, List<Id> lstQuestionDisplayLogicsForDelete) {

        Boolean isSuccess = true;
        Set<Id> setExistingSurveyQuestionIds = new Set<Id>();

        // List and Maps of new records filtered from list and map passed by the component
        List<SurveyQuestion__c> lstNewSurveyQuestions = new List<SurveyQuestion__c>();
        Map<String, List<SurveyQuestionChoice__c>> mapNewSurveyQuestionChoice = new Map<String, List<SurveyQuestionChoice__c>>();
        Map<String, List<SurveyQuestionDisplayLogic__c>> mapNewDisplayLogics = new Map<String, List<SurveyQuestionDisplayLogic__c>>();

        // List of new records for insert
        List<SurveyQuestion__c> lstNewSurveyQuestionsForInsert = new List<SurveyQuestion__c>();
        List<SurveyQuestionChoice__c> lstNewChoicesForInsert = new List<SurveyQuestionChoice__c>();
        List<SurveyQuestionDisplayLogic__c> lstNewDisplayLogicsForInsert = new List<SurveyQuestionDisplayLogic__c>();

        // Maps of existing records for update
        Map<Id, SurveyQuestion__c> mapExistingSurveyQuestionsForUpdate = new Map<Id, SurveyQuestion__c>();
        Map<Id, SurveyQuestionChoice__c> mapExistingChoicesForUpdate = new Map<Id, SurveyQuestionChoice__c>();
        Map<Id, SurveyQuestionDisplayLogic__c> mapExistingDisplayLogicsForUpdate = new Map<Id, SurveyQuestionDisplayLogic__c>();
        
        // Update survey record
        Survey__c existingSurvey = [SELECT Id, Name, SurveyType__c, LatestVersionId__c FROM Survey__c WHERE Id = :surveyRecord.Id LIMIT 1];
        isSuccess = updateSurveyRecord(surveyRecord, existingSurvey);
        
        // Filter new and existing child records from the list and map passed by the component
        for(SurveyQuestion__c question : lstSurveyQuestions) {

            if(!String.isBlank(question.Id)) { 
                setExistingSurveyQuestionIds.add(question.Id);

                // Populate map for new choices of existing question
                String questionOrder = String.valueOf(question.QuestionOrder__c);
                if(!mapSurveyQuestionChoices.isEmpty() && mapSurveyQuestionChoices.containsKey(questionOrder)) {
                    List<SurveyQuestionChoice__c> lstTempQuestionChoices = new List<SurveyQuestionChoice__c>();
                    for(SurveyQuestionChoice__c choice : mapSurveyQuestionChoices.get(questionOrder)) {
                        if(String.isBlank(choice.Id)) { 
                            lstTempQuestionChoices.add(choice);
                        }
                    }
                    mapNewSurveyQuestionChoice.put(questionOrder, lstTempQuestionChoices);
                }

                // Populate map for new display logics of existing question
                String questionName = question.QuestionName__c;
                if(!mapSurveyQuestionDisplayLogics.isEmpty() && mapSurveyQuestionDisplayLogics.containsKey(questionName)) {
                    List<SurveyQuestionDisplayLogic__c> lstTempDisplayLogic = new List<SurveyQuestionDisplayLogic__c>();
                    for(SurveyQuestionDisplayLogic__c logic : mapSurveyQuestionDisplayLogics.get(questionName)) {
                        if(String.isBlank(logic.Id)) {
                            lstTempDisplayLogic.add(logic);
                        }
                    }
                    mapNewDisplayLogics.put(questionName, lstTempDisplayLogic);
                }
            
            } else {
                lstNewSurveyQuestions.add(question);

                // Populate map for new choices of new question
                String questionOrder = String.valueOf(question.QuestionOrder__c);
                if(!mapSurveyQuestionChoices.isEmpty() && mapSurveyQuestionChoices.containsKey(questionOrder)) {
                    for(String order : mapSurveyQuestionChoices.keySet()) {
                        mapNewSurveyQuestionChoice.put(questionOrder, mapSurveyQuestionChoices.get(questionOrder));
                    }
                }

                // Populate map for new display logics of new question
                String questionName = question.QuestionName__c;
                if(!mapSurveyQuestionDisplayLogics.isEmpty() && mapSurveyQuestionDisplayLogics.containsKey(questionName)) {
                    for(String name : mapSurveyQuestionDisplayLogics.keySet()) {
                        mapNewDisplayLogics.put(questionName, mapSurveyQuestionDisplayLogics.get(questionName));
                    }
                }
            }
        } // for loop end
                                            
        Map<Id, SurveyQuestion__c> mapExistingSurveyQuestions = new Map<Id, SurveyQuestion__c>([SELECT Id, QuestionName__c, QuestionOrder__c, IsRequired__c, 
                                                                                                (SELECT Id, Name, ChoiceOrder__c FROM SurveyQuestionChoices__r ORDER BY ChoiceOrder__c), 
                                                                                                (SELECT Id, QuestionName__c, Operator__c, Response__c, QuestionDisplayLogicCondition__c FROM SurveyQuestionDisplayLogics__r ORDER BY LogicOrder__c) 
                                                                                                FROM SurveyQuestion__c WHERE Id IN :setExistingSurveyQuestionIds]);
        
        for(SurveyQuestion__c question : lstSurveyQuestions) { // from cmp
            // Check if the existing question record and its child records have been updated
            if(!String.isBlank(question.Id)) {

                String questionOrder = String.valueOf(question.QuestionOrder__c); // key for map
                String questionName = question.QuestionName__c; // key for map
                SurveyQuestion__c existingQuestion = mapExistingSurveyQuestions.get(question.Id);
                List<SurveyQuestionChoice__c> lstQuestionChoices = mapExistingSurveyQuestions.get(question.Id).SurveyQuestionChoices__r;
                List<SurveyQuestionDisplayLogic__c> lstDisplayLogics = mapExistingSurveyQuestions.get(question.Id).SurveyQuestionDisplayLogics__r;
                
                // Check if values in the existing survey records have been updated
                if(existingQuestion != question) {
                    SurveyQuestion__c questionForUpdate = new SurveyQuestion__c(
                        Id = existingQuestion.Id,
                        Name = question.QuestionName__c,
                        QuestionName__c = question.QuestionName__c,
                        QuestionOrder__c = question.QuestionOrder__c,
                        IsRequired__c = question.IsRequired__c
                    );

                    mapExistingSurveyQuestionsForUpdate.put(questionForUpdate.Id, questionForUpdate);
                }

                // Check if values in the existing survey question choice records have been updated
                if(!lstQuestionChoices.isEmpty()) {
                    for(SurveyQuestionChoice__c existingChoice : lstQuestionChoices) { // existing records
                        for(SurveyQuestionChoice__c choice : mapSurveyQuestionChoices.get(questionOrder)) { // from cmp
                            if(!String.isBlank(choice.Id) && existingChoice.Name != choice.Name && existingChoice.ChoiceOrder__c == choice.ChoiceOrder__c) { 
                                SurveyQuestionChoice__c choiceForUpdate = new SurveyQuestionChoice__c(
                                    Id = existingChoice.Id,
                                    Name = choice.Name
                                );

                                mapExistingChoicesForUpdate.put(choiceForUpdate.Id, choiceForUpdate);
                            }
                        } 
                    }
                }

                // Check if values in the existing question display logic records have been updated
                if(!lstDisplayLogics.isEmpty()) {
                    for(SurveyQuestionDisplayLogic__c existingLogic : lstDisplayLogics) {
                        for(SurveyQuestionDisplayLogic__c logic : mapSurveyQuestionDisplayLogics.get(questionName)) {
                            if(existingLogic != logic) {
                                SurveyQuestionDisplayLogic__c logicForUpdate = new SurveyQuestionDisplayLogic__c(
                                    Id = existingLogic.Id,
                                    Name = logic.QuestionName__c + ' ' + logic.Operator__c + ' ' + logic.Response__c,
                                    QuestionName__c = logic.QuestionName__c,
                                    Operator__c = logic.Operator__c,
                                    Response__c = logic.Response__c,
                                    QuestionDisplayLogicCondition__c = logic.QuestionDisplayLogicCondition__c
                                );

                                mapExistingDisplayLogicsForUpdate.put(logicForUpdate.Id, logicForUpdate);
                            }
                        }
                    }
                }

                // Check if existing question has new choice
                if(!mapNewSurveyQuestionChoice.isEmpty() && mapNewSurveyQuestionChoice.containsKey(questionOrder)) {
                    if(!mapNewSurveyQuestionChoice.get(questionOrder).isEmpty()) {
                        lstNewChoicesForInsert.addAll(createSurveyQuestionChoices(mapNewSurveyQuestionChoice, questionOrder, question.Id, question.SurveyVersionId__c));
                    }
                }

                // Check if existing question has new display logic
                if(!mapNewDisplayLogics.isEmpty() && mapNewDisplayLogics.containsKey(questionName)) {
                    lstNewDisplayLogicsForInsert.addAll(createSurveyQuestionDisplayLogics(mapNewDisplayLogics, questionName, question.Id));
                }
            } else {
                /* The lstNewSurveyQuestions array was populated from the for loop at line 205.
                 * The loop from line 205 was to identify if the question is new or not.
                 * 
                 * Below old code was in a weird placement due to looping again of lstSurveyQuestions,
                 * so if the question itself does not exist yet, this else statement will be executed
                 * 
                 * From the lstNewSurveyQuestions array consist the  questions from the component.
                 * Causing multiple iteration of code below, causing duplicated questions.
                 * 
                 * Instead, moved the code outside the loop and check again if lstNewSurveyQuestions
                 * size is greater than 0.
                */
                // Create new question records
                //if(!lstNewSurveyQuestions.isEmpty()) {
                //    lstNewSurveyQuestionsForInsert.addAll(createSurveyQuestions(existingSurvey.LatestVersionId__c, lstNewSurveyQuestions));
                //}
            } // if else end
        } // for loop end

        // DML ops
        // Update existing records
        if(mapExistingSurveyQuestionsForUpdate.size() > 0) {
            update mapExistingSurveyQuestionsForUpdate.values();
        }

        if(mapExistingChoicesForUpdate.size() > 0) {
            update mapExistingChoicesForUpdate.values();
        }

        if(mapExistingDisplayLogicsForUpdate.size() > 0) {
            update mapExistingDisplayLogicsForUpdate.values();
        }

        // Delete existing records
        if(!lstSurveyQuestionsForDelete.isEmpty()) {
            List<SurveyQuestion__c> lstQuestionsForDeletion = new List<SurveyQuestion__c>([SELECT Id FROM SurveyQuestion__c WHERE Id IN :lstSurveyQuestionsForDelete]);
            delete lstQuestionsForDeletion;
        }

        if(!lstSurveyQuestionChoicesForDelete.isEmpty()) {
            List<SurveyQuestionChoice__c> lstChoicesForDeletion = new List<SurveyQuestionChoice__c>([SELECT Id FROM SurveyQuestionChoice__c WHERE Id IN :lstSurveyQuestionChoicesForDelete]);
            delete lstChoicesForDeletion;
        }

        if(!lstQuestionDisplayLogicsForDelete.isEmpty()) {
            List<SurveyQuestionDisplayLogic__c> lstDisplayLogicForDeletion = new List<SurveyQuestionDisplayLogic__c>([SELECT Id FROM SurveyQuestionDisplayLogic__c WHERE Id IN :lstQuestionDisplayLogicsForDelete]);
            delete lstDisplayLogicForDeletion;
        }
        
        // This is from line 301 and this now moved outside the loop.
        if(!lstNewSurveyQuestions.isEmpty()) {
            lstNewSurveyQuestionsForInsert.addAll(createSurveyQuestions(existingSurvey.LatestVersionId__c, lstNewSurveyQuestions));
        }
                                            
        // Insert new records
        if(!lstNewSurveyQuestionsForInsert.isEmpty()) {
            System.debug('SurveyController - lstNewSurveyQuestionsForInsert.size(): ' + lstNewSurveyQuestionsForInsert.size());
            
            insert lstNewSurveyQuestionsForInsert;

            for(SurveyQuestion__c newQuestionInserted : lstNewSurveyQuestionsForInsert) {
                // Check if new question has choice
                String strQuestionOrder = String.valueOf(newQuestionInserted.QuestionOrder__c); // key for map
                if(!mapNewSurveyQuestionChoice.isEmpty() && mapNewSurveyQuestionChoice.containsKey(strQuestionOrder)) {
                    lstNewChoicesForInsert.addAll(createSurveyQuestionChoices(mapNewSurveyQuestionChoice, strQuestionOrder, newQuestionInserted.Id, newQuestionInserted.SurveyVersionId__c));
                }

                // Check if new question has display logic
                String strQuestionName = String.valueOf(newQuestionInserted.QuestionName__c); // key for map
                if(!mapNewDisplayLogics.isEmpty() && mapNewDisplayLogics.containsKey(strQuestionName)) {
                    lstNewDisplayLogicsForInsert.addAll(createSurveyQuestionDisplayLogics(mapNewDisplayLogics, strQuestionName, newQuestionInserted.Id));
                }
            }
        }

        if(!lstNewChoicesForInsert.isEmpty()) {
            insert lstNewChoicesForInsert;
        }

        if(!lstNewDisplayLogicsForInsert.isEmpty()) {
            insert lstNewDisplayLogicsForInsert;
        }

        return isSuccess;
    }

    public static Boolean updateSurveyRecord(Survey__c surveyRecord, Survey__c existingSurvey) {
        String strSurveyName = surveyRecord.Name;
        String strSurveyType = surveyRecord.SurveyType__c;
        Boolean isSuccess = true;
        Map<Id, SurveyVersion__c> mapExistingSurveyVersionsForUpdate = new Map<Id, SurveyVersion__c>();

        // Check if the survey record was updated
        if(existingSurvey.Name != strSurveyName) {
            // Check if new survey name is unique
            if(!checkSurveyName(strSurveyName)) { 
                existingSurvey.Name = strSurveyName;
            } else {
                throw new AuraHandledException('The survey name you entered already exists. Please enter a different survey name.');
            }
        }

        if(existingSurvey.SurveyType__c != strSurveyType) {
            existingSurvey.SurveyType__c = strSurveyType;
        }
        
        Database.SaveResult surveyUpdateSR = Database.Update(existingSurvey);
        if(!surveyUpdateSR.isSuccess()) {
            isSuccess = false;
        } else {
            // Update the name of associated survey version records
            for(SurveyVersion__c surveyVersion : [SELECT Id, Name, VersionNumber__c FROM SurveyVersion__c WHERE SurveyId__c = :surveyRecord.Id]) {
                SurveyVersion__c versionForUpdate = new SurveyVersion__c(
                    Id = surveyVersion.Id,
                    Name = strSurveyName + ' v' + surveyVersion.VersionNumber__c
                );
                mapExistingSurveyVersionsForUpdate.put(versionForUpdate.Id, versionForUpdate);
            }

            if(mapExistingSurveyVersionsForUpdate.size() > 0) {
                update mapExistingSurveyVersionsForUpdate.values();
            }
        } 
        

        return isSuccess;
    }

    /**
    * @description This method handles the creation of survey question records
    * @author chrcruz@deloitte.com | 08/17/22
    * @param strSurveyVersionId, lstSurveyQuestions
    **/
    public static List<SurveyQuestion__c> createSurveyQuestions(Id strSurveyVersionId, List<SurveyQuestion__c> lstSurveyQuestions) {
        List<SurveyQuestion__c> lstNewSurveyQuestionsForInsert = new List<SurveyQuestion__c>();
        for(SurveyQuestion__c question : lstSurveyQuestions) {
            SurveyQuestion__c questionForInsert = new SurveyQuestion__c(
                Name = question.QuestionName__c,
                QuestionOrder__c = question.QuestionOrder__c,
                QuestionName__c = question.QuestionName__c,
                QuestionType__c = question.QuestionType__c,
                IsRequired__c = question.IsRequired__c,
                SurveyVersionId__c = strSurveyVersionId
            );

            lstNewSurveyQuestionsForInsert.add(questionForInsert);
        }
        
        return lstNewSurveyQuestionsForInsert;
    }

    /**
    * @description This method handles the creation of survey question choices records
    * @author chrcruz@deloitte.com | 08/17/22
    * @param mapNewSurveyQuestionChoice, strQuestionOrder, strQuestionId, strSurveyVersionId
    **/
    public static List<SurveyQuestionChoice__c> createSurveyQuestionChoices(Map<String, List<SurveyQuestionChoice__c>>  mapNewSurveyQuestionChoice, 
                                                                            String strQuestionOrder, Id strQuestionId, Id strSurveyVersionId) {
        List<SurveyQuestionChoice__c> lstNewChoicesForInsert = new List<SurveyQuestionChoice__c>();
        for(SurveyQuestionChoice__c choice : mapNewSurveyQuestionChoice.get(strQuestionOrder)) {
            SurveyQuestionChoice__c newChoice = new SurveyQuestionChoice__c(
                QuestionId__c = strQuestionId,
                SurveyVersionId__c = strSurveyVersionId,
                Name = String.valueOf(choice.Name),
                ChoiceOrder__c = choice.ChoiceOrder__c
            );

            lstNewChoicesForInsert.add(newChoice);
        }

        return lstNewChoicesForInsert;
    }

    /**
    * @description This method handles the creation of survey question display logic records
    * @author chrcruz@deloitte.com | 08/17/22
    * @param mapNewDisplayLogics, strQuestionName, strQuestionId
    **/
    public static List<SurveyQuestionDisplayLogic__c> createSurveyQuestionDisplayLogics(Map<String, List<SurveyQuestionDisplayLogic__c>> mapNewDisplayLogics,
                                                                                        String strQuestionName, Id strQuestionId) {
        List<SurveyQuestionDisplayLogic__c> lstNewDisplayLogicsForInsert = new List<SurveyQuestionDisplayLogic__c>();
        for(SurveyQuestionDisplayLogic__c logic : mapNewDisplayLogics.get(strQuestionName)) {
            SurveyQuestionDisplayLogic__c newLogic = new SurveyQuestionDisplayLogic__c(
                Name = logic.QuestionName__c + ' ' + logic.Operator__c + ' ' + logic.Response__c,
                RelatedSurveyQuestionId__c = strQuestionId,
                QuestionName__c = logic.QuestionName__c,
                Operator__c = logic.Operator__c,
                Response__c = logic.Response__c,
                QuestionDisplayLogicCondition__c = logic.QuestionDisplayLogicCondition__c,
                LogicOrder__c = logic.LogicOrder__c
            );

            lstNewDisplayLogicsForInsert.add(newLogic); 
        }

        return lstNewDisplayLogicsForInsert;
    }

    @AuraEnabled
    public static void updateSurveyVersionStatus(Id latestVersionId, String picklistValue) {
        SurveyVersion__c surveyVersionRecord = new SurveyVersion__c(Id = latestVersionId);
        surveyVersionRecord.SurveyStatus__c = picklistValue;
        update surveyVersionRecord;
    }

   
}