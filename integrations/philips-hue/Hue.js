class Hue {
	constructor() {
		this.settings = settings;
		this.$container = $('#lights');
		this.lights = [];
		this.getStatus();
		// setInterval(() => {
		// 	this.getStatus();
		// }, 2500);
	}
	getStatus() {
		$.ajax({
			url: `${this.settings.endpoint}/${this.settings.apiKey}/lights`,
			method: 'GET'
		}).done((data) => {
			this.lights = data;
			this.renderData();
		});
	}
	renderData() {
		let outputHtml = '';
		$.each(this.lights, (i, light) => {

			const $lightName = $('<strong/>', {
				'class': 'font-narrow size-large lead-solid weight-300 light__name',
				'text': light.name
			});
			const $lightStatus = $('<span/>', {
				'class': 'light__status',
				'text': (light.state.on) ? `${ Math.round(this.normalise(light.state.bri, 0, 100)) }%` : 'Off'
			});
			const $listItem = $('<li/>', {
				'class': 'size-small weight-600 light'
			}).css({
				'background-color': `rgba(255, 255, 255, ${ (light.state.on) ? this.normalise(light.state.bri, 0.5, 1) : '0.5' })`
			});
			$listItem.append($lightName).append($lightStatus);
			outputHtml += $listItem.prop('outerHTML');
		});
		this.$container.html(outputHtml);
	}
	normalise(num, toMin = 0, toMax = 1, fromMin = 0, fromMax = 255) {
		return toMin + (num - fromMin) / (fromMax - fromMin) * (toMax - toMin);
	}
}

$(() => {
	new Hue;
});