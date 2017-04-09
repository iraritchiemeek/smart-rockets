var rocket
var population
var lifespan = 400
var life_text
var count = 0
var target
var obstacle_x = 100
var obstacle_y = 150
var obstacle_w = 200
var obstacle_h = 10
var max_force = 0.2

function setup() {
	createCanvas(400, 300)
	rocket = new Rocket()
	population = new Population()
	life_text = createP()
	target = createVector(width / 2, 50)
}

function draw() {
 	background(0)
 	population.run()
 	life_text.html(count)

 	count++
 	if (count == lifespan) {
 		population.evaluate()
 		population.selection()
 		// population = new Population()
 		count = 0
 	}

 	fill(255)
 	rect(obstacle_x, obstacle_y, obstacle_w, obstacle_h)

 	ellipse(target.x, target.y, 16, 16)
}

function Population() {
	this.rockets = []
	this.population_size = 250
	this.mating_pool = []

	for (var i = 0; i < this.population_size; i++) {
		this.rockets[i] = new Rocket()
	}

	this.evaluate = function() {
		var maximum_fitness = 0

		for (var i = 0; i < this.population_size; i++) {
			this.rockets[i].calculateFitness()
			if (this.rockets[i].fitness > maximum_fitness) {
				maximum_fitness = this.rockets[i].fitness
			}
		}

		for (var i = 0; i < this.population_size; i++) {
			this.rockets[i].fitness /= maximum_fitness
		}

		this.mating_pool = []
		for (var i = 0; i < this.population_size; i++) {
			var n = this.rockets[i].fitness * 100
			for(var j = 0; j < n; j++) {
				this.mating_pool.push(this.rockets[i])
			}
		}


	}

	this.selection = function () {
		var new_rockets = []
		for (var i = 0; i < this.rockets.length; i++) {		
			var parentA = random(this.mating_pool).dna
			console.log(random(this.mating_pool).dna)
			var parentB = random(this.mating_pool).dna
			var child = parentA.crossover(parentB)
			child.mutation()
			new_rockets[i] = new Rocket(child)
		}
		this.rockets = new_rockets
	}

	this.run = function () {
		for (var i = 0; i < this.population_size; i++) {
			this.rockets[i].update()
			this.rockets[i].show()
		}
	}

}

function DNA(genes) {
	if (genes) {
		this.genes = genes
	} else {
		this.genes = []
		for (var i = 0; i < lifespan; i++) {
			this.genes[i] = p5.Vector.random2D()
			this.genes[i].setMag(max_force)
		}
	}

	this.crossover = function (partner) {
		var new_genes = []
		var mid = floor(random(this.genes.length))
		for (var i = 0; i < this.genes.length; i++) {
			if (i > mid) {
				new_genes[i] = this.genes[i]
			} else {
				new_genes[i] = partner.genes[i]
			}
		}
		return new DNA(new_genes)
	}

	this.mutation = function () {
		for (var i = 0; i < this.genes.length; i++) {
			if(random(1) < 0.01) {
				this.genes[i] = p5.Vector.random2D()
				this.genes[i].setMag(max_force)
			}
		}
	}
}

function Rocket(dna) {
	this.position = createVector(width / 2, height)
	this.velocity = createVector()
	this.velocity.limit(4)
	this.acceleration = createVector()
	this.completed = false;
	this.crashed = false;

	if (dna) {
		this.dna = dna
	} else {
		this.dna = new DNA()
	}

	this.fitness = 0

	this.applyForce = function(force) {
		this.acceleration.add(force)
	}

	this.calculateFitness = function () {
		var distance = dist(this.position.x, this.position.y, target.x, target.y)
		this.fitness = map(distance, 0, width, width, 0)
		if(this.completed) {
			this.fitness *= 10
		}
		if(this.crashed) {
			this.fitness /= 10
		}
	}

	this.update = function() {
		var distance = dist(this.position.x, this.position.y, target.x, target.y)
		if (distance < 10) {
			this.completed = true
			this.position = target.copy()
		}

		if (this.position.x > obstacle_x && this.position.x < obstacle_x + obstacle_w && this.position.y > obstacle_y && this.position.y < obstacle_y + obstacle_h) {
			this.crashed = true
		}

		if (this.position.x > width || this.position.x < 0) {
			this.crashed = true
		}

		if (this.position.y > height || this.position.y < 0) {
			this.crashed = true
		}

		this.applyForce(this.dna.genes[count])
		if (!this.completed && !this.crashed) {
			this.velocity.add(this.acceleration)
			this.position.add(this.velocity)
			this.acceleration.mult(0)
		}
	}

	this.show = function() {
		push()
		noStroke()
		fill(255, 150)
		translate(this.position.x, this.position.y)
		rotate(this.velocity.heading())
		rectMode(CENTER)
		rect(0, 0, 25, 5)
		pop()
	}
}