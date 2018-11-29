/**
 * TODO: 
 *   Garbage collection after 15-20 toots.
 *   Custom emoji???
 *   Prettify.
 */

class Mastodon {
	constructor() {
		this.settings = settings;
		this.api = new MastodonAPI({
			instance: this.settings.instance,
			api_user_token: this.settings.apiToken
		});
		this.$timeline = $('#timeline');
		// Trackin' things
		this.lastStatusId = 0; // tracks the last status ID we received, so we don't get dupes 
		// Start the thing
		this.getTimeline();
		this.startStream();
	}
	getTimeline() {
		this.api.get('timelines/home', {
			since_id: this.lastStatusId
		}, (data) => {
			// Reverse order of array
			data.reverse();
			// split into pieces for addTootToTimeline
			$.each(data, (i, toot) => {
				console.log('newToot', data);
				this.addTootToTimeline(toot);
			});
		})
	}
	startStream() {
		this.api.stream('user', (data) => {
			console.log('new streamed toot', data);
			if(data.event === "update") {
				this.addTootToTimeline(data.payload);
			}
			else if(data.event === "delete") {
				$(`#toot-${data.payload}`).remove();
			}
		});
	}
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
					<header class="toot__header">
						${ (reblogger) ? `<div class="toot__rebloggedby">Boosted by ${reblogger.account.display_name}</div>` : '' }
						<div class="toot__user">
							<img class="toot__user-avatar" src="${toot.account.avatar}" alt="${toot.account.display_name}">
							<strong class="toot__user-name">${toot.account.display_name}</strong>
							<span class="toot__user-handle">@${toot.account.acct}</span>
						</div>
						<time class="toot__date" datetime="${toot.created_at}">${toot.created_at}</time>
					</header>
					<div class="toot__body">${toot.content}</div>
					${ (toot.media_attachments.length > 0) ? this.parseMediaAttachments(toot.media_attachments) : '' }
				</article>
			</li>
		`;
		this.$timeline.prepend(tootTemplate);
	}
	parseMediaAttachments(mediaArray) {
		let returnHtml = '';
		$.each(mediaArray, (i, media) => {
			switch(media.type) {
				case 'image':
					returnHtml += `<img src="${media.preview_url}" alt="${media.description}">`;
				break;
				case 'video':
					returnHtml += `<video autoplay muted loop width="${media.meta.width}" height="${media.meta.height}"><source src="${media.remote_url}"></video>`;
				break;
			}
		});
		return returnHtml;
	}
}

new Mastodon;