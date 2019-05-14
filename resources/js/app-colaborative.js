var listRobots = [];
var listMinerals = [];
var listMineralsInBase = [];
var listMotherships = [];
var listTracks = [];

var WIDTH = 800;
var HEIGHT = 800;

var startTime = new Date().getTime();

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
	listMotherships.push(new Mothership(WIDTH/2,HEIGHT/2));
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
	
	
	list_minerals_to_change = []
	var mineral_to_change = null;
	for (j = 0; j < listMotherships.length; j++) {
		for (i = 0; i < listMinerals.length; i++) {
			if( collisionMineral_Mothership(listMotherships[j], listMinerals[i]) != -1){
				mineral_to_change = listMinerals[i];
				list_minerals_to_change.push(mineral_to_change);
			}
		}
	}
	console.log("Minerals in base to change list:");
	for (i = 0; i < list_minerals_to_change.length; i++) {
		console.log(list_minerals_to_change[i]);
		mineral_to_change = list_minerals_to_change[i];
        listMinerals.splice(findMineralInList(mineral_to_change), 1);
		listMineralsInBase.push(mineral_to_change);
		mineral_to_change.packedBy = [];
		mineral_to_change = null;
    }
	
	for(i = 0; i < listMinerals.length; i++){
		canvasLimitsMineral(listMinerals[i]);
	}
			
}

