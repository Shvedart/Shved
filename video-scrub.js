// Управление временем видео по горизонтали курсора/тача с дросселированием seek
export function initScrubber(video, {
	mapX = (e) => (e?.touches?.[0]?.clientX ?? e?.clientX ?? 0) / (window.innerWidth || 1),
	intervalMs = 33,    // частота seek (~30 Гц)
	minDelta = 0.02,    // минимальный шаг по времени (сек)
	lerp = 0.35         // доля пути к цели за один шаг
} = {}) {
	let hasMeta = video.readyState >= 1;
	let targetTime = 0;
	let isDecoding = false;
	let lastSeekAt = 0;
	let timer = 0;

	function clamp01(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }
	function clearTimer(){ if (timer) { clearTimeout(timer); timer = 0; } }

	function scheduleSeek(){
		if (!hasMeta || isDecoding) return;

		const now = performance.now();
		const since = now - lastSeekAt;
		if (since < intervalMs) {
			clearTimer();
			timer = setTimeout(scheduleSeek, intervalMs - since);
			return;
		}

		const dur = video.duration || 0;
		if (!(dur > 0)) return;

		const cur = video.currentTime || 0;
		const desired = Math.min(dur, Math.max(0, targetTime));
		const delta = desired - cur;
		if (Math.abs(delta) < minDelta) return;

		const next = Math.min(dur, Math.max(0, cur + delta * lerp));
		lastSeekAt = now;
		isDecoding = true;
		try { video.pause(); } catch(e){}

		const onReady = () => {
			isDecoding = false;
			video.removeEventListener('seeked', onReady);
			// подтягиваемся, если цель сменилась
			scheduleSeek();
		};
		video.addEventListener('seeked', onReady, { once: true });

		// крупные скачки — fastSeek
		if (typeof video.fastSeek === 'function' && Math.abs(next - cur) > 0.25) {
			try { video.fastSeek(next); return; } catch(e){}
		}
		try { video.currentTime = next; } catch(e){ isDecoding = false; }

		// страховка для хрома
		if (typeof video.requestVideoFrameCallback === 'function') {
			try { video.requestVideoFrameCallback(() => {}); } catch(e){}
		}
	}

	function updateTarget(nx){
		if (!hasMeta || !(video.duration > 0)) return;
		targetTime = clamp01(nx) * video.duration;
		scheduleSeek();
	}
	function onMove(e){
		const nx = clamp01(mapX(e));
		updateTarget(nx);
	}
	function onLoaded(){
		hasMeta = true;
		scheduleSeek();
	}

	window.addEventListener('pointermove', onMove, { passive: true });
	video.addEventListener('loadedmetadata', onLoaded, { once: true });
	if (hasMeta) scheduleSeek();

	return {
		destroy(){
			window.removeEventListener('pointermove', onMove);
			video.removeEventListener('loadedmetadata', onLoaded);
			clearTimer();
		}
	};
}


