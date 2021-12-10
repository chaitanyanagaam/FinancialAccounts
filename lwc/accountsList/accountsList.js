import { LightningElement,wire } from 'lwc';
import getAccountsList from '@salesforce/apex/GetFinancialAccounts.getAccounts';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
export default class AccountsList extends LightningElement {
    accountsList;
    accountListTemp;
    searchAllValue;
    saveDraftValues = [];
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;
    wiredAccounts;
    columns = [
        { 
          label: 'Account name',
            fieldName: 'nameURL',
            type: 'url',
            typeAttributes: {label: { fieldName: 'Name' }, 
            target: '_blank'},
            sortable: true,
            cellAttributes: { alignment: 'left' }, },
        {
            label: 'Account Owner',
            fieldName: 'Owner',
            type: 'string',
            sortable: true,
            cellAttributes: { alignment: 'left' },
        },
        { label: 'Phone', fieldName: 'Phone', type: 'string',editable: true,cellAttributes: { alignment: 'left' }, },
        { label: 'Website', fieldName: 'Website', type: 'url',editable: true,cellAttributes: { alignment: 'left' }, },
        { label: 'Annual Revenue', fieldName: 'AnnualRevenue', type: 'number',editable: true,cellAttributes: { alignment: 'left' }, },
    ];
    
    @wire(getAccountsList)
    wiredAccounts(value) {
        this.wiredAccounts = value;
        const {data,error} = value;
        if (data) {
            this.accountsList = data;
            this.accountListTemp = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.accountsList = undefined;
        }
    }

    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                  return primer(x[field]);
              }
            : function (x) {
                  return x[field];
              };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.accountsList];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.accountsList = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }


    handleKeyChange(event) {
        this.searchAllValue = event.target.value;
        let searchStr = this.searchAllValue.toLowerCase();
        var searchList = [];
        const regex = new RegExp(
            "(^" + searchStr + ")|(." + searchStr + ")|(" + searchStr + "$)"
        );
       
        if (searchStr.length > 2) {
            this.searchable = this.accountsList.filter((item) => {
                if (regex.test(
                        item.Name.toLowerCase() +
                            " " +
                            item.Name.toLowerCase()
                    ))
                {
                    searchList.push(item);
                }
            });
        } else {
            this.accountsList = this.accountListTemp;
        }

        if(searchList.length>0){
            this.accountsList = searchList;
        } 
    }

     handleSave(event) {
        this.saveDraftValues = event.detail.draftValues;
        const recordInputs = this.saveDraftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        const promises = recordInputs.map((recordInput) => {
            return updateRecord(recordInput);
        });
        Promise.all(promises).then(res => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Records Updated Successfully!!',
                    variant: 'success'
                })
            );
            this.saveDraftValues = [];
            refreshApex(this.wiredAccounts)
            .then(()=>{
                console.log(JSON.stringify(this.wiredAccounts));
            })
            //return this.refresh();
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'An Error Occured!!',
                    variant: 'error'
                })
            );
        }).finally(() => {
            this.saveDraftValues = [];
        });
    }
}