let myButton = document.querySelector('button');
let myHeading = document.querySelector('h1');

function setUserName(){
	let myName = prompt('请输入你的名字.');
	if(!myName || myName === null){
		setUserName();
	}else{
		localStorage.setItem('name', myName);
		myHeading.textContent = '匿名者,' + myName;
	}
}

if(!localStorage.getItem('name')){
	setUserName();
}else{
	let storedName = localStorage.getItem('name');
	myHeading.textContent = '匿名者,' + storedName;
}

myButton.onclick = function(){
	setUserName();
}