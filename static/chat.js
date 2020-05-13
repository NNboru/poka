/*
socket = io();

//socket.on('connect',()=>{});
	
socket.on('room', function(msg){
	box.insertAdjacentHTML('beforeEnd',`<div>${msg}</div>`);
});
*/
bstate = 1;
blinkpos=typer.firstElementChild;
smilediv.style.display='none';
setInterval(blinking, 2000);
function blinking(){
	let but = blinkpos;
	but.innerHTML='|';
	setTimeout(()=>{but.innerHTML=''},1000);
}

bdy.onkeydown=insertletter;
function insertletter(e){
	//console.dir(e);
	if(e.ctrlKey){
		if(e.key.toLowerCase()=='v'){
			pastebut.click();
		}
		else if(e.keyCode==13){
			sendbut1.click();
		}
	}
	else if(e.keyCode==13){
		blinkpos.innerHTML='';
		blinkpos.insertAdjacentHTML('beforeBegin',`<div class='blinker'></div><br>`);
		blinking();
		blinkpos.scrollIntoViewIfNeeded();
	}else if(e.keyCode==35){
		blinkpos.innerHTML='';
		blinkpos = typer.lastElementChild;
		blinking();
	}
	else if(e.keyCode==36){
		blinkpos.innerHTML='';
		blinkpos = typer.firstElementChild;
		blinking();
	}
	else if(e.keyCode==37){
		if(blinkpos.previousElementSibling){
			blinkpos.innerHTML='';
			blinkpos = blinkpos.previousElementSibling.previousElementSibling;
			blinking();
		}
	}
	else if(e.keyCode==39){
		if(blinkpos.nextElementSibling){
			blinkpos.innerHTML='';
			blinkpos = blinkpos.nextElementSibling.nextElementSibling;
			blinking();
		}
	}
	else if(e.keyCode==8){
		if(blinkpos.previousElementSibling){
			blinkpos.previousElementSibling.remove();
			blinkpos.previousElementSibling.remove();
		}
	}
	else if(e.key.length==1 || e.keyCode==32)
		addL(e.key);
}

keys.onclick=e=>{
	let but = e.target;
	if(but.id=='smily'){
		keys.style.display='none';
		smilediv.style.display='grid';
		return;
	}
	addL(but.innerHTML);
}
smilediv.onclick=e=>{
	console.dir(e);
	let but = e.target;
	if(but.id=='textbut'){
		keys.style.display='grid';
		smilediv.style.display='none';
		return;
	}
	addL(but.innerHTML);
}

inpsm.onfocus=()=>{bdy.onkeydown=null;}
inpsm.onkeypress=e=>{if(e.key=='Enter')e.target.blur()}

inpsm.onblur=e=>{
	bdy.onkeydown=insertletter;
	for(let i of inpsm.value){
		if(i==' ')
			continue;
		smilebox.insertAdjacentHTML('afterBegin',`<button>${i}</button>`);
		if(smilebox.childElementCount>30)
			smilebox.lastElementChild.remove();
	}
	inpsm.value='';
}

showme.onclick=e=>{
	board.hidden=false;
}

hideme1.onclick=e=>{
	e.stopPropagation();
	board.hidden=true;
}
hideme2.onclick=e=>{
	e.stopPropagation();
	board.hidden=true;
}
goleftbut.onclick=e=>{
	e.stopPropagation();
	insertletter({keyCode:37});
}
gorightbut.onclick=e=>{
	e.stopPropagation();
	insertletter({keyCode:39});
}
delbut.onclick=e=>{
	e.stopPropagation();
	insertletter({keyCode:8});
}

enterbut.onclick=e=>{
	e.stopPropagation();
	insertletter({keyCode:13});
}

typer.onclick=(e)=>{
	//console.dir(e);
	let but = e.target;
	blinkpos.innerHTML='';
	if(but==typer){
		if(e.offsetY>8 && e.offsetY<but.offsetHeight-10){
			if(e.offsetX<20)
				blinkpos = typer.firstElementChild;
			else
				blinkpos = typer.lastElementChild;
		}
	}
	else if(but.classList.contains('blinker'))
		blinkpos = but;
	else if(but.classList.contains('letter')){
		if(e.offsetX<but.offsetWidth/2)
			blinkpos = but.previousElementSibling;
		else
			blinkpos = but.nextElementSibling;
	}
	blinkpos.innerHTML='|';
}

function addL(letter){
	if(letter.length>2)return;
	blinkpos.insertAdjacentHTML('beforeBegin',`<div class='blinker'></div><pre class='letter'>${letter}</pre>`);
	blinkpos.innerHTML='|';
}

sendbar.onclick=e=>{
	e.target.blur();
}
showopbut.onclick=()=>{
	if(showopbut.classList.contains('pressed')){
		showopbut.classList.remove('pressed');
		options.style.display='none';
		send.hidden=false;
	}
	else{
		showopbut.classList.add('pressed');
		options.style.display='grid';
		options.hidden=false;
		send.hidden=true;
	}
}
clearbut.onclick=(e)=>{
	typer.innerHTML="<div class='blinker'></div>";
	blinkpos = typer.firstElementChild;
}
wrapbut.onclick=()=>{
	if(wrapbut.classList.contains('pressed')){
		wrapbut.classList.remove('pressed');
		typer.style.whiteSpace='nowrap';
	}
	else{
		wrapbut.classList.add('pressed');
		typer.style.whiteSpace='initial';
	}
}
pastebut.onclick=e=>{
	navigator.clipboard.readText().then(v=>{for(let i of v) insertletter({key:i})}).catch(e=>alert('Sorry, '+e));
}
sendbut1.onclick=sending;
sendbut2.onclick=sending;

function sending(e){
	blinkpos.innerHTML='';
	let txt = typer.innerText.trim();
	clearbut.click();
	if(txt.length){
		let d = document.createElement('div');
		d.innerText = txt;
		d.style.nowrap=typer.style.nowrap;
		d.classList.add('msg');
		msgbox.prepend(d);
	}
	else
		myalert('nothing to send!', x, y);
	blinkpos.innerHTML='|';
}

function myalert(txt){
	
}



