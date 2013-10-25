var APP_ID = '251485768337071';
var APP_CHANNEL_URL = 'channel.php';

function require_fb_login() {
	$('.only_login').show();
}

$(document).ready(function(){
	$.getScript('//connect.facebook.net/' + $('html').attr('lang').replace('-', '_') + '/all.js#xfbml=1');



});




window.fbAsyncInit = function() {
    FB.init({
        appId: APP_ID,
        channelUrl: APP_CHANNEL_URL,
        status: true,
        cookie: true,
        xfbml: true
    });


 FB.getLoginStatus(function(response) {
        if (response.status == 'connected') {
            //connesso

        }
        if (response.authResponse) {
            FB.api({
                method: 'fql.query',
                query: 'SELECT publish_actions,manage_pages FROM permissions WHERE uid=me()'
            }, function(response) {
                try {
                    if (response[0].publish_actions != 1) {
                        //permessi mancanti
                        
                    }
                    else {
                        
                        FB.api('/me', function(response) {

                            if (response !== null && !$.isEmptyObject(response)) {
                                $(document).trigger("rdd_social_apis_status_fb_logged", [response]);
                            }

                        

                           



                        });
                    }
                } catch (e) {
                    //notify
                }
            });
        } else {
            console.log('ciao, non sei loggato');

            require_fb_login();
        }
    });



};




