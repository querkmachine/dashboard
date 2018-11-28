class Hue {
	constructor() {
		this.settings = settings;
		// Lights
		this.$lightContainer = $('#lights');
		this.lights = [];
		this.getLights();
		setInterval(() => {
			this.getLights();
		}, 2500);
		// Sensors 
		this.$sensorContainer = $('#sensors');
		this.sensors = [];
		this.getSensors();
		setInterval(() => {
			this.getSensors();
		}, 60000);
	}
	normalise(num, toMin = 0, toMax = 1, fromMin = 0, fromMax = 255) {
		return toMin + (num - fromMin) / (fromMax - fromMin) * (toMax - toMin);
	}
	getLights() {
		$.ajax({
			url: `${this.settings.endpoint}/${this.settings.apiKey}/lights`,
			method: 'GET'
		}).done((data) => {
			this.lights = data;
			this.renderLightData();
		});
	}
	renderLightData() {
		let outputHtml = '';
		$.each(this.lights, (i, light) => {
			const $lightName = $('<strong/>', {
				'class': 'size-small lead-solid weight-600 light__name',
				'text': light.name
			});
			const $lightStatus = $('<span/>', {
				'class': 'font-narrow size-heading-s weight-300 light__status',
				'text': (light.state.on) ? `${ Math.round(this.normalise(light.state.bri, 0, 100)) }%` : 'Off'
			});
			const $listItem = $('<div/>', {
				'class': 'light'
			}).css({
				'background-color': `rgba(255, 255, 255, ${ (light.state.on) ? this.normalise(light.state.bri, 0.5, 1) : '0.5' })`
			});
			$listItem.append($lightName).append($lightStatus);
			outputHtml += $listItem.prop('outerHTML');
		});
		this.$lightContainer.html(outputHtml);
	}
	getSensors() {
		$.ajax({
			url: `${this.settings.endpoint}/${this.settings.apiKey}/sensors`,
			method: 'GET'
		}).done((data) => {
			this.sensors = data;
			this.renderSensorData();
		});
	}
	renderSensorData() {
		let outputHtml = '';
		$.each(this.sensors, (i, sensor) => {
			if($.inArray(sensor.type, this.settings.sensors) >= 0) {
				const $sensorName = $('<strong/>', {
					'class': 'size-small lead-solid weight-600 light__name',
					'text': sensor.name
				});
				let sensorStatus = '';
				switch(sensor.type) {
					case 'ZLLTemperature':
						sensorStatus = `${Math.round(sensor.state.temperature / 100)}&deg;`;
						break;
					case 'ZLLLightLevel':
						sensorStatus = `${sensor.state.lightlevel} lux`;
						break;
				}
				const $sensorStatus = $('<span/>', {
					'class': 'font-narrow size-heading-s weight-300 light__status',
					'html': sensorStatus
				});
				const $listItem = $('<div/>', {
					'class': 'light'
				});
				$listItem.append($sensorName).append($sensorStatus);
				outputHtml += $listItem.prop('outerHTML');
			}
		});
		this.$sensorContainer.html(outputHtml);
	}
}

$(() => {
	new Hue;
});