document.addEventListener('DOMContentLoaded',function(){
	
	bdy.onerror=function(e){alert(e);}
	
	let maxz=page.dataset.maxz;
	$('.ui-resizable-handle').remove();
	for(let bx of page.getElementsByClassName('box'))
		$(bx).resizable({handles: "se, sw", start:grabresize, resize:resizing}).draggable({handle:'.bar', start:grabdrag, drag:dragging});
	$('.ui-resizable-handle').addClass('ui-icon ui-icon-triangle-1-sw');
	//if(typeof box1 !== 'undefined') box1.style.top=page.offsetHeight-300 +'px';
	//if(typeof box2 !== 'undefined') box2.style.top=page.offsetHeight/2-120 +'px';
	
	$('#page').on('focusin','.box',inside).on('focusout','.box',outside)
				.on('focusin','textarea',function() { this.style.backgroundColor='azure';})
				.on('blur'   ,'textarea',function() { this.style.background='none'; this.innerHTML=this.value; })
				.on('input','.txtdialog',csschange)
				.on('blur','.txtdialog',hideme)
				.on('click touchstart','.delme',delme)
				.on('click touchstart','.mycss',opendialog)
				.on('change','.file',function(){ loadimg(this).catch(netfail) });
	
	$('.txtdialog').on('touchstart',stopit);
	$('.but').button().click(addbox);
	$('#save').click(function(){ savePage().catch(netfail) });
	$('#preview').click(getpreview);
	copybut.onclick=copydark;
	copybut2.onclick=copydark2;
	if(navigator.share)
		sharebut.onclick = sharelink;
	else
		sharebut.style.display='none';
	bdy.onresize = doresize;
	doresize();
	if(page.dataset.pass)
		setTimeout(()=>{ checkPass().catch(()=>{netfail();location.reload()}) }, 500);
	
	
	function doresize(){
		let wm = page.dataset.width, wc = bdy.clientWidth;
		fact = wc/wm;
		page.style.zoom=fact;
		fact=1/fact;
		$('.barbut').css('font-size',fact*.5+.4+'em');
		$('.mycss').css('right',30 + fact*10 + 'px');
		$('.ui-resizable-handle').css('zoom',.6+fact/2);
	}
	
	function stopit(e){
		e.stopPropagation();
	}
	
	function csschange(){
		this.parentElement.parentElement.parentElement.getElementsByClassName('user')[0].style= this.value;
	}
	function hideme(){
		this.parentElement.hidden=true;
	}
	
	function opendialog(e){
		if(e.target.closest('.box').style.boxShadow=='none')return;
		let dlg = this.nextElementSibling;
		dlg.hidden=false;
		dlg.firstElementChild.focus();
		dlg.style.zIndex=maxz++;
	}
	
	function inside(e){
		if(this.classList.contains('box') && !this.contains(e.relatedTarget)){
			$(this.firstElementChild).css("display", 'initial');
			this.style.boxShadow='0px 0px 8px 4px lightblue';
			this.style.zIndex=maxz++;
		}
	}
	
	function outside(e){
		if(this.classList.contains('box') && e.relatedTarget && !this.contains(e.relatedTarget)){
			this.firstElementChild.style.display='none';
			this.style.boxShadow='none';
		}
	}
	
	async function loadimg(elem){
		let f=elem.files[0];
		if(f){
			let form = new FormData();
			form.append('file',f);
			loadbox.style.display='grid';
			let resp = await fetch('/saveImage',{method:'POST',body:form });
			if(resp.ok){
				let data = await resp.json();
				if(data['code']!=0)
					alert('Image not Saved - Error occurred on server: '+data['msg']);
				else{
					elem.nextElementSibling.src='../static/mypage/'+data['msg'];
					elem.nextElementSibling.hidden=false;
					elem.style.display='none';
				}
			}
			else alert('some error occured while saving image.');
			loadbox.style.display='none';
		}
	}
	
	function delme(){
		if(confirm('Confirm delete ??')){
			$(this.parentElement.parentElement).hide('fade',600);
			this.parentElement.parentElement.remove();
		}
	}
	
	function getpreview(){
		let clr='skyblue';
		if(this.style.backgroundColor!=clr){
			this.style.backgroundColor=clr;
			$('.box').css({'border-color':'rgb(173, 216, 230,0)','backgroundSize':'0'});
			for(let i of insertbar.getElementsByClassName('but'))
				i.style.visibility='hidden';
			//$('.but').button('widget').attr('hidden',true);
			preview.style.visibility='initial';
			$('.txt').attr('placeholder','');
			$('.ui-icon').css('display','none');
			
		}
		else{
			this.style.backgroundColor='';
			$('.box').css({'border-color':'rgb(173, 216, 230,.8)','backgroundSize':'initial'});
			$('.but').attr('hidden',false);
			for(let i of insertbar.getElementsByClassName('but'))
				i.style.visibility='initial';
			$('.txt').attr('placeholder','Your content goes here...');
			$('.ui-icon').css('display','initial');
		}
	}
	
	async function savePage(){
		if(!page.dataset.pass){
			let pass1=1, pass2=2, str='';
			while(pass1!=pass2 && pass1){
				pass1=prompt(str + 'Enter Password, only if you do not want others to have edit access.\nLeave it blank otherwise.');
				if(pass1){
					pass2=prompt('Confirm Password : ');
					if(pass1==pass2){
						loadbox.style.display='grid';
						let resp = await fetch('/savePass',{method:'POST',headers:{'Content-Type': 'application/json;charset=utf-8'}, body:JSON.stringify(pass1) });
						if(!resp.ok)
						{
							loadbox.style.display='none';
							alert('Password (and page) not Saved - Some Error occurred. ');
							return;
						}
						let data = await resp.json();
						loadbox.style.display='none';
						if(data['code']!=0){
							alert('Password (and page) not Saved - Error occurred on server: '+data['msg']);
							return;
						}
						page.dataset.pass = data['msg'];
						alert(`Remember your password - "${pass1}", you cannot change it again!`);
					}
					str='Password mismatch.\n';
				}
			}
		}
		//page.dataset.width=bdy.clientWidth;
		page.dataset.maxz=maxz;
		page.style.zoom=1;
		let code = pagecode + page.outerHTML + '</body></html>';
		page.style.zoom=1/fact;
		
		loadbox.style.display='grid';
		let resp = await fetch('/savePage',{method:'POST',headers:{'Content-Type': 'application/json;charset=utf-8'}, 						body:JSON.stringify(code) });
		if(resp.ok)
		{
			let data = await resp.json();
			if(data['code']==0){
				popup.style.fontSize=40/fact + 'px';
				popup.showModal();
			}
			else
				alert('Page Not Saved - Error occurred on server: '+data['msg']);
		}
		else
			alert('Page Not Saved - Some Error occurred.');
		loadbox.style.display='none';	
	}
	
	function addbox(){
		if(this.value=='text'){
			page.insertAdjacentHTML('afterbegin', temptxt.innerHTML);
		}
		else if(this.value=='block'){
			page.insertAdjacentHTML('afterbegin', tempblock.innerHTML);
		}
		else if(this.value=='frame'){
			page.insertAdjacentHTML('afterbegin', tempframe.innerHTML);
		}
		else if(this.value=='image'){
			page.insertAdjacentHTML('afterbegin', tempimg.innerHTML);
		}
		else return;
		newbox = page.firstElementChild;
		newbox.style.top=window.scrollY + bdy.offsetHeight*fact/2-150 + 'px';
		newbox.style.left=window.scrollX + bdy.offsetWidth*fact/2-150 + 'px';
		newbox.getElementsByClassName('txtdialog')[0].addEventListener('touchstart',stopit);
		newbox.style.zIndex=maxz++;
		$(newbox).resizable({handles: "se, sw", start:grabresize, resize:resizing}).draggable({handle:'.bar', start:grabdrag, drag:dragging});
		//$('.ui-resizable-handle').addClass('ui-icon ui-icon-triangle-1-sw');
	}
	
	async function checkPass(){
		let pass, cnt=0, ret, str='';
		while(cnt<3){
			pass=prompt(str + 'Enter Password : ') ;
			loadbox.style.display='grid';
			let resp = await fetch('/savePass',{method:'POST',headers:{'Content-Type': 'application/json;charset=utf-8'}, 						body:JSON.stringify(pass?pass:'') });
			if(!resp.ok)
				str = 'Some Error occured. Try again.\n\n';
			else{
				let data = await resp.json();
				if(page.dataset.pass != data['msg']){
					str = 'Wrong Password! Try Again.\n\n';
					cnt++;
				}
				else{
					loadbox.style.display='none';
					return;
				}
			}
			loadbox.style.display='none';
		}
		alert('Wrong Password!\nForgot password?? Contact Admin or try again later.');
		location='/';
	}
	
	function copydark(){
		darktxt.hidden=false;
		darktxt.select();
		document.execCommand("copy");
		darktxt.hidden=true;
	}
	function copydark2(){
		darktxt2.hidden=false;
		darktxt2.select();
		document.execCommand("copy");
		darktxt2.hidden=true;
	}
	
	function sharelink(){
		navigator.share({
			title: 'My Web-Page!',
			url: darktxt.value
		}).catch(console.error);
	}
	
	function netfail(e){
		alert('Some network error occured: '+e);
		loadbox.style.display='none';
	}
	
	function grabdrag(e,ui){
		lf=ui.position.left;
		tp=ui.position.top;
	}
	function grabresize(e,ui){
		lf=ui.position.left;
		tp=ui.position.top;
		wd=ui.size.width;
		ht=ui.size.height;
	}
	function dragging(e,ui){
		ui.position.left=lf + (ui.position.left-lf )*fact;
		ui.position.top =tp + (ui.position.top- tp )*fact;
	}
	function resizing(e,ui){
		ui.size.width = wd + (ui.size.width -wd)*fact;
		ui.size.height= ht + (ui.size.height-ht)*fact;
	}
	
	pagecode="<html><head><meta name='viewport' content='width=device-width'><script src='/static/jquery/jquery-3.4.1.min.js'></script><link rel='stylesheet' href='/static/jquery/jquery-ui-1.12.1.custom/jquery-ui.min.css'><script src='/static/jquery/jquery-ui-1.12.1.custom/jquery-ui.min.js'></script><link rel='stylesheet' href='/static/mystyle.css'><script src='/static/myscript.js'></script></head><body id='bdy'>"; 
});





