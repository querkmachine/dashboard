class DarkSky {
	constructor() {
		this.settings = settings;
		this.$container = $('.weather').eq(0);
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
			this.$container.html('').append(this.renderWeatherIcon()).append(this.renderNextHourSummary()).append(this.renderTemperature());
			if(this.showRainGraph(data.minutely.data)) {
				this.$container.addClass('weather--rain').append(this.renderRainGraph());
			}
			else {
				this.$container.removeClass('weather--rain');
				this.$container.find('.weather__rain-graph').remove();
			}
		});
	}
	renderWeatherIcon() {
		const icon = this.forecast.currently.icon;
		return (`
			<div class="weather__icon">${this.parseWeatherIcon(icon)}</div>
		`);
	}
	parseWeatherIcon(iconCode) {
		let celestial, cloud, condition, newCode = false;
		// TODO: Implement wind, fog
		switch(iconCode) {
			case 'clear-day':
				newCode = 'clear';
				celestial = 'sun';
				break;
			case 'clear-night':
				newCode = 'clear';
				celestial = 'moon';
				break;
			case 'cloudy':
				newCode = 'cloudy';
				cloud = 'cloud';
				break;
			case 'partly-cloudy-day':
				newCode = 'cloudy';
				celestial = 'sun';
				cloud = 'cloud';
				break;
			case 'partly-cloudy-night':
				newCode = 'cloudy';
				celestial = 'moon';
				cloud = 'cloud';
				break;
			case 'rain':
				newCode = 'rain-moderate';
				cloud = 'cloud';
      			condition = 'rain-moderate';
				break;
			case 'snow':
				newCode = 'snow-moderate';
				cloud = 'cloud';
      			condition = 'snow-moderate';
				break;
			case 'sleet':
				newCode = 'snow-light';
				cloud = 'cloud';
      			condition = 'snow-light';
				break;
			default:
				break;
		}
		return (`
			<span class="icon" data-condition="${newCode}">
				${(celestial) ? `<svg class="icon__celestial"><use xlink:href="#${celestial}"></use></svg>` : ''}
				${(cloud) ? `<svg class="icon__cloud"><use xlink:href="#${cloud}"></use></svg>` : ''}
				${(condition) ? `<svg class="icon__condition"><use xlink:href="#${condition}"></use></svg>` : ''}
			</span>
		`);
	}
	renderNextHourSummary() {
		const summary = this.forecast.minutely.summary;
		return (`
			<div class="size-heading-s lead-title weather__summary">${summary}</div>
		`);
	}
	renderTemperature() {
		const data = this.forecast.currently;
		if(data.temperature === data.apparentTemperature) {
			return (`
				<div class="size-heading-xl font-narrow weather__temperature">
					${Math.round(data.temperature)}&deg;
				</div>
			`);
		}
		else {
			return (`
				<div class="lead-solid weather__temperature">
					<span class="size-heading-xl font-narrow">${Math.round(data.temperature)}&deg;</span>
					<span class="weather__temperature-feels">Feels like<br>${Math.round(data.apparentTemperature)}&deg;</span>
				</div>
			`);
		}
	}
	renderRainGraph() {
		const data = this.forecast.minutely;
		return (`
			<div class="weather__rain-graph">
				<div class="rain">${this.parseRainGraph(data.data)}</div>
			</div>
		`);
	}
	parseRainGraph(dataArray) {
		let outputHtml = '';
		const highestIntensity = 10; // 10mm is a lot, right? 
		$.each(dataArray, (i, minute) => {
			let percentage = (minute.precipIntensity / highestIntensity) * 100;
			if(percentage > 100) { percentage = 100; }
			outputHtml += `<div class="rain__bar" style="height:${percentage}%"></div>`;
		});
		return outputHtml;
	}
	showRainGraph(dataArray) {
		let chanceOfRain = false;
		console.log('rainGraphDataArray', dataArray);
		$.each(dataArray, (i, minute) => {
			console.log(minute.precipProbability);
			if(minute.precipProbability > 0) {
				chanceOfRain = true;
				return false;
			}
		});
		return chanceOfRain;
	}
}

new DarkSky;