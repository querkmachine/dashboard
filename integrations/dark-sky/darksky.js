class DarkSky {
	constructor() {
		this.settings = settings;
		this.$container = $('#darksky');
		this.forecast = {};
		this.getForecast();
		setInterval(() => {
			this.getForecast();
		}, (1000 * 60 * 5)); // every five minutes
	}
	getForecast() {
		const requestUri = `${this.settings.endpoint}/${this.settings.apiKey}/${this.settings.latitude},${this.settings.longitude}`;
		$.ajax({
			url: requestUri,
			method: 'GET',
		    crossDomain: true,
		    dataType: 'jsonp',
		    data: {
		    	units: 'uk2'
		    }
		}).done((data) => {
			console.log(data);
			this.forecast = data;
			this.$container.html('');
			this.renderPrecip();
			this.renderCurrent();
		});
	}
	renderCurrent() {
		const data = this.forecast.currently;
		const template = `
			<div class="weather">
				<div class="weather__inner">
					<!--<div class="weather__icon">${data.icon}</div>-->
					<div class="weather__body">
						<div class="temperature">
							<span class="size-heading-xl font-narrow lead-solid temperature__actual">${Math.round(data.temperature)}&deg;</span>
							<span class="size-heading-l font-narrow lead-solid temperature__apparent">(feels like ${Math.round(data.apparentTemperature)}&deg;)</span>
						</div>
						<div class="size-heading-m weather__summary">${data.summary}</div>
					</div>
				</div>
			</div>
		`;
		this.$container.prepend(template);
	}
	renderPrecip() {
		const data = this.forecast.minutely;
		const template = `
			<div class="rain">
				<div class="rain__graph">${this.parseRainGraph(data.data)}</div>
				<div class="size-small rain__summary">${data.summary}</div>
			</div>
		`;
		this.$container.append(template);
	}
	parseRainGraph(dataArray) {
		let returnHtml = '';
		const highestIntensity = 10; // 10mm is a lot, right? 
		$.each(dataArray, (i, minute) => {
			let percentage = (minute.precipIntensity / highestIntensity) * 100;
			if(percentage > 100) { percentage = 100; }
			returnHtml += `<div class="rain__bar" style="height:${percentage}%"></div>`;
		});
		return returnHtml;
	}
}

new DarkSky;