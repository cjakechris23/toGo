/******************************************************
* Author : Jai Vera Cruz, KC Cruz
* Date : 02/24/22
* Description : handles all validation in Contact
* History : 03/09/22 changed string literals to custom labels
******************************************************/
public with sharing class ContactTriggerHandler {
    public static void ConvertContactNumber(List<Contact> conts) {
        // Loop through the Contact records that fired the trigger
        for (Contact con : conts){
            if (con.MobilePhone != Null){
                if (con.MobilePhone.isAlpha()){                             // If MobilePhone is all letters
                    con.MobilePhone.addError(Label.Wrong_Number_Format);    // Throw error on the field
                }
                con.MobilePhone = con.MobilePhone.replaceAll('\\s+','');       // Remove white spaces
                con.MobilePhone = con.MobilePhone.replace('+63', '0');         // Replace '+63' with '0'
                con.MobilePhone = con.MobilePhone.replaceAll('[^0-9.]','');    // Remove all characters except alphanumeric
                //System.debug('Formatted Mobile Phone: ' + con.MobilePhone);
            }
        }
    }
}