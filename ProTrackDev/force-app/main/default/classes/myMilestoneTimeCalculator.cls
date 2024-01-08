global class myMilestoneTimeCalculator implements Support.MilestoneTriggerTimeCalculator {   

     global Integer calculateMilestoneTriggerTime(String caseId, String milestoneTypeId){
        Case c = [SELECT Priority FROM Case WHERE Id=:caseId];
        MilestoneType mt = [SELECT Name FROM MilestoneType WHERE Id=:milestoneTypeId];
        if (c.Priority != null) {
            if(c.Priority.equals('1-Severe')){
              if (mt.Name != null && mt.Name.equals('Response Time')) { return 120;}
              if (mt.Name != null && mt.Name.equals('Resolution Time')) { return 720;}
            }
            else if(c.Priority.equals('2-Major')){
              if (mt.Name != null && mt.Name.equals('Response Time')) { return 240;}
              if (mt.Name != null && mt.Name.equals('Resolution Time')) { return 1440;}
            }
            else if(c.Priority.equals('3-Minor')){
              if (mt.Name != null && mt.Name.equals('Response Time')) { return 720;}
              if (mt.Name != null && mt.Name.equals('Resolution Time')) { return 4800;}
            }
            else if(c.Priority.equals('4-Low')){
              if (mt.Name != null && mt.Name.equals('Response Time')) { return 7680;}
              if (mt.Name != null && mt.Name.equals('Resolution Time')) { return 7200;}
            }
            else return 0;
        }
       return 0;                
     }
}