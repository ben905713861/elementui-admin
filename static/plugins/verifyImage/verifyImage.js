//滑动验证码方法
function verify(node, callback) {
	const bgImgWidth = 280; //背景图片宽度
	const defectImageWidth = 50; //缺失块宽度
	
	var box = document.querySelector(node);
	var sliderBtn = box.querySelector(".slider-btn");
	var defectImage = box.querySelector(".defectImage");
//	var sliderBar = box.querySelector(".slider-bar");
	var lightBar = box.querySelector(".bar-light");
	
	var startPageX = 0;
	var isMoving = false;
	
	sliderBtn.onmousedown = function(_event) {
		isMoving = true;
		startPageX = _event.pageX;
		window.onmousemove = function(event) {
			var leftLength = event.pageX - startPageX;
			moving(leftLength);
		}
	}
	
	sliderBtn.ontouchstart = function(_event) {
		isMoving = true;
		startPageX = event.targetTouches[0].pageX;
		window.ontouchmove = function(event) {
			var leftLength = event.targetTouches[0].pageX - startPageX;
			moving(leftLength);
		}
	}

	window.ontouchend = window.onmouseup = function() {
		if(!isMoving) {
			return;
		}
		var leftLength = defectImage.offsetLeft;
		window.ontouchmove = window.onmousemove = null;
		callback(leftLength);
		moving(0);
		isMoving = false;
	}
	
	function moving(leftLength) {
		if(leftLength < 0) {
			leftLength = 0;
		}
		else if(leftLength > bgImgWidth - defectImageWidth) {
			leftLength = bgImgWidth - defectImageWidth;
		}
		sliderBtn.style.left = leftLength + 'px';
		defectImage.style.left = leftLength + 'px';
		lightBar.style.width = leftLength + 10 + 'px';
	}

}

