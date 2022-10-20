class HealthRing {

	constructor(selector, maxRadius = null, strokeWidth = null) {

		const DEFAULT_STROKE_WIDTH = 7;

		this.container = document.querySelector(selector);
		this.maxRadius = maxRadius;
		this.strokeWidth = strokeWidth ?? DEFAULT_STROKE_WIDTH;

		if (this.maxRadius !== null) {
			this.initContainer();
		}
	}

	initContainer() {

		if (this.maxRadius === null) {
			console.error(`HealthRing.initContainer() should not be called until maxRadius is set.`);
		}

		let containerSizePx = 2*this.maxRadius + 2*this.strokeWidth, // the container is a square with sides of this length
			svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

		this.container.style.width = `${containerSizePx}px`;
		this.container.style.height = `${containerSizePx}px`;
		svg.style.width = `${containerSizePx}px`;
		svg.style.height = `${containerSizePx}px`;
		this.container.appendChild(svg);
		this.svg = svg;

		// startX and startY are the coordinates of the starting point for a ring with radius == maxRadius
		// (This is needed to compute the starting coordinates for all rings)
		this.startX = this.maxRadius + this.strokeWidth;
		this.startY = this.strokeWidth;

	}

	add (radius, percentage, color) {

		if (this.maxRadius === null) {
			// If the max radius was not specified in the constructor, assume
			// the first health ring being added is the largest
			this.maxRadius = radius;
			this.initContainer();
		}

		let grayPath = this.defineArcPath(radius, 1, "#ccc");
		let ringPath = this.defineArcPath(radius, percentage, color);

		this.svg.appendChild(grayPath);	
		this.svg.appendChild(ringPath);
		return this; // for chaining
	}

	/**
	 *	defineArcPath
	 *  Returns an SVG <path> element for an arc with a given radius, color, and width.
	 *  The arc represents part of a circle.  If percentage = 1, it is a complete circle.
	 */
	defineArcPath(radius, percentage, color) {

		let largeArcFlag = (percentage <= .5) ? 0 : 1, // 0 for small arc, 1 for large
			sweepFlag = 1; // 0 for counter-clockwise, 1 for clockwise
	
		if (percentage >= 1) percentage = .97; // exactly 1 does weird things

		let startX = this.startX;
		let startY = this.startY + this.maxRadius - radius;

		let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		path.setAttributeNS(null, "fill", "none");
		path.setAttributeNS(null, "stroke", color);
		path.setAttributeNS(null, "stroke-width", this.strokeWidth);
		path.setAttributeNS(null, "stroke-linecap", "round");
		path.setAttributeNS(null, "stroke-miterlimit", "10");

		// assuming the path starts at (radius, 0), find the point (px, py) along the 
		// circle where the path should end
		let angleDegrees = percentage * 360,
			angleRadians = angleDegrees * (Math.PI/180),
			px = radius * Math.sin(angleRadians),
			py = radius * (1 - Math.cos(angleRadians));

		// See: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
		path.setAttributeNS(
			null,
			"d",
			`M ${startX}, ${startY}
			 a ${radius}, ${radius}
			   90, ${largeArcFlag}, ${sweepFlag}
		 	   ${px}, ${py}
		`);

		return path;
	}
}