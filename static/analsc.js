document.addEventListener('DOMContentLoaded',function(){
	
	bdy.onerror=function(e){alert(e);}
	if(getCookie('file')){
		main.hidden=false;
		nofile.hidden=true;
	}
	else{
		main.hidden=true;
		nofile.hidden=false;
		footspace.style.height='30%';
	}
	$('#gtype').selectmenu({change:modify});
	$('#col1').selectmenu();
	$('#col2').selectmenu({change:function(){lab1.innerHTML='';}});
	$('#show').button();
	$('button').button();
	$('#show').on('click',function(){ plot().catch(netfail) });
	imgbox.onclick = fullscreen;
	
	$('#newf').button().on('click',delcook);
	$('#b1').button().on('click',function(){ descrip().catch(netfail) });
	$('#b2').button().on('click',function(){ alook().catch(netfail) });
	$('#b3').button().on('click',function(){ wholef().catch(netfail) });
	
	async function descrip(){
		loadbox.style.display='grid';
		try{
			let resp = await fetch('/text?q=descrip');
			let data= await resp.text();
			mydata.innerHTML=data;
		}catch{}
		loadbox.style.display='none';
	}
	async function alook(){
		loadbox.style.display='grid';
		try{
			let resp = await fetch('/text?q=alook');
			let data= await resp.text();
			mydata.innerHTML=data;
		}catch{}
		loadbox.style.display='none';
	}
	async function wholef(){
		loadbox.style.display='grid';
		try{
			let resp = await fetch('/text?q=wholef');
			let data= await resp.text();
			mydata.innerHTML=data;
		}catch{}
		loadbox.style.display='none';
	}

	async function plot(){
		if(gtype.value=='scatter' && col2.value==''){
			lab1.innerHTML="Select Column 2 - Scatter plot cannot be made with 1 column.";
			return;
		}
		let f=new FormData(form);
		if(col2.disabled || col2.value==''){
			f.delete('col2');
		}
		loadbox.style.display='grid';
		let resp = await fetch('/plot',{ method:'POST', body:f} );
		let fig= await resp.blob();
		if(fig.size<1000)
			fig.text().then( v=>lab1.innerHTML='Error: '+v );
		else{
			src=URL.createObjectURL(fig);
			imgbox.insertAdjacentHTML('afterBegin',`<img title='click for fullscreen' src='${src}'><br><br>`);
			imgbox.scrollTop=0;
		}
		loadbox.style.display='none';
		//lab1.innerHTML=canvas.src;
	}
	
	function delcook(){
		deleteCookie('file');
		document.location='/plotYourFile';
	}
	
	function modify(e,v){
		if(v.item.value=='scatter'){
			op.disabled=true;
			$('#col2').selectmenu('refresh');
			$('#col2').selectmenu('enable');
		}
		else if(v.item.value=='pie'){
			$('#col2').selectmenu('disable');
		}
		else{
			op.disabled=false;
			$('#col2').selectmenu('refresh');
			$('#col2').selectmenu('enable');
		}
	}

	function netfail(e){
		alert('Some network error occured: '+e);
		loadbox.style.display='none';
	}
	
	
	function fullscreen(e){
		if(e.target.tagName=='IMG'){
			pic = e.target;
			pic.title='click to exit';
			openFullscreen(pic);
			screen.orientation.lock('landscape').catch(e=>{});
			setTimeout(()=>{bdy.onclick = normal;},100);
		}
	}
	function normal(){
			screen.orientation.lock('natural').catch(e=>{});
			pic.title='click for fullscreen';
			closeFullscreen();
			screen.orientation.unlock();
			imgbox.onclick = fullscreen;
	}

	
	function openFullscreen(elem) {
	  if (elem.requestFullscreen) {
		elem.requestFullscreen();
	  } else if (elem.mozRequestFullScreen) { /* Firefox */
		elem.mozRequestFullScreen();
	  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
		elem.webkitRequestFullscreen();
	  } else if (elem.msRequestFullscreen) { /* IE/Edge */
		elem.msRequestFullscreen();
	  }
	}
	function closeFullscreen() {
		if(!document.fullscreen) return;
		if (document.exitFullscreen)
			document.exitFullscreen();
		else if (document.mozCancelFullScreen)
			document.mozCancelFullScreen();
		else if (document.webkitExitFullscreen)
			document.webkitExitFullscreen();
		else if (document.msExitFullscreen)
			document.msExitFullscreen();
	}
	
})