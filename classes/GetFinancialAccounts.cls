public class GetFinancialAccounts {
	@AuraEnabled(cacheable=true)
    public static List<AccountWrapper> getAccounts(){
        List<AccountWrapper> wrapperList = new List<AccountWrapper>();
        List<Account> accountsList = [SELECT Id,Name,Owner.Name,Phone,Website,AnnualRevenue FROM Account WHERE Industry='Financial Services' LIMIT 9999];
        if(!accountsList.isEmpty()){
            for(Account financialAccount: accountsList){
                AccountWrapper aWrapper = new AccountWrapper();
                aWrapper.Id = financialAccount.Id;
                aWrapper.Name = financialAccount.Name;
                aWrapper.Owner = financialAccount.Owner.Name;
                aWrapper.Phone = financialAccount.Phone;
                aWrapper.Website = financialAccount.Website;
                aWrapper.AnnualRevenue = financialAccount.AnnualRevenue;
                aWrapper.nameURL = '/'+financialAccount.Id;
                wrapperList.add(aWrapper);
            }
        }
        return wrapperList;
    }
    
    public class AccountWrapper{
        @AuraEnabled public String Id {set;get;}
        @AuraEnabled public String Name {set;get;}
        @AuraEnabled public String Owner {set;get;}
        @AuraEnabled public String Phone {set;get;}
        @AuraEnabled public String Website {set;get;}
        @AuraEnabled public Decimal AnnualRevenue {set;get;}
        @AuraEnabled public String nameURL {set;get;}
    }
}