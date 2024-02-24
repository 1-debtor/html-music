document.addEventListener('DOMContentLoaded', function() {
  // 异步加载songs.json文件
  fetch('songs.json')
    .then(response => response.json())
    .then(songs => {
      initializePlayer(songs);
    })
    .catch(error => console.error('Error loading the songs:', error));
});

function initializePlayer(songs) {
  const audioPlayer = document.getElementById('audioPlayer');
  const songListElement = document.getElementById('songList');
  const lyricsElement = document.getElementById('lyrics');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const volumeControl = document.getElementById('volumeControl');
  const progressBar = document.getElementById('progressBar');
  const progressTime = document.getElementById('progressTime');
  const loopBtn = document.getElementById('loopBtn');
  let isPlaying = false;
  let currentSongIndex = -1;
  let isLooping = false;
  let parsedLyrics = [];

  // 填充歌曲列表
  songs.forEach((song, index) => {
    const li = document.createElement('li');
    li.textContent = song.title;
    li.classList.add('p-2', 'hover:bg-gray-700');
    li.addEventListener('click', () => playSong(index, song.file, song.lyricsFile));
    songListElement.appendChild(li);
  });


  playPauseBtn.addEventListener('click', togglePlayPause);
  volumeControl.addEventListener('input', (event) => audioPlayer.volume = event.target.value / 100);
  progressBar.addEventListener('input', () => audioPlayer.currentTime = progressBar.value);
  audioPlayer.addEventListener('timeupdate', updateProgressBar);
  loopBtn.addEventListener('click', function() {
    isLooping = !isLooping;
    audioPlayer.loop = isLooping;
    loopBtn.classList.toggle('bg-blue-500', isLooping);
    // 显示提示文字并添加特效
    if (isLooping) {
      loopStatus.textContent = '开始循环';
      loopStatus.style.opacity = 1; // 显示提示文字
      loopBtn.classList.add('loop-active-effect'); // 应用特效
    } else {
      loopStatus.textContent = '未循环';
      loopStatus.style.opacity = 0; // 隐藏提示文字
      loopBtn.classList.remove('loop-active-effect'); // 移除特效
    }
  });
  
  audioPlayer.addEventListener('ended', function() {
    if (!isLooping) {
        // 播放下一首歌
        playNextSong();
    }
    // 如果启用了循环单曲，audio 元素的 loop 属性将处理重播
});

function playNextSong() {
    let nextSongIndex = currentSongIndex + 1;
    if (nextSongIndex >= songs.length) {
        nextSongIndex = 0; // 如果是最后一首歌，回到列表开始
    }
    playSong(nextSongIndex);
}


  function playSong(index) {
    currentSongIndex = index;
    const song = songs[index];
    audioPlayer.src = song.file;
    audioPlayer.play().then(() => {
      isPlaying = true;
      updatePlayPauseButton();
      highlightCurrentSong(index);
      loadLyrics(song.lyricsFile);
    }).catch(error => console.error('Playback was prevented:', error));
  }

  function togglePlayPause() {
    if (isPlaying) {
      audioPlayer.pause();
    } else {
      if (audioPlayer.src) {
        audioPlayer.play();
      } else {
        playSong(0); // Default to first song if none selected
      }
    }
    isPlaying = !isPlaying;
    updatePlayPauseButton();
  }

  function toggleLoop() {
    isLooping = !isLooping;
    audioPlayer.loop = isLooping;
    loopBtn.classList.toggle('bg-blue-500', isLooping);
  }

  function updatePlayPauseButton() {
    playPauseBtn.innerHTML = isPlaying
      ? '<img src="https://img.icons8.com/ios-filled/50/ffffff/pause--v1.png" alt="Pause">'
      : '<img src="https://img.icons8.com/ios-filled/50/ffffff/play--v1.png" alt="Play">';
  }

  function updateProgressBar() {
    progressBar.value = audioPlayer.currentTime;
    progressBar.max = audioPlayer.duration;
    const minutes = Math.floor(audioPlayer.currentTime / 60);
    const seconds = Math.floor(audioPlayer.currentTime % 60);
    progressTime.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  function highlightCurrentSong(index) {
    const children = songListElement.children;
    for (let i = 0; i < children.length; i++) {
      children[i].classList.toggle('bg-gray-700', i === index);
    }
  }

  function loadLyrics(lyricsFilePath) {
    fetch(lyricsFilePath)
      .then(response => response.text())
      .then(lyrics => {
        parsedLyrics = parseLyrics(lyrics);
        // No need to display all lyrics at once, removed for now
      })
      .catch(error => console.error('Error loading the lyrics:', error));
  }

  function parseLyrics(lyrics) {
    return lyrics.split('\n').map(line => {
      const parts = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
      if (parts) {
        const time = parseInt(parts[1], 10) * 60 + parseFloat(parts[2]);
        const text = parts[3];
        return { time, text };
      }
      return null;
    }).filter(line => line !== null);
  }

  audioPlayer.addEventListener('timeupdate', () => {
    const currentTime = audioPlayer.currentTime+0.5;
    let currentLineIndex = parsedLyrics.findIndex(line => line && currentTime < line.time) - 1;
    currentLineIndex = Math.max(currentLineIndex, 0); // Ensure index is not negative
    if (parsedLyrics.length > 0) {
      displayLyricsAroundCurrentIndex(parsedLyrics, currentLineIndex);
    }
  });

  function displayLyricsAroundCurrentIndex(parsedLyrics, currentIndex) {
    lyricsElement.innerHTML = ''; // 清除当前显示的歌词

    // 计算应该显示的歌词的起始和结束索引
    const startIndex = Math.max(currentIndex - 1, 0); // 确保不会小于0
    const endIndex = Math.min(currentIndex + 1, parsedLyrics.length - 1); // 确保不会超出数组范围

    // 循环遍历并显示这段范围内的歌词
    for (let i = startIndex; i <= endIndex; i++) {
        const line = parsedLyrics[i];
        if (line) {
            const p = document.createElement('p');
            p.textContent = line.text;
            // 如果是当前行，则应用高亮样式
            if (i === currentIndex) {
                p.classList.add('lyric-line', 'highlight');
            } else {
                p.classList.add('lyric-line');
            }
            p.setAttribute('id', `line-${i}`);
            lyricsElement.appendChild(p);
        }
    }

    // 确保当前行（中间行）可见
    ensureLyricVisible(currentIndex);
}


  function ensureLyricVisible(index) {
      const currentLine = document.getElementById(`line-${index}`);
      if (currentLine) {
          lyricsElement.scrollTop = currentLine.offsetTop - lyricsElement.offsetTop - (lyricsElement.offsetHeight / 2) + (currentLine.offsetHeight / 2);
      }
 }
};
