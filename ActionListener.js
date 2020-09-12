on("chat:message", function(msg) {
    if (msg.type == "api" && msg.content.includes("!steady")) {
        var playerChar = findObjs({ type: 'character', name: msg.who })[0];
        var adjustment = parseInt(msg.content.replace("!steady ", ""));

        if (playerChar) {
            var ap = findObjs({ type: 'attribute', characterid: playerChar.id, name: "ap" })[0];
            var apCurrent = parseInt(ap.get('current'));
            var apMax = parseInt(ap.get('max'));
            
            if(apCurrent == apMax){
                sendChat(msg.who, "/em takes a moment to steady themself...but they're pretty steady already.");
            }else{
                sendChat(msg.who, "/em takes a moment to steady themself.");
                sendChat('',"&{template:default} {{name=Steady Action}} {{AP Gain="+adjustment+"}}");
                apCurrent += adjustment;
                ap.set('current', apCurrent);
            }
            
            
        } else { sendChat(msg.who, "Action Failed because <b>I should be sending chat messages as my character!</b>"); }
    }
});