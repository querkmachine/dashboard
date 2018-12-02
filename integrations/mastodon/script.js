class Mastodon {
	constructor() {
		this.settings = settings;
		this.api = new MastodonAPI({
			instance: this.settings.instance,
			api_user_token: this.settings.apiToken
		});
		this.$timeline = $('.timeline');
		// Trackin' things
		this.lastStatusId = 0; // tracks the last status ID we received, so we don't get dupes 
		// Start the thing
		this.getTimeline();
		setInterval(() => {
			this.getTimeline();
		}, 1000 * 60);
		//this.startStream();
	}
	getTimeline() {
		this.api.get('timelines/home', {
			since_id: this.lastStatusId
		}, (data) => {
			// Reverse order of array
			data.reverse();
			// split into pieces for addTootToTimeline
			$.each(data, (i, toot) => {
				//console.log('newToot', toot);
				this.addTootToTimeline(toot);
			});
		})
	}
	// startStream() {
	// 	this.api.stream('user', (data) => {
	// 		//console.log('new streamed toot', data);
	// 		if(data.event === "update") {
	// 			this.addTootToTimeline(data.payload);
	// 		}
	// 		else if(data.event === "delete") {
	// 			$(`#toot-${data.payload}`).remove();
	// 		}
	// 	});
	// }
	addTootToTimeline(toot) {
		this.lastStatusId = toot.id;
		let reblogger = false;
		if(toot.reblog) {
			reblogger = toot;
			toot = toot.reblog;
		}
		const tootTemplate = `
			<li id="toot-${toot.id}">
				<article class="toot">
					${ (reblogger) ? `<div class="size-small toot__rebloggedby">🔁 Boosted by ${reblogger.account.display_name}</div>` : '' }
					<header class="size-small toot__header">
						<img class="toot__avatar" src="${toot.account.avatar}" alt="${toot.account.display_name}">
						<span class="toot__user">
							<strong class="weight-600 toot__user-name">${toot.account.display_name}</strong>
							<span class="toot__user-handle">@${toot.account.acct}</span>
						</span>
						<time class="font-narrow toot__date" datetime="${toot.created_at}">${toot.created_at}</time>
					</header>
					<div class="toot__body">${this.parseTootContent(toot)}</div>
					${ (toot.media_attachments.length > 0) ? this.parseMediaAttachments(toot.media_attachments) : '' }
				</article>
			</li>
		`;
		// add to the list
		this.$timeline.prepend(tootTemplate);
		// remove old ones
		this.$timeline.children(':nth-child(n+11)').remove();
		// re-init timeago
		$('.toot__date').timeago();
	}
	parseMediaAttachments(mediaArray) {
		let returnHtml = '<div class="toot__media">';
		$.each(mediaArray, (i, media) => {
			switch(media.type) {
				case 'image':
					returnHtml += `
						<div class="toot__image">
							<img src="${media.preview_url}" alt="${ (media.description) ? media.description : '' }" width="${media.meta.small.width}" height="${media.meta.small.height}">
						</div>
					`;
				break;
				case 'video':
					returnHtml += `
						<div class="toot__video" style="padding-top:${(media.meta.height / media.meta.width) * 100}%">
							<video autoplay muted loop width="${media.meta.width}" height="${media.meta.height}">
								<source src="${media.remote_url}" type="video/mp4">
							</video>
						</div>
					`;
				break;
			}
		});
		returnHtml += '</div>';
		return returnHtml;
	}
	parseTootContent(toot) {
		let tootContent = toot.content;
		$.each(toot.emojis, (i, emoji) => {
			tootContent = tootContent.replace(new RegExp(`:${emoji.shortcode}:`, 'gm'), `<img class="toot__emoji" alt="emoji" src="${emoji.static_url}">`);
		});
		return tootContent;
	}
}

new Mastodon;