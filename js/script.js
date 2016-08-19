(function($) {
	// Settings
	var repeat = localStorage.repeat || 0,
		shuffle = localStorage.shuffle || 'false',
		continous = true,
		autoplay = true,
		playlist = [{
			title: 'Wild World (Acoustic Version)',
			artist: '王若琳',
			album: '爵士乐',
			cover: 'http://p4.music.126.net/Qzf4VdoOAdBYx_56VcFYiw==/272678883704279.jpg?param=130y130',
			mp3: 'http://music.huoxing.com/upload/20121215/1355575227640_8200.mp3',
			ogg: '',
			lrc: 'lrc/wild world.lrc'
		}, {
			title: '寂寞的恋人啊',
			artist: 'Someone',
			album: '寂寞的恋人啊',
			cover: 'http://p4.music.126.net/AW7USiHyoueL0J_KzYgZjA==/1417270501380416.jpg?param=140y140',
			mp3: 'http://mp3.haoduoge.com/s/2016-07-15/1468545177.mp3',
			ogg: '',
			lrc: 'lrc/jmdlr.lrc'
		}, {
			title: '蓝莲花',
			artist: '许巍',
			album: '蓝莲花',
			cover: 'http://p3.music.126.net/I6I81M7B7_hoeqp9VGg8sw==/568447511584754.jpg?param=130y130',
			mp3: 'http://mp3.haoduoge.com/s/2016-07-14/1468478235.mp3',
			ogg: '',
			lrc: 'lrc/llh.lrc'
		}, ];

	// Load playlist
	for(var i = 0; i < playlist.length; i++) {
		var item = playlist[i];
		$('#playlist').append('<li>' + item.artist + ' - ' + item.title + '</li>');
	}

	var time = new Date(), 
		$lrc = $('#lrcContent'),
		$title = $('#title'),
		currentTrack = shuffle === 'true' ? time.getTime() % playlist.length : 0,
		trigger = false,
		lrcSetp = 0,
		origTop = 20,
		stepHeight = 30,
		showLrc = false,
		fixHeight,
		lrcHeight,
		audio, timeout, isPlaying, playCounts,lrcData;

	var play = function() {
		var totalSec = parseInt(audio.duration % 60) < 10 ? '0' + parseInt(audio.duration % 60) : parseInt(audio.duration % 60),
			totalMin = parseInt(audio.duration / 60) < 10 ? '0' + parseInt(audio.duration / 60) : parseInt(audio.duration / 60);

		audio.play();

		if(totalSec && totalMin) {
			$(".timer span").text(" / " + totalMin + ':' + totalSec)
		} else {
			$(".timer span").text(" / 00:00");
		};
		$('.playback').addClass('playing');
		timeout = setInterval(updateProgress, 500);
		isPlaying = true;
		lrcSetp = 0;
	}

	var pause = function() {
		audio.pause();
		$('.playback').removeClass('playing');
		clearInterval(updateProgress);
		isPlaying = false;
	}

	// Update progress
	var setProgress = function(value) {
		var currentSec = parseInt(value % 60) < 10 ? '0' + parseInt(value % 60) : parseInt(value % 60),
			currentMin = parseInt(value / 60) < 10 ? '0' + parseInt(value / 60) : parseInt(value / 60),
			ratio = value / audio.duration * 100;

		$('.timer strong').text(currentMin + ':' + currentSec);
		$('.progress .pace').css('width', ratio + '%');
		$('.progress .slider a').css('left', ratio + '%');
	}

	var updateProgress = function() {
		
		  var words = lrcData.words, 
		  times = lrcData.times,
		  len = times.length, i = lrcSetp,
		  
          curTime = audio.currentTime*1e3|0;
          
        for(;i<len;i++){
            var t = times[i]; 
            if (curTime > t && curTime < times[i + 1]) {
                lrcSetp = i;
				var $cur = $lrc.find('[data-lrctime="'+t+'"]');
                var top = $cur.attr('data-lrctop');
                var uperLimit = parseInt(top) + stepHeight * 2 ;
                
				document.title = $cur.html();	
				$cur.addClass('cur');
				
				var mathTop = Math.abs(top) ;			    
				
				if( mathTop > fixHeight && mathTop < (lrcHeight - fixHeight))
				{
					$lrc.stop().animate({marginTop:uperLimit},"fast", "linear");
				}else{
					$lrc.stop();
				}
				
				$lrc.find('p.cur').removeClass('cur');
				$cur.addClass('cur')
                break;
            }
        }
		
		setProgress(audio.currentTime);
	}

	// Progress slider
	$('.progress .slider').slider({
		step: 0.1,
		slide: function(event, ui) {
			$(this).addClass('enable');
			setProgress(audio.duration * ui.value / 100);
			clearInterval(timeout);
		},
		stop: function(event, ui) {
			lrcSetp = 0;
			audio.currentTime = audio.duration * ui.value / 100;
			$(this).removeClass('enable');
			timeout = setInterval(updateProgress, 500);
		}
	});

	// Volume slider
	var setVolume = function(value) {
		audio.volume = localStorage.volume = value;
		$('.volume .pace').css('width', value * 100 + '%');
		$('.volume .slider a').css('left', value * 100 + '%');
	}

	var volume = localStorage.volume || 0.5;
	$('.volume .slider').slider({
		max: 1,
		min: 0,
		step: 0.01,
		value: volume,
		slide: function(event, ui) {
			setVolume(ui.value);
			$(this).addClass('enable');
			$('.mute').removeClass('enable');
		},
		stop: function() {
			$(this).removeClass('enable');
		}
	}).children('.pace').css('width', volume * 100 + '%');

	$('.mute').click(function() {
		if($(this).hasClass('enable')) {
			setVolume($(this).data('volume'));
			$(this).removeClass('enable');
		} else {
			$(this).data('volume', audio.volume).addClass('enable');
			setVolume(0);
		}
	});

	// Switch track
	var switchTrack = function(i) {
		if(i < 0) {
			track = currentTrack = playlist.length - 1;
		} else if(i >= playlist.length) {
			track = currentTrack = 0;
		} else {
			track = i;
		}

		$('audio').remove();
		loadMusic(track);
		if(isPlaying == true) play();
	}

	// Shuffle
	var shufflePlay = function() {
		var time = new Date(),
			lastTrack = currentTrack;
		currentTrack = time.getTime() % playlist.length;
		if(lastTrack == currentTrack) ++currentTrack;
		switchTrack(currentTrack);
	}

	// Fire when track ended
	var ended = function() {
		pause();
		audio.currentTime = 0;
		playCounts++;
		if(continous == true) isPlaying = true;
		if(repeat == 1) {
			play();
		} else {
			if(shuffle === 'true') {
				shufflePlay();
			} else {
				if(repeat == 2) {
					switchTrack(++currentTrack);
				} else {
					if(currentTrack < playlist.length) switchTrack(++currentTrack);
				}
			}
		}
	}

	var beforeLoad = function() {
		var endVal = this.seekable && this.seekable.length ? this.seekable.end(0) : 0;
		$('.progress .loaded').css('width', (100 / (this.duration || 1) * endVal) + '%');
	}

	// Fire when track loaded completely
	var afterLoad = function() {
		if(autoplay == true) play();
	}

	// Load track
	var loadMusic = function(i) {
		var item = playlist[i], 
			newaudio = $('<audio>').html('<source src="' + item.mp3 + '"><source src="' + item.ogg + '">').appendTo('#player');

		$('.cover').html('<img src="' + item.cover + '" alt="' + item.album + '">');
		$('.tag').html('<strong>' + item.title + '</strong><span class="artist">' + item.artist + '</span><span class="album">' + item.album + '</span>');
		$('#playlist li').removeClass('playing').eq(i).addClass('playing');

		if(localStorage[item.lrc] && localStorage[item.lrc] !== '') {
			setLrc(localStorage[item.lrc]);
		} else {
			loadLrc(item.lrc);
		}
		
		fixHeight = $("#lrcs > dd").height() / 2 - stepHeight ;
		lrcHeight = $lrc.height() - stepHeight * 2 ;

		audio = newaudio[0];
		audio.volume = $('.mute').hasClass('enable') ? 0 : volume;
		audio.addEventListener('progress', beforeLoad, false);
		audio.addEventListener('durationchange', beforeLoad, false);
		audio.addEventListener('canplay', afterLoad, false);
		audio.addEventListener('ended', ended, false);

	}

	//加载歌词

	var loadLrc = function(url) {
		$.get(url, function(lrc) {
			localStorage[url] = lrc;
			setLrc(lrc);
		});
	}

	//设置歌词
	var setLrc = function(lrc) {
		lrc = lrcData = parseLrc(lrc);
		var words = lrc.words,
			times = lrc.times,
			data = lrc.data;
		var len = times.length,
			i = 0,
			str = '',
			top = origTop;
		for(; i < len; i++) {
			var t = times[i],
				w = words[t];
			str += '<p data-lrctime="' + t + '" data-lrctop="' + top + '">' + w + '</p>';
			top -= stepHeight;
		}
		data = [data.ti, data.ar, data.al].filter(function(a) {
			return a !== ''
		});
		
		$title.html(data.join(' - '));

		lrcSetp = 0;
		
		$lrc.html(str).stop().animate({
			marginTop: origTop
		}, 1.4E3).children().eq(0).addClass('cur');
	}

	//解析歌词
	var parseLrc = function(lrc) {
		var arr = lrc.split(/[\r\n]/),
			len = arr.length,
			words = {},
			times = [],
			i = 0;
		var musicData = {
			ti: '',
			ar: '',
			al: ''
		};
		for(; i < len;) {
			var temp, doit = true,
				str = decodeURIComponent(arr[i]),
				word = str.replace(/\[\d*:\d*((\.|\:)\d*)*\]/g, '');

			'ti ar al'.replace(/\S+/g, function(a) {

				if(doit && musicData[a] === '') {
					temp = str.match(new RegExp('\\[' + a + '\\:(.*?)\\]'));
					if(temp && temp[1]) {
						doit = false;
						musicData[a] = temp[1];
					}
				}
			});

			if(word.length === 0) {
				word = "&nbsp;&nbsp;";
			}
			str.replace(/\[(\d*):(\d*)([\.|\:]\d*)*\]/g, function() {
				var min = arguments[1] | 0,
					sec = arguments[2] | 0,
					mse = arguments[3] !== undefined ? parseInt(arguments[3].replace(/(.|:)/,"")) : 0,
					time = min * 60 + sec + mse/100,
					p = times.push(parseInt(time * 1e3));
				words[times[--p]] = word.trim();
			});
			i++;
		}
		times.sort(function(a, b) {
			return a - b;
		});
		return {
			words: words,
			times: times,
			data: musicData
		};
	}

	loadMusic(currentTrack);

	$('.playback').on('click', function() {
		if($(this).hasClass('playing')) {
			pause();
		} else {
			play();
		}
	});

	$('.rewind').on('click', function() {
		if(shuffle === 'true') {
			shufflePlay();
		} else {
			switchTrack(--currentTrack);
		}
	});
	$('.fastforward').on('click', function() {
		if(shuffle === 'true') {
			shufflePlay();
		} else {
			switchTrack(++currentTrack);
		}
	});
	$('#playlist li').each(function(i) {
		var _i = i;
		$(this).on('click', function() {
			switchTrack(_i);
		});
	});

	if(shuffle === 'true') $('.shuffle').addClass('enable');
	if(repeat == 1) {
		$('.repeat').addClass('once');
	} else if(repeat == 2) {
		$('.repeat').addClass('all');
	}

	$('.repeat').on('click', function() {
		if($(this).hasClass('once')) {
			repeat = localStorage.repeat = 2;
			$(this).removeClass('once').addClass('all');
		} else if($(this).hasClass('all')) {
			repeat = localStorage.repeat = 0;
			$(this).removeClass('all');
		} else {
			repeat = localStorage.repeat = 1;
			$(this).addClass('once');
		}
	});

	$('.shuffle').on('click', function() {
		if($(this).hasClass('enable')) {
			shuffle = localStorage.shuffle = 'false';
			$(this).removeClass('enable');
		} else {
			shuffle = localStorage.shuffle = 'true';
			$(this).addClass('enable');
		}
	});
})(jQuery);