class Clock {
	constructor() {
		this.settings = settings;
		this.clockDate = document.querySelector('.date');
		this.clockTime = document.querySelector('.time');
		console.log(this.settings, this.clockDate, this.clockTime)
		this.setTime();
		setInterval(() => {
			this.setTime();
		}, 1000);
	}
	setTime() {
		const now = moment();
		// Date
		this.clockDate.innerText = now.format(this.settings.dateFormat);
		// Time
		//let clockHTML = now.format(this.settings.timeFormat);
		let clockHTML = '';
		clockHTML += `<span class="big">${now.format('h')}:${now.format('mm')}</span>`;
		clockHTML += `<span class="seconds">:${now.format('ss')}</span>`;
		clockHTML += `<span class="meridian">${now.format('a')}</span>`;
		this.clockTime.innerHTML = clockHTML;
	}
}

new Clock();