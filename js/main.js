requirejs.config({
    baseUrl: './',
});

require(["js/util"], function(util) {
    //This function is called when js/util.js is loaded.
    //If util.js calls define(), then this function is not fired until
    //util's dependencies have loaded, and the util argument will hold
    //the module value for "./util".
	$('#b_boot').append("util.js ... " + (util.version || "error") + "<br>");				    
});

require(["js/b"], function() {

});
