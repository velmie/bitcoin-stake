(function($) {
    "use strict";
  $(document).ready(function () {

        $('#getintouch').on('click', function(event) {
            var target = $(this.getAttribute('href'));
            if( target.length ) {
                $("html, body").animate({ scrollTop: $(document).height() }, 1000);
            }
        });

        function homeheaderInit(){
            $(window).scroll(
                function(){
                    var topScroll=$(this).scrollTop();
                    if(topScroll > 50){
                        $('.header').addClass('header-scroll'); }
                    else if(topScroll < 50){
                        $('.header').removeClass('header-scroll');
                    }
                }
            );
        }
        homeheaderInit();
				$('.dropdown-toggle').dropdown();

        // Mobile menu button

        $('.menu-btn').on('click',function(){
            $('.mobile-left-menu').addClass('open');
            $('.overlay').fadeIn(500);
        });
        $('.left-mobile-menu-close').on('click',function(){
            $('.mobile-left-menu').removeClass('open');
            $('.overlay').fadeOut(500);
        });
        $(".td-collapse").hide();
        $(window).resize(function(){
        		var windowWidth=$(this).width();
        		if(windowWidth<767){
        			$(".td-collapse").css({'display':'block'}).hide();
        		}
        		else if(windowWidth>767){
        			$(".td-collapse").css({'display':'table-cell'}).show();
        		}
        });
        $('.collapse-arrow').on("click",function(){
        				$(this).parents("tr").find(".td-collapse").slideToggle("slow"); 
        });

        //Datepicker
        $('.input-daterange').datepicker({});
        //Table colHover
        function tableColActive(){
						var index=$('.init-selected-col-td').index();
						$('.tableColHover tr').each(function(i){
      					$(this).children('td').eq(index).addClass('init-selected-col-td');
      			});
        };
        tableColActive();
        function tableColHover(){
        		$('.tableColHover td').mouseover(function(){
        			var index=$(this).index();
        			$('.tableColHover tr').each(function(i){
        					$(this).children('td').eq(index).addClass('select-td');
        			});
        		}); 
        		$('.tableColHover td').mouseout(function(){
        			var index=$(this).index();
        			$('.tableColHover tr').each(function(i){
        					$(this).children('td').eq(index).removeClass('select-td');
        			});
        		});
        }
        tableColHover();
        //DropDown 
        function customerDropDown(){
      		$('.customer-select li').on('click',function(){
      			var text=$(this).addClass('active').find('a').text();
      			$(this).siblings('li').removeClass('active');
      			$(this).parents('ul').siblings('.btn').html(text+'<span class="caret"></span>');
      		});
        }
        customerDropDown();
        //Input Mask (http://www.jasny.net/bootstrap/javascript/#inputmask)
        //AudioPlayer
        $( 'audio' ).audioPlayer();
        //Qrcode (https://github.com/jeromeetienne/jquery-qrcode)
        $('#qrcode').qrcode("http://ikantam.com");
        // Tabs
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
          $('.input-daterange').datepicker({});
        })
        //Audio Slider
        if ($('input').is('.range')){
            sliders();
        }
        //Modal function
        function modal(){
            $('.modal-btn').on("click",function(){
                $('body').addClass('modal-open');
                var modalTarget=$(this).attr('data-target');
                $(modalTarget).css({'top':'0','opacity':'1'});

            });
            $(".close-btn").on("click",function(){
                $('.modal-box').css({'opacity':'0','top':'-9999px'});
            });
        }
        modal();
	});
})(jQuery);
