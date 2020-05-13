document.addEventListener('DOMContentLoaded',function(){
	
	bdy.onerror=function(e){alert(e);}
	// $('#draweq').button().on('click',drawequation);
	btns.onclick = edit;
	drawbut.onclick = function(){ drawequation().catch(netfail) };
	imgbox.onclick = fullscreen;
	eq.onblur = towhichbut;
	
	$(btns).resizable({handles: "se, sw", resize:changefont, minWidth:250, minHeight:140, zIndex:0});
	let mybut = $('#btns button');
	
	function changefont(e,ui){
		mybut.css({'font-size':13+(ui.size.width/100) +'px', 'height':5+(ui.size.height/8) +'px'});
	}
	
	butt=null;
	function towhichbut(e){
		butt = e.relatedTarget;
	}
	
	function edit(e){
		if(e.target.tagName=='BUTTON'){
			let txt=e.target.innerText;
			if(txt=='Draw')
				return;
			else if(txt=='⨷'){
				if(eq.selectionStart){
					if(eq.selectionStart==eq.selectionEnd)
						eq.setRangeText('',eq.selectionStart-1,eq.selectionStart);
					else
						eq.setRangeText('',eq.selectionStart,eq.selectionEnd);
				}
			}
			else if(txt=='→')
				eq.selectionEnd=eq.selectionStart=eq.selectionStart+1;
			else if(txt=='←')
				eq.selectionEnd=eq.selectionStart=eq.selectionStart-1;
			else if(txt=='clear')
				eq.value='';
			else{
				if(txt=='sin' || txt=='cos' || txt=='tan' || txt=='abs' || txt=='log')
					txt+='(';
				eq.setRangeText(txt,eq.selectionStart,eq.selectionEnd,'end');
			}
			if(butt==e.target){
				eq.focus();
				butt=null;
			}
		}
	}
	
	async function drawequation(){
		let name = eq.value;
		loadbox.style.display='grid';
		let resp = await fetch('/drawEquation', { method:'POST', body:new FormData(eqform) });
		if(!resp.ok)
			error.innerHTML='Some error occurred!';
		else{
			let imdata = await resp.blob();
			if(imdata.size<400)
				error.innerHTML="Error: Wrong syntax";
			else{
				//canvas.src=URL.createObjectURL(imdata);
				src=URL.createObjectURL(imdata);
				imgbox.insertAdjacentHTML('afterBegin',`${name}\n<img src='${src}' title='click for fullscreen'><br><br>`);
				eq.blur();
				imgbox.scroll({top:0, behavior:'smooth'});
				window.scroll({top:630, behavior:'smooth'});
			}
		}
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

	function netfail(e){
		alert('Some network error occured: '+e);
		loadbox.style.display='none';
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
	
});





