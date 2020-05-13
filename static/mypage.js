document.addEventListener('DOMContentLoaded',function(){
	
	bdy.onerror=function(e){alert(e);}
	$('#start').button().click(start);
	pname.onchange=clr;
	footer.style.top=bdy.scrollHeight-60;
	function clr(){
		error.innerHTML='';
		pname.setCustomValidity('');
		
	}
	async function start(){
		if( !pname.checkValidity()){
			if(pname.value=='')
				pname.setCustomValidity('Your page need a name.');
			else
				pname.setCustomValidity("Capital letters, Space and Special characters are not allowed.");
		}else{
			let resp = await fetch('/checkPage',{method:'POST',headers: {'Content-Type': 'application/json;charset=utf-8'}, 						body:JSON.stringify(pname.value)});
			let msg = await resp.json();
			if(msg['code']){
				error.innerHTML='Sorry, User of this name already exists.'
			}else{
				setCookie('user',msg['msg']);
				location = `/createPage/`;
				//location = `/createPage/${msg['msg']}`;
			}
		}
	}

});