define('text',
    [], function() {
        var names = {
            cashier:{
                first: ['Shelby','Patsy','Lou Ann','Ginny','Mae','Trina','Winona', 'Naomi','Shirleen','Bitsy','Doreen','Tanya','Tammy','Lurleen','Peggy','Pearl','Billie','Betty','Opal',
                        'Cheyenne','Angel','Loretta','Condoleeza','Sadie','Twyla','Rhonda','Crystal'],
                last: ['Ann','Lou','Lee','Kay','Marie','Lynn','Jo','Mae','April','Sue' ]

                },
            npc: []
        },
            getCashierName = function (maxChars) {
                var name = '';

                while (!name || name.length > maxChars){
                    name = names.cashier.first[Math.floor(Math.random() * names.cashier.first.length)] + ' ' +
                    names.cashier.last[Math.floor(Math.random() * names.cashier.last.length)];
                    if (!maxChars)
                        break;
                }
                return name;
            };
                
        
        return {
            getCashierName: getCashierName
        };
});



