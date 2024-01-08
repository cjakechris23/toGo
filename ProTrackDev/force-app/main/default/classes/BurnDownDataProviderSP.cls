/**
 * @author Ashok Kalluri
 * @date 2-Sep-2021
 *
 * @description Controller for Burndown chart by Story Points
 */
public inherited sharing class BurnDownDataProviderSP extends ChartDataProvider {
  public static final String burnDownColor = 'rgba(60, 179, 113, 1);';
  public static final String fullCapacityColor = 'rgba(120, 120, 120, 1);';
  public static final String idealBurnDownColor = 'rgba(255, 99, 71, 1);';
  private String recordId;

  /*******************************************************************************************************
   * @description Not used for this class
   * @param initParameter Object
   */
  public override void init(final Object initParameter) {
    this.recordId = String.valueOf(initParameter);
    // TODO
  }

  /*******************************************************************************************************
   * @description return the data
   * @return List<ChartData> the list of chart data needed to display the graph
   */
  public override List<ChartDataProvider.ChartData> getData() {
    Date todayDate = System.today();
    //Date todayDate = Date.newInstance(2021, 10, 20);
    final List<ChartDataProvider.ChartData> chartDatas = new List<ChartDataProvider.ChartData>();

    List<Double> burnDownDATA = new List<Double>();
    List<Double> fullCapacityDATA = new List<Double>();
    List<Double> idealburnDownDATA = new List<Double>();

    List<String> xAxisData = new List<String>();

    ChartDataProvider.ChartData burnDownChartData = new ChartDataProvider.ChartData();
    ChartDataProvider.ChartData fullCapacityChartData = new ChartDataProvider.ChartData();
    ChartDataProvider.ChartData idealburnDownChartData = new ChartDataProvider.ChartData();

    List<TR_Sprint__c> currentSprint = [
      SELECT TR_Start_Date__c, TR_End_Date__c, TR_Total_Capacity_US_Points__c
      FROM TR_Sprint__c
      WHERE Id = :this.recordId
    ];
    //get all the user stories from the sprint
    List<TR_User_Story__c> userStoriesList = [
      SELECT
        Id,
        Name,
        TR_Allocated_Sprint__c,
        TR_Completed_Date__c,
        TR_Status__c,
        TR_Story_Point__c,
        TR_Allocated_Sprint__r.Name
      FROM TR_User_Story__c
      WHERE TR_Allocated_Sprint__c = :this.recordId
      AND TR_Status__c != 'Cancelled'
      ORDER BY TR_Completed_Date__c ASC NULLS FIRST
    ];

    //calculate total sprint effort
    Double sumOfManDays = 0;
    Double manDaysBeforeSprint = 0;
    Double manDaysAfterSprint = 0;
    for (TR_User_Story__c userStory : userStoriesList) {
      Decimal tempEffort = userStory.TR_Story_Point__c == null
        ? 0
        : Decimal.valueOf(userStory.TR_Story_Point__c);
      sumOfManDays = sumOfManDays + Double.valueOf(tempEffort);
      if (
        currentSprint[0].TR_Start_Date__c == null ||
        currentSprint[0].TR_Start_Date__c > userStory.TR_Completed_Date__c
      ) {
        manDaysBeforeSprint = manDaysBeforeSprint + tempEffort;
      }
      if (
        currentSprint[0].TR_End_Date__c < todayDate &&
        currentSprint[0].TR_End_Date__c < userStory.TR_Completed_Date__c
      ) {
        manDaysAfterSprint = manDaysBeforeSprint + tempEffort;
      }
    }

    //calculate X-axis range
    Integer noSprintDays = currentSprint[0]
      .TR_Start_Date__c.daysBetween(currentSprint[0].TR_End_Date__c);
    for (Integer i = 0; i <= noSprintDays; i++) {
      xAxisData.add(currentSprint[0].TR_Start_Date__c.addDays(i).format());
    }

    //calculate effort remaining for each day
    Double tempIdealBurnDownPerDay =
      sumOfManDays /
      currentSprint[0]
        .TR_Start_Date__c.daysBetween(currentSprint[0].TR_End_Date__c);
    Integer actualSprintCounter = 0;
    for (String dateVal : xAxisData) {
      Date refDateVal = Date.parse(dateVal);
      Double noOfManDaysRemaining = sumOfManDays;
      if (refDateVal <= todayDate) {
        for (TR_User_Story__c userStory : userStoriesList) {
          if (
            userStory.TR_Completed_Date__c != null &&
            userStory.TR_Completed_Date__c <= refDateVal
          ) {
            Decimal tempEffort = userStory.TR_Story_Point__c == null
              ? 0
              : Decimal.valueOf(userStory.TR_Story_Point__c);
            noOfManDaysRemaining =
              noOfManDaysRemaining - Double.valueOf(tempEffort);
          }
        }
        burnDownDATA.add(noOfManDaysRemaining);
      }
      fullCapacityDATA.add(currentSprint[0].TR_Total_Capacity_US_Points__c);
      if (
        refDateVal > currentSprint[0].TR_Start_Date__c &&
        refDateVal <= currentSprint[0].TR_End_Date__c
      ) {
        actualSprintCounter++;
      }
      idealburnDownDATA.add(
        sumOfManDays - (actualSprintCounter * tempIdealBurnDownPerDay)
      );
    }

    if (manDaysBeforeSprint > 0) {
      xAxisData.add(0, 'Before Sprint');
      if (burnDownDATA.isEmpty()) {
        burnDownDATA.add(sumOfManDays - manDaysBeforeSprint);
      } else {
        burnDownDATA.add(0, sumOfManDays - manDaysBeforeSprint);
      }
      fullCapacityDATA.add(0, currentSprint[0].TR_Total_Capacity_US_Points__c);
      idealburnDownDATA.add(0, sumOfManDays);
    }

    if (manDaysAfterSprint > 0 && todayDate > currentSprint[0].TR_End_Date__c) {
      xAxisData.add('After Sprint');
      burnDownDATA.add(0);
      fullCapacityDATA.add(currentSprint[0].TR_Total_Capacity_US_Points__c);
      idealburnDownDATA.add(0);
    }

    //adding the range and data to the chart
    burnDownChartData.labels = xAxisData;
    burnDownChartData.detail = burnDownDATA;
    burnDownChartData.legendtitle = 'Actual Burndown';
    //burnDownChartData.bgColor = burnDownColor;
    chartDatas.add(burnDownChartData);

    fullCapacityChartData.labels = xAxisData;
    fullCapacityChartData.detail = fullCapacityDATA;
    fullCapacityChartData.legendtitle = 'Capacity';
    //fullCapacityChartData.bgColor = fullCapacityColor;
    chartDatas.add(fullCapacityChartData);

    idealburnDownChartData.labels = xAxisData;
    idealburnDownChartData.detail = idealburnDownDATA;
    idealburnDownChartData.legendtitle = 'Ideal Burndown';
    //idealburnDownChartData.bgColor = idealBurnDownColor;
    chartDatas.add(idealburnDownChartData);
    return chartDatas;
  }
}
