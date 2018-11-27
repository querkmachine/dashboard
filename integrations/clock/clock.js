class Clock {
	constructor() {
		this.clock = document.getElementById('clock');
		this.clockDate = clock.querySelector('.date');
		this.clockTime = clock.querySelector('.time');
		this.setTime();
		this.startTheClock();
	}
	setTime() {
		const now = new Date();
		this.clockTime.innerHTML = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
	}
	startTheClock() {
		setInterval(() => {
			this.setTime();
		}, 1000);
	}
}

new Clock();