function clusterMinerals(x,y){
	var numMineralsToCreate = Math.floor((Math.random() * 10) + 3);
	for(var i = 0; i < numMineralsToCreate; i++){
		listMinerals.push(
			new Mineral(
				x + Math.floor((Math.random() * 50)), 
				y + Math.floor((Math.random() * 50)),
				Math.floor(5+(Math.random() * 10))
				));
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
		//ctx = simulation.context;
		//ctx.rect(listMotherships[i].drawable.x - 40 ,listMotherships[i].drawable.y - 40,110,110);
		//ctx.stroke();
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
	if(listMinerals.length === 0){
		console.log( (new Date().getTime() - startTime)/1000 );
	} else {
		console.log(listMinerals.length);
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
	
	this.signal_need_help_with_mineral = null;

    this.setTrack = function () {
        listTracks.push(new Track(this.x,this.y))
    };
	
	this.iteractionsPushing = 0;
	
	this.execute = function(){
		var senseMinerals = this.senseMinerals();
		var collisionMineral = collisionRobot_Minerals(this,senseMinerals);
		var collisionMothership = collisionRobot_Mothership(this);
		var collisionTracks = collisionRobot_Track(this);
		var feelHelpSignal = this.senseHelpSignal();
		
		//	(1) IF detect an obstacle THEN change direction
		if(false){
			
		//	(2) IF carrying samples AND at the base THEN drop samples
		} else if(this.mineralLoaded != null && collisionMothership != -1){
			if(this.mineralLoaded.mustBePushed()){
				disbandRobotGroup(this.mineralLoaded.packedBy);
			} else {
				this.unloadMineral();
			}
		//	(3) IF carrying samples and NOT at the base 
		//		THEN drop 2 crumbs 
		//		AND travel up gradient 
		} else if(this.mineralLoaded != null && collisionMothership == -1){
			// If the mineral is heavy you must coordinate with other robots
			if(this.mineralLoaded.mustBePushed()){
				if(this.mineralLoaded.packedBy.length > 1){
					moveRobotGroup(this.mineralLoaded.packedBy);
					this.iteractionsPushing = this.iteractionsPushing + 1;
				} else{
					// wait for help
				}
			// If not, you can carry it alone
			} else {
				this.followMothershipSignal();
				listTracks.push(new Track(this.drawable.x, this.drawable.y, 2));
				
				this.mineralLoaded.drawable.x = this.drawable.x;
				this.mineralLoaded.drawable.y = this.drawable.y;
			}
		//	(NEW) 	IF detect help signal
		//			AND NOT at the base 
		//			THEN help
		} else if(feelHelpSignal != null && collisionMothership == -1){
			
			var helpMineral = feelHelpSignal.signal_need_help_with_mineral;
			
			// Are we in collision with the mineral?
			if( collisionRobot_Mineral(this, helpMineral) ){
				helpMineral.packedBy.push(this);
				this.helpSignal(helpMineral);
				
			// If not, move closer to the mineral
			} else {
				this.moveCloser(helpMineral);
			}

			
		//	(4) IF detect a sample without robot carring
		//		AND NOT at the base 
		//		THEN pick sample up
		} else if(senseMinerals.length != 0 && this.findCloserMineral(senseMinerals).packedBy.length  === 0 && this.mineralLoaded == null && collisionMothership == -1){
			// If we are in collision with a mineral we look in the list what mineral is...
			if(collisionMineral != -1){
				var mineral_in_colision = listMinerals[findMineralInList(senseMinerals[collisionMineral])];
				
				// ...and when we know what mineral is we are in collision with it
				if(collisionMineral != -1 && mineral_in_colision !== undefined && mineral_in_colision.packedBy.length === 0){
					// We add the robot to the list of robots moving the mineral
					mineral_in_colision.packedBy.push(this);
					// This mineral is heavy? It need help?
					if( mineral_in_colision.mustBePushed() ){
						this.helpSignal(mineral_in_colision);
					// If it can solo then load the mineral
					} else {
						this.loadMineral(mineral_in_colision);
						
					}
				
				} else {
					var closerMineral = this.findCloserMineral(senseMinerals);
					if(closerMineral.packedBy.length === 0){
						this.moveCloser(closerMineral);
					}
				}
			
			// If we are not in collision with it, then we need to be closer
			} else {
				var closerMineral = this.findCloserMineral(senseMinerals);
				if(closerMineral.packedBy.length === 0){
					this.moveCloser(closerMineral);
				}
			}
			
		//	(5) IF sense crumbs 
		//		THEN pick up 1 crumb 
		//		AND travel down gradient 	
		} else if(collisionTracks.length != 0){
			this.followTrack(collisionTracks);
		//	(6) IF true THEN move randomly
		} else {
			this.moveRandomly();
		}
		
		canvasLimits(this);
	};
	
	this.moveRandomly = function(){
		this.stopHelpSignal();
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
	
	this.moveCloser = function(objectToApproximate){
		// we look for the object we must be closer
		
		// ajustamos nuestra velocidad del eje X para acercarnos al mineral
		if(objectToApproximate.drawable.x < this.drawable.x ){
			this.speed_x = -0.8
		} else {
			this.speed_x = 0.8
		}
		
		// ajustamos nuestra velocidad del eje Y para acercarnos al mineral
		if(objectToApproximate.drawable.y < this.drawable.y ){
			this.speed_y = -0.8
		} else {
			this.speed_y = 0.8
		}
		
		// El robot se mueve
		this.drawable.x = this.drawable.x + this.speed_x * 10;
		this.drawable.y = this.drawable.y + this.speed_y * 10;
	};
	
	this.helpSignal = function(mineral){
		this.signal_need_help_with_mineral = mineral;
		this.mineralLoaded = mineral;
		this.drawable.image.src = "./resources/images/robotSignal.png";
	};
	
	this.stopHelpSignal = function(){
		this.signal_need_help_with_mineral = null
		this.drawable.image.src = "./resources/images/robot.png";
	};
	
	this.senseMinerals = function(){
		listCloseMinerals = [];
		for (i = 0; i < listMinerals.length; i++) {
			if(listMinerals[i].drawable.x < this.drawable.x + 40
				&& listMinerals[i].drawable.x > this.drawable.x - 40
				&& listMinerals[i].drawable.y < this.drawable.y + 40
				&& listMinerals[i].drawable.y > this.drawable.y - 40
				&& !listMinerals[i].isBeingTransported
				){
				listCloseMinerals.push(listMinerals[i]);
			}
		}
		return listCloseMinerals;
	};
	
	this.senseHelpSignal = function(){
		for(i = 0; i < listRobots.length; i++) {
			if(
				listRobots[i].signal_need_help_with_mineral != null &&
				listRobots[i].drawable.x < this.drawable.x + 40 &&
				listRobots[i].drawable.x > this.drawable.x - 40 &&
				listRobots[i].drawable.y < this.drawable.y + 40 &&
				listRobots[i].drawable.y > this.drawable.y - 40
			){
				return listRobots[i];
			}
		}
		return listRobots[i];
	};
	
	this.loadMineral = function(mineral){
		this.mineralLoaded = mineral;
		this.mineralLoaded.isBeingTransported = true;
		this.mineralLoaded.drawable.x = this.drawable.x;
		this.mineralLoaded.drawable.y = this.drawable.y;
	};
	
	this.unloadMineral = function(){
		this.mineralLoaded.drawable.x = this.drawable.x;
		this.mineralLoaded.drawable.y = this.drawable.y;
		listMinerals.splice(findMineralInList(this.mineralLoaded), 1);
		listMineralsInBase.push(this.mineralLoaded);
		this.mineralLoaded.packedBy = [];
		this.mineralLoaded = null;
		this.iteractionsPushing = 0;
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
			if(newCloserX < closerX && newCloserY < closerY && !closerMinerals[i].isBeingTransported){
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

function disbandRobotGroup( robots ){
	if(robots.length !== 0){
		this.mineral = robots[0].mineralLoaded;
		
		this.mineral.drawable.x = robots[0].drawable.x;
		this.mineral.drawable.y = robots[0].drawable.y;
		
		listMinerals.splice(findMineralInList(this.mineral), 1);
		listMineralsInBase.push(this.mineral);

		for (i = 0; i < robots.length; i++) {
			robots[i].mineralLoaded = null;
			robots[i].iteractionsPushing = 0;
		}
		
		this.mineral.packedBy = [];
	}
}

function moveRobotGroup( robotsToMove ) {
	this.mineralToMove = robotsToMove[0].mineralLoaded;
	
	this.mothership = robotsToMove[0].findSignal();
	this.moth_x = +1;
	this.moth_y = +1;
	
	robotsToMove[0].stopHelpSignal();
	robotsToMove[1].stopHelpSignal();
	
	if( this.mothership.drawable.x < robotsToMove[0].drawable.x ){
		this.moth_x = -1
	} else {
		this.moth_x = 1
	}
		
	if( this.mothership.drawable.y < robotsToMove[0].drawable.y ){
		this.moth_y = -1
	} else {
		this.moth_y = 1
	}
	
	if(robotsToMove[2] !== undefined){
		while(robotsToMove[2] !== undefined){
			robotsToMove[2].stopHelpSignal();
			robotsToMove[2].mineralLoaded = null;
			this.mineralToMove.packedBy.splice(2,1);
			
		}
		console.log(robotsToMove[2])
		console.log("hay un tercerlo!!!")
	}

	robotsToMove[0].drawable.x = this.mineralToMove.drawable.x + 2;
	robotsToMove[0].drawable.y = this.mineralToMove.drawable.y + 12;
		
	robotsToMove[1].drawable.x = this.mineralToMove.drawable.x + 2;
	robotsToMove[1].drawable.y = this.mineralToMove.drawable.y - 7;


	robotsToMove[0].drawable.x = robotsToMove[0].drawable.x + this.moth_x;
	robotsToMove[0].drawable.y = robotsToMove[0].drawable.y + this.moth_y;
		
	robotsToMove[1].drawable.x = robotsToMove[1].drawable.x + this.moth_x;
	robotsToMove[1].drawable.y = robotsToMove[1].drawable.y + this.moth_y;
		
	this.mineralToMove.drawable.x = this.mineralToMove.drawable.x + this.moth_x;
	this.mineralToMove.drawable.y = this.mineralToMove.drawable.y + this.moth_y;
	
	if(robotsToMove[0].iteractionsPushing % 10 === 0){
		listTracks.push(new Track(robotsToMove[0].drawable.x, robotsToMove[0].drawable.y, 2));
	}
}

function Track(x, y, number) {
    //Canvas Information
    this.drawable = new Drawable(x,y,17,17);
    this.drawable.image.src = "./resources/images/track.png";
	this.number = number;
};

function Mineral(x, y, param_weight) {
	// Canvas Information
	this.drawable = new Drawable(x, y,
									17*(param_weight/12),
									17*(param_weight/12));
	this.drawable.image.src = "./resources/images/mineral.png";
	
	this.originalPosition_x = x;
	this.originalPosition_y = y;
	
	this.packedBy = [];
	
	this.isBeingTransported = false;
	
	this.weight = param_weight;
	
	this.mustBePushed = function(){
		if( this.weight > 12 ){
			return true;
		}
		return false;
	}
	
	this.isEnoughForce = function(){
		if(this.weight > 12 && this.packedBy.length < 2){
			console.log("SOY DEMASIADO PESADO!!! - " + this)
			return false;
		}
		return true;
	}
	
	this.equals = function(mineral){
		if(this.originalPosition_x == mineral.originalPosition_x 
			&& this.originalPosition_y && mineral.originalPosition_y){
			return true;
		}
		return false;
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
		if( collisionRobot_Mineral(
				robot, 
				listCloserMinerals[i]) 
		){
			return i;
		}
	}
	return -1;
};

function collisionRobot_Mineral(robot, mineral){
	if(
		mineral.drawable.x < robot.drawable.x + 10
		&& mineral.drawable.x > robot.drawable.x - 10
		&& mineral.drawable.y < robot.drawable.y + 10
		&& mineral.drawable.y > robot.drawable.y - 10
		){
			return true;
	}
	return false;
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

function collisionMineral_Mothership(mothership, mineral){
	if(mothership.drawable.x - 60 < mineral.drawable.x
		&& mothership.drawable.x + 60 > mineral.drawable.x
		&& mothership.drawable.y - 60 < mineral.drawable.y
		&& mothership.drawable.y + 60 > mineral.drawable.y
		){
		return i;
	}
	return -1;
};

function canvasLimits(robot){
	// Limits
	if(robot.drawable.x < -10)
		robot.drawable.x = simulation.canvas.width;
	if(robot.drawable.y < -10)
		robot.drawable.y = simulation.canvas.height;
	if(robot.drawable.x > simulation.canvas.width + 10)
		robot.drawable.x = 0;
	if(robot.drawable.y > simulation.canvas.height + 10)
		robot.drawable.y = 0;
}

function canvasLimitsMineral(mineral){
	// Limits
	if(mineral.drawable.x < 0)
		mineral.drawable.x = simulation.canvas.width - 10 - (Math.random() * 10);
	if(mineral.drawable.y < 0)
		mineral.drawable.y = simulation.canvas.height - 10 - (Math.random() * 10);
	if(mineral.drawable.x > simulation.canvas.width)
		mineral.drawable.x = 10 + Math.random() * 10;
	if(mineral.drawable.y > simulation.canvas.height)
		mineral.drawable.y = 10 + Math.random() * 10;
}