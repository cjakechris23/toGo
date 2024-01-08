import LightningDatatable from 'lightning/datatable';
//import the template so that it can be reused
import DatatablePicklistTemplate from './trPicklistTemplate.html';
import DatatableTextareatemplate from "./trTextareaTemplate.html";
import { loadStyle } from 'lightning/platformResourceLoader';
import CustomDataTableResource from '@salesforce/resourceUrl/trCustomDataTable';

export default class CustomDataTable extends LightningDatatable {
    static customTypes = {
        picklist: {
            template: DatatablePicklistTemplate,
            typeAttributes: ['label', 'placeholder', 'options', 'value', 'context'],
        },
        textarea: {
          template: DatatableTextareatemplate,
          typeAttributes: [
            "label",
            "placeholder",
            "value",
            "context",
            "required",
            "maxlength",
            "variant"
          ]
        }

    };

    renderedCallback() {
        Promise.all([
            loadStyle(this, CustomDataTableResource),
        ]).then(() => { })
    }
}