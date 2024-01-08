import {ShowToastEvent} from 'lightning/platformShowToastEvent'; 
import { createRecord } from 'lightning/uiRecordApi'; 

 

//success toast 

const showSuccessToast=(strMessage,strMode)=>{ 

    showToast('Success',strMessage,'success',strMode); 

}; 

//error toast 

const showErrorToast=(strMessage,strMode)=>{ 

    showToast('Error',strMessage,'error',strMode); 

}; 

//Warning toast 

const showWarningToast=(strMessage,strMode)=>{ 

    showToast('Warning',strMessage,'warning',strMode); 

}; 

//generic toast message 

const showToast=(strTitle,strMessage,strVariant,strMode,strMessageData)=>{ 

    if(isNull(strTitle) || isNull(strMessage) || isNull(strVariant)){ 

        showErrorToast('Basic attributes not found for toast!'); 

        return; 

    } 

    if(isNull(strMode)) 

        strMode='dismissable'; 

    const evt = new ShowToastEvent({ 

        title: strTitle, 

        message: strMessage, 

        messageData: strMessageData, 

        variant: strVariant, 

        mode: strMode 

    }); 

    dispatchEvent(evt); 

}; 

//check if string is blank 

const isBlank=(strValue)=>{ 

    if(isNull(strValue) || strValue.trim()==='') 

        return true; 

    else 

        return false; 

}; 

//check if string is not blank 

const isNotBlank=(strValue)=>{ 

    return !isBlank(strValue); 

}; 

//Check if null 

const isNull=(objValue)=>{ 

    if(objValue===null||objValue===undefined) 

        return true; 

    else 

        return false; 

} 

//Check if not null 

const isNotNull=(objValue)=>{ 

    return !isNull(objValue); 

} 

//Check if Array is Empty 

const isEmpty=(objValue)=>{ 

    if(isNull(objValue)||!Array.isArray(objValue)|| objValue.length<1) 

        return true; 

    else 

        return false; 

} 

//Check Array is not empty 

const isNotEmpty=(objValue)=>{ 

    return !isEmpty(objValue); 

} 

//sort a list 

const sortBy=(field, reverse, primer)=>{ 

    const key = primer 

        ? function(x) { 

              return primer(x[field]); 

          } 

        : function(x) { 

              return x[field]; 

          }; 

 

    return function(a, b) { 

        a = key(a); 

        b = key(b); 

        return reverse * ((a > b) - (b > a)); 

    }; 

} 

// Generic Event dispatcher 

const genericEvent=(eventName,evtDetails,context)=>{ 

    consoleLog('Details :',eventName); 

    const evt = new CustomEvent( 

        eventName, { 

            detail: evtDetails 

        } 

    ); 

    context.dispatchEvent(evt); 

} 

/*Filter Method 

* Description : Funtion to return subset of array 

* Parameter : arr : Array to be reduced ; value : length of subset 

*/ 

const arraySubset=(arr,value) => { 

    return arr.filter(function (ele, index) { 

        return index < value; 

    }); 

} 

/*Filter Method 

* Description : Funtion to remove existing selected value from picklist value set 

* Parameter : arr : picklist option value ; arr2 : array of option to be removed 

*/ 

const arrayRemove=(arr,arr2) => { 

    return arr.filter(function (ele) { 

        return !arr2.includes(ele.value); 

    }); 

} 

/*Filter Method 

* Description : Funtion to remove element from index 

* Parameter : arr : array of value ; value : index to be removed 

*/ 

const arrayIndexRemove=(arr,value) => { 

    return arr.filter(function (ele, index) { 

        return index != value; 

    }); 

} 

//get URL Parameters in encoded format to set on a URL 

const getEncodedParams=(strKey,strValue) => { 

    return encodeURIComponent(strKey)+'='+encodeURIComponent(strValue); 

} 

 

// Fetch URL Query String 

const getURLQueryStringValues=()=>{ 

    try { 

        /* Example URL: /s/isd-needs-assessment-domain-selection?attr1=value1&attr2=value2  

        oQueryString will be as follows: 

        {"attr1":"value1", "attr2";"value2" }*/             

        var url = document.createElement('a'); 

        url.href = document.URL; 

        //var url = new URL(document.URL); 

        var sQueryString = url.search.substring(1); 

        //var sQueryString = window.location.search.substring(1); 

        var aQueryString = sQueryString.split("&"); 

        var oQueryString = {}; 

        oQueryString["PathName"] = url.pathname; 

        for(var i=0; i<aQueryString.length; i++) 

        { 

            var aStr = aQueryString[i].split("="); 

            oQueryString[aStr[0]] = aStr[1]; 

        } 

        return oQueryString; 

    } catch(e) { 

        this.consoleLog(e.stack, true); 

    } 

} 
const closeSubTabInConsole=() => { 

    invokeWorkspaceAPI('isConsoleNavigation').then(isConsole => {
        if (isConsole) {
          invokeWorkspaceAPI('getFocusedTabInfo').then(focusedTab => {
            invokeWorkspaceAPI('closeTab', {
                tabId: focusedTab.tabId
           })
          });
        }
      });

}

const openSubTabInConsole=(pageRef,strTabLabel,strTabIcon) => { 

    invokeWorkspaceAPI('isConsoleNavigation').then(isConsole => {
        if (isConsole) {
          invokeWorkspaceAPI('getFocusedTabInfo').then(focusedTab => {
            invokeWorkspaceAPI('openSubtab', {
               parentTabId: focusedTab.tabId,
               pageReference: pageRef
           }).then(tabId => {
            invokeWorkspaceAPI('setTabLabel', {
                             tabId: tabId,
                             label: strTabLabel
                         });
             invokeWorkspaceAPI('setTabIcon',{
                                 tabId: tabId,
                                 icon: strTabIcon,
                                 iconAlt: strTabLabel
                             });
             
          });
          });
        }
      });

}
 
const invokeWorkspaceAPI=(methodName, methodArgs) => {
    return new Promise((resolve, reject) => {
        const apiEvent = new CustomEvent("internalapievent", {
          bubbles: true,
          composed: true,
          cancelable: false,
          detail: {
            category: "workspaceAPI",
            methodName: methodName,
            methodArgs: methodArgs,
            callback: (err, response) => {
              if (err) {
                  return reject(err);
              } else {
                  return resolve(response);
              }
            }
          }
        });
   
        window.dispatchEvent(apiEvent);
      });
}

export {showSuccessToast,showErrorToast,showToast,isBlank,isNotBlank,sortBy,isNotNull,isNull,isEmpty,isNotEmpty,genericEvent,arraySubset,arrayRemove,arrayIndexRemove,getURLQueryStringValues,showWarningToast,getEncodedParams,openSubTabInConsole,closeSubTabInConsole};