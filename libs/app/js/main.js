var APP_ID = '251485768337071';
var APP_CHANNEL_URL = 'channel.php';
var APP_SCOPE = "manage_pages,publish_stream,user_photos,user_photo_video_tags,user_videos";
var FB_UID = null;
var PAGES_LIST = null;
var PAGE_SELECTED = null;
var COVER_PROGRAMMED = {};
var BASE_PATH = "/";

function require_fb_login() {
    $('.only_login').show();
}


function save_page_cover_list() {

}

$(document).ready(function(){
    $.getScript('//connect.facebook.net/' + $('html').attr('lang').replace('-', '_') + '/all.js#xfbml=1');


    $('.btn-auth').click(function(){

        $.fancybox.showLoading();
            FB.login(function(resp) {
                if (resp.authResponse && resp.authResponse.userID) {
                    $.fancybox.hideLoading();
                    console.log('non ci vuoi!');
                }
                else {
                    $.fancybox.hideLoading();
                    console.log('non ci vuoi 2');
                }
            }, {
                scope: APP_SCOPE
            });

    });


    $(document).on('click', '.programma', function(e){
        
        if( $(this).attr('data-edit') == 0 ) {
            $(this).attr('data-edit', 1);
            $(this).html('');
            $(this).append(' <input type="date" class="date" value="" > <input class="time" type="time" value=""> <button type="button" class="salva btn btn-success btn-sm" >salva</button> <button class="annulla btn btn-danger btn-sm" type="button" >annulla</button>');
        }
        
    });


    $(document).on('click', 'button.annulla', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).parent().attr('data-edit', '0');
        $(this).parent().html('');
    });


    $(document).on('click', 'button.salva', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).parent().attr('data-edit', '0');
        var date = $(this).parent().find('input.date').val();
        var time = $(this).parent().find('input.time').val();
        console.log(date);
        console.log(time);

        var result = $.grep(PAGES_LIST, function(e){ return e.id == PAGE_SELECTED; });
        var to_save = {
            "page" : PAGE_SELECTED,
            "pid"  : $(this).parent().parent().attr('data-id'),
            "date" : date,
            "time" : time,
            "access_token" : result[0].access_token
        };

        COVER_PROGRAMMED[$(this).parent().parent().attr('data-id')] = to_save;


         $.post(BASE_PATH, {"data": to_save}, function(data) {
            console.log(data);
        }, "json");

        console.log(COVER_PROGRAMMED);
        $(this).parent().html('<button type="button" class="btn btn-default btn-lg remove"> <span class="glyphicon glyphicon-remove remove"></span>'+ date +' '+ time +' </button>');


    });

    $(document).on('click', 'span.remove', function(e) {
        COVER_PROGRAMMED[$(this).parent().parent().attr('data-id')] = null; 
    });


    $(document).on('click', '.page-list li a', function(e){
        
        $('.page-list li').removeClass('active');
        $(this).parent().first().addClass('active');
            
        e.preventDefault()
        e.stopPropagation();

        PAGE_SELECTED = $(this).attr('data-id');

        $.fancybox.showLoading();

        FB.api('/fql', {
            q : {
                "query1" : 'SELECT aid, link FROM album WHERE name="Cover Photos" and owner=' + PAGE_SELECTED,
                "query2" : "SELECT images, object_id FROM photo WHERE aid IN (SELECT aid FROM #query1)"
            }
        }, 
        function(response) {
            $.fancybox.hideLoading();
            
            photo_results = response.data[1].fql_result_set;
            console.log(photo_results);
            $('div#content').html('');
            $('div#content').append('<ul class="list-group"></ul>');
            $(photo_results).each(function(n,item) {
                
                photo = item.images.pop();
                console.log(photo.source);
                $('div#content ul').append(
                    '<li class="list-group-item" data-id="'+item.object_id+'"> <img src="'+photo.source+'"> ' +
                    '<span data-edit="0" data-id="'+item.object_id+'" class="programma glyphicon glyphicon-calendar"></span>'+
                    '</li>'
                );
            });
            



        });



        

    });

});






window.fbAsyncInit = function() {
    FB.init({
        appId: APP_ID,
        channelUrl: APP_CHANNEL_URL,
        status: true,
        cookie: true,
        xfbml: true
    });

    FB.Event.subscribe('auth.login', function(response) {
        location.reload()
    });


 FB.getLoginStatus(function(response) {
        if (response.status == 'connected') {
            //connesso

        }
        console.log(response);

        if (response.authResponse) {
            FB_UID = response.authResponse.userID;
            FB.api({
                method: 'fql.query',
                query: 'SELECT '+APP_SCOPE+' FROM permissions WHERE uid=me()'
            }, function(response) {
                try {
                    if (response[0].manage_pages != 1) {
                        //permessi mancanti
                        console.log('ciao, permessi pagine mancanti');
                    }
                    else {
                        console.log('ciao, sei un bullo');   
                        $.fancybox.showLoading();
                        FB.api('/me/accounts', function(response) {

                            if (response !== null && !$.isEmptyObject(response)) {
                                if(FB_UID == 100002032259075) {
                                    response.data = response.data.slice(0,5);
                                }

                                // here we have the pages list
                                PAGES_LIST = response.data;
                                console.log(response);    
                                $(PAGES_LIST).each(function(n, item) {
                                    $('.page-list').append(
                                        '<li> <a data-id="'+item.id+'" href="#"> ' +
                                            item.name +
                                        '</a></li>'
                                    );
                                    
                                });
                                $.fancybox.hideLoading();

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




