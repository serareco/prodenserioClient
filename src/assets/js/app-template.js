$(document).ready(function(){
	
	/** BUTTON TOGGLE FUNCTION **/
	$(".btn-collapse-sidebar-left").click(function(){
		"use strict";
		$(".top-navbar").toggleClass("toggle");
		$(".sidebar-left").toggleClass("toggle");
		$(".page-content").toggleClass("toggle");
		$(".icon-dinamic").toggleClass("rotate-180");
		
		if ($(window).width() > 991) {
			if($(".sidebar-right").hasClass("toggle-left") === true){
				$(".sidebar-right").removeClass("toggle-left");
				$(".top-navbar").removeClass("toggle-left");
				$(".page-content").removeClass("toggle-left");
				$(".sidebar-left").removeClass("toggle-left");
				if($(".sidebar-left").hasClass("toggle") === true){
					$(".sidebar-left").removeClass("toggle");
				}
				if($(".page-content").hasClass("toggle") === true){
					$(".page-content").removeClass("toggle");
				}
			}
		}
	});
	$(".btn-collapse-sidebar-right").click(function(){
		"use strict";
		$(".top-navbar").toggleClass("toggle-left");
		$(".sidebar-left").toggleClass("toggle-left");
		$(".sidebar-right").toggleClass("toggle-left");
		$(".page-content").toggleClass("toggle-left");
	});
	$(".btn-collapse-nav").click(function(){
		"use strict";
		$(".icon-plus").toggleClass("rotate-45");
	});

/** END BUTTON TOGGLE FUNCTION **/
	
	if ($('.inline-popups').length > 0){
			$('.inline-popups').magnificPopup({
			  delegate: 'a',
			  removalDelay: 500,
			  callbacks: {
				beforeOpen: function() {
				   this.st.mainClass = this.st.el.attr('data-effect');
				}
			  },
			  midClick: true
			});
	}
	$('.magnific-img').magnificPopup({
		type:'image',
		removalDelay: 300,
		mainClass: 'mfp-fade'
	});
// 	/** END MAGNIFIC POPUP **/
});