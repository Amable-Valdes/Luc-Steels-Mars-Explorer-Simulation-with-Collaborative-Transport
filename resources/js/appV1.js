/*
$.mobile.autoInitializePage = false;
$(document).ready(function () {
    if (document.getElementById("controlsCanvas") !== null) {
        myControlsArea.start();
        $("#controlsCanvas").on('click touchstart', function (event) {

            if (event.type.toLowerCase() === 'touchstart') {
                touch = event.changedTouches[0];
                mouseEventType = "click";
                var mouseEvent = new MouseEvent(
                        mouseEventType,
                        {
                            'view': event.target.ownerDocument.defaultView,
                            'bubbles': true,
                            'cancelable': true,
                            'screenX': touch.screenX,
                            'screenY': touch.screenY,
                            'clientX': touch.clientX,
                            'clientY': touch.clientY
                        });
                event = mouseEvent;
            }

            var canvas = document.getElementById("controlsCanvas");
            var limits = canvas.getBoundingClientRect();
            var x = Math.round((event.clientX - limits.left) / (limits.right - limits.left) * canvas.width);
            var y = Math.round((event.clientY - limits.top) / (limits.bottom - limits.top) * canvas.height);

            // Collision between clicked pixel and element.
            myControls.forEach(function (control) {
                if (x < control.x + control.width && x > control.x
                        && y < control.y + control.height && y > control.y) {
                    control.click();
                }
            });
            //dejo esto aqui por si me da otro rompedero de cabeza x e y
            //alert("x:" + x + " - y:" + y);
        });
    }
});
*/

var listRobots = [];
var listMinerals = [];
var listMineralsInBase = [];
var listMotherships = [];
var listTracks = [];
var listObstacles = [];

var WIDTH = 800;
var HEIGHT = 800;

