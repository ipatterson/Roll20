on("chat:message", function(msg) {

    if('!w'){
        var link = msg.content.split('--')[1];

        sendChat('Helper Bot',"/w " + msg.who + " " + link + "\" style=\"color:blue\")");
    }
    //Read the chat message for API commands and execute based on the command given
    if(msg.type == "api"){

        //Steady Action - Player recharges AP
        if (msg.content.includes("!steady")) {
            var playerChar = findObjs({ type: 'character', name: msg.who })[0];
            var adjustment = parseInt(msg.content.replace("!steady ", ""));

            if (playerChar) {
                var ap = findObjs({ type: 'attribute', characterid: playerChar.id, name: "ap" })[0];
                var apCurrent = parseInt(ap.get('current'));
                var apMax = parseInt(ap.get('max'));

                if (apCurrent == apMax) {
                    sendChat(msg.who, "/em takes a moment to steady themself...but they're pretty steady already.");
                } else {
                    sendChat(msg.who, "/em takes a moment to steady themself.");
                    sendChat('', "&{template:default} {{name=Steady Action}} {{AP Gain=" + adjustment + "}}");
                    apCurrent += adjustment;
                    ap.set('current', apCurrent);
                }


            } else { sendChat(msg.who, "Action Failed because <b>I should be sending chat messages as my character!</b>"); }
        }

        parseOpts = function(content, hasValue){
            return content.replace(/\s+$/g, "") //Remove spaces
                .split(/\s+--/) //Split string, turn each '--' into a section
                .slice(1)
                .reduce((m, arg) => { //Determine if each section has a value and assign it
                    const kv = arg.split(/\s(.+)/);
                    if (hasValue.includes(kv[0])) {
                        m[kv[0]] = kv[1] || "";
                    } else {
                        m[arg] = true;
                    }
                    return m;
                }, {});
        }

        createBaseAttackRoll = function(diceMod){
            if(diceMod < 0){
                return (Math.abs(diceMod) + 3) + "d20>8kl3";
            } else{
                return (diceMod + 3) + "d20>8";
            }
        }

        createBaseStatRoll = function(diceMod, toggle){
            var base_roll = (Math.abs(diceMod) + 3) + "d20";

            if(toggle == "attack"){
                if(diceMod < 0){
                    base_roll = base_roll.concat(">8kl3");
                } else {
                    base_roll = base_roll.concat(">8");
                }
            } else {
                if(diceMod < 0){
                    base_roll = base_roll.concat("kl3");
                } else {
                    base_roll = base_roll.concat("k3");
                }
            }

            return base_roll;
        }

        //Attack Action
        if(msg.content.includes("!attack")){

            const hasValue = ["wpnPower", "tier", "diceMod", "powerMod"];

            var args = parseOpts(msg.content.substring(7),hasValue);

            var base_attack = createBaseAttackRoll(parseInt(args.diceMod));

            sendChat(msg.who, '&{template:attack} {{name=Attack Roll}} {{base='+base_attack+'}} {{diceMod='+args.diceMod+'}} {{wpnPower='+args.wpnPower+'}} {{powerMod='+args.powerMod+'}} {{levelTier='+args.tier+'}} {{result=[['+base_attack+' * ('+args.wpnPower+' + ('+args.powerMod+' * '+args.tier+'))]]}}');

        }

        //Stat Action
        if(msg.content.includes("!statroll")){

            const hasValue = ["statName", "statValue", "toggle", "tier", "diceMod", "powerMod"];

            var args = parseOpts(msg.content.substring(9), hasValue);

            var base_stat = createBaseStatRoll(parseInt(args.diceMod), args.toggle);

            var operator;
            var powerFormula;
            var type;

            if(args.toggle == "attack"){
                type = "Success Based";
                operator = "*";
                powerFormula = "("+args.powerMod+"*"+args.tier+")";
            }else{
                type = "Additive";
                operator = "+";
                powerFormula = args.powerMod;
            }

            sendChat(msg.who, '&{template:stat} {{name='+type+'}} {{base='+base_stat+'}} {{diceMod='+args.diceMod+'}} {{statName='+args.statName+'}} {{statValue='+args.statValue+'}} {{powerMod='+args.powerMod+'}} {{levelTier='+args.tier+'}} {{result=[['+base_stat +' '+ operator +' ('+args.statValue+'+'+powerFormula+')]]}}');

        }
    }
});
