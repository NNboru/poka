document.addEventListener('DOMContentLoaded',function(){
	$('textarea').attr('placeholder','').attr('readonly',true);
	$('.ui-resizable-handle').remove();
	$('.box').css('border','none');
	
	
	bdy.onresize = doresize;
	doresize();
	function doresize(){
		let wm = page.dataset.width, wc = bdy.clientWidth;
		fact = wc/wm;
		page.style.zoom=fact;
	}
});