var simulation = {
    start: function () {
        this.canvas = document.getElementById("canvas");
        this.canvas.width = WIDTH;
        this.canvas.height = HEIGHT;
        this.context = this.canvas.getContext("2d");
        this.frameNo = 0;
        this.interval = setInterval(updateCanvas, 100);
		init();
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

function init(){
	listRobots.push(new Robot(Math.floor((Math.random() * WIDTH)),Math.floor((Math.random() * HEIGHT))));
	listRobots.push(new Robot(Math.floor((Math.random() * WIDTH)),Math.floor((Math.random() * HEIGHT))));
	listRobots.push(new Robot(Math.floor((Math.random() * WIDTH)),Math.floor((Math.random() * HEIGHT))));
	listRobots.push(new Robot(Math.floor((Math.random() * WIDTH)),Math.floor((Math.random() * HEIGHT))));
	listRobots.push(new Robot(Math.floor((Math.random() * WIDTH)),Math.floor((Math.random() * HEIGHT))));
	listRobots.push(new Robot(Math.floor((Math.random() * WIDTH)),Math.floor((Math.random() * HEIGHT))));
	listRobots.push(new Robot(Math.floor((Math.random() * WIDTH)),Math.floor((Math.random() * HEIGHT))));
	clusterMinerals(Math.floor((Math.random() * WIDTH - 50)),Math.floor((Math.random() * HEIGHT - 50)));
	clusterMinerals(Math.floor((Math.random() * WIDTH - 50)),Math.floor((Math.random() * HEIGHT - 50)));
	clusterMinerals(Math.floor((Math.random() * WIDTH - 50)),Math.floor((Math.random() * HEIGHT - 50)));
	clusterMinerals(Math.floor((Math.random() * WIDTH - 50)),Math.floor((Math.random() * HEIGHT - 50)));
	clusterMinerals(Math.floor((Math.random() * WIDTH - 50)),Math.floor((Math.random() * HEIGHT - 50)));
	clusterMinerals(Math.floor((Math.random() * WIDTH - 50)),Math.floor((Math.random() * HEIGHT - 50)));
	listMotherships.push(new Mothership(WIDTH/2,HEIGHT/2));
}

function clusterMinerals(x,y){
	var numMineralsToCreate = Math.floor((Math.random() * 10) + 3);
	for(var i = 0; i<numMineralsToCreate; i++){
		listMinerals.push(new Mineral(x + Math.floor((Math.random() * 50)),y + Math.floor((Math.random() * 50))));
	}
}

function updateCanvas() {
	simulation.clear();
	var i = 0
	for (i = 0; i < listTracks.length; i++) {
        listTracks[i].drawable.draw();
    }
	for (i = 0; i < listMotherships.length; i++) {
        listMotherships[i].drawable.draw();
		ctx = simulation.context;
		ctx.rect(listMotherships[i].drawable.x - 40 ,listMotherships[i].drawable.y - 40,100,100);
		ctx.stroke();
	}
    for (i = 0; i < listRobots.length; i++) {
		listRobots[i].execute();
        listRobots[i].drawable.draw();
    }
	for (i = 0; i < listMinerals.length; i++) {
        listMinerals[i].drawable.draw();
    }
	for (i = 0; i < listMineralsInBase.length; i++) {
		listMineralsInBase[i].drawable.draw();
	}
	
};

function Drawable(x,y,width,height){
	this.x = x;
	this.y = y;
	this.image = new Image();
	this.width = width;
    this.height = height;
	
    this.draw = function () {
        ctx = simulation.context;
        ctx.drawImage(
                this.image,
                this.x,
                this.y,
                this.width,
                this.height);
    };
}

function Robot(x, y) {
	// Canvas Information
	this.drawable = new Drawable(x,y,17,17);
	this.drawable.image.src = "./resources/images/robot.png";
	
	// Robot information
	this.speed_x = 0;
	this.speed_y = 0;
	
	this.mineralLoaded = null;
	this.iterationsWithoutChangeSpeed = 0;

    this.setTrack = function () {
        listTracks.push(new Track(this.x,this.y))
    };
	
	this.execute = function(){
		var senseMinerals = this.senseMinerals();
		var collisionMineral = collisionRobot_Minerals(this,senseMinerals);
		var collisionMothership = collisionRobot_Mothership(this);
		var collisionTracks = collisionRobot_Track(this);
		//	(1) IF detect an obstacle THEN change direction
		if(false){
			
		//	(2) IF carrying samples AND at the base THEN drop samples
		} else if(this.mineralLoaded != null && collisionMothership != -1){
			this.unloadMineral();
		//	(3) IF carrying samples and NOT at the base 
		//		THEN drop 2 crumbs 
		//		AND travel up gradient 
		} else if(this.mineralLoaded != null && collisionMothership == -1){
			this.followMothershipSignal();
			listTracks.push(new Track(this.drawable.x, this.drawable.y, 2))
			
		//	(4) IF detect a sample AND NOT at the base THEN pick sample up
		} else if(senseMinerals.length != 0 && this.mineralLoaded == null && collisionMothership == -1){
			if(collisionMineral != -1 && collisionMineral.packedBy == null){
				console.log(collisionMineral);
				console.log();
				console.log(senseMinerals[collisionMineral]);
				
				this.loadMineral(listMinerals[findMineralInList(senseMinerals[collisionMineral])]);
			} else {
				console.log(senseMinerals);
				console.log(this);
				var closer = this.findCloserMineral(senseMinerals);
				if(closer.drawable.x < this.drawable.x ){
					this.speed_x = -0.8
				} else {
					this.speed_x = 0.8
				}
				
				if(closer.drawable.y < this.drawable.y ){
					this.speed_y = -0.8
				} else {
					this.speed_y = 0.8
				}
				
				this.drawable.x = this.drawable.x + this.speed_x * 10;
				this.drawable.y = this.drawable.y + this.speed_y * 10;
			}
			
		//	(5) IF sense crumbs THEN pick up 1 crumb 
		//		AND travel down gradient 	
		} else if(collisionTracks.length != 0){
			this.followTrack(collisionTracks);
		//	(6) IF true THEN move randomly
		} else {
			this.moveRandomly();
		}
		
		if(this.mineralLoaded != null){
			if(this.mineralLoaded.packedBy == this){
				this.mineralLoaded.drawable.x = this.drawable.x;
				this.mineralLoaded.drawable.y = this.drawable.y;
			}else{
				this.mineralLoaded = null;
			}
		}
		canvasLimits(this);
	};
	
	this.moveRandomly = function(){
		
		if(this.iterationsWithoutChangeSpeed > 5){
			this.iterationsWithoutChangeSpeed = 0;
			this.speed_x = Math.floor((Math.random() * 3) -1);
			this.speed_y = Math.floor((Math.random() * 3) -1);
		}
		this.drawable.x = this.drawable.x + this.speed_x * 10;
		this.drawable.y = this.drawable.y + this.speed_y * 10;
		this.iterationsWithoutChangeSpeed++;
		//console.log("");
		//console.log(this.speed_x);
		//console.log(this.speed_y);
	};
	
	this.senseMinerals = function(){
		listCloseMinerals = [];
		for (i = 0; i < listMinerals.length; i++) {
			if(listMinerals[i].drawable.x < this.drawable.x + 30
				&& listMinerals[i].drawable.x > this.drawable.x - 30
				&& listMinerals[i].drawable.y < this.drawable.y + 30
				&& listMinerals[i].drawable.y > this.drawable.y - 30
				&& listMinerals[i].packedBy == null
				){
				listCloseMinerals.push(listMinerals[i]);
			}
		}
		return listCloseMinerals;
	};
	
	this.loadMineral = function(mineral){
		this.mineralLoaded = mineral;
		mineral.packedBy = this;
		this.mineralLoaded.drawable.x = this.drawable.x;
		this.mineralLoaded.drawable.y = this.drawable.y;
	};
	
	this.unloadMineral = function(){
		this.mineralLoaded.drawable.x = this.drawable.x;
		this.mineralLoaded.drawable.y = this.drawable.y;
		listMinerals.splice(findMineralInList(this.mineralLoaded), 1);
		listMineralsInBase.push(this.mineralLoaded);
		this.mineralLoaded.packedBy = null;
		this.mineralLoaded = null;
		
	};
	
	this.findSignal = function(){
		var closer = listMotherships[0];
		var closerX = Math.abs(listMotherships[0].drawable.x - this.drawable.x);
		var closerY = Math.abs(listMotherships[0].drawable.y - this.drawable.y);
		var newCloserX = 0;
		var newCloserY = 0;
		for (i = 0; i < listMotherships.length; i++) {
			newCloserX = Math.abs(listMotherships[i].drawable.x - this.drawable.x)
			newCloserY = Math.abs(listMotherships[i].drawable.y - this.drawable.y)
			if(newCloserX < closerX && newCloserY < closerY){
				closer = listMotherships[i];
			}
		}
		return closer;
	}
	
	this.findCloserMineral = function(closerMinerals){
		var closer = closerMinerals[0];
		var closerX = Math.abs(closerMinerals[0].drawable.x - this.drawable.x);
		var closerY = Math.abs(closerMinerals[0].drawable.y - this.drawable.y);
		var newCloserX = 0;
		var newCloserY = 0;
		for (i = 0; i < closerMinerals.length; i++) {
			newCloserX = Math.abs(closerMinerals[i].drawable.x - this.drawable.x)
			newCloserY = Math.abs(closerMinerals[i].drawable.y - this.drawable.y)
			if(newCloserX < closerX && newCloserY < closerY && closerMinerals[i].packedBy == null){
				closer = closerMinerals[i];
			}
		}
		return closer;
	}
	
	this.followMothershipSignal = function(){
		var closer = this.findSignal();
		
		if(closer.drawable.x < this.drawable.x ){
			this.speed_x = -1
		} else {
			this.speed_x = 1
		}
		
		if(closer.drawable.y < this.drawable.y ){
			this.speed_y = -1
		} else {
			this.speed_y = 1
		}
		
		this.drawable.x = this.drawable.x + this.speed_x * 10;
		this.drawable.y = this.drawable.y + this.speed_y * 10;
	}
	this.followTrack = function(collisionTracks){
		/*
		var closestSignal = this.findSignal();
		
		var findTrack = false;
		
		var southDirectionSignal = false;
		var eastDirectionSignal = false;
		
		if(closestSignal.drawable.y - this.drawable.y > 0){
			southDirectionSignal = true;
		}
		if(closestSignal.drawable.x - this.drawable.x > 0){
			eastDirectionSignal = true;
		}
		
		var track = null
		var southDirectionTrack = false;
		var eastDirectionTrack = false;
		
		for (i = 0; i < collisionTracks.length && findTrack == false; i++) {
			
			track = listTracks[collisionTracks[i]];
			
			if(track.drawable.y - this.drawable.y > 0){
				southDirectionSignal = true;
			}
			if(track.drawable.x - this.drawable.x > 0){
				eastDirectionSignal = true;
			}
			
			if(southDirectionSignal != southDirectionTrack){
				if(closer.drawable.x < this.drawable.x ){
					this.speed_x = -1
				} else {
					this.speed_x = 1
				}
				
				if(closer.drawable.y < this.drawable.y ){
					this.speed_y = -1
				} else {
					this.speed_y = 1
				}
				
				this.drawable.x = this.drawable.x + this.speed_x * 10;
				this.drawable.y = this.drawable.y + this.speed_y * 10;
				if(listMinerals[i] == mineral){
					return i;
				}
			}
		}
		
		*/
		
		var closer = this.findSignal();
		
		if(closer.drawable.x < this.drawable.x ){
			this.speed_x = 1
		} else {
			this.speed_x = -1
		}
		
		if(closer.drawable.y < this.drawable.y ){
			this.speed_y = 1
		} else {
			this.speed_y = -1
		}
		
		this.drawable.x = this.drawable.x + this.speed_x * 10;
		this.drawable.y = this.drawable.y + this.speed_y * 10;
		
		track = listTracks[collisionTracks[0]];
		if(track.number > 1)
			track.number = track.number - 1;
		else {
			listTracks.splice(collisionTracks[0], 1);
		}
		this.drawable.x = track.drawable.x;
		this.drawable.y = track.drawable.y;
	}
};

function Track(x, y, number) {
    //Canvas Information
    this.drawable = new Drawable(x,y,17,17);
    this.drawable.image.src = "./resources/images/track.png";
	this.number = number;
};

function Mineral(x, y) {
	// Canvas Information
	this.drawable = new Drawable(x,y,17,17);
	this.drawable.image.src = "./resources/images/mineral.png";
	
	this.originalPosition_x = x;
	this.originalPosition_y = y;
	
	this.packedBy = null;
	
	this.equals = function(mineral){
		if(this.originalPosition_x == mineral.originalPosition_x 
			&& this.originalPosition_y && mineral.originalPosition_y){
			return true;
		}
		return false
	} 
};

function Mothership(x, y) {
	// Canvas Information
	this.drawable = new Drawable(x,y,20,40);
	this.drawable.image.src = "./resources/images/mothership.png";
};

function findMineralInList(mineral){
	for (i = 0; i < listMinerals.length; i++) {
		if(listMinerals[i].equals(mineral)){
			return i;
		}
	}
	return -1;
}

function collisionRobot_Minerals(robot,listCloserMinerals){
	for (i = 0; i < listCloserMinerals.length; i++) {
		if(listCloserMinerals[i].drawable.x < robot.drawable.x + 10
			&& listCloserMinerals[i].drawable.x > robot.drawable.x - 10
			&& listCloserMinerals[i].drawable.y < robot.drawable.y + 10
			&& listCloserMinerals[i].drawable.y > robot.drawable.y - 10
			){
			return i;
		}
	}
	return -1;
};

function collisionRobot_Mothership(robot){
	for (i = 0; i < listMotherships.length; i++) {
		if(listMotherships[i].drawable.x - 50 < robot.drawable.x
			&& listMotherships[i].drawable.x + 50 > robot.drawable.x
			&& listMotherships[i].drawable.y - 50 < robot.drawable.y
			&& listMotherships[i].drawable.y + 50 > robot.drawable.y
			){
			return i;
		}
	}
	return -1;
};

function collisionRobot_Track(robot){
	tracks=[];
	for (i = 0; i < listTracks.length; i++) {
		if(listTracks[i].drawable.x - 25 < robot.drawable.x
			&& listTracks[i].drawable.x + 25 > robot.drawable.x
			&& listTracks[i].drawable.y - 25 < robot.drawable.y
			&& listTracks[i].drawable.y + 25 > robot.drawable.y
			){
			tracks.push(i);
		}
	}
	return tracks;
};

function collisionRobot_Obstacle(mineral){
	for (i = 0; i < listMinerals.length; i++) {
		if(listMinerals[i] == mineral){
			return i;
		}
	}
	return -1;
};

function canvasLimits(robot){
	// Limits
	if(robot.drawable.x < 0)
		robot.drawable.x = simulation.canvas.width;
	if(robot.drawable.y < 0)
		robot.drawable.y = simulation.canvas.height;
	if(robot.drawable.x > simulation.canvas.width)
		robot.drawable.x = 0;
	if(robot.drawable.y > simulation.canvas.height)
		robot.drawable.y = 0;
}

/*
function Control(imgNormal, imgPressed, width, height, x, y, newOrder) {
    //Canvas Information
    this.image = new Image();
    this.image.src = imgNormal;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.imgNormal = imgNormal;
    this.imgPressed = imgPressed;

    //Object state
    this.pressed = false;

    //Robot information
    this.order = {
        remoteControlOrder: newOrder
    };

    this.update = function () {
        ctx = myControlsArea.context;
        ctx.drawImage(
                this.image,
                this.x,
                this.y,
                this.width,
                this.height);
    };

    this.click = function () {
        if (this.pressed) {
            this.desactivate();
            defaultControl.activate();
            defaultControl.sendPetition();
        } else {
            controlPressed.desactivate();
            this.activate();
            this.sendPetition();
        }
    };

    this.desactivate = function () {
        this.image.src = this.imgNormal;
        this.pressed = false;
    };

    this.activate = function () {
        this.image.src = this.imgPressed;
        this.pressed = true;
        controlPressed = this;
    };

    this.sendPetition = function () {
        $.ajax({
            url: '/users/assignedRobot/remoteControl',
            type: 'post',
            dataType: 'json',
            success: function (data) {
                $('#target').html(data.order);
            },
            data: this.order
        });
    };
}

function Message(msg, x, y) {
    //Canvas Information
    this.message = msg;
    this.x = x;
    this.y = y;

    this.update = function () {
        ctx = myControlsArea.context;
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText(msg, this.x, this.y);
    };
}

function Button(img, width, height, x, y) {
    //Canvas Information
    this.image = new Image();
    this.image.src = img;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;

    this.update = function () {
        ctx = myControlsArea.context;
        ctx.drawImage(
                this.image,
                this.x,
                this.y,
                this.width,
                this.height);
    };

    this.click = function () {
        $.ajax({
            url: '/users/remoteControl',
            type: 'get',
            dataType: 'json',
            success: function () {
            },
            data: {}
        });
    };
}

function showControls() {
    //Clear
    myControls = [];
    //Stop
    defaultControl = new Control("/img/remoteControl/stop.png", "/img/remoteControl/stopPressed.png", 100, 100, 190, 265, 5);
    defaultControl.activate();
    myControls.push(defaultControl);
    //Arrow Up
    myControls.push(new Control("/img/remoteControl/arrowUp.png", "/img/remoteControl/arrowUpPressed.png", 170, 260, 155, 0, 1));
    //Arrow Down
    myControls.push(new Control("/img/remoteControl/arrowDown.png", "/img/remoteControl/arrowDownPressed.png", 170, 260, 155, 370, 2));
    //Rotate Right
    myControls.push(new Control("/img/remoteControl/rotateToLeft.png", "/img/remoteControl/rotateToLeftPressed.png", 150, 350, 330, 0, 3));
    //Rotate Left
    myControls.push(new Control("/img/remoteControl/rotateToRight.png", "/img/remoteControl/rotateToRightPressed.png", 150, 350, 0, 0, 4));
    state = "showingControls";
}
*/
